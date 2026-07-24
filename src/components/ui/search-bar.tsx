"use client";

import cn from "@/lib/utils/cn";
import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Icon } from "./icon";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
}

// 원본의 Search 위젯(둥근 필드 + 아래 제안 목록)을 WAI-ARIA Combobox 패턴으로 구현.
// 기본 <input type="search">만 필요하면 이 컴포넌트 대신 TextField에
// type="search" icon={<Icon name="search" />}를 쓰는 걸 추천 — 이건 자동완성
// 드롭다운이 실제로 필요할 때만 쓰는 무거운 버전입니다.

export function SearchBar({
  value,
  onChange,
  suggestions,
  onSelect,
  placeholder,
  className,
  ...props
}: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const listboxId = `${id}-listbox`;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const showSuggestions = open && suggestions.length > 0;

  const selectSuggestion = (s: string) => {
    onSelect(s);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === "ArrowDown" && suggestions.length > 0) {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative max-w-[400px]", className)}>
      <div className="flex items-center gap-2 bg-background rounded-xl px-4 py-[11px] focus-within:ring-4 focus-within:ring-primary/15">
        <Icon name="search" size={16} className="text-muted-light shrink-0" />
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          aria-label={props["aria-label"] ?? "검색"}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "문서 검색..."}
          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-light"
        />
      </div>

      {showSuggestions && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="검색 제안"
          className="absolute top-full mt-1.5 left-0 right-0 bg-surface border border-border rounded-xl shadow-[0_12px_28px_rgba(20,30,60,0.12)] overflow-hidden z-10 list-none m-0 p-0"
        >
          {suggestions.map((s, index) => (
            <li key={s}>
              <button
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectSuggestion(s)}
                className={cn(
                  "w-full text-left flex items-center gap-2 px-4 py-[11px] text-[13px] text-foreground cursor-pointer",
                  index === activeIndex ? "bg-info-bg" : "bg-transparent",
                )}
              >
                <Icon name="search" size={14} className="text-muted-light shrink-0" />
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ===== 사용 예시 =====
//
// // 기본 (자동완성 없이 브라우저 네이티브 검색 인풋만 필요할 때)
// <TextField type="search" placeholder="검색" icon={<Icon name="search" size={16} />} />
//
// // 커스텀 (자동완성 드롭다운 필요할 때)
// const [query, setQuery] = useState('');
// <SearchBar
//   aria-label="문서 검색"
//   value={query}
//   onChange={setQuery}
//   suggestions={query ? allTitles.filter((t) => t.includes(query)).slice(0, 5) : []}
//   onSelect={(title) => { setQuery(title); router.push(`/doc/${title}`); }}
// />
//
// 체크리스트
// - role="combobox" + aria-expanded + aria-controls + aria-autocomplete="list"로
//   "타이핑하면 아래 목록이 걸러진다"는 관계를 스크린리더에 전달
// - aria-activedescendant로 방향키 이동 중인 항목을 알려줌 (포커스 자체는 input에 유지한 채로)
// - Escape로 닫기, 바깥 클릭으로 닫기, Enter로 활성 항목 선택
