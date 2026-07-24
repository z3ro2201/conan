import { prisma } from "@/lib/prisma";
import { TrackType, SeriesType, Prisma } from "@/generated/prisma/client";
import { jsonSafe } from "@/lib/json";

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const trackTypeParam = (url.searchParams.get("track_type") ?? "").trim();
  const seasonTypeParam = (url.searchParams.get("season_type") ?? "").trim();

  const where: Prisma.TrackWhereInput = {
    ...(trackTypeParam && {
      trackType: trackTypeParam as TrackType, // "TV_OP" | "TV_ED" | "MOVIE"
    }),
    ...(seasonTypeParam && {
      series: {
        seriesType: seasonTypeParam as SeriesType, // "TV" | "MOVIE"
      },
    }),
  };

  const lists = await prisma.track.findMany({
    where,
    include: {
      series: true,
      titles: true,
      lyrics: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return jsonSafe({ lists });
};
