import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { revalidateTag } from "next/cache";

export interface TrackInput {
  seriesType: "TV" | "MOVIE";
  trackType: "TV_OP" | "TV_ED" | "MOVIE";
  dubType: "ORIGINAL" | "KR_DUB";
  episode: string;
  seriesName: string;
  startEpisode?: string | null;
  endEpisode?: string | null;
  songTitleJP?: string;
  songTitleKR?: string;
  lyricsJP?: string;
  lyricsKR?: string;
  artistName: string;
  lyricistName?: string;
  composerName?: string;
  youtubeLink: string;
  appleMusicLink?: string;
  spotifyLink?: string;
}

export class DuplicateTrackError extends Error {}

export async function registTrack(input: TrackInput) {
  console.log("registTrack input:", input);
  const { seriesType, trackType, dubType, episode, seriesName, startEpisode, endEpisode, ...rest } = input;

  const existingSeries = await prisma.series.findUnique({
    where: { uq_series_type_number: { seriesType, number: Number(episode) } },
  });

  if (existingSeries) {
    const duplicateTrack = await prisma.track.findFirst({
      where: { seriesId: existingSeries.id, trackType, dubType },
    });
    if (duplicateTrack) {
      const label = trackType === "TV_OP" ? "오프닝" : trackType === "TV_ED" ? "엔딩" : "주제가";
      const dubLabel = dubType === "KR_DUB" ? "한국어 더빙판" : "원곡";
      throw new DuplicateTrackError(
        `${seriesType} ${episode}${seriesType === "TV" ? "기" : "탄"}의 ${dubLabel} ${label}이 이미 등록되어 있습니다.`,
      );
    }
  }

  const track = await prisma.$transaction(async (tx) => {
    const series =
      existingSeries ??
      (await tx.series.create({
        data: {
          seriesType,
          number: Number(episode),
          title: seriesName,
          startEpisode: startEpisode ? Number(startEpisode) : null,
          endEpisode: endEpisode ? Number(endEpisode) : null,
        },
      }));

    const created = await tx.track.create({
      data: {
        seriesId: series.id,
        trackType,
        dubType,
        artist: rest.artistName,
        lyricist: rest.lyricistName || null,
        composer: rest.composerName || null,
        youtubeUrl: rest.youtubeLink,
        appleMusicUrl: rest.appleMusicLink || null,
        spotifyUrl: rest.spotifyLink || null,
      },
    });

    await createTitlesAndLyrics(tx, created.id, rest);
    return created;
  });

  // 새 트랙 등록이니 개별 태그는 아직 없고, 목록 캐시만 무효화
  revalidateTag("tracks", { expire: 0 });

  return track;
}

export async function createTitlesAndLyrics(
  tx: Prisma.TransactionClient,
  trackId: bigint,
  rest: Pick<TrackInput, "songTitleJP" | "songTitleKR" | "lyricsJP" | "lyricsKR">,
) {
  const titleData = [
    rest.songTitleJP && { trackId, language: "ja" as const, title: rest.songTitleJP },
    rest.songTitleKR && { trackId, language: "ko" as const, title: rest.songTitleKR },
  ].filter((v): v is { trackId: bigint; language: "ja" | "ko"; title: string } => Boolean(v));

  if (titleData.length > 0) await tx.trackTitle.createMany({ data: titleData });

  const lyricsData = [
    rest.lyricsJP && { trackId, language: "ja" as const, content: rest.lyricsJP },
    rest.lyricsKR && { trackId, language: "ko" as const, content: rest.lyricsKR },
  ].filter((v): v is { trackId: bigint; language: "ja" | "ko"; content: string } => Boolean(v));

  if (lyricsData.length > 0) await tx.trackLyrics.createMany({ data: lyricsData });
}
