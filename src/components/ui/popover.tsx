"use client";

import cn from "@/lib/utils/cn";
import { cloneElement, useEffect, useId, useRef, useState } from "react";

interface PopoverProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  className?: string;
}

// HoverCard(마우스 올리면 열림)와 달리 클릭으로 열고 닫는 팝오버.
// DropdownMenu/CustomSelect와 같은 열기·닫기 인프라(Escape, 바깥 클릭, 포커스 복귀)를 쓰되,
// 메뉴/리스트박스 같은 정해진 role 없이 자유 형식 콘텐츠(설명 문단 등)를 담을 때 씁니다.

export function Popover({ trigger, children, className }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!popoverRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <span className="relative inline-block">
      {cloneElement(trigger, {
        ref: triggerRef,
        "aria-haspopup": true,
        "aria-expanded": open,
        "aria-controls": open ? id : undefined,
        onClick: () => setOpen((v) => !v),
      } as Record<string, unknown>)}

      {open && (
        <div
          ref={popoverRef}
          id={id}
          role="group"
          className={cn(
            "absolute top-full mt-3.5 left-0 w-[220px] bg-surface border border-border rounded-2xl p-4 z-20",
            "shadow-[0_12px_28px_rgba(20,30,60,0.14)]",
            className,
          )}
        >
          {/* 트리거를 가리키는 작은 삼각형 포인터 */}
          <span
            aria-hidden="true"
            className="absolute -top-[7px] left-6 w-3.5 h-3.5 bg-surface border-l border-t border-border rotate-45"
          />
          {children}
        </div>
      )}
    </span>
  );
}

// ===== 사용 예시 =====
//
// <Popover trigger={<Button variant="secondary" size="sm">설정 팝오버 열기</Button>}>
//   <div className="font-bold text-[13px] text-foreground mb-2">문서 설정</div>
//   <div className="text-xs text-muted leading-relaxed">
//     스포일러 기본 접기, 알림 수신 등을 여기서 빠르게 조정할 수 있어요.
//   </div>
// </Popover>
//
// 체크리스트
// - trigger에 aria-haspopup/aria-expanded/aria-controls를 자동으로 심어줌 (cloneElement)
// - Escape·바깥 클릭으로 닫힘, 닫히면 포커스가 트리거로 복귀
// - 옵션을 고르는 목록이면 CustomSelect(listbox)나 DropdownMenu(menu)가 더 적합 —
//   Popover는 그 둘에 안 맞는 자유 형식 콘텐츠(설명, 미니 폼 등)용입니다
