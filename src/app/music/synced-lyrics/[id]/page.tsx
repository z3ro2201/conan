import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { splitLyricsToLines } from "@/lib/utils/split-lyrics-lines";
// import { SyncedLyricsEditor } from "./synced-lyrics-editor-wrapper";
import { SyncedLyricsEditor } from "./synced-lyrics-editor";

const LANGUAGE_ORDER = ["ja", "ko"] as const;

const SyncedLyricsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  let trackId: bigint;
  try {
    trackId = BigInt(id);
  } catch {
    notFound();
  }

  const track = await prisma.track.findUnique({
    where: { id: trackId },
    include: {
      series: true,
      titles: true,
      lyrics: true,
      syncedLyrics: true,
    },
  });

  if (!track) {
    notFound();
  }

  const mapped = LANGUAGE_ORDER.map((language) => {
    const lyric = track.lyrics.find((l) => l.language === language);
    if (!lyric) return null;

    const existingSynced = track.syncedLyrics.find((s) => s.language === language);

    return {
      language,
      lines: existingSynced
        ? (existingSynced.lines as { time: number; text: string }[])
        : splitLyricsToLines(lyric.content),
    };
  });

  const initialLinesByLanguage = mapped.filter((v): v is Exclude<(typeof mapped)[number], null> => v !== null);

  const titleMap = {
    ko: track.titles.find((item) => item.language === "ko")?.title ?? null,
    ja: track.titles.find((item) => item.language === "ja")?.title ?? null,
  };

  return (
    <div className="w-full flex justify-center bg-gray-200">
      <div className="p-2 w-full max-w-2xl bg-white">
        <div className="flex px-2 min-h-[60px] flex-col justify-center">
          <h1>{track.dubType === "ORIGINAL" ? (titleMap.ja ?? track.artist) : (titleMap.ko ?? track.artist)}</h1>
          <p className="m-0 p-0 mt-1 text-gray-400">{track.artist}</p>
        </div>
        <SyncedLyricsEditor
          trackId={id}
          youtubeUrl={track.youtubeUrl}
          initialLinesByLanguage={initialLinesByLanguage}
          initialMarkers={(track.syncedMarkers as { id: string; label: string; time: number }[]) ?? []}
        />
      </div>
    </div>
  );
};

export default SyncedLyricsPage;
