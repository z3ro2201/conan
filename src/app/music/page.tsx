import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/json";
import { MusicPageClient } from "./music-page-client";

const getTracks = unstable_cache(
  async () => {
    const tracks = await prisma.track.findMany({
      include: { series: true, titles: true },
      orderBy: { createdAt: "desc" },
    });
    return serializeBigInt(tracks); // 캐시에 들어가기 전에 BigInt를 미리 문자열로 변환
  },
  ["music-tracks-list"],
  { tags: ["tracks"] },
);

export default async function MusicPage() {
  const tracks = await getTracks();

  // BigInt는 클라이언트 컴포넌트로 그대로 못 넘기니 문자열로 변환
  const serialized = tracks.map((t) => ({
    ...t,
    id: t.id.toString(),
    seriesId: t.seriesId.toString(),
    series: { ...t.series, id: t.series.id.toString() },
  }));

  return <MusicPageClient tracks={serialized} />;
}
