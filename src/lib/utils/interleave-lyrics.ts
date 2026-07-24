import type { SyncedLine } from "./parse-lrc";

export interface LanguageLine extends SyncedLine {
  language: string;
}

export function interleaveLyricsLines(linesByLanguage: { language: string; lines: SyncedLine[] }[]): LanguageLine[] {
  const queues = linesByLanguage.map((l) => ({ language: l.language, lines: [...l.lines] }));
  const result: LanguageLine[] = [];

  let remaining = true;
  while (remaining) {
    remaining = false;
    for (const queue of queues) {
      const line = queue.lines.shift();
      if (line) {
        result.push({ ...line, language: queue.language });
        remaining = true;
      }
    }
  }

  return result;
}
