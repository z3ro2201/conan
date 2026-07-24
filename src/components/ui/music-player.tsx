"use client";

import cn from "@/lib/utils/cn";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./icon";

interface MusicPlayerProps {
  src: string;
  title: string;
  artist: string;
  variant?: "full" | "mini";
  /** 있으면 전체화면(NowPlayingOverlay 등)으로 확장하는 버튼이 추가로 표시됨 */
  onExpand?: () => void;
  /** mini variant 전용 — 있으면 우측 상단에 닫기(✕) 버튼이 표시됨 */
  onDismiss?: () => void;
  className?: string;
}

// VideoPlayer와 같은 이유로 진행바/음량 둘 다 실제 <input type="range">를 씁니다
// (원본은 div 기반이라 키보드 조작이 불가능했음). full/mini 두 모습을 하나의 컴포넌트로
// 묶어서 재생 로직(재생/일시정지/시크/음량)을 중복 없이 공유합니다.

export function MusicPlayer({
  src,
  title,
  artist,
  variant = "full",
  onExpand,
  onDismiss,
  className,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrent(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrent(value);
  };

  const changeVolume = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = value / 100;
    setVolume(value);
    if (value > 0 && audio.muted) {
      audio.muted = false;
      setMuted(false);
    }
  };

  const audioEl = <audio ref={audioRef} src={src} />;

  if (variant === "mini") {
    return (
      <div
        className={cn(
          "w-60 rounded-2xl overflow-hidden shadow-[0_12px_28px_rgba(20,30,60,0.18)] bg-primary",
          className,
        )}
      >
        {audioEl}
        <div
          role={onExpand ? "button" : undefined}
          tabIndex={onExpand ? 0 : undefined}
          onClick={onExpand}
          onKeyDown={(e) => onExpand && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onExpand())}
          className={cn(
            "p-3 flex items-center gap-2.5 bg-gradient-to-br from-black/15 to-black/35",
            onExpand && "cursor-pointer",
          )}
        >
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-white font-black shrink-0">
            ♪
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{title}</div>
            <div className="text-[10px] text-white/75 truncate">{artist}</div>
          </div>
          <button
            type="button"
            aria-label={playing ? "일시정지" : "재생"}
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-[26px] h-[26px] rounded-full bg-white text-[#1B1F2A] flex items-center justify-center cursor-pointer shrink-0"
          >
            <Icon name={playing ? "pause" : "play"} size={11} />
          </button>
          {onDismiss && (
            <button
              type="button"
              aria-label="미니 플레이어 닫기"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="w-6 h-6 rounded-full bg-white/15 text-white flex items-center justify-center cursor-pointer shrink-0"
            >
              <Icon name="close" size={11} />
            </button>
          )}
        </div>
        <label className="sr-only" htmlFor="mini-music-seek">
          재생 위치
        </label>
        <input
          id="mini-music-seek"
          type="range"
          min={0}
          max={duration || 0}
          value={current}
          onChange={(e) => seek(Number(e.target.value))}
          style={{ accentColor: "#fff" }}
          className="w-full h-[3px] cursor-pointer block"
        />
      </div>
    );
  }

  return (
    <div className={cn("max-w-[520px] bg-[#1B1F2A] rounded-2xl px-[18px] py-3.5 flex items-center gap-4", className)}>
      {audioEl}
      <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center text-white font-black shrink-0">
        ♪
      </div>
      <div className="w-[130px] shrink-0 min-w-0">
        <div className="text-[13px] font-bold text-white truncate">{title}</div>
        <div className="text-[11px] text-white/60 truncate">{artist}</div>
      </div>
      <button
        type="button"
        aria-label={playing ? "일시정지" : "재생"}
        onClick={togglePlay}
        className="w-9 h-9 rounded-full bg-danger text-white flex items-center justify-center cursor-pointer shrink-0"
      >
        <Icon name={playing ? "pause" : "play"} size={14} />
      </button>
      <div className="flex-1 flex items-center gap-2.5 min-w-0">
        <label className="sr-only" htmlFor="music-seek">
          재생 위치
        </label>
        <input
          id="music-seek"
          type="range"
          min={0}
          max={duration || 0}
          value={current}
          onChange={(e) => seek(Number(e.target.value))}
          style={{ accentColor: "var(--danger)" }}
          className="flex-1 h-1 cursor-pointer"
        />
      </div>
      <button
        type="button"
        aria-label={muted ? "음소거 해제" : "음소거"}
        onClick={toggleMute}
        className="text-white cursor-pointer shrink-0"
      >
        <Icon name={muted ? "volume-mute" : "volume-up"} size={14} />
      </button>
      <label className="sr-only" htmlFor="music-volume">
        음량
      </label>
      <input
        id="music-volume"
        type="range"
        min={0}
        max={100}
        value={muted ? 0 : volume}
        onChange={(e) => changeVolume(Number(e.target.value))}
        style={{ accentColor: "var(--danger)" }}
        className="w-[70px] shrink-0 cursor-pointer"
      />
      {onExpand && (
        <button
          type="button"
          aria-label="전체화면으로 보기"
          onClick={onExpand}
          className="bg-white/10 text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer shrink-0"
        >
          ⤢ 팝업으로 보기
        </button>
      )}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <MusicPlayer src="/audio/track.mp3" title="너와 나" artist="OST 컬렉션 Vol.1" />
// <MusicPlayer src="/audio/track.mp3" title="너와 나" artist="한로로" variant="mini" />
