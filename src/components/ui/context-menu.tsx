"use client";

import cn from "@/lib/utils/cn";
import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import { DropdownMenuItem } from "./dropdown-menu";

interface ContextMenuProps {
  items: DropdownMenuItem[];
  children: React.ReactNode;
  className?: string;
}

// DropdownMenu와 같은 role="menu"/role="menuitem" 패턴이지만, 트리거가 버튼이 아니라
// 마우스 우클릭 이벤트이고 위치도 클릭한 좌표를 따라간다는 점만 다릅니다.
// 우클릭은 스크린리더/키보드 사용자에게 애초에 접근 불가능한 상호작용이라, children으로
// 감싼 영역은 반드시 다른 방법(툴바 버튼 등)으로도 같은 작업에 접근할 수 있게 하세요.

export function ContextMenu({ items, children, className }: ContextMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = () => setPosition(null);

  useEffect(() => {
    if (!position) return;
    const handleClick = () => close();
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [position]);

  const handleContextMenu = (e: ReactMouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const runItem = (item: DropdownMenuItem) => {
    if (item.disabled) return;
    item.onClick();
    close();
  };

  return (
    <>
      <div onContextMenu={handleContextMenu} className={cn("cursor-context-menu", className)}>
        {children}
      </div>

      {position && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="컨텍스트 메뉴"
          style={{ left: position.x, top: position.y }}
          className="fixed z-[255] min-w-[160px] bg-surface border border-border rounded-[10px] shadow-[0_8px_24px_rgba(20,30,60,0.12)] overflow-hidden py-1"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => runItem(item)}
              className={cn(
                "w-full text-left px-[14px] py-2.5 text-[13px] cursor-pointer outline-none hover:bg-info-bg",
                item.danger ? "text-danger" : "text-foreground",
                item.disabled && "cursor-not-allowed text-muted-light hover:bg-transparent",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ===== 사용 예시 =====
//
// <ContextMenu
//   items={[
//     { label: '복사', onClick: handleCopy },
//     { label: '수정', onClick: handleEdit },
//     { label: '삭제', onClick: handleDelete, danger: true },
//   ]}
// >
//   <div className="border-[1.5px] border-dashed border-muted-light/50 rounded-2xl p-8 text-center text-[13px] text-muted-light">
//     이 영역에서 마우스 우클릭 해보세요
//   </div>
// </ContextMenu>
//
// 체크리스트
// - 우클릭 전용 상호작용이라 키보드/스크린리더 사용자는 도달할 수 없음 — 같은 기능을
//   수행할 수 있는 다른 경로(툴바 버튼, DropdownMenu 등)를 반드시 같이 제공하세요
// - 화면 오른쪽/아래 경계에서 메뉴가 잘릴 수 있는데, 이 컴포넌트는 기본 위치만 잡아주고
//   경계 보정은 안 함 — 필요하면 열린 후 getBoundingClientRect로 위치를 보정하는 로직 추가 필요
