import { prisma } from "@/lib/prisma";
import { createTitlesAndLyrics } from "../regist";
import type { TrackInput } from "../regist";
import { revalidateTag } from "next/cache";

export class TrackNotFoundError extends Error {}

export async function updateTrack(trackId: bigint, input: TrackInput) {
  const { seriesType, trackType, dubType, episode, seriesName, startEpisode, endEpisode, ...rest } = input;

  // 1) 존재하는 트랙인지 확인
  const existingTrack = await prisma.track.findUnique({ where: { id: trackId } });
  if (!existingTrack) {
    throw new TrackNotFoundError("해당 곡을 찾을 수 없습니다.");
  }

  // 2) 시리즈(시즌/극장판)가 이미 있는지 확인 — 있으면 재사용, 없으면 새로 생성
  const existingSeries = await prisma.series.findUnique({
    where: { uq_series_type_number: { seriesType, number: Number(episode) } },
  });

  // 3) 트랜잭션으로 series 확보 → track 갱신 → titles/lyrics 재생성
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

    const updated = await tx.track.update({
      where: { id: trackId },
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

    // 다국어 제목/가사는 통째로 지우고 새로 넣는 방식 (부분 upsert보다 단순하고 안전)
    await tx.trackTitle.deleteMany({ where: { trackId } });
    await tx.trackLyrics.deleteMany({ where: { trackId } });
    await createTitlesAndLyrics(tx, trackId, rest);

    return updated;
  });

  // 트랜잭션이 성공적으로 끝난 뒤에만 캐시 무효화
  revalidateTag(`track-${trackId}`, { expire: 0 });
  revalidateTag("tracks", { expire: 0 });

  return track;
}
