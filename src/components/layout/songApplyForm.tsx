"use client";
import { Box } from "@/components/ui/box";
import { Label } from "@/components/ui/label";
import { TextField } from "@/components/ui/text-field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Select } from "@/components/ui/select";

const track_type = [
  { value: "TV_OP", label: "TV 오프닝" },
  { value: "TV_ED", label: "TV 엔딩" },
  { value: "MOVIE", label: "극장판" },
];

const dub_type = [
  { value: "ORIGINAL", label: "원곡" },
  { value: "KR_DUB", label: "한국어 더빙판" },
];

type seriesTypes = "MOVIE" | "TV";
type trackTypes = "TV_OP" | "TV_ED" | "MOVIE";
type dubTypes = "ORIGINAL" | "KR_DUB";

export interface SongFormData {
  seriesType: seriesTypes;
  trackType: trackTypes;
  dubType: dubTypes;
  episode: string;
  seriesName: string;
  startEpisode: string;
  endEpisode: string;
  songTitleJP: string;
  songTitleKR: string;
  artistName: string;
  lyricistName: string;
  composerName: string;
  youtubeLink: string;
  appleMusicLink: string;
  spotifyLink: string;
  lyricsJP: string;
  lyricsKR: string;
}

interface ApplyRegiFormProps {
  /** 수정 모드일 때 채워줄 초기값. 없으면 신규 등록 모드로 동작 */
  initialData?: SongFormData;
  /** 수정 대상 트랙 ID. 있으면 PUT, 없으면 POST */
  trackId?: string;
  /** 등록/수정 성공 시 호출 */
  onSuccess?: () => void;
}

export const ApplyRegiForm = ({ initialData, trackId, onSuccess }: ApplyRegiFormProps) => {
  const isEditMode = Boolean(trackId);

  const [seriesType, setSeriesType] = useState<seriesTypes>(initialData?.seriesType ?? "MOVIE");
  const [trackType, setTrackType] = useState<trackTypes>(initialData?.trackType ?? "MOVIE");
  const [dubType, setDubType] = useState<dubTypes>(initialData?.dubType ?? "ORIGINAL");

  const [episode, setEpisode] = useState<string>(initialData?.episode ?? "");
  const [seriesName, setSeriesName] = useState<string>(initialData?.seriesName ?? "");

  const [startEpisode, setStartEpisode] = useState<string>(initialData?.startEpisode ?? "");
  const [endEpisode, setEndEpisode] = useState<string>(initialData?.endEpisode ?? "");

  const [songTitleJP, setSongTitleJP] = useState<string>(initialData?.songTitleJP ?? "");
  const [songTitleKR, setSongTitleKR] = useState<string>(initialData?.songTitleKR ?? "");
  const [artistName, setArtistName] = useState<string>(initialData?.artistName ?? "");
  const [lyricistName, setLyricistName] = useState<string>(initialData?.lyricistName ?? "");
  const [composerName, setComposerName] = useState<string>(initialData?.composerName ?? "");

  const [youtubeLink, setYoutubeLink] = useState<string>(initialData?.youtubeLink ?? "");
  const [appleMusicLink, setAppleMusicLink] = useState<string>(initialData?.appleMusicLink ?? "");
  const [spotifyLink, setSpotifyLink] = useState<string>(initialData?.spotifyLink ?? "");

  const [lyricsJP, setLyricsJP] = useState<string>(initialData?.lyricsJP ?? "");
  const [lyricsKR, setLyricsKR] = useState<string>(initialData?.lyricsKR ?? "");

  // 트랙 종류가 바뀌면 시리즈 타입도 자동 갱신 (단, 수정 모드로 처음 값 세팅되는 순간은 건너뜀)
  useEffect(() => {
    if (["TV_ED", "TV_OP"].includes(trackType)) {
      setSeriesType("TV");
    } else {
      setSeriesType("MOVIE");
      setStartEpisode("");
      setEndEpisode("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackType]);

  const replaceEpisodeNumber = (type: "start" | "end" | "episode", v: string) => {
    const digitsOnly = v.replace(/[^0-9]/g, "");
    const n = digitsOnly === "" ? "" : String(Number(digitsOnly));

    if (type === "start") setStartEpisode(n);
    else if (type === "end") setEndEpisode(n);
    else if (type === "episode") {
      setEpisode(n);
      // 수정 모드에서는 자동 채움으로 기존 명칭을 덮어쓰지 않도록 함
      if (!isEditMode && seriesType === "TV") {
        const seriesTitle = trackType === "TV_OP" ? "오프닝" : "엔딩";
        setSeriesName(`명탐정 코난 ${n}기 ${seriesTitle}`);
      }
    }
  };

  const checkRequired = () => {
    if (episode.trim().length === 0) {
      alert("애니메이션/극장판 회차를 입력해주세요.");
      return false;
    }
    if (seriesName.trim().length === 0) {
      alert("시리즈 정식 명칭을 입력해주세요.");
      return false;
    }
    if (songTitleJP.trim().length === 0 && songTitleKR.trim().length === 0) {
      alert("곡 제목을 일본어 또는 한국어 중 하나는 입력해주세요.");
      return false;
    }
    if (artistName.trim().length === 0) {
      alert("가수명을 입력해주세요.");
      return false;
    }
    if (youtubeLink.trim().length === 0) {
      alert("유튜브 링크를 입력해주세요.");
      return false;
    }
    return true;
  };

  const upload = async () => {
    if (!checkRequired()) return;

    const payload = {
      seriesType,
      trackType,
      dubType,
      episode,
      seriesName,
      startEpisode: seriesType === "TV" ? startEpisode : null,
      endEpisode: seriesType === "TV" ? endEpisode : null,
      songTitleJP,
      songTitleKR,
      artistName,
      lyricistName,
      composerName,
      youtubeLink,
      appleMusicLink,
      spotifyLink,
      lyricsJP,
      lyricsKR,
    };

    const res = await fetch(isEditMode ? `/api/music/tracks/${trackId}` : "/api/music/tracks", {
      method: isEditMode ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? `${isEditMode ? "수정" : "등록"}에 실패했습니다.`);
      return;
    }

    alert(`${isEditMode ? "수정" : "등록"}되었습니다.`);
    onSuccess?.();
  };

  return (
    <>
      <Box className="m-2 mb-0 bg-white">
        <div className="mb-2 flex gap-2">
          <div className="w-6/12">
            <Label>정보</Label>
            <div className="flex gap-2">
              <div className="w-3/6">
                <Select
                  name=""
                  value={trackType}
                  onChange={(e) => setTrackType(e.currentTarget.value as trackTypes)}
                  options={track_type}
                />
              </div>
              <div className="w-3/6">
                <Select
                  name=""
                  value={dubType}
                  onChange={(e) => setDubType(e.currentTarget.value as dubTypes)}
                  options={dub_type}
                />
              </div>
            </div>
          </div>
          <div className="w-6/12">
            <Label>애니메이션 / 극장판 회차 (ex. 1기)</Label>
            <TextField
              type="number"
              hideSpinner={true}
              onChange={(e) => replaceEpisodeNumber("episode", e.currentTarget.value)}
              value={episode}
              required
            />
          </div>
          <div className="w-2/12">
            <Label>시작 화수</Label>
            <TextField
              disabled={seriesType !== "TV"}
              type="number"
              hideSpinner={true}
              onChange={(e) => replaceEpisodeNumber("start", e.currentTarget.value)}
              value={startEpisode}
            />
          </div>
          <div className="w-2/12">
            <Label>종료 화수</Label>
            <TextField
              disabled={seriesType !== "TV"}
              type="number"
              hideSpinner={true}
              onChange={(e) => replaceEpisodeNumber("end", e.currentTarget.value)}
              value={endEpisode}
            />
          </div>
        </div>
        <div className="mb-2">
          <Label>시리즈 정식 명칭</Label>
          <TextField onChange={(e) => setSeriesName(e.currentTarget.value)} value={seriesName} required />
        </div>
        <div className="mb-2 flex gap-2">
          <div className="w-6/12">
            <Label>곡 제목 (일본어)</Label>
            <TextField value={songTitleJP} onChange={(e) => setSongTitleJP(e.currentTarget.value)} />
          </div>
          <div className="w-6/12">
            <Label>곡 제목 (한국어)</Label>
            <TextField value={songTitleKR} onChange={(e) => setSongTitleKR(e.currentTarget.value)} />
          </div>
        </div>
        <div className="mb-2 flex gap-2">
          <div className="w-4/12">
            <Label>가수명</Label>
            <TextField value={artistName} onChange={(e) => setArtistName(e.currentTarget.value)} required />
          </div>
          <div className="w-4/12">
            <Label>작사가</Label>
            <TextField value={lyricistName} onChange={(e) => setLyricistName(e.currentTarget.value)} />
          </div>
          <div className="w-4/12">
            <Label>작곡가</Label>
            <TextField value={composerName} onChange={(e) => setComposerName(e.currentTarget.value)} />
          </div>
        </div>
        <div className="mb-2">
          <Label>Youtube 링크</Label>
          <TextField onChange={(e) => setYoutubeLink(e.currentTarget.value)} value={youtubeLink} required />
        </div>
        <div className="mb-2">
          <Label>애플뮤직 URL</Label>
          <TextField onChange={(e) => setAppleMusicLink(e.currentTarget.value)} value={appleMusicLink} />
        </div>
        <div className="mb-2">
          <Label>스포티파이 URL</Label>
          <TextField onChange={(e) => setSpotifyLink(e.currentTarget.value)} value={spotifyLink} />
        </div>
        <div className="mb-2">
          <Label>가사 (일본어)</Label>
          <Textarea value={lyricsJP} onChange={(e) => setLyricsJP(e.currentTarget.value)} />
        </div>
        <div className="mb-2">
          <Label>가사 (한국어)</Label>
          <Textarea value={lyricsKR} onChange={(e) => setLyricsKR(e.currentTarget.value)} />
        </div>
      </Box>
      <Box className="border-none text-right">
        <Button onClick={upload}>{isEditMode ? "수정" : "등록"}</Button>
      </Box>
    </>
  );
};
