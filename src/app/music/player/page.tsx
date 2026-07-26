"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useYouTubePlayer } from "@/lib/utils/use-youtube-player";
import { Icon } from "@/components/ui/icon";
import { interleaveLyricsLines } from "@/lib/utils/interleave-lyrics";
import { sanitizeRubyHtml, stripGroupTags } from "@/lib/utils/sanitize-ruby";
import Link from "next/link";

const MessageWindow = ({ type, text }: { type: "LOADING" | "ERROR"; text: string }) => {
  return (
    <div
      className="w-screen h-screen absolute top-0 left-0 z-100 flex items-center justify-center flex-col gap-2"
      style={{ background: "linear-gradient(180deg, #1e1e1e 0%, #3a3a3a 100%)", color: "#fff" }}
    >
      {type === "LOADING" && (
        <div className="flex items-center justify-center gap-1.5">
          <span className="loading-dot w-3 h-3 rounded-full bg-white/40" />
          <span className="loading-dot w-3 h-3 rounded-full bg-white/40" />
          <span className="loading-dot w-3 h-3 rounded-full bg-white/40" />
        </div>
      )}
      <h1>{text}</h1>
    </div>
  );
};

type SyncedSegment = { text: string; time: number };
type SyncedLine = { time: number; text: string; segments?: SyncedSegment[] };
type SyncedMarker = { id: string; label: string; time: number };

type TrackWithRelations = {
  id: string;
  artist: string;
  youtubeUrl: string;
  trackType: string;
  dubType: string;
  appleMusicMeta: {
    artistId: number;
    artworkUrl100: string;
    artworkUrl1000: string | null;
    palette: {
      darkMuted: string;
      darkVibrant: string;
      lightMuted: string;
      lightVibrant: string;
      muted: string;
      vibrant: string;
    } | null;
  } | null;
  series: {
    id: string;
    seriesType: string;
    number: number;
    title: string | null;
    startEpisode: number | null;
    endEpisode: number | null;
  };
  titles: { language: string; title: string }[];
  lyrics: { language: string; content: string }[];
  syncedLyrics: { language: string; lines: SyncedLine[] }[];
  syncedMarkers: SyncedMarker[];
};

const extractVideoId = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("v") ?? "";
  } catch {
    return "";
  }
};

const fetchTracks = async (playIds: string[]): Promise<TrackWithRelations[]> => {
  if (playIds.length === 1) {
    const res = await fetch(`/api/music/tracks/${playIds[0]}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.error ?? "트랙을 불러오지 못했습니다.");
    }
    const track = await res.json();
    return [track];
  }

  const res = await fetch("/api/music/tracks/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playIds }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.error ?? "트랙을 불러오지 못했습니다.");
  }
  const tracks: TrackWithRelations[] = await res.json();

  return playIds.map((id) => tracks.find((t) => t.id === id)).filter((t): t is TrackWithRelations => Boolean(t));
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const LANGUAGE_PRIORITY: Record<string, number> = { ja: 0, ko: 1, en: 2 };

function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1.5 h-full">
      <span className="loading-dot w-2.5 h-2.5 rounded-full bg-white" />
      <span className="loading-dot w-2.5 h-2.5 rounded-full bg-white" />
      <span className="loading-dot w-2.5 h-2.5 rounded-full bg-white" />
    </div>
  );
}

function getTrackTitleLine(track: TrackWithRelations): string {
  const ja = track.titles.find((t) => t.language === "ja")?.title;
  const ko = track.titles.find((t) => t.language === "ko")?.title;

  const titlePart =
    track.dubType === "ORIGINAL"
      ? ja && ko
        ? `${ja} (${ko})`
        : (ja ?? ko ?? track.artist)
      : (ko ?? ja ?? track.artist);

  return `${titlePart} - ${track.artist}`;
}

function getTrackSeriesLine(track: TrackWithRelations): string {
  const suffix =
    track.series.seriesType === "MOVIE"
      ? `극장판 ${track.series.number}기`
      : track.series.startEpisode && track.series.endEpisode
        ? `${track.series.startEpisode}~${track.series.endEpisode}화`
        : `${track.series.number}기`;

  return `${track.series.title ?? ""} (${suffix})`;
}

type TimelineEntry =
  | { kind: "lyric"; time: number; text: string; language: string; segments?: SyncedSegment[] }
  | { kind: "marker"; time: number; text: string };

function buildTimeline(
  syncedLyrics: { language: string; lines: SyncedLine[] }[],
  syncedMarkers: SyncedMarker[],
): TimelineEntry[] {
  const sorted = [...syncedLyrics].sort(
    (a, b) => (LANGUAGE_PRIORITY[a.language] ?? 99) - (LANGUAGE_PRIORITY[b.language] ?? 99),
  );
  const merged = interleaveLyricsLines(sorted);

  const timeline: TimelineEntry[] = [
    ...merged.map((line) => ({
      kind: "lyric" as const,
      time: line.time,
      text: line.text,
      language: line.language,
      segments: (line as SyncedLine).segments,
    })),
    ...syncedMarkers.map((m) => ({ kind: "marker" as const, time: m.time, text: m.label })),
  ];

  return timeline.sort((a, b) => a.time - b.time);
}

function getActiveTime(entries: { time: number }[], currentTimeMs: number): number | null {
  let activeTime: number | null = null;
  for (const entry of entries) {
    if (entry.time <= currentTimeMs) {
      activeTime = entry.time;
    } else {
      break;
    }
  }
  return activeTime;
}

function SegmentedText({ segments, currentTimeMs }: { segments: SyncedSegment[]; currentTimeMs: number }) {
  return (
    <span>
      {segments.map((seg, i) => {
        const isPast = seg.time <= currentTimeMs;
        return (
          <span
            key={i}
            style={{ color: isPast ? "#fff" : "rgba(255,255,255,0.3)", transition: "color 0.15s linear" }}
            dangerouslySetInnerHTML={{ __html: sanitizeRubyHtml(stripGroupTags(seg.text)) }}
          />
        );
      })}
    </span>
  );
}

interface SyncedLyricsViewProps {
  syncedLyrics: { language: string; lines: SyncedLine[] }[];
  syncedMarkers: SyncedMarker[];
  currentTime: number;
  currentTrack: TrackWithRelations;
}

function SyncedLyricsView({ syncedLyrics, syncedMarkers, currentTime, currentTrack }: SyncedLyricsViewProps) {
  const currentTimeMs = currentTime * 1000;

  const timeline = buildTimeline(syncedLyrics, syncedMarkers);
  const activeTime = getActiveTime(timeline, currentTimeMs);
  const activeEntries = timeline.filter((e) => activeTime !== null && e.time === activeTime);

  if (activeEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: "rgba(255,255,255,0.3)" }}>♪</p>
      </div>
    );
  }

  return (
    <div key={activeTime} className="flex flex-col items-center justify-center gap-2 h-full overflow-hidden">
      {activeEntries.map((entry, i) => {
        if (entry.kind === "marker") {
          const isEnd = entry.text === "끝";

          return (
            <div key={i} className="flex flex-col items-center gap-4">
              {!isEnd && (
                <div className="flex items-center justify-center gap-1.5">
                  <span className="loading-dot w-2 h-2 rounded-full bg-white/40" />
                  <span className="loading-dot w-2 h-2 rounded-full bg-white/40" />
                  <span className="loading-dot w-2 h-2 rounded-full bg-white/40" />
                </div>
              )}
              <div>
                <h1 className="m-0 p-0 text-xl font-bold text-center">{getTrackTitleLine(currentTrack)}</h1>
                <p className="m-0 p-0 mt-1 text-sm text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {getTrackSeriesLine(currentTrack)}
                </p>
              </div>
            </div>
          );
        }

        return (
          <div key={i} className="lyric-wave-in text-2xl font-bold" style={{ animationDelay: `${i * 0.08}s` }}>
            {entry.segments && entry.segments.length > 0 ? (
              <SegmentedText segments={entry.segments} currentTimeMs={currentTimeMs} />
            ) : (
              <span style={{ color: "#fff" }} dangerouslySetInnerHTML={{ __html: sanitizeRubyHtml(entry.text) }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function getPreferredLyricsLang(track: TrackWithRelations): string {
  if (track.syncedLyrics.length > 0) return "synced";
  return track.dubType === "ORIGINAL" ? "ja" : "ko";
}

interface PlaylistTabViewProps {
  tracks: TrackWithRelations[];
  currentIndex: number;
  onSelectTrack: (index: number) => void;
}

function PlaylistTabView({ tracks, currentIndex, onSelectTrack }: PlaylistTabViewProps) {
  return (
    <ul className="h-full overflow-y-auto scrollbar-thin list-none m-0 px-2">
      {tracks.map((track, index) => {
        const isActive = index === currentIndex;
        const title = track.titles.find((t) => t.language === "ko")?.title ?? track.artist;
        const artworkUrl = track.appleMusicMeta?.artworkUrl100;

        return (
          <li key={track.id}>
            <button
              onClick={() => onSelectTrack(index)}
              className="w-full flex items-center gap-3 px-2 py-2.5 text-left cursor-pointer rounded-lg hover:bg-white/5"
            >
              {artworkUrl ? (
                <img src={artworkUrl} className="w-11 h-11 rounded object-cover flex-shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded bg-white/10 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p
                  className="m-0 text-sm truncate"
                  style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.85)", fontWeight: isActive ? 700 : 400 }}
                >
                  {title}
                </p>
                <p className="m-0 text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {track.artist}
                </p>
              </div>
              {isActive && (
                <Icon name="volume-up" size={16} className="ml-auto flex-shrink-0" style={{ color: "#fff" }} />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

interface MiniPlayerViewProps {
  currentTrack: TrackWithRelations;
  artworkUrl: string | undefined;
  showVideo: boolean;
  onToggleVideo: () => void;
  albumSlotRef: React.RefObject<HTMLDivElement | null>;
  titleMap: { ko: string | null; ja: string | null };
  progressValue: number;
  progressPercent: number;
  duration: number;
  rangeColor: string;
  playing: boolean;
  ready: boolean;
  buffering: boolean;
  goPrev: () => void;
  goNext: () => void;
  handleTogglePlay: () => void;
  onExpand: () => void;
  onShowPlaylist: () => void;
  currentIndex: number;
  tracksLength: number;
  repeatMode: "off" | "all" | "one";
  onCycleRepeat: () => void;
}

function MiniPlayerView({
  currentTrack,
  artworkUrl,
  showVideo,
  onToggleVideo,
  albumSlotRef,
  titleMap,
  progressValue,
  progressPercent,
  duration,
  rangeColor,
  playing,
  ready,
  buffering,
  goPrev,
  goNext,
  handleTogglePlay,
  onExpand,
  onShowPlaylist,
  currentIndex,
  tracksLength,
  repeatMode,
  onCycleRepeat,
}: MiniPlayerViewProps) {
  const title =
    currentTrack.dubType === "ORIGINAL" ? (titleMap.ja ?? currentTrack.artist) : (titleMap.ko ?? currentTrack.artist);

  return (
    <div className="flex flex-col h-full px-6 pt-14 pb-6">
      <button
        onClick={handleTogglePlay}
        disabled={!ready}
        className="flex-1 flex items-center justify-center min-h-0 cursor-pointer relative group"
      >
        <div ref={albumSlotRef} className="max-w-full max-h-full aspect-square" style={{ width: "min(60vw, 320px)" }}>
          {artworkUrl && !showVideo && (
            <img src={artworkUrl} className="w-full h-full object-cover rounded-2xl shadow-2xl" />
          )}
        </div>

        {artworkUrl && !showVideo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity bg-black/20 rounded-2xl pointer-events-none">
            {!ready || buffering ? (
              <div className="spinner w-10 h-10 rounded-full border-4 border-white/20 border-t-white" />
            ) : playing ? (
              <Icon name="pause" size={48} />
            ) : (
              <Icon name="play" size={48} />
            )}
          </div>
        )}
      </button>

      <div className="flex-shrink-0 pt-4">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onExpand} className="text-left cursor-pointer">
            <h1 className="m-0 p-0 text-xl font-bold">{title}</h1>
            <p className="m-0 p-0 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              {currentTrack.artist}
            </p>
          </button>
          <div className="flex gap-2 justify-end">
            {artworkUrl && (
              <button onClick={onToggleVideo} className="cursor-pointer flex-shrink-0">
                <Icon name="youtube" size={22} style={{ opacity: showVideo ? 1 : 0.7 }} />
              </button>
            )}
            <button onClick={onCycleRepeat} className="cursor-pointer flex-shrink-0">
              <Icon
                name={repeatMode === "one" ? "repeat-one" : "repeat"}
                size={22}
                style={{ opacity: repeatMode === "off" ? 0.5 : 1 }}
              />
            </button>
            <button onClick={onExpand} className="cursor-pointer flex-shrink-0">
              <Icon name="chevron-double-up" size={22} />
            </button>
            <button onClick={onShowPlaylist} className="cursor-pointer flex-shrink-0">
              <Icon name="list" size={22} />
            </button>
            <button onClick={onShowPlaylist} className="cursor-pointer flex-shrink-0">
              <Icon name="lyrics" size={22} />
            </button>
          </div>
        </div>

        <div
          className="progress-range progress-range-playhead w-full h-1 rounded-full"
          style={
            {
              background: `linear-gradient(to right, ${rangeColor} ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
              "--progress-percent": `${progressPercent}%`,
            } as React.CSSProperties
          }
        />
        <div className="flex justify-between mt-1 mb-4">
          <span className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
            {formatTime(progressValue)}
          </span>
          <span className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
            -{formatTime(Math.max(duration - progressValue, 0))}
          </span>
        </div>

        <div className="flex items-center justify-center gap-8">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Icon name="chevron-double-left" size={28} />
          </button>
          <button
            onClick={handleTogglePlay}
            disabled={!ready}
            className="w-12 h-12 flex items-center justify-center cursor-pointer"
          >
            {!ready || buffering ? (
              <div className="spinner w-7 h-7 rounded-full border-4 border-white/20 border-t-white" />
            ) : playing ? (
              <Icon name="pause" size={40} />
            ) : (
              <Icon name="play" size={40} />
            )}
          </button>
          <button
            onClick={goNext}
            disabled={currentIndex >= tracksLength - 1 && repeatMode !== "all"}
            className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Icon name="chevron-double-right" size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface ExpandedMobileViewProps {
  currentTrack: TrackWithRelations;
  artworkUrl: string | undefined;
  showVideo: boolean;
  onToggleVideo: () => void;
  albumSlotRef: React.RefObject<HTMLDivElement | null>;
  titleMap: { ko: string | null; ja: string | null };
  lyricsLang: string;
  setLyricsLang: (lang: string) => void;
  hasSyncedLyrics: boolean;
  currentLyrics: { language: string; content: string } | undefined;
  ready: boolean;
  buffering: boolean;
  currentTime: number;
  progressValue: number;
  progressPercent: number;
  duration: number;
  volumePercent: number;
  rangeColor: string;
  playing: boolean;
  muted: boolean;
  goPrev: () => void;
  goNext: () => void;
  handleTogglePlay: () => void;
  toggleMute: () => void;
  setVolume: (value: number) => void;
  setSeeking: (value: number | null) => void;
  seek: (value: number) => void;
  currentIndex: number;
  tracksLength: number;
  onCollapse: () => void;
  tracks: TrackWithRelations[];
  onSelectTrack: (index: number) => void;
  repeatMode: "off" | "all" | "one";
  onCycleRepeat: () => void;
}

function ExpandedMobileView({
  currentTrack,
  artworkUrl,
  showVideo,
  onToggleVideo,
  albumSlotRef,
  titleMap,
  lyricsLang,
  setLyricsLang,
  hasSyncedLyrics,
  currentLyrics,
  ready,
  buffering,
  currentTime,
  progressValue,
  progressPercent,
  duration,
  volumePercent,
  rangeColor,
  playing,
  muted,
  goPrev,
  goNext,
  handleTogglePlay,
  toggleMute,
  setVolume,
  setSeeking,
  seek,
  currentIndex,
  tracksLength,
  onCollapse,
  tracks,
  onSelectTrack,
  repeatMode,
  onCycleRepeat,
}: ExpandedMobileViewProps) {
  const isPlaylistOpen = lyricsLang === "playlist";
  const togglePlaylist = () => setLyricsLang(isPlaylistOpen ? "ko" : "playlist");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 flex-shrink-0">
        <button onClick={onCollapse} className="cursor-pointer">
          <Icon name="chevron-down" size={24} />
        </button>
      </div>

      <div className="w-full flex items-center justify-between flex-shrink-0 pt-2 pb-2 px-6">
        <div className="flex items-center">
          <div ref={albumSlotRef} className="mr-3 w-24 h-24">
            {artworkUrl && !showVideo && (
              <img src={artworkUrl} className="w-full h-full shadow-2xl object-cover rounded-md" />
            )}
          </div>
          <div>
            <h1 className="m-0 p-0 text-xl font-bold">
              {currentTrack.dubType === "ORIGINAL"
                ? (titleMap.ja ?? currentTrack.artist)
                : (titleMap.ko ?? currentTrack.artist)}
            </h1>
            <p className="m-0 p-0 mt-1 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              {currentTrack.artist}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center justify-end">
          {artworkUrl && (
            <button onClick={onToggleVideo} className="cursor-pointer flex-shrink-0">
              <Icon name="youtube" size={22} style={{ opacity: showVideo ? 1 : 0.7 }} />
            </button>
          )}
          <button onClick={onCycleRepeat} className="cursor-pointer flex-shrink-0">
            <Icon
              name={repeatMode === "one" ? "repeat-one" : "repeat"}
              size={22}
              style={{ opacity: repeatMode === "off" ? 0.5 : 1 }}
            />
          </button>
          <button onClick={togglePlaylist} className="cursor-pointer flex-shrink-0">
            <Icon name="list" size={22} style={{ opacity: isPlaylistOpen ? 1 : 0.7 }} />
          </button>
          <button onClick={togglePlaylist} className="cursor-pointer flex-shrink-0">
            <Icon name="lyrics" size={22} style={{ opacity: isPlaylistOpen ? 1 : 0.7 }} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-6">
        {!isPlaylistOpen && (currentTrack.lyrics.length > 1 || hasSyncedLyrics) && (
          <div className="flex justify-center gap-2 mb-2 flex-shrink-0">
            {currentTrack.lyrics.map((l) => (
              <button
                key={l.language}
                onClick={() => setLyricsLang(l.language)}
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  background: lyricsLang === l.language ? "rgba(255,255,255,0.2)" : "transparent",
                  color: lyricsLang === l.language ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              >
                {l.language === "ko" ? "한국어" : l.language === "ja" ? "일본어" : l.language}
              </button>
            ))}
            {hasSyncedLyrics && (
              <button
                onClick={() => setLyricsLang("synced")}
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  background: lyricsLang === "synced" ? "rgba(255,255,255,0.2)" : "transparent",
                  color: lyricsLang === "synced" ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              >
                실시간
              </button>
            )}
          </div>
        )}

        {isPlaylistOpen && (
          <div className="flex justify-between items-center mb-2 flex-shrink-0">
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              재생목록 · {tracksLength}곡
            </span>
            <button
              onClick={togglePlaylist}
              className="text-sm cursor-pointer"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              닫기
            </button>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
          {isPlaylistOpen ? (
            <PlaylistTabView tracks={tracks} currentIndex={currentIndex} onSelectTrack={onSelectTrack} />
          ) : !ready || buffering ? (
            <LoadingDots />
          ) : lyricsLang === "synced" ? (
            <SyncedLyricsView
              syncedLyrics={currentTrack.syncedLyrics}
              syncedMarkers={currentTrack.syncedMarkers}
              currentTime={currentTime}
              currentTrack={currentTrack}
            />
          ) : (
            currentLyrics && (
              <div className="px-2 text-center">
                {currentLyrics.content
                  .split("\n")
                  .filter((line) => line.trim().length > 0)
                  .map((line, i) => (
                    <p
                      key={i}
                      className="my-2 text-lg leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.85)" }}
                      dangerouslySetInnerHTML={{ __html: sanitizeRubyHtml(line) }}
                    />
                  ))}
              </div>
            )
          )}
        </div>
      </div>

      <div className="w-full px-6 pb-6 pt-3 flex-shrink-0">
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
          className="progress-range progress-range-playhead w-full"
          style={
            {
              background: `linear-gradient(to right, ${rangeColor} ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
              "--progress-percent": `${progressPercent}%`,
            } as React.CSSProperties
          }
        />
        <div className="flex justify-between mt-1 mb-3">
          <span className="text-sm tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
            {formatTime(progressValue)}
          </span>
          <span className="text-sm tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
            -{formatTime(Math.max(duration - progressValue, 0))}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Icon name="chevron-double-left" size={32} />
            </button>

            <button
              onClick={handleTogglePlay}
              disabled={!ready}
              className="w-[45px] h-[45px] flex items-center justify-center cursor-pointer"
            >
              {!ready || buffering ? (
                <div className="spinner w-8 h-8 rounded-full border-4 border-white/20 border-t-white" />
              ) : playing ? (
                <Icon name="pause" size={40} />
              ) : (
                <Icon name="play" size={40} />
              )}
            </button>

            <button
              className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={goNext}
              disabled={currentIndex >= tracksLength - 1 && repeatMode !== "all"}
            >
              <Icon name="chevron-double-right" size={32} />
            </button>
          </div>

          <div className="flex items-center gap-2 w-28">
            <button className="cursor-pointer" onClick={toggleMute}>
              {muted ? <Icon name="volume-mute" /> : <Icon name="volume-up" />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={volumePercent}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="progress-range progress-range-playhead flex-1"
              style={
                {
                  background: `linear-gradient(to right, ${rangeColor} ${volumePercent}%, rgba(255,255,255,0.2) ${volumePercent}%)`,
                  "--progress-percent": `${volumePercent}%`,
                } as React.CSSProperties
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MusicPlayerContent() {
  const searchParams = useSearchParams();

  const [tracks, setTracks] = useState<TrackWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seeking, setSeeking] = useState<number | null>(null);
  const [lyricsLang, setLyricsLang] = useState<string>("ko");
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [videoOverride, setVideoOverride] = useState(false);
  const [desktopPanelOpen, setDesktopPanelOpen] = useState(true);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");

  const desktopAlbumSlotRef = useRef<HTMLDivElement>(null);
  const miniAlbumSlotRef = useRef<HTMLDivElement>(null);
  const expandedAlbumSlotRef = useRef<HTMLDivElement>(null);
  const [videoRect, setVideoRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }, []);

  useEffect(() => {
    const playIdParamRaw = (searchParams.get("playId") ?? "").trim();

    let playIds: string[] = [];

    if (playIdParamRaw) {
      playIds = playIdParamRaw
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    } else {
      const stored = sessionStorage.getItem("playlist");
      if (stored) {
        try {
          playIds = JSON.parse(stored);
        } catch {
          playIds = [];
        }
      }
    }

    if (playIds.length === 0) {
      setError("재생할 곡 정보가 없습니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchTracks(playIds)
      .then((result) => {
        setTracks(result);
        setCurrentIndex(0);
        if (result[0]) setLyricsLang(getPreferredLyricsLang(result[0]));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "ADD_TO_PLAYLIST") return;

      const trackId: string = event.data.trackId;
      if (!trackId) return;

      setTracks((prev) => {
        if (prev.some((t) => t.id === trackId)) return prev;

        fetchTracks([trackId]).then(([newTrack]) => {
          if (!newTrack) return;
          setTracks((current) => {
            if (current.some((t) => t.id === newTrack.id)) return current;
            return [...current, newTrack];
          });
        });

        return prev;
      });
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    setVideoOverride(false);
  }, [currentIndex]);

  const currentTrack = tracks[currentIndex];
  const videoId = currentTrack ? extractVideoId(currentTrack.youtubeUrl) : "";
  const artworkUrl = currentTrack?.appleMusicMeta?.artworkUrl1000 ?? currentTrack?.appleMusicMeta?.artworkUrl100;
  const showVideo = !artworkUrl || videoOverride;

  useEffect(() => {
    if (!showVideo) {
      setVideoRect(null);
      return;
    }

    const measure = () => {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;

      let slotEl: HTMLDivElement | null;
      if (isDesktop) {
        slotEl = desktopAlbumSlotRef.current;
      } else if (isExpanded) {
        slotEl = expandedAlbumSlotRef.current;
      } else {
        slotEl = miniAlbumSlotRef.current;
      }

      if (!slotEl) return;

      const rect = slotEl.getBoundingClientRect();
      const rounded = {
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };

      setVideoRect((prev) => {
        if (
          prev &&
          prev.top === rounded.top &&
          prev.left === rounded.left &&
          prev.width === rounded.width &&
          prev.height === rounded.height
        ) {
          return prev;
        }
        return rounded;
      });
    };

    const timeout = setTimeout(measure, 50);
    window.addEventListener("resize", measure);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", measure);
    };
  }, [showVideo, isExpanded, loading, desktopPanelOpen]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => {
      if (i + 1 < tracks.length) {
        const nextTrack = tracks[i + 1];
        if (nextTrack) setLyricsLang(getPreferredLyricsLang(nextTrack));
        if (userInteracted) setShouldAutoplay(true);
        return i + 1;
      }
      if (repeatMode === "all" && tracks.length > 0) {
        const nextTrack = tracks[0];
        if (nextTrack) setLyricsLang(getPreferredLyricsLang(nextTrack));
        if (userInteracted) setShouldAutoplay(true);
        return 0;
      }
      return i;
    });
  }, [tracks, userInteracted, repeatMode]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => {
      if (i > 0) {
        const prevTrack = tracks[i - 1];
        if (prevTrack) setLyricsLang(getPreferredLyricsLang(prevTrack));
        if (userInteracted) setShouldAutoplay(true);
        return i - 1;
      }
      return i;
    });
  }, [tracks, userInteracted]);

  const selectTrack = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      const nextTrack = tracks[index];
      if (nextTrack) setLyricsLang(getPreferredLyricsLang(nextTrack));
      if (userInteracted) setShouldAutoplay(true);
    },
    [userInteracted, tracks],
  );

  const handleTrackEndedRef = useRef<() => void>(() => {});
  const handleTrackEndedStable = useCallback(() => handleTrackEndedRef.current(), []);

  const {
    containerRef,
    ready,
    playing,
    buffering,
    currentTime,
    duration,
    volume,
    muted,
    togglePlay,
    seek,
    play,
    setVolume,
    toggleMute,
  } = useYouTubePlayer({
    videoId,
    onEnded: handleTrackEndedStable,
    autoplay: shouldAutoplay,
  });

  useEffect(() => {
    handleTrackEndedRef.current = () => {
      if (repeatMode === "one") {
        seek(0);
        play();
        return;
      }
      goNext();
    };
  }, [repeatMode, seek, play, goNext]);

  const handleTogglePlay = useCallback(() => {
    setUserInteracted(true);
    setShouldAutoplay(true);
    togglePlay();
  }, [togglePlay]);

  useEffect(() => {
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
        handleTogglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTime, duration, seek, handleTogglePlay]);

  if (loading) return <MessageWindow type="LOADING" text="불러오는 중" />;
  if (error) return <MessageWindow type="ERROR" text={error} />;
  if (!currentTrack || !videoId) return <MessageWindow type="ERROR" text="재생할 곡이 없습니다." />;

  const progressValue = Number.isFinite(seeking ?? currentTime) ? (seeking ?? currentTime) : 0;
  const safeDuration = Number.isFinite(duration) ? duration : 0;
  const progressPercent = safeDuration > 0 ? (progressValue / safeDuration) * 100 : 0;
  const volumePercent = muted ? 0 : Number.isFinite(volume) ? volume : 0;

  const titleMap = {
    ko: currentTrack.titles.find((item) => item.language === "ko")?.title ?? null,
    ja: currentTrack.titles.find((item) => item.language === "ja")?.title ?? null,
  };

  const palette = currentTrack.appleMusicMeta?.palette;
  const bgGradient = palette
    ? `linear-gradient(180deg, ${palette.muted} 0%, ${palette.vibrant} 100%)`
    : "linear-gradient(180deg, #1e1e1e 0%, #1e1e1e 100%)";
  const rangeColor = palette?.darkVibrant ?? "#2563eb";

  const currentLyrics = currentTrack.lyrics.find((l) => l.language === lyricsLang) ?? currentTrack.lyrics[0];
  const hasSyncedLyrics = currentTrack.syncedLyrics.length > 0;
  const isPlaylistOpenDesktop = lyricsLang === "playlist";

  const toggleDesktopPlaylist = () => {
    if (desktopPanelOpen && isPlaylistOpenDesktop) {
      setDesktopPanelOpen(false);
    } else {
      setDesktopPanelOpen(true);
      setLyricsLang("playlist");
    }
  };

  const toggleDesktopLyrics = () => {
    if (desktopPanelOpen && !isPlaylistOpenDesktop) {
      setDesktopPanelOpen(false);
    } else {
      setDesktopPanelOpen(true);
      if (isPlaylistOpenDesktop) setLyricsLang(getPreferredLyricsLang(currentTrack));
    }
  };

  const playerContainerStyle: React.CSSProperties = !showVideo
    ? {
        position: "fixed",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
      }
    : videoRect
      ? {
          position: "fixed",
          top: videoRect.top,
          left: videoRect.left,
          width: videoRect.width,
          height: videoRect.height,
          borderRadius: "16px",
          overflow: "hidden",
          zIndex: 5,
        }
      : {
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
        };

  return (
    <div
      className="relative w-screen h-screen transition-[background] duration-500 overflow-hidden"
      style={{ background: bgGradient, color: "#fff" }}
    >
      <div className="fixed right-5 top-5 z-20 hidden md:block">
        {Object.keys(titleMap).length > 0 && (
          <Link
            href={`/music/synced-lyrics/${currentTrack.id}`}
            className="px-3 py-1 rounded-full text-sm"
            style={{ background: "transparent", color: "rgba(255,255,255,0.5)" }}
            target="_blank"
          >
            실시간 가사 {hasSyncedLyrics ? "편집" : "등록"}
          </Link>
        )}
        {Object.keys(titleMap).length == 0 && (
          <Link
            href={`/music/update/${currentTrack.id}`}
            className="px-3 py-1 rounded-full text-sm"
            style={{ background: "transparent", color: "rgba(255,255,255,0.5)" }}
            target="_blank"
          >
            가사정보 등록
          </Link>
        )}
      </div>

      <div ref={containerRef} style={playerContainerStyle} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: artworkUrl ? `url(${artworkUrl})` : undefined,
          backgroundSize: "90%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.35,
          zIndex: 0,
        }}
      />

      <div
        className="backdrop-blur-2xl"
        style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.45)", zIndex: 1 }}
      />

      {/* ===== 데스크톱(md 이상) 레이아웃 ===== */}
      <div className="relative z-10 hidden md:flex h-full items-center justify-center">
        <div
          className={`flex flex-row mx-auto transition-all duration-300 ${
            desktopPanelOpen ? "w-full max-w-6xl" : "w-full max-w-md justify-center"
          }`}
        >
          <div
            className={`flex flex-col justify-center gap-6 transition-all duration-300 ${
              desktopPanelOpen ? "w-1/2 lg:w-[45%] lg:max-w-[480px] items-start pl-16 pr-8" : "w-full items-center px-8"
            }`}
          >
            <div className="w-full flex items-center justify-center">
              <button
                onClick={handleTogglePlay}
                disabled={!ready}
                className={`cursor-pointer relative group transition-all duration-300 ${
                  desktopPanelOpen ? "w-64 h-64" : "w-80 h-80"
                }`}
              >
                <div ref={desktopAlbumSlotRef} className="w-full h-full">
                  {artworkUrl && !showVideo && (
                    <img src={artworkUrl} className="w-full h-full shadow-2xl object-cover rounded-md" />
                  )}
                </div>

                {artworkUrl && !showVideo && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-md pointer-events-none">
                    {!ready || buffering ? (
                      <div className="spinner w-10 h-10 rounded-full border-4 border-white/20 border-t-white" />
                    ) : playing ? (
                      <Icon name="pause" size={48} />
                    ) : (
                      <Icon name="play" size={48} />
                    )}
                  </div>
                )}
              </button>
            </div>

            <div
              className={`w-full flex items-center ${
                desktopPanelOpen ? "justify-between" : "justify-center flex-col text-center"
              }`}
            >
              <div>
                <h1 className="m-0 p-0 text-2xl font-bold">
                  {currentTrack.dubType === "ORIGINAL"
                    ? (titleMap.ja ?? currentTrack.artist)
                    : (titleMap.ko ?? currentTrack.artist)}
                </h1>
                <p className="m-0 p-0 mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {currentTrack.artist}
                </p>
              </div>
              <div className={`flex gap-2 ${desktopPanelOpen ? "justify-end" : "mt-2"}`}>
                {artworkUrl && (
                  <button onClick={() => setVideoOverride((prev) => !prev)} className="cursor-pointer flex-shrink-0">
                    <Icon name="youtube" size={22} style={{ opacity: showVideo ? 1 : 0.7 }} />
                  </button>
                )}
                {tracks.length > 1 && (
                  <button onClick={toggleDesktopPlaylist} className="cursor-pointer flex-shrink-0">
                    <Icon
                      name="list"
                      size={22}
                      style={{ opacity: desktopPanelOpen && isPlaylistOpenDesktop ? 1 : 0.7 }}
                    />
                  </button>
                )}
                <button onClick={toggleDesktopLyrics} className="cursor-pointer flex-shrink-0">
                  <Icon
                    name="lyrics"
                    size={22}
                    style={{ opacity: desktopPanelOpen && !isPlaylistOpenDesktop ? 1 : 0.7 }}
                  />
                </button>
              </div>
            </div>

            <div className="w-full">
              <input
                type="range"
                min={0}
                max={safeDuration}
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
                className="progress-range progress-range-playhead w-full"
                style={
                  {
                    background: `linear-gradient(to right, ${rangeColor} ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
                    "--progress-percent": `${progressPercent}%`,
                  } as React.CSSProperties
                }
              />
              <div className="flex justify-between mt-1">
                <span className="text-sm tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {formatTime(progressValue)}
                </span>
                <span className="text-sm tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
                  -{formatTime(Math.max(safeDuration - progressValue, 0))}
                </span>
              </div>
            </div>

            <div className="w-full flex justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Icon name="chevron-double-left" size={40} />
                </button>

                <button
                  onClick={handleTogglePlay}
                  disabled={!ready}
                  className="w-[45px] h-[45px] flex items-center justify-center cursor-pointer"
                >
                  {!ready || buffering ? (
                    <div className="spinner w-8 h-8 rounded-full border-4 border-white/20 border-t-white" />
                  ) : playing ? (
                    <Icon name="pause" size={45} />
                  ) : (
                    <Icon name="play" size={45} />
                  )}
                </button>

                <button
                  className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={goNext}
                  disabled={currentIndex >= tracks.length - 1 && repeatMode !== "all"}
                >
                  <Icon name="chevron-double-right" size={40} />
                </button>
              </div>

              <div className="flex items-center gap-2 w-40">
                <button onClick={cycleRepeatMode} className="cursor-pointer">
                  <Icon
                    name={repeatMode === "one" ? "repeat-one" : "repeat"}
                    size={20}
                    style={{ opacity: repeatMode === "off" ? 0.5 : 1 }}
                  />
                </button>
                <button className="cursor-pointer" onClick={toggleMute}>
                  {muted ? <Icon name="volume-mute" /> : <Icon name="volume-up" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volumePercent}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="progress-range progress-range-playhead flex-1"
                  style={
                    {
                      background: `linear-gradient(to right, ${rangeColor} ${volumePercent}%, rgba(255,255,255,0.2) ${volumePercent}%)`,
                      "--progress-percent": `${volumePercent}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
            {tracks.length > 1 && (
              <div className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                {currentIndex + 1} / {tracks.length}곡
              </div>
            )}
          </div>

          {desktopPanelOpen && (
            <div className="w-1/2 lg:flex-1 flex flex-col justify-center pr-16 pl-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  {!isPlaylistOpenDesktop && (currentTrack.lyrics.length > 1 || hasSyncedLyrics) && (
                    <div className="flex justify-center gap-2">
                      {currentTrack.lyrics.map((l) => (
                        <button
                          key={l.language}
                          onClick={() => setLyricsLang(l.language)}
                          className="px-3 py-1 rounded-full text-sm"
                          style={{
                            background: lyricsLang === l.language ? "rgba(255,255,255,0.2)" : "transparent",
                            color: lyricsLang === l.language ? "#fff" : "rgba(255,255,255,0.5)",
                          }}
                        >
                          {l.language === "ko" ? "한국어" : l.language === "ja" ? "일본어" : l.language}
                        </button>
                      ))}
                      {hasSyncedLyrics && (
                        <button
                          onClick={() => setLyricsLang("synced")}
                          className="px-3 py-1 rounded-full text-sm"
                          style={{
                            background: lyricsLang === "synced" ? "rgba(255,255,255,0.2)" : "transparent",
                            color: lyricsLang === "synced" ? "#fff" : "rgba(255,255,255,0.5)",
                          }}
                        >
                          실시간
                        </button>
                      )}
                    </div>
                  )}
                  {isPlaylistOpenDesktop && (
                    <span className="px-3 py-1 rounded-full text-sm" style={{ background: "rgba(255,255,255,0.2)" }}>
                      재생목록 · {tracks.length}곡
                    </span>
                  )}
                </div>
                <button onClick={() => setDesktopPanelOpen(false)} className="cursor-pointer flex-shrink-0 ml-2">
                  <Icon name="close" size={20} />
                </button>
              </div>

              <div className="h-[70vh]">
                {isPlaylistOpenDesktop ? (
                  <PlaylistTabView tracks={tracks} currentIndex={currentIndex} onSelectTrack={selectTrack} />
                ) : !ready || buffering ? (
                  <LoadingDots />
                ) : lyricsLang === "synced" ? (
                  <SyncedLyricsView
                    syncedLyrics={currentTrack.syncedLyrics}
                    syncedMarkers={currentTrack.syncedMarkers}
                    currentTime={currentTime}
                    currentTrack={currentTrack}
                  />
                ) : (
                  currentLyrics && (
                    <div className="h-full px-2 overflow-y-auto text-center scrollbar-thin">
                      {currentLyrics.content
                        .split("\n")
                        .filter((line) => line.trim().length > 0)
                        .map((line, i) => (
                          <p
                            key={i}
                            className="my-2 text-lg leading-relaxed"
                            style={{ color: "rgba(255,255,255,0.85)" }}
                            dangerouslySetInnerHTML={{ __html: sanitizeRubyHtml(line) }}
                          />
                        ))}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== 모바일(md 미만) 레이아웃 ===== */}
      <div className="relative z-10 flex md:hidden flex-col h-full">
        {isExpanded ? (
          <ExpandedMobileView
            currentTrack={currentTrack}
            artworkUrl={artworkUrl}
            showVideo={showVideo}
            onToggleVideo={() => setVideoOverride((prev) => !prev)}
            albumSlotRef={expandedAlbumSlotRef}
            titleMap={titleMap}
            lyricsLang={lyricsLang}
            setLyricsLang={setLyricsLang}
            hasSyncedLyrics={hasSyncedLyrics}
            currentLyrics={currentLyrics}
            ready={ready}
            buffering={buffering}
            currentTime={currentTime}
            progressValue={progressValue}
            progressPercent={progressPercent}
            duration={safeDuration}
            volumePercent={volumePercent}
            rangeColor={rangeColor}
            playing={playing}
            muted={muted}
            goPrev={goPrev}
            goNext={goNext}
            handleTogglePlay={handleTogglePlay}
            toggleMute={toggleMute}
            setVolume={setVolume}
            setSeeking={setSeeking}
            seek={seek}
            currentIndex={currentIndex}
            tracksLength={tracks.length}
            onCollapse={() => setIsExpanded(false)}
            tracks={tracks}
            onSelectTrack={selectTrack}
            repeatMode={repeatMode}
            onCycleRepeat={cycleRepeatMode}
          />
        ) : (
          <MiniPlayerView
            currentTrack={currentTrack}
            artworkUrl={artworkUrl}
            showVideo={showVideo}
            onToggleVideo={() => setVideoOverride((prev) => !prev)}
            albumSlotRef={miniAlbumSlotRef}
            titleMap={titleMap}
            progressValue={progressValue}
            progressPercent={progressPercent}
            duration={safeDuration}
            rangeColor={rangeColor}
            playing={playing}
            ready={ready}
            buffering={buffering}
            goPrev={goPrev}
            goNext={goNext}
            handleTogglePlay={handleTogglePlay}
            onExpand={() => setIsExpanded(true)}
            onShowPlaylist={() => {
              setIsExpanded(true);
              setLyricsLang("playlist");
            }}
            currentIndex={currentIndex}
            tracksLength={tracks.length}
            repeatMode={repeatMode}
            onCycleRepeat={cycleRepeatMode}
          />
        )}
      </div>
    </div>
  );
}

const MusicPlayerPage = () => {
  return (
    <Suspense fallback={<MessageWindow type="LOADING" text="불러오는 중..." />}>
      <MusicPlayerContent />
    </Suspense>
  );
};

export default MusicPlayerPage;
