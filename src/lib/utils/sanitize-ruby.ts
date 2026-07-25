export function sanitizeRubyHtml(text: string): string {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return escaped.replace(/&lt;(\/?(?:ruby|rt|rp|group))&gt;/g, "<$1>");
}

// 실시간 재생 화면 등에서 group 태그만 벗겨내고 텍스트는 그대로 살리는 헬퍼
export function stripGroupTags(text: string): string {
  return text.replace(/<\/?group>/g, "");
}
