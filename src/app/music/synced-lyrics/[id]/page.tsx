import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { splitLyricsToLines } from "@/lib/utils/split-lyrics-lines";
import { SyncedLyricsEditor } from "./synced-lyrics-editor-wrapper"; // 경로만 wrapper로 변경
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

  // initialLinesByLanguage를 만들 때, 언어 순서를 ja 먼저로 고정
  const mapped = LANGUAGE_ORDER.map((language) => {
    const lyric = track.lyrics.find((l) => l.language === language);
    if (!lyric) return null; // 해당 언어 가사 자체가 없으면 제외

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
        <div className="flex px-2  min-h-[60px] flex-col justify-center">
          <h1>{track.dubType === "ORIGINAL" ? (titleMap.ja ?? track.artist) : (titleMap.ko ?? track.artist)}</h1>
          <p className="m-0 p-0 mt-1 text-gray-400">{track.artist}</p>
        </div>
        <SyncedLyricsEditor
          trackId={id}
          youtubeUrl={track.youtubeUrl}
          initialLinesByLanguage={initialLinesByLanguage}
        />
      </div>
    </div>
  );
};

export default SyncedLyricsPage;
