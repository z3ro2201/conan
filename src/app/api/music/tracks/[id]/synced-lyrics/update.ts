import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export class TrackNotFoundError extends Error {}

interface SyncedLyricsInput {
  grouped: Record<string, { time: number; text: string }[]>;
  markers: { id: string; label: string; time: number }[];
}

export async function updateSyncedLyrics(trackId: bigint, input: SyncedLyricsInput) {
  const { grouped, markers } = input;

  const existingTrack = await prisma.track.findUnique({ where: { id: trackId } });
  if (!existingTrack) {
    throw new TrackNotFoundError("해당 곡을 찾을 수 없습니다.");
  }

  const track = await prisma.$transaction(async (tx) => {
    await tx.track.update({
      where: { id: trackId },
      data: { syncedMarkers: markers },
    });

    await tx.trackSyncedLyrics.deleteMany({ where: { trackId } });

    const syncedLyricsData = Object.entries(grouped)
      .filter(([, lines]) => lines.length > 0)
      .map(([language, lines]) => ({
        trackId,
        language: language as "ko" | "ja" | "en",
        lines,
      }));

    if (syncedLyricsData.length > 0) {
      await tx.trackSyncedLyrics.createMany({ data: syncedLyricsData });
    }

    return tx.track.findUnique({
      where: { id: trackId },
      include: { syncedLyrics: true },
    });
  });

  // 이 트랙의 상세 조회 캐시(findTrack)를 무효화
  revalidateTag(`track-${trackId}`, { expire: 0 });
  revalidateTag("tracks", { expire: 0 });

  return track;
}
