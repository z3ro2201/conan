import { updateSyncedLyrics, TrackNotFoundError } from "./update";
import { jsonSafe } from "@/lib/json";

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  let trackId: bigint;
  try {
    trackId = BigInt(id);
  } catch {
    return jsonSafe({ error: "유효하지 않은 id입니다." }, { status: 400 });
  }

  const body = await req.json();

  try {
    const track = await updateSyncedLyrics(trackId, body);
    return jsonSafe({ track });
  } catch (error) {
    if (error instanceof TrackNotFoundError) {
      return jsonSafe({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return jsonSafe({ error: error instanceof Error ? error.message : "서버 오류" }, { status: 500 });
  }
};
