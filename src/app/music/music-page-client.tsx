"use client";

import { useState } from "react";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icon";
import { Checkbox } from "@/components/ui/checkbox";
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

const PLAYER_WINDOW_NAME = "conan-wiki-music-player";

export function MusicPageClient({ tracks }: MusicPageClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (trackId: string) => {
    setSelectedIds((prev) => (prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]));
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === tracks.length ? [] : tracks.map((t) => t.id)));
  };

  const clearSelection = () => setSelectedIds([]);

  // 재생 버튼: 새창으로 열되, 이미 열려있으면 그 창을 재사용
  const playTrack = (trackId: string) => {
    window.open(`/music/player?playId=${trackId}`, PLAYER_WINDOW_NAME);
  };

  // 선택된 여러 곡 재생: 단일 곡이면 쿼리스트링, 여러 곡이면 sessionStorage
  const playSelected = () => {
    if (selectedIds.length === 0) return;

    if (selectedIds.length === 1) {
      window.open(`/music/player?playId=${selectedIds[0]}`, PLAYER_WINDOW_NAME);
      return;
    }

    sessionStorage.setItem("playlist", JSON.stringify(selectedIds));
    window.open("/music/player", PLAYER_WINDOW_NAME);
  };

  // "재생목록에 추가": 플레이어 창이 열려있으면 postMessage로 곡 추가, 없으면 새로 재생 시작
  const addToPlaylist = (trackId: string) => {
    const playerWindow = window.open("", PLAYER_WINDOW_NAME);

    if (!playerWindow || playerWindow.closed) {
      window.open(`/music/player?playId=${trackId}`, PLAYER_WINDOW_NAME);
      return;
    }

    playerWindow.postMessage({ type: "ADD_TO_PLAYLIST", trackId }, window.location.origin);
    playerWindow.focus();
  };

  if (tracks.length === 0) {
    return <div className="p-8">등록된 곡이 없습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1120px] mx-auto px-6 py-8">
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
                      className="flex-1 flex items-center gap-3.5 cursor-pointer text-left"
                    >
                      <span aria-hidden="true" className="w-6 text-center text-muted-light">
                        <Icon name="play" size={13} className="mx-auto" />
                      </span>
                      <span className="flex-1 text-sm font-medium text-foreground">{title}</span>
                    </button>

                    <button
                      onClick={() => addToPlaylist(track.id)}
                      className="text-xs text-muted-light hover:text-primary px-2 cursor-pointer"
                      title="재생 중인 목록에 추가"
                    >
                      + 재생목록
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
