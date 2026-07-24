import cn from "@/lib/utils/cn";

interface TruncateProps {
  text: string;
  /** 1이면 한 줄 말줄임(...), 2 이상이면 그 줄 수에서 line-clamp */
  lines?: number;
  className?: string;
}

// CSS로 잘라낸 텍스트라도 스크린리더는 어차피 전체 텍스트를 다 읽습니다(짤림은 시각 효과일 뿐).
// 놓치기 쉬운 건 마우스 사용자 쪽 — 시각적으로 잘린 텍스트에 title을 달아두면
// 마우스를 올렸을 때 브라우저 기본 툴팁으로 전체 텍스트를 확인할 수 있습니다.

export function Truncate({ text, lines = 1, className }: TruncateProps) {
  if (lines <= 1) {
    return (
      <div title={text} className={cn("whitespace-nowrap overflow-hidden text-ellipsis", className)}>
        {text}
      </div>
    );
  }

  return (
    <div
      title={text}
      style={{ WebkitLineClamp: lines }}
      className={cn("overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical]", className)}
    >
      {text}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Truncate text="명탐정 OOO 정체 떡밥 총정리 및 최신 이론 모음집" className="max-w-[320px] font-bold text-sm border border-border rounded-[10px] px-3.5 py-2.5" />
//
// <Truncate
//   lines={2}
//   text="이 문서는 예시 구조 확인용 텍스트입니다. 로그인 없이 누구나 즉시 수정·삭제할 수 있으며..."
//   className="max-w-[320px] text-[13px] text-muted leading-relaxed"
// />
//
// 체크리스트
// - title 속성으로 마우스 사용자도 전체 텍스트를 확인할 수 있게 함
// - 스크린리더는 애초에 잘림 없이 전체 텍스트를 읽으므로 별도 처리 불필요
// - line-clamp는 -webkit- 접두사 전용 CSS라 표준화되진 않았지만 모든 주요 브라우저가 지원
