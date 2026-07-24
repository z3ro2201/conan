import cn from "@/lib/utils/cn";

interface BubbleProps {
  children: React.ReactNode;
  /** 우측 상단에 붙는 카운트 (예: 3) */
  count?: number;
  tone?: "primary" | "dark";
  className?: string;
}

export function Bubble({ children, count, tone = "primary", className }: BubbleProps) {
  return (
    <span
      className={cn(
        "relative inline-block text-[13px] px-4 py-2.5 rounded-2xl",
        tone === "primary" ? "bg-primary text-white font-bold" : "bg-foreground text-white rounded-bl-[4px]",
        className,
      )}
    >
      {children}
      {count !== undefined && (
        <span
          aria-hidden="true"
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger text-white text-[11px] flex items-center justify-center"
        >
          {count}
        </span>
      )}
      {count !== undefined && <span className="sr-only"> ({count}개)</span>}
    </span>
  );
}

// ===== 사용 예시 =====
//
// <Bubble count={3}>알림</Bubble>
// <Bubble tone="dark">말풍선 스타일</Bubble>
//
// 참고: 아바타 곁들인 채팅 말풍선은 Message, 단순 상태 라벨은 Badge를 쓰세요 —
// Bubble은 그 사이 어디쯤(카운트 결합 pill)의 장식적 용도입니다.
