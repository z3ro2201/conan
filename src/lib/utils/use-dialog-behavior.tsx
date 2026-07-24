"use client";

import { useEffect, useRef } from "react";

// Dialog와 Modal은 겉모습만 다르고 "떠 있는 동안 어떻게 동작해야 하는가"는 완전히 동일해서
// 공용 훅으로 분리했습니다:
// - 열리는 순간 포커스를 다이얼로그 안으로 이동
// - Tab/Shift+Tab이 다이얼로그 밖으로 못 나가게 가둠 (포커스 트랩)
// - Escape로 닫힘
// - 열려있는 동안 배경(body) 스크롤 잠금
// - 닫히면 열기 전 포커스가 있던 요소로 되돌림 (트리거 버튼 등)

export function useDialogBehavior<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
  containerRef: React.RefObject<T | null>,
) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 다음 프레임에 포커스 이동 (컨테이너가 아직 DOM에 안 붙었을 수 있어서)
    const focusTimer = requestAnimationFrame(() => {
      const focusable = containerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      (focusable?.[0] ?? containerRef.current)?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !containerRef.current) return;

      const focusable = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused.current?.focus();
    };
  }, [open, onClose, containerRef]);
}
