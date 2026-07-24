"use client";

import { useYouTubePlayer } from "@/lib/utils/use-youtube-player";
import { VideoPlayerChrome } from "./video-player-chrome";

interface YouTubeVideoPlayerProps {
  /** 유튜브 영상 ID (URL의 v= 뒤 부분, 예: "dQw4w9WgXcQ") */
  videoId: string;
  className?: string;
}

// 유튜브 자체 컨트롤은 꺼두고(controls:0) VideoPlayerChrome의 커스텀 바만 노출합니다.
// 일반 파일(mp4 등) 재생이면 이 컴포넌트 말고 VideoPlayer를 쓰세요.

export function YouTubeVideoPlayer({ videoId, className }: YouTubeVideoPlayerProps) {
  const player = useYouTubePlayer({ videoId });

  return (
    <VideoPlayerChrome
      playing={player.playing}
      onTogglePlay={player.togglePlay}
      currentTime={player.currentTime}
      duration={player.duration}
      onSeek={player.seek}
      muted={player.muted}
      volume={player.volume}
      onToggleMute={player.toggleMute}
      onVolumeChange={player.setVolume}
      onFullscreen={() => player.containerEl?.querySelector("iframe")?.requestFullscreen()}
      className={className}
    >
      <div ref={player.containerRef} className="w-full h-full" />
    </VideoPlayerChrome>
  );
}

// ===== 사용 예시 =====
//
// <YouTubeVideoPlayer videoId="dQw4w9WgXcQ" />
//
// 체크리스트
// - 유튜브 임베드는 브라우저 자동재생 정책상 처음엔 음소거 상태로 시작될 수 있음 —
//   재생 버튼을 누르는 사용자 제스처 이후엔 음소거 해제가 정상 동작합니다
// - 자막은 유튜브 영상 자체에 등록된 자막을 그대로 씀 (이 컴포넌트가 별도 자막을 받지 않음)
