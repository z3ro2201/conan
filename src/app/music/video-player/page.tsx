"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { YouTubeVideoPlayer } from "@/components/ui/youtube-video-player";
import { Tabs } from "@/components/ui/tabs";

type TrackWithRelations = {
  id: string;
  artist: string;
  youtubeUrl: string;
  trackType: string;
  series: {
    id: string;
    seriesType: string;
    number: number;
    title: string | null;
  };
  titles: { language: string; title: string }[];
  lyrics: { language: string; content: string }[];
  syncedLyrics: { language: string; lines: unknown }[];
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

  const res = await fetch("/api/music/tracks", {
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

const LYRICS_LABELS: Record<string, string> = {
  ko: "한국어",
  ja: "일본어",
  en: "영어",
};

const hangulLyrics = () => {};
const japaneseLyrics = () => {};

const VideoPlayerPage = () => {
  const searchParams = useSearchParams();
  const playIdParam = (searchParams.get("playId") ?? "").trim();

  const [tracks, setTracks] = useState<TrackWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!playIdParam) {
      setError("재생할 곡 정보가 없습니다.");
      setLoading(false);
      return;
    }

    const playIds = playIdParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    setLoading(true);
    setError(null);

    fetchTracks(playIds)
      .then((result) => {
        setTracks(result);
        setCurrentIndex(0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [playIdParam]);

  const currentTrack = tracks[currentIndex];
  const videoId = currentTrack ? extractVideoId(currentTrack.youtubeUrl) : "";

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1 < tracks.length ? i + 1 : i));
  }, [tracks.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  if (loading) return <div>불러오는 중...</div>;
  if (error) return <div>{error}</div>;
  if (!currentTrack || !videoId) return <div>재생할 곡이 없습니다.</div>;

  return (
    <div>
      <h1>{currentTrack.titles.find((t) => t.language === "ko")?.title ?? currentTrack.artist}</h1>
      <p>{currentTrack.artist}</p>

      {/* key로 videoId를 넘겨서 곡이 바뀔 때 컴포넌트가 완전히 새로 마운트되도록 함 */}
      <YouTubeVideoPlayer key={videoId} videoId={videoId} className="w-full aspect-video" />

      <div>
        <div></div>
      </div>

      {currentTrack?.lyrics && currentTrack.lyrics.length > 0 && (
        <div className="">
          <Tabs
            aria-label="가사"
            items={currentTrack.lyrics.map((lyric) => ({
              id: lyric.language,
              label: LYRICS_LABELS[lyric.language] ?? lyric.language,
              content: <div className="h-[300px] px-2 overflow-auto whitespace-pre-line">{lyric.content}</div>,
            }))}
          />
        </div>
      )}
      {tracks.length > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <button onClick={goPrev} disabled={currentIndex === 0}>
            이전곡
          </button>
          <span>
            {currentIndex + 1} / {tracks.length}
          </span>
          <button onClick={goNext} disabled={currentIndex >= tracks.length - 1}>
            다음곡
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayerPage;
