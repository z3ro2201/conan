export const splitLyricsToLines = (content: string): { time: number; text: string }[] => {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((text) => ({ time: 0, text })); // 시간은 아직 안 찍힌 상태(0)로 초기화
};
