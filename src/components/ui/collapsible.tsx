"use client";

import cn from "@/lib/utils/cn";
import { useId, useState } from "react";
import { Icon } from "./icon";

interface CollapsibleProps {
  trigger: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

// Accordion과의 차이는 이름 그대로 "그룹이 없다"는 것뿐 — 하나만 단독으로 접었다 펼 때 씁니다.
// 내부적으로는 Accordion의 헤더 버튼과 똑같은 aria-expanded/aria-controls 패턴을 씁니다.

export function Collapsible({ trigger, children, defaultOpen = false, className }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between bg-transparent border-none p-0 cursor-pointer",
          "font-bold text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded",
        )}
      >
        <span>{trigger}</span>
        <Icon
          name="chevron-down"
          size={14}
          className={cn("text-muted-light transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div id={contentId} className="text-[13px] text-muted mt-2.5 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Collapsible trigger="상세 정보 보기">
//   (예시) 접이식 콘텐츠 영역입니다. Accordion과 달리 그룹 없이 단독으로 쓰는 토글이에요.
// </Collapsible>
