// player/page.tsx 에서 반복되어 사용되는 부분을 모아둔 UI 컴포넌트입니다.

import cn from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/formatTime";
import { LoadingDots } from "./loadingDots";
import { Icon } from "./icon";
import React, { ButtonHTMLAttributes } from "react";
import { repeatModeTypes } from "@/lib/utils/player";
export const PlayTimeDisplay = ({
  className,
  progressValue,
  safeDuration,
}: {
  className: string;
  progressValue: number;
  safeDuration: number;
}) => {
  return (
    <div className={cn(className)}>
      <span className="text-sm tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
        {formatTime(progressValue)}
      </span>
      <span className="text-sm tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
        -{formatTime(Math.max(safeDuration - progressValue, 0))}
      </span>
    </div>
  );
};

export const MessageWindow = ({ type, text }: { type: "LOADING" | "ERROR"; text: string }) => {
  return (
    <div
      className="w-screen h-screen absolute top-0 left-0 z-100 flex items-center justify-center flex-col gap-2"
      style={{ background: "linear-gradient(180deg, #1e1e1e 0%, #3a3a3a 100%)" }}
    >
      {type === "LOADING" && <LoadingDots isFull={false} />}
      <h1>{text}</h1>
    </div>
  );
};

interface PlayButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ready: boolean;
  buffering: boolean;
  playing: boolean;
  size: number;
}

export const PlayButton = ({ ready, buffering, playing, className, size, ...props }: PlayButtonProps) => {
  return (
    <button
      disabled={!ready}
      className={cn(className ?? "w-[45px] h-[45px] flex items-center justify-center", "cursor-pointer")}
      {...props}
    >
      {!ready || buffering ? (
        <div className={cn(`spinner w-${size} h-${size} rounded-full border-4 border-white/20 border-t-white`)} />
      ) : playing ? (
        <Icon name="pause" size={40} />
      ) : (
        <Icon name="play" size={40} />
      )}
    </button>
  );
};

interface NextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  currentIndex: number;
  tracksLength: number;
  repeatMode: repeatModeTypes;
  size: number;
}

export const GoNextButton = ({ currentIndex, tracksLength, repeatMode, size, ...props }: NextButtonProps) => {
  return (
    <button
      className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
      disabled={currentIndex >= tracksLength - 1 && repeatMode !== "all"}
      {...props}
    >
      <Icon name="chevron-double-right" size={size} />
    </button>
  );
};

interface PrevButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  currentIndex: number;
  size: number;
}
export const GoPrevButton = ({ currentIndex, size, ...props }: PrevButtonProps) => {
  return (
    <button
      disabled={currentIndex === 0}
      className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
      {...props}
    >
      <Icon name="chevron-double-left" size={size} />
    </button>
  );
};

interface SeekBarProps {
  progressValue: number;
  progressPercent: number;
  rangeColor: string;
  safeDuration?: number;
  setSeeking?: (value: number | null) => void;
  seek?: (value: number) => void;
  interactive?: boolean;
}

export const SeekBar = ({
  progressValue,
  progressPercent,
  rangeColor,
  safeDuration,
  setSeeking,
  seek,
  interactive = true,
}: SeekBarProps) => {
  const style = {
    background: `linear-gradient(to right, ${rangeColor} ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
    "--progress-percent": `${progressPercent}%`,
  } as React.CSSProperties;

  if (!interactive) {
    return <div className="progress-range progress-range-playhead w-full h-1 rounded-full" style={style} />;
  }

  return (
    <input
      type="range"
      min={0}
      max={safeDuration ?? 0}
      step={0.1}
      value={progressValue}
      onChange={(e) => setSeeking?.(Number(e.target.value))}
      onMouseUp={(e) => {
        seek?.(Number((e.target as HTMLInputElement).value));
        setSeeking?.(null);
      }}
      onTouchEnd={(e) => {
        seek?.(Number((e.target as HTMLInputElement).value));
        setSeeking?.(null);
      }}
      className="progress-range progress-range-playhead w-full"
      style={style}
    />
  );
};

interface YoutubeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  className?: string;
  showVideo: boolean;
}

export const YoutubeButton = ({ size, className, style, showVideo, ...props }: YoutubeButtonProps) => {
  return (
    <button className="cursor-pointer flex-shrink-0" {...props}>
      <Icon name="youtube" size={size ?? 22} style={{ opacity: showVideo ? 1 : 0.7 }} />
    </button>
  );
};

interface CommonPlayerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const LyricsButton = ({ size, className, style, ...props }: CommonPlayerButtonProps) => {
  return (
    <button className="cursor-pointer flex-shrink-0" {...props}>
      <Icon name="lyrics" size={size ?? 22} style={style} />
    </button>
  );
};

export const ListButton = ({ size, className, style, ...props }: CommonPlayerButtonProps) => {
  return (
    <button className="cursor-pointer flex-shrink-0" {...props}>
      <Icon name="list" size={size ?? 22} />
    </button>
  );
};

export const ExpandButton = ({ size, className, style, ...props }: CommonPlayerButtonProps) => {
  return (
    <button className="cursor-pointer flex-shrink-0" {...props}>
      <Icon name="chevron-double-up" size={size ?? 22} />
    </button>
  );
};
export const RepeatButton = ({
  size,
  className,
  style,
  repeatMode,
  ...props
}: CommonPlayerButtonProps & {
  repeatMode: repeatModeTypes;
}) => {
  return (
    <button className="cursor-pointer flex-shrink-0" {...props}>
      <Icon
        name={repeatMode === "one" ? "repeat-one" : "repeat"}
        size={22}
        style={{ opacity: repeatMode === "off" ? 0.5 : 1 }}
      />
    </button>
  );
};
