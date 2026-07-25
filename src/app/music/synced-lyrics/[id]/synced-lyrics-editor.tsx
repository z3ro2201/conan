"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useYouTubePlayer } from "@/lib/utils/use-youtube-player";
import { Icon } from "@/components/ui/icon";
import { interleaveLyricsLines, type LanguageLine } from "@/lib/utils/interleave-lyrics";
import { sanitizeRubyHtml } from "@/lib/utils/sanitize-ruby";
import { GripVerticalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SyncedSegment {
  text: string;
  time: number;
}

interface SyncedLyricsEditorProps {
  trackId: string;
  youtubeUrl: string;
  initialLinesByLanguage: {
    language: string;
    lines: { time: number; text: string; segments?: SyncedSegment[] }[];
  }[];
  initialMarkers?: { id: string; label: string; time: number }[];
}

interface Marker {
  id: string;
  label: string;
  time: number;
}

type EditableLine = LanguageLine & { segments?: SyncedSegment[] };

type TimelineItem =
  | { kind: "lyric"; id: string; time: number; pair: { lines: EditableLine[]; indices: number[] } }
  | { kind: "marker"; id: string; time: number; marker: Marker };

const extractVideoId = (url: string): string => {
  try {
    return new URL(url).searchParams.get("v") ?? "";
  } catch {
    return "";
  }
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const LANG_LABELS: Record<string, string> = { ja: "JP", ko: "KR", en: "EN" };
const LANGUAGE_PRIORITY: Record<string, number> = { ja: 0, ko: 1, en: 2 };

const SEEK_PRESETS = [
  { label: "-1초", seconds: -1 },
  { label: "-0.5초", seconds: -0.5 },
  { label: "-0.1초", seconds: -0.1 },
  { label: "+0.1초", seconds: 0.1 },
  { label: "+0.5초", seconds: 0.5 },
  { label: "+1초", seconds: 1 },
];

const MARKER_TYPES = ["전주", "간주", "후주", "끝"];

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// <ruby>...</ruby> 또는 <group>...</group> 태그는 하나의 조각으로 유지하고,
// 그 외 텍스트는 영단어/숫자는 통째로, 나머지(한글/일본어/공백/기호)는 글자 단위로 분할
function buildInitialSegments(text: string): SyncedSegment[] {
  const blockPattern = /<ruby>.*?<\/ruby>|<group>.*?<\/group>/g;
  const chunks: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      chunks.push(text.slice(lastIndex, match.index));
    }
    chunks.push(match[0]);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    chunks.push(text.slice(lastIndex));
  }

  const parts: string[] = [];
  for (const chunk of chunks) {
    if (chunk.startsWith("<ruby>") || chunk.startsWith("<group>")) {
      parts.push(chunk);
      continue;
    }

    const wordPattern = /[A-Za-z0-9']+|[^A-Za-z0-9']/g;
    const wordMatches = chunk.match(wordPattern) ?? [];
    parts.push(...wordMatches);
  }

  return parts.filter((p) => p.length > 0).map((p) => ({ text: p, time: 0 }));
}

function SortableTimelineItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </li>
  );
}

export function SyncedLyricsEditor({
  trackId,
  youtubeUrl,
  initialLinesByLanguage,
  initialMarkers = [],
}: SyncedLyricsEditorProps) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasNoLyrics = initialLinesByLanguage.every((l) => l.lines.length === 0) || initialLinesByLanguage.length === 0;

  const [lines, setLines] = useState<EditableLine[]>(() => {
    const sorted = [...initialLinesByLanguage].sort(
      (a, b) => (LANGUAGE_PRIORITY[a.language] ?? 99) - (LANGUAGE_PRIORITY[b.language] ?? 99),
    );
    return interleaveLyricsLines(sorted) as EditableLine[];
  });
  const [markers, setMarkers] = useState<Marker[]>(initialMarkers);
  const [seeking, setSeeking] = useState<number | null>(null);
  const [timelineOrder, setTimelineOrder] = useState<string[] | null>(null);
  const [sortEnabled, setSortEnabled] = useState(true);
  const [precisionOpenIndex, setPrecisionOpenIndex] = useState<number | null>(null);

  const videoId = extractVideoId(youtubeUrl);
  const { containerRef, ready, playing, currentTime, duration, togglePlay, seek } = useYouTubePlayer({ videoId });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const progressValue = seeking ?? currentTime;
  const progressPercent = duration > 0 ? (progressValue / duration) * 100 : 0;

  const languageCount = initialLinesByLanguage.length;
  const groupSize = languageCount >= 2 ? 2 : 1;

  const groupedPairs: { lines: EditableLine[]; indices: number[] }[] = [];
  for (let i = 0; i < lines.length; i += groupSize) {
    const pairLines = lines.slice(i, i + groupSize);
    const indices = pairLines.map((_, offset) => i + offset);
    groupedPairs.push({ lines: pairLines, indices });
  }

  const stampPair = (indices: number[]) => {
    const time = Math.round(currentTime * 1000);
    setLines((prev) => prev.map((line, i) => (indices.includes(i) ? { ...line, time } : line)));
  };

  const insertLineAfter = (pairIndex: number) => {
    const pair = groupedPairs[pairIndex];
    if (!pair) return;

    const insertAt = Math.max(...pair.indices) + 1;
    const time = Math.round(currentTime * 1000);

    const languagesInOrder = [...new Set(lines.map((l) => l.language))].sort(
      (a, b) => (LANGUAGE_PRIORITY[a] ?? 99) - (LANGUAGE_PRIORITY[b] ?? 99),
    );

    const newLines: EditableLine[] = languagesInOrder.map((language) => ({
      language,
      time,
      text: "",
    }));

    setLines((prev) => [...prev.slice(0, insertAt), ...newLines, ...prev.slice(insertAt)]);
    setTimelineOrder(null);
  };

  const removePair = (indices: number[]) => {
    setLines((prev) => prev.filter((_, i) => !indices.includes(i)));
    setTimelineOrder(null);
  };

  const updateLineText = (index: number, text: string) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, text } : line)));
  };

  const togglePrecisionMode = (pairIndex: number, lineGlobalIndex: number) => {
    setPrecisionOpenIndex((prev) => (prev === pairIndex ? null : pairIndex));

    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== lineGlobalIndex) return line;
        if (line.segments && line.segments.length > 0) return line;
        return { ...line, segments: buildInitialSegments(line.text) };
      }),
    );
  };

  // 이미 segments가 있어도 현재 텍스트 기준으로 강제로 다시 나눔 (타이밍은 초기화됨)
  const rebuildSegments = (lineGlobalIndex: number) => {
    setLines((prev) =>
      prev.map((line, i) => (i === lineGlobalIndex ? { ...line, segments: buildInitialSegments(line.text) } : line)),
    );
  };

  const stampSegment = (lineGlobalIndex: number, segIndex: number) => {
    const time = Math.round(currentTime * 1000);
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== lineGlobalIndex || !line.segments) return line;
        const newSegments = line.segments.map((seg, si) => (si === segIndex ? { ...seg, time } : seg));
        return { ...line, segments: newSegments };
      }),
    );
  };

  const clearSegments = (lineGlobalIndex: number) => {
    setLines((prev) => prev.map((line, i) => (i === lineGlobalIndex ? { ...line, segments: undefined } : line)));
  };

  const addMarker = (label: string) => {
    const time = Math.round(currentTime * 1000);
    setMarkers((prev) => [...prev, { id: generateId(), label, time }]);
    setTimelineOrder(null);
  };

  const removeMarker = (id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
    setTimelineOrder(null);
  };

  const restampMarker = (id: string) => {
    const time = Math.round(currentTime * 1000);
    setMarkers((prev) => prev.map((m) => (m.id === id ? { ...m, time } : m)));
  };

  const save = async () => {
    try {
      const grouped = lines.reduce<Record<string, { time: number; text: string; segments?: SyncedSegment[] }[]>>(
        (acc, line) => {
          if (!acc[line.language]) acc[line.language] = [];
          acc[line.language].push({
            time: line.time,
            text: line.text,
            ...(line.segments && line.segments.length > 0 ? { segments: line.segments } : {}),
          });
          return acc;
        },
        {},
      );

      await fetch(`/api/music/tracks/${trackId}/synced-lyrics`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grouped, markers }),
      });

      alert("저장되었습니다.");
    } catch {
      alert("저장 도중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (hasNoLyrics) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        seek(Math.max(currentTime - 5, 0));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        seek(Math.min(currentTime + 5, duration || currentTime + 5));
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTime, duration, seek, hasNoLyrics, togglePlay]);

  const baseTimeline: TimelineItem[] = [
    ...groupedPairs.map((pair, idx) => ({
      kind: "lyric" as const,
      id: `lyric-${idx}`,
      time: pair.lines[0]?.time ?? 0,
      pair,
    })),
    ...markers.map((marker) => ({
      kind: "marker" as const,
      id: `marker-${marker.id}`,
      time: marker.time,
      marker,
    })),
  ];

  const timeline = timelineOrder
    ? timelineOrder
        .map((id) => baseTimeline.find((item) => item.id === id))
        .filter((item): item is TimelineItem => Boolean(item))
    : sortEnabled
      ? [...baseTimeline].sort((a, b) => a.time - b.time)
      : baseTimeline;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentOrder = timeline.map((item) => item.id);
    const fromIndex = currentOrder.indexOf(active.id as string);
    const toIndex = currentOrder.indexOf(over.id as string);
    if (fromIndex === -1 || toIndex === -1) return;

    setTimelineOrder(arrayMove(currentOrder, fromIndex, toIndex));
  };

  if (hasNoLyrics) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-gray-500">가사 정보가 없습니다.</p>
        <button onClick={() => router.push(`/music/update/${trackId}`)} className="px-4 py-2 border rounded">
          곡 정보로 이동
        </button>
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-[calc(100%-60px-1rem)]" />;
  }

  return (
    <div className="h-[calc(100%-60px-1rem)]">
      <div ref={containerRef} style={{ width: 0, height: 0, overflow: "hidden" }} />

      <div className="flex items-center gap-3 mb-6">
        <button onClick={togglePlay} disabled={!ready}>
          {playing ? <Icon name="pause" size={32} /> : <Icon name="play" size={32} />}
        </button>

        <span className="text-sm tabular-nums text-gray-500">{formatTime(progressValue)}</span>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={progressValue}
          onChange={(e) => setSeeking(Number(e.target.value))}
          onMouseUp={(e) => {
            seek(Number((e.target as HTMLInputElement).value));
            setSeeking(null);
          }}
          onTouchEnd={(e) => {
            seek(Number((e.target as HTMLInputElement).value));
            setSeeking(null);
          }}
          className="progress-range progress-range-playhead flex-1"
          style={
            {
              background: `linear-gradient(to right, #2563eb ${progressPercent}%, #e5e7eb ${progressPercent}%)`,
              "--progress-percent": `${progressPercent}%`,
            } as React.CSSProperties
          }
        />

        <span className="text-sm tabular-nums text-gray-500">{formatTime(duration)}</span>
      </div>

      <div className="flex gap-2 mb-2">
        {SEEK_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => seek(Math.max(currentTime + preset.seconds, 0))}
            className="px-2 py-1 border rounded text-sm"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {MARKER_TYPES.map((label) => (
          <button
            key={label}
            onClick={() => addMarker(label)}
            className="px-3 py-1 border border-dashed rounded text-sm text-gray-600"
          >
            + {label}
          </button>
        ))}

        <button
          onClick={() => setSortEnabled((prev) => !prev)}
          className="px-3 py-1 border rounded text-sm text-gray-400 ml-auto"
        >
          {sortEnabled ? "삽입 순서로 보기" : "시간순으로 정렬"}
        </button>

        {timelineOrder && (
          <button onClick={() => setTimelineOrder(null)} className="px-3 py-1 border rounded text-sm text-gray-400">
            드래그 순서 초기화
          </button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={timeline.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <ul className="max-h-[calc(100vh-118px-8.5rem)] py-2 px-4 overflow-auto">
            {timeline.map((item) => {
              if (item.kind === "marker") {
                return (
                  <SortableTimelineItem key={item.id} id={item.id}>
                    <div className="flex items-center gap-2 py-2 mb-1 bg-gray-100 rounded px-2 cursor-move">
                      <GripVerticalIcon size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-500 w-16">{(item.marker.time / 1000).toFixed(2)}s</span>
                      <span className="flex-1 font-medium text-gray-600">— {item.marker.label} —</span>
                      <Button onClick={() => restampMarker(item.marker.id)} className="text-sm">
                        지금!
                      </Button>
                      <button onClick={() => removeMarker(item.marker.id)} className="text-sm text-red-500">
                        삭제
                      </button>
                    </div>
                  </SortableTimelineItem>
                );
              }

              const { pair } = item;
              const representativeTime = pair.lines[0]?.time ?? 0;
              const pairIndex = groupedPairs.indexOf(pair);
              const isPrecisionOpen = precisionOpenIndex === pairIndex;

              return (
                <SortableTimelineItem key={item.id} id={item.id}>
                  <div className="flex flex-col gap-1 border-b border-gray-200 py-2 mb-1">
                    <div className="flex items-start gap-2 cursor-move">
                      <GripVerticalIcon size={16} className="text-gray-400 mt-1" />
                      <span
                        className="text-sm text-gray-500 w-16 cursor-pointer mt-1"
                        onClick={() => stampPair(pair.indices)}
                        draggable={false}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        {(representativeTime / 1000).toFixed(2)}s
                      </span>

                      <div className="flex-1">
                        {pair.lines.map((line) => {
                          const lineGlobalIndex = lines.indexOf(line);
                          return (
                            <div key={line.language} className="flex items-start gap-2">
                              <span className="w-6 text-xs text-gray-400 mt-1">
                                {LANG_LABELS[line.language] ?? line.language}
                              </span>
                              <textarea
                                value={line.text}
                                onChange={(e) => updateLineText(lineGlobalIndex, e.target.value)}
                                className="flex-1 bg-transparent border-b border-transparent focus:border-gray-300 outline-none resize-none py-0.5 leading-snug"
                                rows={1}
                                draggable={false}
                                onPointerDown={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onInput={(e) => {
                                  const el = e.currentTarget;
                                  el.style.height = "auto";
                                  el.style.height = `${el.scrollHeight}px`;
                                }}
                              />
                              <button
                                onClick={() => togglePrecisionMode(pairIndex, lineGlobalIndex)}
                                className="text-xs text-blue-500 flex-shrink-0 mt-1"
                              >
                                {line.segments && line.segments.length > 0 ? "정밀편집" : "+정밀"}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <Button onClick={() => stampPair(pair.indices)} className="mt-0.5">
                        지금!
                      </Button>
                      <button onClick={() => insertLineAfter(pairIndex)} className="text-sm text-blue-500 mt-1">
                        + 줄 추가
                      </button>
                      <button onClick={() => removePair(pair.indices)} className="text-sm text-red-500 mt-1">
                        삭제
                      </button>
                    </div>

                    {isPrecisionOpen &&
                      pair.lines.map((line) => {
                        const lineGlobalIndex = lines.indexOf(line);
                        if (!line.segments || line.segments.length === 0) return null;

                        return (
                          <div
                            key={line.language}
                            className="ml-8 mt-1 p-2 bg-blue-50 rounded flex flex-wrap gap-2 items-center"
                          >
                            <span className="text-xs text-gray-400 w-6">{LANG_LABELS[line.language]}</span>
                            {line.segments.map((seg, segIndex) => (
                              <div key={segIndex} className="flex items-center gap-1 bg-white rounded px-2 py-1 border">
                                <span className="text-xs text-gray-400 tabular-nums">
                                  {(seg.time / 1000).toFixed(2)}s
                                </span>
                                <span
                                  className="text-sm"
                                  dangerouslySetInnerHTML={{ __html: sanitizeRubyHtml(seg.text) }}
                                />
                                <button
                                  onClick={() => stampSegment(lineGlobalIndex, segIndex)}
                                  className="text-xs text-blue-500 ml-1"
                                >
                                  지금!
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => rebuildSegments(lineGlobalIndex)}
                              className="text-xs text-orange-500 ml-2"
                            >
                              다시 나누기
                            </button>
                            <button
                              onClick={() => clearSegments(lineGlobalIndex)}
                              className="text-xs text-red-500 ml-auto"
                            >
                              정밀 모드 끄기
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </SortableTimelineItem>
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>

      <Button className="mt-2" onClick={save}>
        저장
      </Button>
    </div>
  );
}
