import { revalidateTag } from "next/cache";
import { jsonSafe } from "@/lib/json";

export const POST = async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  const tag = body.tag ?? "tracks"; // 기본값

  revalidateTag(tag, { expire: 0 });

  return jsonSafe({ revalidated: true, tag });
};
