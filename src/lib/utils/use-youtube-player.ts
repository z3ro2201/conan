"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// 유튜브 IFrame Player API는 전역 스크립트를 한 번만 로드해야 하고, 그 로드가 끝났다는 걸
// window.onYouTubeIframeAPIReady 콜백으로 알려주는 방식이라, 페이지에 여러 플레이어가 있어도
// 스크립트 자체는 딱 한 번만 불러오도록 모듈 스코프에서 Promise를 캐싱합니다.

interface YTPlayerInstance {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  destroy(): void;
}

interface YTNamespace {
  Player: new (element: HTMLElement, options: Record<string, unknown>) => YTPlayerInstance;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return apiPromise;
}

interface UseYouTubePlayerOptions {
  videoId: string;
  onEnded?: () => void;
  /** true면 플레이어가 준비되는 즉시 재생을 시도합니다. 브라우저 자동재생 정책상
      사용자 상호작용이 한 번도 없었던 세션에서는 무음이 아니면 막힐 수 있습니다. */
  autoplay?: boolean;
}

// 이 훅 하나가 "실제 재생 상태의 유일한 출처"가 되도록 설계했습니다.
// MusicPlayer(하단 바)와 NowPlayingOverlay(전체화면)처럼 같은 곡을 다르게 보여주는
// UI가 여러 개 있어도, 이 훅은 페이지에서 딱 한 번만 호출하고 상태/컨트롤 함수를
// 두 컴포넌트에 똑같이 내려주면 됩니다 (MusicPlayer/NowPlayingOverlay는 그래서 controlled
// 컴포넌트로 만들어져 있음 — 자체적으로 재생 상태를 갖지 않고 props로만 받음).

export function useYouTubePlayer({ videoId, onEnded, autoplay = false }: UseYouTubePlayerOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let pollId: ReturnType<typeof setInterval> | undefined;

    setReady(false);
    setPlaying(false);
    setCurrentTime(0);

    loadYouTubeApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: 0,
          autoplay: autoplay ? 1 : 0,
        },
        events: {
          onReady: (e: { target: YTPlayerInstance }) => {
            setReady(true);
            setDuration(e.target.getDuration());
            setVolumeState(e.target.getVolume());

            if (autoplay) {
              e.target.playVideo();
            }

            pollId = setInterval(() => {
              const player = playerRef.current;
              if (!player) return;
              setCurrentTime(player.getCurrentTime());
              const d = player.getDuration();
              if (d) setDuration(d);
            }, 500);
          },
          onStateChange: (e: { data: number }) => {
            setPlaying(e.data === window.YT!.PlayerState.PLAYING);
            if (e.data === window.YT!.PlayerState.ENDED) onEndedRef.current?.();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (pollId) clearInterval(pollId);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- videoId/autoplay가 바뀔 때만 플레이어를 새로 만들어야 함
  }, [videoId, autoplay]);

  const play = useCallback(() => playerRef.current?.playVideo(), []);
  const pause = useCallback(() => playerRef.current?.pauseVideo(), []);
  const togglePlay = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, play, pause]);

  const seek = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback(
    (value: number) => {
      playerRef.current?.setVolume(value);
      setVolumeState(value);
      if (value > 0 && muted) {
        playerRef.current?.unMute();
        setMuted(false);
      }
    },
    [muted],
  );

  const toggleMute = useCallback(() => {
    if (muted) {
      playerRef.current?.unMute();
      setMuted(false);
    } else {
      playerRef.current?.mute();
      setMuted(true);
    }
  }, [muted]);

  return {
    /** 이 ref를 실제 iframe이 들어갈 자리에 붙이세요. 음악처럼 소리만 필요하면
        시각적으로 숨긴 1px 컨테이너에, 영상처럼 화면이 보여야 하면 실제 영역에 붙이면 됩니다. */
    containerRef,
    ready,
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
