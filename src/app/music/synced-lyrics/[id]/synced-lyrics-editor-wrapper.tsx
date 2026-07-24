"use client";

import dynamic from "next/dynamic";

const SyncedLyricsEditor = dynamic(() => import("./synced-lyrics-editor").then((mod) => mod.SyncedLyricsEditor), {
  ssr: false,
});

export { SyncedLyricsEditor };
