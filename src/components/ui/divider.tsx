import cn from "@/lib/utils/cn";

interface DividerProps {
  /** 가운데 텍스트 (예: "또는") */
  label?: string;
  /** 왼쪽에 붙는 뱃지형 라벨 (예: "2026.07") — label과 같이 쓰지 않음 */
  badge?: string;
  /** "수정 | 삭제 | 토론"처럼 inline 항목 사이에 쓰는 세로 구분선 */
  orientation?: "horizontal" | "vertical";
  className?: string;
}

// label도 badge도 없으면 그냥 <hr>. 순수 시각적 구분선이라 <hr>이 정확히 맞는 시맨틱 —
// 스크린리더가 "구분선"으로 안내하고, 문서를 주제별로 나누는 용도로도 쓰입니다.
// 세로형은 <hr>에 방향을 강제로 바꿀 수 없어서 role="separator" + aria-orientation을 직접 씀.

export function Divider({ label, badge, orientation = "horizontal", className }: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn("w-px h-3.5 bg-border inline-block", className)}
      />
    );
  }

  if (badge) {
    return (
      <div className={cn("flex items-center gap-2", className)} role="separator">
        <span className="text-[11px] font-bold text-primary bg-info-bg px-2.5 py-1 rounded-full shrink-0">{badge}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }

  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)} role="separator">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-bold text-muted-light">{label}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }

  return <hr className={cn("border-none border-t border-border m-0 w-full", className)} />;
}

// ===== 사용 예시 =====
//
// <Divider />
// <Divider label="또는" />
// <Divider badge="2026.07" />
//
// // inline 항목 구분 (예: 수정 | 삭제 | 토론)
// <div className="flex items-center gap-3 text-sm text-muted">
//   <span>수정</span>
//   <Divider orientation="vertical" />
//   <span>삭제</span>
//   <Divider orientation="vertical" />
//   <span>토론</span>
// </div>
