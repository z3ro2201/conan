"use client";

import cn from "@/lib/utils/cn";
import { cloneElement, useId, useRef, useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  side?: "top" | "bottom";
  className?: string;
}

// 원본은 onMouseEnter/onMouseLeave만 있어서 마우스 없이 Tab으로 접근하는 사용자는
// 이 툴팁을 절대 볼 수 없었습니다. focus/blur를 추가하고, Escape로도 닫히게 했습니다.
// role="tooltip"은 순수 텍스트 설명용 — 안에 버튼/링크 같은 인터랙티브 요소를 넣지 마세요
// (그런 게 필요하면 HoverCard를 쓰세요).

export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();
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
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => e.key === "Escape" && hide()}
    >
      {/* children(트리거)에 aria-describedby를 심어서 포커스했을 때 스크린리더가
          "버튼, 되돌리기 전 마지막 편집 확인"처럼 이어 읽어주게 함 */}
      {cloneElement(children, { "aria-describedby": visible ? id : undefined } as Record<string, unknown>)}
      {visible && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#22252E] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg z-30 pointer-events-none",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}

// ===== 사용 예시 =====
//
// <Tooltip content="되돌리기 전 마지막 편집 확인">
//   <IconButton icon={<Icon name="edit" />} aria-label="편집 정보" />
// </Tooltip>
//
// 체크리스트
// - 트리거를 Tab으로 포커스해도 뜨고, Escape로 닫힘 — 마우스 전용이 아님
// - role="tooltip" + aria-describedby로 "이 버튼에 대한 부가 설명"임을 스크린리더에 전달
// - 200ms 지연 후 표시 — 마우스가 스치기만 해도 매번 뜨면 오히려 방해가 됨
