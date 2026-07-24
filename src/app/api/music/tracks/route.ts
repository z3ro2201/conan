import { registTrack, DuplicateTrackError } from "./regist";
import { jsonSafe } from "@/lib/json";

export const POST = async (req: Request) => {
  const body = await req.json();

  try {
    const track = await registTrack(body);
    return jsonSafe({ track });
  } catch (error) {
    if (error instanceof DuplicateTrackError) {
      return jsonSafe({ error: error.message }, { status: 409 });
    }
    console.error(error);
    return jsonSafe({ error: "서버 오류" }, { status: 500 });
  }
};
