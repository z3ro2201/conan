import { prisma } from "@/lib/prisma";
import { attachAppleMusicMeta } from "@/services/music/attach-apple-meta";
import { serializeBigInt } from "@/lib/json";
import { unstable_cache } from "next/cache";

export class TrackNotFoundError extends Error {}

async function fetchTrackWithMeta(trackId: bigint) {
  const track = await prisma.track.findUnique({
    where: { id: trackId },
    include: {
      series: true,
      titles: true,
      lyrics: true,
      syncedLyrics: true,
    },
  });

  if (!track) return null;

  const trackWithMeta = await attachAppleMusicMeta(track);
  return serializeBigInt(trackWithMeta);
}

export async function findTrack(trackId: bigint) {
  const cached = unstable_cache(() => fetchTrackWithMeta(trackId), ["music-track-detail", trackId.toString()], {
    tags: [`track-${trackId}`, "tracks"],
  });

  const track = await cached();

  if (!track) {
    throw new TrackNotFoundError("해당 곡을 찾을 수 없습니다.");
  }

  return track;
}
