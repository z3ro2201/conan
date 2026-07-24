"use client";

import cn from "@/lib/utils/cn";
import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { useDialogBehavior } from "@/lib/utils/use-dialog-behavior";
import { Icon } from "./icon";

export interface CommandItem {
  id: string;
  label: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  items: CommandItem[];
  /** ⌘K/Ctrl+K 전역 단축키를 이 컴포넌트가 직접 등록할지 (기본 true) */
  enableShortcut?: boolean;
}

// 트리거 버튼은 이 컴포넌트가 그리지 않고 소비하는 쪽에서 자유롭게 만들도록 열어뒀습니다
// (원본처럼 "🔍 빠른 검색... ⌘K" 버튼이 대표적인 형태). 이 컴포넌트는 열림 상태와
// ⌘K 전역 단축키, 그리고 오버레이 자체만 담당합니다.

export function CommandPalette({ items, enableShortcut = true }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  useDialogBehavior(open, close, containerRef);

  useEffect(() => {
    if (!enableShortcut) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enableShortcut]);

  const results = items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const runResult = (item: CommandItem) => {
    item.onSelect();
    close();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      runResult(results[activeIndex]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[240] bg-[#14192a]/45 flex items-start justify-center pt-[120px]" onClick={close}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="명령어 팔레트"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] bg-surface rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
      >
        <div className="flex items-center gap-2.5 px-[18px] py-4 border-b border-border">
          <Icon name="search" size={16} className="text-muted-light shrink-0" />
          <label className="sr-only" htmlFor={`${listboxId}-input`}>
            문서, 명령어 검색
          </label>
          <input
            ref={inputRef}
            id={`${listboxId}-input`}
            role="combobox"
            aria-expanded
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={results[activeIndex] ? `${listboxId}-${results[activeIndex].id}` : undefined}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="문서, 명령어 검색..."
            className="flex-1 border-none outline-none text-[15px] bg-transparent"
          />
          <span className="bg-background border border-border rounded-md px-2 py-0.5 text-[11px] font-bold text-muted shrink-0">
            ESC
          </span>
        </div>

        <ul
          id={listboxId}
          role="listbox"
          aria-label="검색 결과"
          className="list-none m-0 p-0 max-h-[320px] overflow-y-auto"
        >
          {results.length === 0 ? (
            <li className="px-[18px] py-6 text-center text-xs text-muted-light">검색 결과가 없어요</li>
          ) : (
            results.map((item, index) => (
              <li key={item.id}>
                <button
                  id={`${listboxId}-${item.id}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => runResult(item)}
                  className={cn(
                    "w-full text-left px-[18px] py-3 text-sm cursor-pointer",
                    index === activeIndex ? "bg-info-bg text-primary" : "text-foreground",
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

// ===== 사용 예시 =====
//
// <button className="...">🔍 빠른 검색... <kbd>⌘K</kbd></button>
// <CommandPalette
//   items={[
//     { id: 'doc-1', label: '명탐정 OOO', onSelect: () => router.push('/character/1') },
//     { id: 'action-1', label: '새 문서 작성', onSelect: () => router.push('/new') },
//   ]}
// />
//
// 체크리스트
// - role="combobox" + aria-activedescendant 패턴으로 SearchBar와 동일한 콤보박스 접근성
// - ⌘K/Ctrl+K는 window 레벨 keydown이라 포커스가 어디 있든 동작함 (입력창 안이 아니어도)
// - useDialogBehavior로 포커스 트랩·Escape·스크롤 잠금·포커스 복귀 동일 적용
