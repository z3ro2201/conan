"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  loadVideoById(videoId: string): void;
}

interface YTNamespace {
  Player: new (element: HTMLElement, options: Record<string, unknown>) => YTPlayerInstance;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number };
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
  autoplay?: boolean;
}

export function useYouTubePlayer({ videoId, onEnded, autoplay = false }: UseYouTubePlayerOptions) {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerEl(node);
  }, []);

  const playerRef = useRef<YTPlayerInstance | null>(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!containerEl) return;

    let cancelled = false;
    let pollId: ReturnType<typeof setInterval> | undefined;

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT) return;

      playerRef.current = new window.YT.Player(containerEl, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: 0,
        },
        events: {
          onReady: (e: { target: YTPlayerInstance }) => {
            setReady(true);
            setDuration(e.target.getDuration());
            setVolumeState(e.target.getVolume());

            pollId = setInterval(() => {
              const player = playerRef.current;
              if (!player) return;
              setCurrentTime(player.getCurrentTime());
              const d = player.getDuration();
              if (d) setDuration(d);
            }, 500);
          },
          onStateChange: (e: { data: number }) => {
            const YTState = window.YT!.PlayerState;
            setPlaying(e.data === YTState.PLAYING);
            setBuffering(e.data === 3); // YT.PlayerState.BUFFERING === 3
            if (e.data === YTState.ENDED) onEndedRef.current?.();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (pollId) clearInterval(pollId);
      playerRef.current?.destroy();
      playerRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerEl]);

  const previousVideoIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!ready) return;

    if (previousVideoIdRef.current === null) {
      previousVideoIdRef.current = videoId;
      return;
    }

    if (previousVideoIdRef.current === videoId) return;
    previousVideoIdRef.current = videoId;

    const player = playerRef.current;
    if (!player || !videoId) return;

    setCurrentTime(0);
    player.loadVideoById(videoId);

    if (autoplay) {
      player.playVideo();
    }
  }, [videoId, autoplay, ready]);

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
    containerRef,
    containerEl,
    ready,
    playing,
    buffering,
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
