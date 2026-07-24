"use client";

import cn from "@/lib/utils/cn";
import { cloneElement, useRef, useState } from "react";

interface HoverCardProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  className?: string;
}

// Tooltip과 달리 콘텐츠가 풍부해질 수 있어(아바타, 여러 줄 텍스트 등) role="tooltip"은
// 안 씁니다(ARIA 스펙상 tooltip 안엔 텍스트만 들어가야 함). 대신 순수 시각적 팝오버로 두고,
// 트리거에 aria-describedby 대신 aria-expanded로 "펼쳐진 부가 정보가 있다"만 알립니다.

export function HoverCard({ trigger, children, className }: HoverCardProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), 200);
  };
  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => e.key === "Escape" && hide()}
    >
      {cloneElement(trigger, { "aria-expanded": visible } as Record<string, unknown>)}
      {visible && (
        <div
          role="group"
          className={cn(
            "absolute top-full mt-2 left-0 w-[220px] bg-surface border border-border rounded-2xl",
            "shadow-[0_12px_28px_rgba(20,30,60,0.14)] p-4 z-20",
            className,
          )}
        >
          {children}
        </div>
      )}
    </span>
  );
}

// ===== 사용 예시 =====
//
// <HoverCard trigger={<a href="/user/123" className="font-bold text-primary cursor-pointer">@나비넥타이덕후</a>}>
//   <Avatar initials="나" tone="primary" size="md" className="mb-2.5" />
//   <div className="font-bold text-[13px] text-foreground">나비넥타이덕후</div>
//   <div className="text-[11px] text-muted-light mt-0.5">기여 128건 · 가입 2년차</div>
// </HoverCard>
//
// 체크리스트
// - 트리거는 여전히 진짜 링크(<a>)로 두세요 — 호버카드는 "미리보기"일 뿐,
//   실제 이동 기능을 대체하면 안 됩니다
// - 안에 버튼/링크 등 인터랙티브 요소를 넣어도 되는 게 Tooltip과의 핵심 차이
