export interface SyncedLine {
  time: number; // 밀리초
  text: string;
}

export const parseLRC = (lrcText: string): SyncedLine[] => {
  const lines = lrcText.split("\n");
  const result: SyncedLine[] = [];

  const timeTagRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  for (const line of lines) {
    const timestamps = [...line.matchAll(timeTagRegex)];
    if (timestamps.length === 0) continue;

    const lastMatch = timestamps[timestamps.length - 1];
    const text = line.slice(lastMatch.index! + lastMatch[0].length).trim();

    if (!text) continue; // 가사 없는 빈 타임스탬프 줄은 건너뜀

    for (const match of timestamps) {
      const [, min, sec, ms] = match;
      const time = parseInt(min) * 60 * 1000 + parseInt(sec) * 1000 + parseInt(ms.padEnd(3, "0"));
      result.push({ time, text });
    }
  }

  return result.sort((a, b) => a.time - b.time);
};

export const stringifyLRC = (lines: SyncedLine[]): string => {
  return lines
    .map((line) => {
      const totalMs = line.time;
      const min = Math.floor(totalMs / 60000);
      const sec = Math.floor((totalMs % 60000) / 1000);
      const ms = Math.floor(totalMs % 1000);

      const mm = String(min).padStart(2, "0");
      const ss = String(sec).padStart(2, "0");
      const mmm = String(ms).padStart(3, "0").slice(0, 2); // LRC는 보통 2자리 ms

      return `[${mm}:${ss}.${mmm}]${line.text}`;
    })
    .join("\n");
};
