import cn from "@/lib/utils/cn";
import { Icon } from "./icon";
import { IconButton } from "./button";

interface VideoPlayerChromeProps {
  /** 실제 비디오 화면(유튜브 iframe 컨테이너 또는 <video> 태그)이 여기 들어감 */
  children: React.ReactNode;
  playing: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  muted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (value: number) => void;
  onFullscreen?: () => void;
  className?: string;
}

// YouTubeVideoPlayer와 VideoPlayer(일반 video)는 재생 소스만 다르고 컨트롤 바 UI는
// 완전히 동일해서, 그 UI 부분만 여기로 뽑아 공유합니다. 두 컴포넌트 다 이 컴포넌트에
// 실제 화면 요소(iframe 컨테이너 또는 <video>)만 children으로 넘기면 됩니다.

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoPlayerChrome({
  children,
  playing,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  muted,
  volume,
  onToggleMute,
  onVolumeChange,
  onFullscreen,
  className,
}: VideoPlayerChromeProps) {
  return (
    <div className={cn("max-w-[480px] rounded-2xl bg-[#1B1F2A]", className)}>
      <div className="relative aspect-video bg-black">
        {children}
        {!playing && (
          <button
            type="button"
            aria-label="재생"
            onClick={onTogglePlay}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
          >
            <span className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center text-white">
              <Icon name="play" size={22} />
            </span>
          </button>
        )}
      </div>

      <div className="px-3.5 py-3">
        <label className="sr-only" htmlFor="video-chrome-seek">
          재생 위치
        </label>
        <input
          id="video-chrome-seek"
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          style={{ accentColor: "var(--danger)" }}
          className="w-full h-1 mb-2.5 cursor-pointer"
        />

        <div className="flex items-center gap-3.5">
          <button
            type="button"
            aria-label={playing ? "일시정지" : "재생"}
            onClick={onTogglePlay}
            className="text-white cursor-pointer"
          >
            <Icon name={playing ? "pause" : "play"} size={16} />
          </button>
          <span className="text-[11px] text-white/60">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div className="flex-1" />
          <button
            type="button"
            aria-label={muted ? "음소거 해제" : "음소거"}
            onClick={onToggleMute}
            className="text-white/85 cursor-pointer"
          >
            <Icon name={muted ? "volume-mute" : "volume-up"} size={15} />
          </button>
          <label className="sr-only" htmlFor="video-chrome-volume">
            음량
          </label>
          <input
            id="video-chrome-volume"
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            style={{ accentColor: "var(--danger)" }}
            className="w-[60px] cursor-pointer"
          />
          {onFullscreen && (
            <IconButton
              icon={<Icon name="video" size={13} />}
              aria-label="전체화면"
              size="sm"
              onClick={onFullscreen}
              className="bg-transparent text-white/70 hover:bg-white/10"
            />
          )}
        </div>
      </div>
    </div>
  );
}
