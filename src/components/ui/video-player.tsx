"use client";

import { useMediaPlayer } from "@/lib/utils/use-media-player";
import { VideoPlayerChrome } from "./video-player-chrome";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}

// 자체 호스팅 mp4 파일 등 일반 <video> 소스용. 유튜브 영상이면 이 컴포넌트 말고
// YouTubeVideoPlayer를 쓰세요 — 둘 다 같은 VideoPlayerChrome을 공유해서 시각적으로는
// 완전히 동일하게 보입니다.

export function VideoPlayer({ src, poster, title, className }: VideoPlayerProps) {
  const player = useMediaPlayer<HTMLVideoElement>();

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
      onFullscreen={() => player.mediaRef.current?.requestFullscreen()}
      className={className}
    >
      <video
        ref={player.mediaRef}
        src={src}
        poster={poster}
        onClick={player.togglePlay}
        className="w-full h-full cursor-pointer"
      >
        {title && <track kind="captions" label={title} />}
      </video>
    </VideoPlayerChrome>
  );
}

// ===== 사용 예시 =====
//
// <VideoPlayer src="/case-849/clip.mp4" poster="/case-849/thumb.jpg" title="사건 EP.849 요약 영상" />
//
// 체크리스트
// - <track kind="captions">는 자리만 마련해뒀고 실제 자막 파일(.vtt)은 title 대신
//   src를 지정해서 연결하세요 — 자막 없는 영상 콘텐츠는 청각장애 사용자를 배제하게 됩니다
