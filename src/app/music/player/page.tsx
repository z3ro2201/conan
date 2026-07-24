"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useYouTubePlayer } from "@/lib/utils/use-youtube-player";
import { Icon } from "@/components/ui/icon";
import { interleaveLyricsLines } from "@/lib/utils/interleave-lyrics";
import Link from "next/link";

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
    <div className="flex items-center justify-center gap-1.5 h-full">
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
      <div className="flex items-center justify-center h-full">
        <p style={{ color: "rgba(255,255,255,0.3)" }}>♪</p>
      </div>
    );
  }

  return (
    <div key={activeTime} className="flex flex-col items-center justify-center gap-2 h-full overflow-hidden">
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

function getPreferredLyricsLang(track: TrackWithRelations): string {
  if (track.syncedLyrics.length > 0) return "synced";
  return track.dubType === "ORIGINAL" ? "ja" : "ko";
}

/** ===== 재생목록 — 가사와 같은 자리에서 탭처럼 전환되는 인라인 뷰 ===== */
interface PlaylistTabViewProps {
  tracks: TrackWithRelations[];
  currentIndex: number;
  onSelectTrack: (index: number) => void;
}

function PlaylistTabView({ tracks, currentIndex, onSelectTrack }: PlaylistTabViewProps) {
  return (
    <ul className="h-full overflow-y-auto scrollbar-thin list-none m-0 px-2">
      {tracks.map((track, index) => {
        const isActive = index === currentIndex;
        const title = track.titles.find((t) => t.language === "ko")?.title ?? track.artist;
        const artworkUrl = track.appleMusicMeta?.artworkUrl100;

        return (
          <li key={track.id}>
            <button
              onClick={() => onSelectTrack(index)}
              className="w-full flex items-center gap-3 px-2 py-2.5 text-left cursor-pointer rounded-lg hover:bg-white/5"
            >
              {artworkUrl ? (
                <img src={artworkUrl} className="w-11 h-11 rounded object-cover flex-shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded bg-white/10 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p
                  className="m-0 text-sm truncate"
                  style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.85)", fontWeight: isActive ? 700 : 400 }}
                >
                  {title}
                </p>
                <p className="m-0 text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {track.artist}
                </p>
              </div>
              {isActive && (
                <Icon name="volume-up" size={16} className="ml-auto flex-shrink-0" style={{ color: "#fff" }} />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** ===== 미니 플레이어 (평상시 기본 화면) ===== */
interface MiniPlayerViewProps {
  currentTrack: TrackWithRelations;
  artworkUrl: string | undefined;
  albumSlotRef: React.RefObject<HTMLDivElement | null>;
  titleMap: { ko: string | null; ja: string | null };
  progressValue: number;
  progressPercent: number;
  duration: number;
  rangeColor: string;
  playing: boolean;
  ready: boolean;
  buffering: boolean;
  goPrev: () => void;
  goNext: () => void;
  handleTogglePlay: () => void;
  onExpand: () => void;
  onShowPlaylist: () => void;
  currentIndex: number;
  tracksLength: number;
}

function MiniPlayerView({
  currentTrack,
  artworkUrl,
  albumSlotRef,
  titleMap,
  progressValue,
  progressPercent,
  duration,
  rangeColor,
  playing,
  ready,
  buffering,
  goPrev,
  goNext,
  handleTogglePlay,
  onExpand,
  onShowPlaylist,
  currentIndex,
  tracksLength,
}: MiniPlayerViewProps) {
  const title =
    currentTrack.dubType === "ORIGINAL" ? (titleMap.ja ?? currentTrack.artist) : (titleMap.ko ?? currentTrack.artist);

  return (
    <div className="flex flex-col h-full px-6 pt-14 pb-6">
      <button onClick={onExpand} className="flex-1 flex items-center justify-center min-h-0 cursor-pointer">
        {/* 앨범아트가 있으면 이미지, 없으면 이 자리를 빈 슬롯으로 두고 좌표만 측정 */}
        <div ref={albumSlotRef} className="max-w-full max-h-full aspect-square" style={{ width: "min(60vw, 320px)" }}>
          {artworkUrl && <img src={artworkUrl} className="w-full h-full object-cover rounded-2xl shadow-2xl" />}
        </div>
      </button>

      <div className="flex-shrink-0 pt-4">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onExpand} className="text-left cursor-pointer">
            <h1 className="m-0 p-0 text-xl font-bold">{title}</h1>
            <p className="m-0 p-0 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              {currentTrack.artist}
            </p>
          </button>
          <div className="flex gap-2 justify-end">
            <button onClick={onShowPlaylist} className="cursor-pointer flex-shrink-0 ml-2">
              <Icon name="list" size={22} />
            </button>
            <button onClick={onShowPlaylist} className="cursor-pointer flex-shrink-0">
              <Icon name="lyrics" size={22} />
            </button>
          </div>
        </div>

        <div
          className="progress-range w-full h-1 rounded-full"
          style={{
            background: `linear-gradient(to right, ${rangeColor} ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
          }}
        />
        <div className="flex justify-between mt-1 mb-4">
          <span className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
            {formatTime(progressValue)}
          </span>
          <span className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
            -{formatTime(Math.max(duration - progressValue, 0))}
          </span>
        </div>

        <div className="flex items-center justify-center gap-8">
          <button onClick={goPrev} disabled={currentIndex === 0} className="cursor-pointer">
            <Icon name="chevron-double-left" size={28} />
          </button>
          <button
            onClick={handleTogglePlay}
            disabled={!ready}
            className="w-12 h-12 flex items-center justify-center cursor-pointer"
          >
            {!ready || buffering ? (
              <div className="spinner w-7 h-7 rounded-full border-4 border-white/20 border-t-white" />
            ) : playing ? (
              <Icon name="pause" size={40} />
            ) : (
              <Icon name="play" size={40} />
            )}
          </button>
          <button onClick={goNext} disabled={currentIndex >= tracksLength - 1} className="cursor-pointer">
            <Icon name="chevron-double-right" size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** ===== 확장 플레이어 (가사/재생목록 탭 전환 영역 포함) ===== */
interface ExpandedMobileViewProps {
  currentTrack: TrackWithRelations;
  artworkUrl: string | undefined;
  titleMap: { ko: string | null; ja: string | null };
  lyricsLang: string;
  setLyricsLang: (lang: string) => void;
  hasSyncedLyrics: boolean;
  currentLyrics: { language: string; content: string } | undefined;
  ready: boolean;
  buffering: boolean;
  currentTime: number;
  progressValue: number;
  progressPercent: number;
  duration: number;
  volumePercent: number;
  rangeColor: string;
  playing: boolean;
  muted: boolean;
  goPrev: () => void;
  goNext: () => void;
  handleTogglePlay: () => void;
  toggleMute: () => void;
  setVolume: (value: number) => void;
  setSeeking: (value: number | null) => void;
  seek: (value: number) => void;
  currentIndex: number;
  tracksLength: number;
  onCollapse: () => void;
  tracks: TrackWithRelations[];
  onSelectTrack: (index: number) => void;
}

function ExpandedMobileView({
  currentTrack,
  artworkUrl,
  titleMap,
  lyricsLang,
  setLyricsLang,
  hasSyncedLyrics,
  currentLyrics,
  ready,
  buffering,
  currentTime,
  progressValue,
  progressPercent,
  duration,
  volumePercent,
  rangeColor,
  playing,
  muted,
  goPrev,
  goNext,
  handleTogglePlay,
  toggleMute,
  setVolume,
  setSeeking,
  seek,
  currentIndex,
  tracksLength,
  onCollapse,
  tracks,
  onSelectTrack,
}: ExpandedMobileViewProps) {
  const isPlaylistOpen = lyricsLang === "playlist";
  const togglePlaylist = () => setLyricsLang(isPlaylistOpen ? "ko" : "playlist");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 flex-shrink-0">
        <button onClick={onCollapse} className="cursor-pointer">
          <Icon name="chevron-down" size={24} />
        </button>
      </div>

      <div className="w-full flex items-center justify-between flex-shrink-0 pt-2 pb-2 px-6">
        <div className="flex items-center">
          <div className="mr-3">
            {artworkUrl && <img src={artworkUrl} className="w-24 h-24 shadow-2xl object-cover rounded-md" />}
          </div>
          <div>
            <h1 className="m-0 p-0 text-xl font-bold">
              {currentTrack.dubType === "ORIGINAL"
                ? (titleMap.ja ?? currentTrack.artist)
                : (titleMap.ko ?? currentTrack.artist)}
            </h1>
            <p className="m-0 p-0 mt-1 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              {currentTrack.artist}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center justify-end">
          <button onClick={togglePlaylist} className="cursor-pointer flex-shrink-0">
            <Icon name="list" size={22} style={{ opacity: isPlaylistOpen ? 1 : 0.7 }} />
          </button>
          <button onClick={togglePlaylist} className="cursor-pointer flex-shrink-0">
            <Icon name="lyrics" size={22} style={{ opacity: isPlaylistOpen ? 1 : 0.7 }} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-6">
        {!isPlaylistOpen && (currentTrack.lyrics.length > 1 || hasSyncedLyrics) && (
          <div className="flex justify-center gap-2 mb-2 flex-shrink-0">
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

        {isPlaylistOpen && (
          <div className="flex justify-between items-center mb-2 flex-shrink-0">
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              재생목록 · {tracksLength}곡
            </span>
            <button
              onClick={togglePlaylist}
              className="text-sm cursor-pointer"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              닫기
            </button>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
          {isPlaylistOpen ? (
            <PlaylistTabView tracks={tracks} currentIndex={currentIndex} onSelectTrack={onSelectTrack} />
          ) : !ready || buffering ? (
            <LoadingDots />
          ) : lyricsLang === "synced" ? (
            <SyncedLyricsView syncedLyrics={currentTrack.syncedLyrics} currentTime={currentTime} />
          ) : (
            currentLyrics && (
              <div className="px-2 text-center">
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

      <div className="w-full px-6 pb-6 pt-3 flex-shrink-0">
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
        <div className="flex justify-between mt-1 mb-3">
          <span className="text-sm tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
            {formatTime(progressValue)}
          </span>
          <span className="text-sm tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
            -{formatTime(Math.max(duration - progressValue, 0))}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button onClick={goPrev} disabled={currentIndex === 0} className="cursor-pointer">
              <Icon name="chevron-double-left" size={32} />
            </button>

            <button
              onClick={handleTogglePlay}
              disabled={!ready}
              className="w-[45px] h-[45px] flex items-center justify-center cursor-pointer"
            >
              {!ready || buffering ? (
                <div className="spinner w-8 h-8 rounded-full border-4 border-white/20 border-t-white" />
              ) : playing ? (
                <Icon name="pause" size={40} />
              ) : (
                <Icon name="play" size={40} />
              )}
            </button>

            <button className="cursor-pointer" onClick={goNext} disabled={currentIndex >= tracksLength - 1}>
              <Icon name="chevron-double-right" size={32} />
            </button>
          </div>

          <div className="flex items-center gap-2 w-28">
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
      </div>
    </div>
  );
}

function MusicPlayerContent() {
  const searchParams = useSearchParams();

  const [tracks, setTracks] = useState<TrackWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seeking, setSeeking] = useState<number | null>(null);
  const [lyricsLang, setLyricsLang] = useState<string>("ko");
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 앨범아트 자리(빈 슬롯)의 좌표를 측정해서 유튜브 플레이어를 그 위치에 배치
  const desktopAlbumSlotRef = useRef<HTMLDivElement>(null);
  const miniAlbumSlotRef = useRef<HTMLDivElement>(null);
  const [videoRect, setVideoRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

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
        if (result[0]) setLyricsLang(getPreferredLyricsLang(result[0]));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "ADD_TO_PLAYLIST") return;

      const trackId: string = event.data.trackId;
      if (!trackId) return;

      setTracks((prev) => {
        if (prev.some((t) => t.id === trackId)) return prev;

        fetchTracks([trackId]).then(([newTrack]) => {
          if (!newTrack) return;
          setTracks((current) => {
            if (current.some((t) => t.id === newTrack.id)) return current;
            return [...current, newTrack];
          });
        });

        return prev;
      });
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const currentTrack = tracks[currentIndex];
  const videoId = currentTrack ? extractVideoId(currentTrack.youtubeUrl) : "";
  const artworkUrl = currentTrack?.appleMusicMeta?.artworkUrl1000 ?? currentTrack?.appleMusicMeta?.artworkUrl100;

  // artworkUrl이 없을 때만, 실제로 화면에 보이는(md 이상이면 데스크톱, 아니면 모바일 미니뷰) 슬롯의 좌표를 측정
  useEffect(() => {
    if (artworkUrl) {
      setVideoRect(null);
      return;
    }

    const measure = () => {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const slotEl = isDesktop ? desktopAlbumSlotRef.current : miniAlbumSlotRef.current;
      if (!slotEl) return;

      const rect = slotEl.getBoundingClientRect();
      setVideoRect({
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    const timeout = setTimeout(measure, 50); // DOM 페인트 이후 1회 측정
    window.addEventListener("resize", measure);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", measure);
    };
  }, [artworkUrl, isExpanded, loading]); // isExpanded가 바뀔 때(확장/축소)만 재측정

  const goNext = useCallback(() => {
    setCurrentIndex((i) => {
      if (i + 1 < tracks.length) {
        const nextTrack = tracks[i + 1];
        if (nextTrack) setLyricsLang(getPreferredLyricsLang(nextTrack));
        if (userInteracted) setShouldAutoplay(true);
        return i + 1;
      }
      return i;
    });
  }, [tracks, userInteracted]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => {
      if (i > 0) {
        const prevTrack = tracks[i - 1];
        if (prevTrack) setLyricsLang(getPreferredLyricsLang(prevTrack));
        if (userInteracted) setShouldAutoplay(true);
        return i - 1;
      }
      return i;
    });
  }, [tracks, userInteracted]);

  const selectTrack = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      const nextTrack = tracks[index];
      if (nextTrack) setLyricsLang(getPreferredLyricsLang(nextTrack));
      if (userInteracted) setShouldAutoplay(true);
    },
    [userInteracted, tracks],
  );

  const {
    containerRef,
    ready,
    playing,
    buffering,
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
    setUserInteracted(true);
    setShouldAutoplay(true);
    togglePlay();
  };

  const progressValue = Number.isFinite(seeking ?? currentTime) ? (seeking ?? currentTime) : 0;
  const safeDuration = Number.isFinite(duration) ? duration : 0;
  const progressPercent = safeDuration > 0 ? (progressValue / safeDuration) * 100 : 0;
  const volumePercent = muted ? 0 : Number.isFinite(volume) ? volume : 0;

  const titleMap = {
    ko: currentTrack.titles.find((item) => item.language === "ko")?.title ?? null,
    ja: currentTrack.titles.find((item) => item.language === "ja")?.title ?? null,
  };

  const palette = currentTrack.appleMusicMeta?.palette;
  const bgGradient = palette
    ? `linear-gradient(180deg, ${palette.muted} 0%, ${palette.vibrant} 100%)`
    : "linear-gradient(180deg, #1e1e1e 0%, #1e1e1e 100%)";
  const rangeColor = palette?.darkVibrant ?? "#2563eb";

  const currentLyrics = currentTrack.lyrics.find((l) => l.language === lyricsLang) ?? currentTrack.lyrics[0];
  const hasSyncedLyrics = currentTrack.syncedLyrics.length > 0;
  const isPlaylistOpenDesktop = lyricsLang === "playlist";

  // artworkUrl 없을 때: 측정된 슬롯 좌표에 정확히 맞춰 배치. 아직 측정 전이면 화면 밖에 숨겨둠(깜빡임 방지)
  const playerContainerStyle: React.CSSProperties = artworkUrl
    ? {
        position: "fixed",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
      }
    : videoRect
      ? {
          position: "fixed",
          top: videoRect.top,
          left: videoRect.left,
          width: videoRect.width,
          height: videoRect.height,
          borderRadius: "16px",
          overflow: "hidden",
          zIndex: 50, // 더 높은 값으로 임시 테스트
          opacity: 1, // 명시적으로 추가
          pointerEvents: "auto", // 명시적으로 추가
          background: "yellow", // 임시: 이 배경색이 보이면 div 위치는 맞는데 iframe이 안 그려지는 것
        }
      : {
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
        };

  return (
    <div
      className="relative w-screen h-screen transition-[background] duration-500 overflow-hidden"
      style={{ background: bgGradient, color: "#fff" }}
    >
      <div className="fixed right-5 top-5 z-20 hidden md:block">
        {Object.keys(titleMap).length > 0 && (
          <Link
            href={`/music/synced-lyrics/${currentTrack.id}`}
            className="px-3 py-1 rounded-full text-sm"
            style={{
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
            }}
            target="_blank"
          >
            실시간 가사 {hasSyncedLyrics ? "편집" : "등록"}
          </Link>
        )}
        {Object.keys(titleMap).length == 0 && (
          <Link
            href={`/music/update/${currentTrack.id}`}
            className="px-3 py-1 rounded-full text-sm"
            style={{
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
            }}
            target="_blank"
          >
            가사정보 등록
          </Link>
        )}
      </div>

      {/* 컨테이너 하나만 유지 — 측정된 좌표에 맞춰 fixed로 이동 */}
      <div ref={containerRef} style={playerContainerStyle} />

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

      {/* ===== 데스크톱(md 이상) 레이아웃 ===== */}
      <div className="relative z-10 hidden md:flex h-full items-center justify-center">
        <div className="w-full max-w-6xl flex flex-row mx-auto">
          <div className="w-1/2 lg:w-[45%] lg:max-w-[480px] flex flex-col justify-center items-start pl-16 pr-8 gap-6">
            {/* 앨범아트 슬롯 — artworkUrl 있으면 이미지, 없으면 빈 자리(측정용) */}
            <div className="w-full flex items-center justify-center">
              <div ref={desktopAlbumSlotRef} className="w-64 h-64">
                {artworkUrl && <img src={artworkUrl} className="w-full h-full shadow-2xl object-cover rounded-md" />}
              </div>
            </div>

            <div className="w-full flex items-center justify-between">
              <div>
                <h1 className="m-0 p-0 text-2xl font-bold">
                  {currentTrack.dubType === "ORIGINAL"
                    ? (titleMap.ja ?? currentTrack.artist)
                    : (titleMap.ko ?? currentTrack.artist)}
                </h1>
                <p className="m-0 p-0 mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {currentTrack.artist}
                </p>
              </div>
              {tracks.length > 1 && (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setLyricsLang(isPlaylistOpenDesktop ? "ko" : "playlist")}
                    className="cursor-pointer flex-shrink-0"
                  >
                    <Icon name="list" size={22} style={{ opacity: isPlaylistOpenDesktop ? 1 : 0.7 }} />
                  </button>
                  <button
                    onClick={() => setLyricsLang(isPlaylistOpenDesktop ? "ko" : "playlist")}
                    className="cursor-pointer flex-shrink-0"
                  >
                    <Icon name="lyrics" size={22} />
                  </button>
                </div>
              )}
            </div>

            <div className="w-full">
              <input
                type="range"
                min={0}
                max={safeDuration}
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
                  -{formatTime(Math.max(safeDuration - progressValue, 0))}
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
                {!ready || buffering ? (
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

            {tracks.length > 1 && (
              <div className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                {currentIndex + 1} / {tracks.length}곡
              </div>
            )}
          </div>

          <div className="w-1/2 lg:flex-1 flex flex-col justify-center pr-16 pl-8">
            {!isPlaylistOpenDesktop && (currentTrack.lyrics.length > 1 || hasSyncedLyrics) && (
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

            {isPlaylistOpenDesktop && (
              <div className="flex justify-center mb-4">
                <span className="px-3 py-1 rounded-full text-sm" style={{ background: "rgba(255,255,255,0.2)" }}>
                  재생목록 · {tracks.length}곡
                </span>
              </div>
            )}

            <div className="h-[70vh]">
              {isPlaylistOpenDesktop ? (
                <PlaylistTabView tracks={tracks} currentIndex={currentIndex} onSelectTrack={selectTrack} />
              ) : !ready || buffering ? (
                <LoadingDots />
              ) : lyricsLang === "synced" ? (
                <SyncedLyricsView syncedLyrics={currentTrack.syncedLyrics} currentTime={currentTime} />
              ) : (
                currentLyrics && (
                  <div className="h-full px-2 overflow-y-auto text-center scrollbar-thin">
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

      {/* ===== 모바일(md 미만) 레이아웃 ===== */}
      <div className="relative z-10 flex md:hidden flex-col h-full">
        {isExpanded ? (
          <ExpandedMobileView
            currentTrack={currentTrack}
            artworkUrl={artworkUrl}
            titleMap={titleMap}
            lyricsLang={lyricsLang}
            setLyricsLang={setLyricsLang}
            hasSyncedLyrics={hasSyncedLyrics}
            currentLyrics={currentLyrics}
            ready={ready}
            buffering={buffering}
            currentTime={currentTime}
            progressValue={progressValue}
            progressPercent={progressPercent}
            duration={safeDuration}
            volumePercent={volumePercent}
            rangeColor={rangeColor}
            playing={playing}
            muted={muted}
            goPrev={goPrev}
            goNext={goNext}
            handleTogglePlay={handleTogglePlay}
            toggleMute={toggleMute}
            setVolume={setVolume}
            setSeeking={setSeeking}
            seek={seek}
            currentIndex={currentIndex}
            tracksLength={tracks.length}
            onCollapse={() => setIsExpanded(false)}
            tracks={tracks}
            onSelectTrack={selectTrack}
          />
        ) : (
          <MiniPlayerView
            currentTrack={currentTrack}
            artworkUrl={artworkUrl}
            albumSlotRef={miniAlbumSlotRef}
            titleMap={titleMap}
            progressValue={progressValue}
            progressPercent={progressPercent}
            duration={safeDuration}
            rangeColor={rangeColor}
            playing={playing}
            ready={ready}
            buffering={buffering}
            goPrev={goPrev}
            goNext={goNext}
            handleTogglePlay={handleTogglePlay}
            onExpand={() => setIsExpanded(true)}
            onShowPlaylist={() => {
              setIsExpanded(true);
              setLyricsLang("playlist");
            }}
            currentIndex={currentIndex}
            tracksLength={tracks.length}
          />
        )}
      </div>
    </div>
  );
}

const MusicPlayerPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#1e1e1e", color: "#fff" }}>
          불러오는 중...
        </div>
      }
    >
      <MusicPlayerContent />
    </Suspense>
  );
};

export default MusicPlayerPage;
