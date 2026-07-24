"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icon";
import { Checkbox } from "@/components/ui/checkbox";
import { useYouTubePlayer } from "@/lib/utils/use-youtube-player";
import cn from "@/lib/utils/cn";

interface SerializedTrack {
  id: string;
  artist: string;
  youtubeUrl: string;
  series: { id: string; title: string | null };
  titles: { language: string; title: string }[];
}

interface MusicPageClientProps {
  tracks: SerializedTrack[];
}

const extractVideoId = (url: string): string => {
  try {
    return new URL(url).searchParams.get("v") ?? "";
  } catch {
    return "";
  }
};

export function MusicPageClient({ tracks }: MusicPageClientProps) {
  const router = useRouter();

  const [activeTrackId, setActiveTrackId] = useState(tracks[0]?.id ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const activeTrack = tracks.find((t) => t.id === activeTrackId) ?? tracks[0];
  const activeIndex = tracks.findIndex((t) => t.id === activeTrack?.id);

  const videoId = activeTrack ? extractVideoId(activeTrack.youtubeUrl) : "";

  const player = useYouTubePlayer({
    videoId,
    onEnded: () => shiftTrack(1),
  });

  function shiftTrack(delta: number) {
    if (tracks.length === 0) return;
    const next = tracks[(activeIndex + delta + tracks.length) % tracks.length];
    setActiveTrackId(next.id);
  }

  const playTrack = (trackId: string) => {
    setActiveTrackId(trackId);
  };

  const toggleSelect = (trackId: string) => {
    setSelectedIds((prev) => (prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]));
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === tracks.length ? [] : tracks.map((t) => t.id)));
  };

  const clearSelection = () => setSelectedIds([]);

  // 단일 곡이면 쿼리스트링(공유 가능), 여러 곡이면 sessionStorage(같은 브라우저 한정)
  const playSelected = () => {
    if (selectedIds.length === 0) return;

    if (selectedIds.length === 1) {
      router.push(`/music/player?playId=${selectedIds[0]}`);
      return;
    }

    sessionStorage.setItem("playlist", JSON.stringify(selectedIds));
    router.push("/music/player");
  };

  if (!activeTrack) {
    return <div className="p-8">등록된 곡이 없습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div ref={player.containerRef} className="fixed w-px h-px overflow-hidden opacity-0 pointer-events-none" />
      <main className="max-w-[1120px] mx-auto px-6 py-8 pb-[140px]">
        <Typography variant="h1" className="text-[26px] mb-1">
          OST 감상실
        </Typography>

        <div className="bg-surface rounded-2xl shadow-[0_2px_8px_rgba(20,30,60,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedIds.length === tracks.length}
                onChange={toggleSelectAll}
                aria-label="전체 선택"
              />
              <span className="font-black text-[17px] text-primary">트랙 목록</span>
              {selectedIds.length > 0 && (
                <span className="text-xs text-muted-light">{selectedIds.length}개 선택됨</span>
              )}
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={playSelected} className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white">
                  선택 재생
                </button>
                <button onClick={clearSelection} className="px-3 py-1.5 text-sm rounded-lg text-muted-light">
                  선택 해제
                </button>
              </div>
            )}
          </div>

          <ul className="list-none m-0 p-0">
            {tracks.map((track) => {
              const isActive = track.id === activeTrack.id;
              const isSelected = selectedIds.includes(track.id);
              const title = track.titles.find((t) => t.language === "ko")?.title ?? track.artist;

              return (
                <li key={track.id} className="border-b border-background last:border-none">
                  <div className="flex items-center gap-3 px-5 py-3 hover:bg-background">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleSelect(track.id)}
                      aria-label={`${title} 선택`}
                    />
                    <button
                      type="button"
                      onClick={() => playTrack(track.id)}
                      aria-current={isActive ? "true" : undefined}
                      className="flex-1 flex items-center gap-3.5 cursor-pointer text-left"
                    >
                      <span
                        aria-hidden="true"
                        className={cn("w-6 text-center", isActive ? "text-danger" : "text-muted-light")}
                      >
                        <Icon name={isActive && player.playing ? "pause" : "play"} size={13} className="mx-auto" />
                      </span>
                      <span
                        className={cn(
                          "flex-1 text-sm",
                          isActive ? "font-black text-danger" : "font-medium text-foreground",
                        )}
                      >
                        {title}
                      </span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </div>
  );
}
