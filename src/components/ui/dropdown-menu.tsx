"use client";

import cn from "@/lib/utils/cn";
import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Icon } from "./icon";

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  /** 삭제처럼 되돌리기 어려운 액션에 danger 색상 적용 */
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  "aria-label"?: string;
  className?: string;
}

// 원본의 "DROPDOWN"(작업 선택: 수정하기/되돌리기/삭제)은 값을 저장하는 게 아니라
// 누르면 바로 실행되고 끝나는 액션 목록이라 Select와는 다른 시맨틱 — WAI-ARIA
// Menu 패턴(role="menu"/role="menuitem")으로 구현했습니다.
// CustomSelect(listbox, "지금 뭐가 선택돼 있나"가 중요)와
// DropdownMenu(menu, "선택되면 즉시 실행되고 끝남")를 헷갈리지 않게 이름도 다르게 뒀습니다.

export function DropdownMenu({ trigger, items, className, ...props }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const menuId = `${id}-menu`;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open) itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  const runItem = (index: number) => {
    const item = items[index];
    if (item.disabled) return;
    item.onClick();
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveIndex(0);
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(items.length - 1);
      setOpen(true);
    }
  };

  const handleMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(items.length - 1);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
        className="outline-none focus-visible:ring-4 focus-visible:ring-primary/30 rounded-[10px]"
      >
        {trigger}
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={props["aria-label"] ?? "작업 메뉴"}
          onKeyDown={handleMenuKeyDown}
          className="absolute top-full mt-1.5 left-0 min-w-[160px] bg-surface border border-border rounded-[10px] shadow-[0_8px_24px_rgba(20,30,60,0.12)] overflow-hidden z-20 py-1"
        >
          {items.map((item, index) => (
            <button
              key={item.label}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={item.disabled}
              onClick={() => runItem(index)}
              className={cn(
                "w-full text-left px-[14px] py-2.5 text-[13px] cursor-pointer outline-none",
                item.danger ? "text-danger" : "text-foreground",
                "hover:bg-info-bg focus:bg-info-bg",
                item.disabled && "cursor-not-allowed text-muted-light hover:bg-transparent focus:bg-transparent",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <DropdownMenu
//   aria-label="문서 작업"
//   trigger={<Button variant="secondary" size="sm">작업 선택 ⌄</Button>}
//   items={[
//     { label: '수정하기', onClick: () => router.push('/edit') },
//     { label: '되돌리기', onClick: handleRevert },
//     { label: '삭제', onClick: handleDelete, danger: true },
//   ]}
// />
//
// // 아이콘 버튼(⋮ 케밥 메뉴)을 트리거로 쓰고 싶으면
// <DropdownMenu
//   aria-label="문서 작업"
//   trigger={<IconButton icon={<Icon name="menu" />} aria-label="더보기" />}
//   items={[...]}
// />
//
// 체크리스트
// - CustomSelect(listbox)와 헷갈리지 마세요: "지금 뭐가 선택돼 있나"가 중요하면 CustomSelect,
//   "누르면 즉시 실행되고 끝"이면 DropdownMenu — 원본의 SELECT(div)와 DROPDOWN이
//   겉보기엔 비슷해도 서로 다른 ARIA role(listbox vs menu)을 쓰는 이유
// - 메뉴가 열리면 첫 항목(또는 위 화살표로 열었으면 마지막 항목)에 바로 포커스 이동
// - 방향키로 항목 이동, Escape/Tab으로 닫힘, 닫힐 때 포커스는 트리거로 복귀
// - danger 항목(삭제 등)은 색으로만 구분하지 않고 텍스트 자체가 "삭제"처럼 명확해야 함
