import { ApplyRegiForm, SongFormData } from "@/components/layout/songApplyForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

const ApplyUpdatePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const track = await prisma.track.findUnique({
    where: { id: BigInt(id) },
    include: {
      series: true,
      titles: true,
      lyrics: true,
    },
  });

  if (!track) {
    notFound();
  }

  const initialData: SongFormData = {
    seriesType: track.series.seriesType,
    trackType: track.trackType,
    dubType: track.dubType,
    episode: String(track.series.number),
    seriesName: track.series.title ?? "",
    startEpisode: track.series.startEpisode ? String(track.series.startEpisode) : "",
    endEpisode: track.series.endEpisode ? String(track.series.endEpisode) : "",
    songTitleJP: track.titles.find((t) => t.language === "ja")?.title ?? "",
    songTitleKR: track.titles.find((t) => t.language === "ko")?.title ?? "",
    artistName: track.artist,
    lyricistName: track.lyricist ?? "",
    composerName: track.composer ?? "",
    youtubeLink: track.youtubeUrl,
    appleMusicLink: track.appleMusicUrl ?? "",
    spotifyLink: track.spotifyUrl ?? "",
    lyricsJP: track.lyrics.find((l) => l.language === "ja")?.content ?? "",
    lyricsKR: track.lyrics.find((l) => l.language === "ko")?.content ?? "",
  };

  return <ApplyRegiForm initialData={initialData} trackId={id} />;
};

export default ApplyUpdatePage;
