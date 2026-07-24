import { resolveAppleMusicMeta } from "./itunes-search";
import type { Track, TrackTitle } from "@/generated/prisma/client";

export async function attachAppleMusicMeta<T extends Track & { titles: TrackTitle[] }>(track: T) {
  const dubType = track.dubType === "ORIGINAL" ? "ja" : "ko";
  const songTitle = track.titles.find((item) => item.language === dubType)?.title ?? null;

  let appleMusicMeta = null;
  if (songTitle && track.artist) {
    try {
      appleMusicMeta = await resolveAppleMusicMeta(songTitle, track.artist);
    } catch (error) {
      console.error(error);
    }
  }

  return { ...track, appleMusicMeta };
}
