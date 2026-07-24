import { findTrack, TrackNotFoundError as FindNotFoundError } from "./getTrack";
import { updateTrack, TrackNotFoundError as UpdateNotFoundError } from "./update";
import { jsonSafe } from "@/lib/json";

const parseTrackId = (id: string): bigint | null => {
  try {
    return BigInt(id);
  } catch {
    return null;
  }
};

export const GET = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const trackId = parseTrackId(id);

  if (trackId === null) {
    return jsonSafe({ error: "유효하지 않은 id입니다." }, { status: 400 });
  }

  try {
    const track = await findTrack(trackId);
    return jsonSafe(track);
  } catch (error) {
    if (error instanceof FindNotFoundError) {
      return jsonSafe({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return jsonSafe({ error: "서버 오류" }, { status: 500 });
  }
};

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const trackId = parseTrackId(id);

  if (trackId === null) {
    return jsonSafe({ error: "유효하지 않은 id입니다." }, { status: 400 });
  }

  const body = await req.json();

  try {
    const track = await updateTrack(trackId, body);
    return jsonSafe({ track });
  } catch (error) {
    if (error instanceof UpdateNotFoundError) {
      return jsonSafe({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return jsonSafe({ error: error instanceof Error ? error.message : "서버 오류" }, { status: 500 });
  }
};
