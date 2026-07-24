"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useYouTubePlayer } from "@/lib/utils/use-youtube-player";
import { Icon } from "@/components/ui/icon";
import { interleaveLyricsLines } from "@/lib/utils/interleave-lyrics";

type SyncedLine = { time: number; text: string };

type TrackWithRelations = {
  id: string;
  artist: string;
  youtubeUrl: string;
  trackType: string;
  dubType: string;
  appleMusicMeta: {
    artistId: number;
    artworkUrl100: string;
    artworkUrl1000: string | null;
    palette: {
      darkMuted: string;
      darkVibrant: string;
      lightMuted: string;
      lightVibrant: string;
      muted: string;
      vibrant: string;
    } | null;
  } | null;
  series: {
    id: string;
    seriesType: string;
    number: number;
    title: string | null;
  };
  titles: { language: string; title: string }[];
  lyrics: { language: string; content: string }[];
  syncedLyrics: { language: string; lines: SyncedLine[] }[];
};

const extractVideoId = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("v") ?? "";
  } catch {
    return "";
  }
};

const fetchTracks = async (playIds: string[]): Promise<TrackWithRelations[]> => {
  if (playIds.length === 1) {
    const res = await fetch(`/api/music/tracks/${playIds[0]}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.error ?? "트랙을 불러오지 못했습니다.");
    }
    const track = await res.json();
    return [track];
  }

  const res = await fetch("/api/music/tracks/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playIds }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.error ?? "트랙을 불러오지 못했습니다.");
  }
  const tracks: TrackWithRelations[] = await res.json();

  return playIds.map((id) => tracks.find((t) => t.id === id)).filter((t): t is TrackWithRelations => Boolean(t));
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const getActiveTime = (lines: { time: number }[], currentTimeMs: number): number | null => {
  let activeTime: number | null = null;
  for (const line of lines) {
    if (line.time <= currentTimeMs) {
      activeTime = line.time;
    } else {
      break;
    }
  }
  return activeTime;
};

const LANGUAGE_PRIORITY: Record<string, number> = { ja: 0, ko: 1, en: 2 };

function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1.5 min-h-[70vh] max-h-[70vh]">
      <span className="loading-dot w-2.5 h-2.5 rounded-full bg-white" />
      <span className="loading-dot w-2.5 h-2.5 rounded-full bg-white" />
      <span className="loading-dot w-2.5 h-2.5 rounded-full bg-white" />
    </div>
  );
}

interface SyncedLyricsViewProps {
  syncedLyrics: { language: string; lines: SyncedLine[] }[];
  currentTime: number;
}

function SyncedLyricsView({ syncedLyrics, currentTime }: SyncedLyricsViewProps) {
  const currentTimeMs = currentTime * 1000;

  const sorted = [...syncedLyrics].sort(
    (a, b) => (LANGUAGE_PRIORITY[a.language] ?? 99) - (LANGUAGE_PRIORITY[b.language] ?? 99),
  );
  const merged = interleaveLyricsLines(sorted);

  const activeTime = getActiveTime(merged, currentTimeMs);
  const activeLines = merged.filter((line) => activeTime !== null && line.time === activeTime);

  if (activeLines.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] max-h-[70vh]">
        <p style={{ color: "rgba(255,255,255,0.3)" }}>♪</p>
      </div>
    );
  }

  return (
    <div
      key={activeTime}
      className="flex flex-col items-center justify-center gap-2 min-h-[70vh] max-h-[70vh] overflow-hidden"
    >
      {activeLines.map((line, i) => (
        <div
          key={i}
          className="lyric-wave-in text-2xl font-bold"
          style={{ color: "#fff", animationDelay: `${i * 0.08}s` }}
        >
          {line.text}
        </div>
      ))}
    </div>
  );
}

const MusicPlayerPage = () => {
  const searchParams = useSearchParams();

  const [tracks, setTracks] = useState<TrackWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seeking, setSeeking] = useState<number | null>(null);
  const [lyricsLang, setLyricsLang] = useState<string>("ko");
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    const playIdParamRaw = (searchParams.get("playId") ?? "").trim();

    let playIds: string[] = [];

    if (playIdParamRaw) {
      playIds = playIdParamRaw
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    } else {
      const stored = sessionStorage.getItem("playlist");
      if (stored) {
        try {
          playIds = JSON.parse(stored);
        } catch {
          playIds = [];
        }
      }
    }

    if (playIds.length === 0) {
      setError("재생할 곡 정보가 없습니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchTracks(playIds)
      .then((result) => {
        setTracks(result);
        setCurrentIndex(0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const currentTrack = tracks[currentIndex];
  const videoId = currentTrack ? extractVideoId(currentTrack.youtubeUrl) : "";

  const goNext = useCallback(() => {
    setCurrentIndex((i) => {
      if (i + 1 < tracks.length) {
        if (userInteracted) setShouldAutoplay(true); // 사용자가 한 번 재생한 적 있어야 다음곡 자동재생 허용
        return i + 1;
      }
      return i;
    });
  }, [tracks.length, userInteracted]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => {
      if (i > 0) {
        if (userInteracted) setShouldAutoplay(true); // 이전곡도 동일하게 처리
        return i - 1;
      }
      return i;
    });
  }, [userInteracted]);

  const {
    containerRef,
    ready,
    playing,
    currentTime,
    duration,
    volume,
    muted,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
  } = useYouTubePlayer({
    videoId,
    onEnded: goNext,
    autoplay: shouldAutoplay,
  });

  if (loading) return <div>불러오는 중...</div>;
  if (error) return <div>{error}</div>;
  if (!currentTrack || !videoId) return <div>재생할 곡이 없습니다.</div>;

  const handleTogglePlay = () => {
    setUserInteracted(true); // 최초 재생 버튼 클릭 시점부터 "사용자 상호작용 있었음"으로 기록
    setShouldAutoplay(true);
    togglePlay();
  };

  const progressValue = seeking ?? currentTime;
  const progressPercent = duration > 0 ? (progressValue / duration) * 100 : 0;
  const volumePercent = muted ? 0 : volume;

  const titleMap = {
    ko: currentTrack.titles.find((item) => item.language === "ko")?.title ?? null,
    ja: currentTrack.titles.find((item) => item.language === "ja")?.title ?? null,
  };

  const palette = currentTrack.appleMusicMeta?.palette;
  const bgGradient = palette
    ? `linear-gradient(180deg, ${palette.muted} 0%, ${palette.vibrant} 100%)`
    : "linear-gradient(180deg, #1e1e1e 0%, #1e1e1e 100%)";
  const rangeColor = palette?.darkVibrant ?? "#2563eb";
  const artworkUrl = currentTrack.appleMusicMeta?.artworkUrl1000 ?? currentTrack.appleMusicMeta?.artworkUrl100;

  const currentLyrics = currentTrack.lyrics.find((l) => l.language === lyricsLang) ?? currentTrack.lyrics[0];
  const hasSyncedLyrics = currentTrack.syncedLyrics.length > 0;

  return (
    <div
      className="relative min-w-screen min-h-screen transition-[background] duration-500 overflow-hidden"
      style={{ background: bgGradient, color: "#fff" }}
    >
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: artworkUrl ? `url(${artworkUrl})` : undefined,
          backgroundSize: "90%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.35,
          zIndex: 0,
        }}
      />

      <div
        className="backdrop-blur-2xl"
        style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.45)", zIndex: 1 }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="w-full max-w-6xl flex flex-col md:flex-row mx-auto">
          <div className="w-full md:w-1/2 lg:w-[45%] lg:max-w-[480px] flex flex-col justify-center items-start px-6 md:pl-16 md:pr-8 gap-6 py-10 md:py-0">
            {artworkUrl && (
              <div className="w-full flex items-center justify-center">
                <img src={artworkUrl} className="w-48 h-48 md:w-64 md:h-64 shadow-2xl object-cover rounded-md" />
              </div>
            )}

            <div className="w-full justify-center">
              <h1 className="m-0 p-0 text-2xl font-bold">
                {currentTrack.dubType === "ORIGINAL"
                  ? (titleMap.ja ?? currentTrack.artist)
                  : (titleMap.ko ?? currentTrack.artist)}
              </h1>
              <p className="m-0 p-0 mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                {currentTrack.artist}
              </p>
            </div>

            <div className="w-full">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={progressValue}
                onChange={(e) => setSeeking(Number(e.target.value))}
                onMouseUp={(e) => {
                  seek(Number((e.target as HTMLInputElement).value));
                  setSeeking(null);
                }}
                onTouchEnd={(e) => {
                  seek(Number((e.target as HTMLInputElement).value));
                  setSeeking(null);
                }}
                className="progress-range w-full"
                style={{
                  background: `linear-gradient(to right, ${rangeColor} ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
                }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-sm tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {formatTime(progressValue)}
                </span>
                <span className="text-sm tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
                  -{formatTime(Math.max(duration - progressValue, 0))}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button onClick={goPrev} disabled={currentIndex === 0} className="cursor-pointer">
                <Icon name="chevron-double-left" size={40} />
              </button>

              <button
                onClick={handleTogglePlay}
                disabled={!ready}
                className="w-[45px] h-[45px] flex items-center justify-center cursor-pointer"
              >
                {!ready ? (
                  <div className="spinner w-8 h-8 rounded-full border-4 border-white/20 border-t-white" />
                ) : playing ? (
                  <Icon name="pause" size={45} />
                ) : (
                  <Icon name="play" size={45} />
                )}
              </button>

              <button className="cursor-pointer" onClick={goNext} disabled={currentIndex >= tracks.length - 1}>
                <Icon name="chevron-double-right" size={40} />
              </button>
            </div>

            <div className="flex items-center gap-2 w-40">
              <button className="cursor-pointer" onClick={toggleMute}>
                {muted ? <Icon name="volume-mute" /> : <Icon name="volume-up" />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={volumePercent}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="progress-range flex-1"
                style={{
                  background: `linear-gradient(to right, ${rangeColor} ${volumePercent}%, rgba(255,255,255,0.2) ${volumePercent}%)`,
                }}
              />
            </div>
          </div>

          <div className="w-full md:w-1/2 lg:flex-1 flex flex-col justify-center px-6 md:pr-16 md:pl-8 py-10 md:py-0">
            {(currentTrack.lyrics.length > 1 || hasSyncedLyrics) && (
              <div className="flex justify-center gap-2 mb-4">
                {currentTrack.lyrics.map((l) => (
                  <button
                    key={l.language}
                    onClick={() => setLyricsLang(l.language)}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      background: lyricsLang === l.language ? "rgba(255,255,255,0.2)" : "transparent",
                      color: lyricsLang === l.language ? "#fff" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {l.language === "ko" ? "한국어" : l.language === "ja" ? "일본어" : l.language}
                  </button>
                ))}
                {hasSyncedLyrics && (
                  <button
                    onClick={() => setLyricsLang("synced")}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      background: lyricsLang === "synced" ? "rgba(255,255,255,0.2)" : "transparent",
                      color: lyricsLang === "synced" ? "#fff" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    실시간
                  </button>
                )}
              </div>
            )}

            {!ready ? (
              <LoadingDots />
            ) : lyricsLang === "synced" ? (
              <SyncedLyricsView syncedLyrics={currentTrack.syncedLyrics} currentTime={currentTime} />
            ) : (
              currentLyrics && (
                <div className="px-2 min-h-[70vh] max-h-[70vh] overflow-y-auto text-center scrollbar-thin">
                  {currentLyrics.content
                    .split("\n")
                    .filter((line) => line.trim().length > 0)
                    .map((line, i) => (
                      <p key={i} className="my-2 text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                        {line}
                      </p>
                    ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerPage;
