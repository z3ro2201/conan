"use client";

import cn from "@/lib/utils/cn";
import { useEffect, useId, useState } from "react";
import { Icon } from "./icon";

export interface TocItem {
  /** 해당 본문 헤딩의 id (예: <h2 id="identity">정체</h2>) */
  id: string;
  label: string;
  level?: number;
}

// ===== 접이식 목차 카드 =====

interface TocProps {
  items: TocItem[];
  title?: string;
  defaultOpen?: boolean;
  className?: string;
}

export function Toc({ items, title = "목차", defaultOpen = true, className }: TocProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className={cn("border border-border rounded-2xl px-5 py-[18px] max-w-[420px]", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center cursor-pointer bg-transparent border-none p-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
      >
        <span className="font-black text-base text-foreground">{title}</span>
        <Icon
          name="chevron-down"
          size={14}
          className={cn("text-muted-light transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul id={contentId} className="mt-2.5 flex flex-col gap-1.5 list-none m-0 p-0">
          {items.map((item) => (
            <li key={item.id} style={{ paddingLeft: ((item.level ?? 1) - 1) * 14 }}>
              <a href={`#${item.id}`} className="text-[13px] text-muted no-underline hover:text-primary">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ===== 플로팅 스크롤스파이 레일 =====
// 원본은 클릭으로만 활성 항목이 바뀌는 정적 데모였는데("실제로는 스크롤 위치에 따라..."라고
// 스스로 밝혀둘 정도), 여기서는 IntersectionObserver로 진짜 스크롤 위치를 추적해서
// 지금 화면에 보이는 섹션의 항목이 자동으로 활성화되게 구현했습니다.

interface TocRailProps {
  items: TocItem[];
  className?: string;
}

export function TocRail({ items, className }: TocRailProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const elements = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      // 화면 위 20%~아래 70% 사이에 걸린 헤딩을 "지금 읽고 있는 섹션"으로 간주
      { rootMargin: "-20% 0px -70% 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="문서 내 이동" className={cn("bg-background rounded-2xl p-3.5 flex flex-col gap-1", className)}>
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={active ? "location" : undefined}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs no-underline transition-colors",
              active ? "bg-primary text-white font-bold" : "text-muted hover:text-primary",
            )}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

// ===== 사용 예시 =====
//
// const outline = [
//   { id: 'identity', label: '정체' },
//   { id: 'appearances', label: '출연 목록', level: 2 },
//   { id: 'theories', label: '이론' },
// ];
//
// <Toc items={outline} />
// <TocRail items={outline} className="fixed right-8 top-32" />
//
// // 본문 쪽 헤딩에 같은 id를 달아두면 TocRail이 자동으로 그 위치를 추적함
// <h2 id="identity">정체</h2>
//
// 체크리스트
// - aria-current="location"은 ARIA 스펙이 "지금 보고 있는 위치"용으로 마련해둔 값
//   (Breadcrumb/Stepper의 "page"/"step"과 같은 계열, 상황에 맞는 값으로 구분해서 씀)
// - TocRail은 실제 헤딩 id가 페이지에 있어야 동작함 — Toc(목차 카드)는 그 없이도 링크만으로 동작
