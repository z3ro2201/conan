import { prisma } from "@/lib/prisma";
import { attachAppleMusicMeta } from "@/services/music/attach-apple-meta";
import { jsonSafe, serializeBigInt } from "@/lib/json"; // 이 한 줄만 남기기

export const POST = async (req: Request) => {
  const body = await req.json();
  const playIds: string[] = body.playIds ?? [];

  if (!Array.isArray(playIds) || playIds.length === 0) {
    return jsonSafe({ error: "playIds 배열이 필요합니다." }, { status: 400 });
  }

  let trackIds: bigint[];
  try {
    trackIds = playIds.map((id) => BigInt(id));
  } catch {
    return jsonSafe({ error: "유효하지 않은 playId가 포함되어 있습니다." }, { status: 400 });
  }

  const tracks = await prisma.track.findMany({
    where: { id: { in: trackIds } },
    include: { series: true, titles: true, lyrics: true, syncedLyrics: true },
  });

  const tracksWithMeta = await Promise.all(tracks.map(attachAppleMusicMeta));

  return jsonSafe(serializeBigInt(tracksWithMeta));
};
