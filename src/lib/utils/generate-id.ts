export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // 폴백: 타임스탬프 + 랜덤값 조합
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
