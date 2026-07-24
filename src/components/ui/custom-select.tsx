"use client";

import cn from "@/lib/utils/cn";
import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Icon } from "./icon";
import { SelectOption } from "./select";

interface CustomSelectProps {
  label?: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
}

// 원본의 "SELECT (div 커스텀)"을 WAI-ARIA Listbox 패턴으로 구현.
// 원본은 aria-haspopup="listbox"까지만 있고 방향키 이동, 옵션 role 연결이 없었음.
// 여기서는 그 둘을 채웠습니다: 방향키(↑↓)로 옵션 이동, Enter로 확정, Home/End 지원.

export function CustomSelect({ label, options, value, onChange, placeholder, className, ...props }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      options.findIndex((o) => o.value === value),
      0,
    ),
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const listboxId = `${id}-listbox`;

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!listRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const commit = (index: number) => {
    onChange(options[index].value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handleListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      commit(activeIndex);
    } else if (e.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  // 목록이 열리면 바로 목록에 포커스를 줘서 방향키가 즉시 먹히게 함
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  return (
    <div className={cn("relative flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-muted-light">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "w-full flex items-center justify-between border-2 rounded-[10px] px-[14px] py-[11px] text-sm bg-surface cursor-pointer",
          "outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
          open ? "border-primary" : "border-border",
          selected ? "text-foreground" : "text-muted-light",
        )}
      >
        <span>{selected ? selected.label : (placeholder ?? "선택하세요")}</span>
        <Icon
          name="chevron-down"
          size={16}
          className={cn("text-muted-light transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={props["aria-label"] ?? label ?? "옵션 목록"}
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          className="absolute top-full mt-1.5 left-0 right-0 bg-surface border border-border rounded-[10px] shadow-[0_12px_28px_rgba(20,30,60,0.12)] overflow-hidden z-20 list-none m-0 p-0 outline-none"
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isActive = index === activeIndex;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(index)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-[14px] py-2.5 text-[13px] text-left cursor-pointer",
                    isActive ? "bg-info-bg" : "bg-transparent",
                    "text-foreground",
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Icon name="check" size={14} className="text-primary shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ===== 사용 예시 =====
//
// const [category, setCategory] = useState<string | null>(null);
// <CustomSelect
//   label="문서 분류"
//   placeholder="분류를 선택하세요"
//   value={category}
//   onChange={setCategory}
//   options={[
//     { value: 'character', label: '인물' },
//     { value: 'case', label: '사건/에피소드' },
//     { value: 'org', label: '범죄조직' },
//   ]}
// />
//
// 네이티브 select로 충분하면 Select 컴포넌트가 훨씬 가볍습니다 — 이건 옵션 안에
// 아이콘/뱃지 같은 걸 같이 보여줘야 하는 등 디자인을 완전히 통제해야 할 때만 쓰세요.
//
// 체크리스트
// - 방향키(↑↓)로 옵션 이동, Enter/Space로 확정, Home/End로 처음/끝 이동
// - 선택된 옵션엔 체크 아이콘 + aria-selected — 시각/스크린리더 둘 다에 전달
// - 목록이 열리자마자 포커스를 목록으로 옮겨서 방향키가 바로 먹히게 함
