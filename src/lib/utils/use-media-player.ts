"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type MediaElement = HTMLAudioElement | HTMLVideoElement;

// useYouTubePlayer와 반환값 모양(playing/currentTime/duration/volume/muted/togglePlay/seek/
// setVolume/toggleMute)을 똑같이 맞췄습니다. 그래서 MusicPlayer 같은 controlled UI
// 컴포넌트는 "지금 재생 상태가 유튜브에서 온 건지 일반 파일에서 온 건지" 전혀 몰라도 됩니다 —
// 둘 중 어느 훅을 호출하느냐만 바꾸면 같은 UI가 그대로 재사용됩니다.
//
// 유튜브 버전과의 차이는 ref 하나뿐입니다: 유튜브는 iframe이 들어갈 빈 컨테이너(containerRef)가
// 필요하지만, 이건 실제 <audio>/<video> 태그 자체에 mediaRef를 바로 붙입니다.

export function useMediaPlayer<T extends MediaElement = HTMLAudioElement>() {
  const mediaRef = useRef<T>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const onTime = () => setCurrentTime(media.currentTime);
    const onLoaded = () => setDuration(media.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVolumeEvent = () => {
      setVolumeState(Math.round(media.volume * 100));
      setMuted(media.muted);
    };

    media.addEventListener("timeupdate", onTime);
    media.addEventListener("loadedmetadata", onLoaded);
    media.addEventListener("play", onPlay);
    media.addEventListener("pause", onPause);
    media.addEventListener("volumechange", onVolumeEvent);

    return () => {
      media.removeEventListener("timeupdate", onTime);
      media.removeEventListener("loadedmetadata", onLoaded);
      media.removeEventListener("play", onPlay);
      media.removeEventListener("pause", onPause);
      media.removeEventListener("volumechange", onVolumeEvent);
    };
    // mediaRef.current는 <audio src={src}> / <video src={src}>가 리마운트될 때마다
    // (예: src가 바뀌어 key가 바뀌는 경우) 새로 붙기 때문에 별도 deps 없이 마운트 시 1회 등록으로 충분
  }, []);

  const play = useCallback(() => mediaRef.current?.play(), []);
  const pause = useCallback(() => mediaRef.current?.pause(), []);
  const togglePlay = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;
    if (media.paused) media.play();
    else media.pause();
  }, []);

  const seek = useCallback((seconds: number) => {
    const media = mediaRef.current;
    if (!media) return;
    media.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((value: number) => {
    const media = mediaRef.current;
    if (!media) return;
    media.volume = value / 100;
    if (value > 0 && media.muted) media.muted = false;
  }, []);

  const toggleMute = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;
    media.muted = !media.muted;
  }, []);

  return {
    /** 이 ref를 <audio> 또는 <video> 태그에 직접 붙이세요 (src도 그 태그에 직접 지정) */
    mediaRef,
    playing,
    currentTime,
    duration,
    volume,
    muted,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
  };
}

// ===== 사용 예시 (오디오) =====
//
// const player = useMediaPlayer<HTMLAudioElement>();
// <audio ref={player.mediaRef} src="/audio/track.mp3" className="hidden" />
// <MusicPlayer
//   title="너와 나" artist="한로로"
//   playing={player.playing} onTogglePlay={player.togglePlay}
//   currentTime={player.currentTime} duration={player.duration} onSeek={player.seek}
//   volume={player.volume} muted={player.muted}
//   onVolumeChange={player.setVolume} onToggleMute={player.toggleMute}
// />
//
// ===== 사용 예시 (비디오) — VideoPlayer 컴포넌트가 내부적으로 이 훅을 씀 =====
//
// <VideoPlayer src="/video/clip.mp4" title="사건 EP.849 요약 영상" />
