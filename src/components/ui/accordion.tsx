"use client";

import cn from "@/lib/utils/cn";
import { useId, useRef, useState, KeyboardEvent } from "react";
import { Icon } from "./icon";

export interface AccordionItemData {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItemData[];
  /**
   * multiple(기본): 여러 항목을 동시에 열어둘 수 있음 (원본 UI킷과 동일한 동작)
   * single: 하나를 열면 나머지는 자동으로 닫힘 (FAQ처럼 한 번에 하나만 보여주고 싶을 때)
   */
  type?: "multiple" | "single";
  defaultOpenIds?: string[];
  /** 헤더를 감싸는 헤딩 레벨. 페이지 문서 구조에 맞게 조정 (기본 h3) */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function Accordion({
  items,
  type = "multiple",
  defaultOpenIds = [],
  headingLevel = 3,
  className,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpenIds));
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const groupId = useId();
  const Heading = `h${headingLevel}` as const;

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (type === "single") {
        next.clear();
        if (!prev.has(id)) next.add(id);
      } else {
        next.has(id) ? next.delete(id) : next.add(id);
      }
      return next;
    });
  };

  // WAI-ARIA Accordion 패턴: 헤더 버튼 사이를 방향키(↑↓)/Home/End로 이동.
  // Tab으로도 원래 순서대로 이동 가능하니 방향키는 추가 편의 기능.
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === "ArrowDown") nextIndex = (index + 1) % items.length;
    else if (e.key === "ArrowUp") nextIndex = (index - 1 + items.length) % items.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = items.length - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {items.map((item, index) => {
        const isOpen = openIds.has(item.id);
        const buttonId = `${groupId}-trigger-${item.id}`;
        const panelId = `${groupId}-panel-${item.id}`;

        return (
          <div key={item.id} className="border border-border rounded-xl overflow-hidden">
            <Heading className="m-0">
              <button
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  "w-full text-left bg-background border-none px-[18px] py-[14px]",
                  "font-bold text-sm text-foreground cursor-pointer",
                  "flex justify-between items-center gap-3",
                  "outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                )}
              >
                <span>{item.title}</span>
                <Icon
                  name="chevron-down"
                  size={16}
                  className={cn("shrink-0 text-primary transition-transform", isOpen && "rotate-180")}
                />
              </button>
            </Heading>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="px-[18px] py-4 text-[13px] leading-[1.7] text-muted"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Accordion
//   items={[
//     { id: 'a1', title: '이 인물의 정체는 무엇인가요?', content: '...' },
//     { id: 'a2', title: '스포일러 정책이 궁금해요', content: '...' },
//     { id: 'a3', title: '문서를 되돌리려면 어떻게 하나요?', content: '...' },
//   ]}
//   defaultOpenIds={['a1']}
// />
//
// // FAQ처럼 한 번에 하나만 열리게
// <Accordion items={faqItems} type="single" />
//
// // 페이지에서 이미 h2가 섹션 제목으로 쓰이고 있다면 아코디언 헤더는 h3가 자연스러움 (기본값).
// // 아코디언이 페이지의 최상위 섹션 제목 역할을 한다면 headingLevel={2}로 조정
//
// 체크리스트
// - 헤더를 h3 등 헤딩으로 감싸는 이유: 스크린리더 사용자가 "헤딩 목록으로 건너뛰기" 기능으로
//   페이지를 훑어볼 때 아코디언 항목들도 그 목록에 잡히게 하기 위함
// - role="region" + aria-labelledby로 패널이 어떤 버튼에 속하는지 스크린리더에 알려줌
// - 방향키(↑↓)/Home/End는 Tab 순서를 대체하는 게 아니라 보조 수단 — 둘 다 됨
