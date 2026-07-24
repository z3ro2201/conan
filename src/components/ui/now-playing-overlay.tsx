"use client";

import cn from "@/lib/utils/cn";
import { useId, useRef } from "react";
import { useDialogBehavior } from "@/lib/utils/use-dialog-behavior";
import { Icon } from "./icon";

export interface OverlayTrack {
  id: string;
  name: string;
  duration: string;
}

interface NowPlayingOverlayProps {
  open: boolean;
  onClose: () => void;
  trackName: string;
  albumName: string;
  lyricLine?: string;
  playing: boolean;
  onTogglePlay: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** 0~100 */
  progress: number;
  onSeek?: (percent: number) => void;
  currentTime: string;
  duration: string;
  tracks: OverlayTrack[];
  activeTrackId?: string;
  onTrackSelect?: (id: string) => void;
  /** 블러된 배경/커버 아트에 쓰이는 강조색 (앨범 대표색) */
  accentColor?: string;
  className?: string;
}

// MusicPlayer(인라인/미니)와 성격이 다른, 몰입형 전체화면 오버레이라 따로 만들었습니다.
// Dialog/Modal/Drawer/Popup/ImageViewer/CommandPalette와 같은 useDialogBehavior를 재사용해서
// 포커스 트랩·Escape·스크롤 잠금·포커스 복귀가 동일하게 동작합니다.

export function NowPlayingOverlay({
  open,
  onClose,
  trackName,
  albumName,
  lyricLine,
  playing,
  onTogglePlay,
  onPrev,
  onNext,
  progress,
  onSeek,
  currentTime,
  duration,
  tracks,
  activeTrackId,
  onTrackSelect,
  accentColor = "var(--primary)",
  className,
}: NowPlayingOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useDialogBehavior(open, onClose, containerRef);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      style={{ background: accentColor }}
      className={cn("fixed inset-0 z-[300] overflow-hidden", className)}
    >
      {/* 장식용 블러 배경 — 실제 앨범 커버 이미지가 있다면 그 이미지를 blur 처리해서 까는 자리 */}
      <div
        aria-hidden="true"
        style={{ background: accentColor }}
        className="absolute -inset-[10%] blur-3xl opacity-90"
      />
      <div
        aria-hidden="true"
        className="absolute w-[60%] aspect-square rounded-full bg-white/[0.18] blur-3xl -top-[10%] -left-[10%]"
      />
      <div
        aria-hidden="true"
        className="absolute w-[50%] aspect-square rounded-full bg-black/[0.18] blur-3xl -bottom-[15%] -right-[10%]"
      />

      <div className="relative h-full flex flex-col">
        <div className="flex justify-end items-center px-8 py-6">
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="w-[34px] h-[34px] rounded-full bg-white/15 text-white flex items-center justify-center cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-white/40"
          >
            <Icon name="close" size={14} />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 px-6 lg:px-12 pb-12 overflow-hidden">
          {/* 왼쪽: 커버, 메타, 가사, 진행바, 컨트롤 */}
          <div className="flex flex-col items-center justify-center gap-8 min-w-0">
            <div
              aria-hidden="true"
              className="w-[min(360px,80%)] aspect-square rounded-[22px] flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))" }}
            >
              <Icon name="music" size={72} className="text-white/70" />
            </div>

            <div className="text-center">
              <div id={titleId} className="text-2xl font-black text-white">
                {trackName}
              </div>
              <div className="text-[15px] text-white/75 mt-1">{albumName}</div>
            </div>

            {lyricLine && (
              <div aria-live="polite" className="text-lg font-bold text-white text-center min-h-[28px]">
                {lyricLine}
              </div>
            )}

            <div className="w-[min(500px,90%)]">
              <label className="sr-only" htmlFor="now-playing-seek">
                재생 위치
              </label>
              <input
                id="now-playing-seek"
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => onSeek?.(Number(e.target.value))}
                style={{ accentColor: "#fff" }}
                className="w-full h-[5px] cursor-pointer"
              />
              <div className="flex justify-between mt-1.5 text-xs text-white/70">
                <span>{currentTime}</span>
                <span>-{duration}</span>
              </div>
            </div>

            <div className="flex items-center gap-7">
              <button
                type="button"
                aria-label="이전 곡"
                onClick={onPrev}
                disabled={!onPrev}
                className="text-white/85 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed outline-none focus-visible:ring-4 focus-visible:ring-white/40 rounded-full"
              >
                <Icon name="skip-previous" size={22} />
              </button>
              <button
                type="button"
                aria-label={playing ? "일시정지" : "재생"}
                onClick={onTogglePlay}
                className="text-white cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-white/40 rounded-full"
              >
                <Icon name={playing ? "pause" : "play"} size={38} />
              </button>
              <button
                type="button"
                aria-label="다음 곡"
                onClick={onNext}
                disabled={!onNext}
                className="text-white/85 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed outline-none focus-visible:ring-4 focus-visible:ring-white/40 rounded-full"
              >
                <Icon name="skip-next" size={22} />
              </button>
            </div>
          </div>

          {/* 오른쪽: 트랙 목록 */}
          <div role="listbox" aria-label="트랙 목록" className="overflow-y-auto pr-1 min-h-0">
            {tracks.map((track) => {
              const active = track.id === activeTrackId;
              return (
                <button
                  key={track.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onTrackSelect?.(track.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-2 py-2.5 rounded-[10px] cursor-pointer text-left",
                    "outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                    active ? "bg-white/15" : "hover:bg-white/10",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="w-9 h-9 rounded-lg bg-white/15 shrink-0 flex items-center justify-center"
                  >
                    {active && playing && <Icon name="music" size={14} className="text-white" />}
                  </span>
                  <span
                    className={cn(
                      "flex-1 min-w-0 text-[13px] truncate",
                      active ? "font-black text-white" : "text-white/85",
                    )}
                  >
                    {track.name}
                  </span>
                  <span className="text-[11px] text-white/60 shrink-0">{track.duration}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 사용 예시 =====
//
// <NowPlayingOverlay
//   open={overlayOpen}
//   onClose={() => setOverlayOpen(false)}
//   trackName="메인 테마 (예시)"
//   albumName="OST 컬렉션 Vol.1"
//   lyricLine="이 도시 어딘가에 숨겨진 진실을 찾아서"
//   playing={playing}
//   onTogglePlay={() => setPlaying((v) => !v)}
//   onPrev={playPrevTrack}
//   onNext={playNextTrack}
//   progress={progress}
//   onSeek={(pct) => seekTo(pct)}
//   currentTime="1:24"
//   duration="3:42"
//   tracks={tracks}
//   activeTrackId={currentTrackId}
//   onTrackSelect={(id) => playTrack(id)}
//   accentColor="#1B4FA0"
// />
//
// 체크리스트
// - Dialog/Modal/Drawer/Popup/ImageViewer/CommandPalette와 동일한 useDialogBehavior 재사용
// - 진행바는 원본처럼 클릭만 되는 div가 아니라 진짜 <input type="range"> — 방향키로 탐색 가능
// - 가사 줄은 aria-live="polite"라 자동으로 바뀔 때마다 스크린리더가 새 줄을 읽어줌
// - 트랙 목록은 role="listbox"/role="option" — MusicPlayer 자체보다 이 오버레이가
//   "지금 재생 중인 곡을 고르는 화면"에 가까워서 CustomSelect와 같은 패턴을 씀
