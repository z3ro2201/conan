export function sanitizeRubyHtml(text: string): string {
  // ruby, rt 태그만 허용하고 나머지 태그는 이스케이프
  const allowedTags = /<\/?(?:ruby|rt|rp)>/g;
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // 허용된 태그만 다시 원래대로 복원
  return escaped.replace(/&lt;(\/?(?:ruby|rt|rp))&gt;/g, "<$1>");
}
