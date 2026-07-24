"use client";

import cn from "@/lib/utils/cn";
import { KeyboardEvent, useId, useRef, useState } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  /** 탭 목록 자체를 설명하는 라벨 (예: "문서 섹션 탭") */
  "aria-label": string;
  className?: string;
}

// 원본 UI킷은 role="tablist"/aria-selected까지는 있었지만
// aria-controls로 패널과 연결되지 않았고, 방향키로 탭 이동도 안 됐음.
// 여기서는 WAI-ARIA Tabs 패턴(자동 활성화 방식)을 온전히 구현:
// - 방향키(←→)/Home/End로 탭 이동 시 그 자리에서 바로 패널도 전환됨
// - 선택 안 된 탭은 tabIndex=-1이라 Tab 키로는 한 번에 하나만 걸림 (방향키로 나머지 이동)
// - 패널은 항상 DOM에 존재하고 hidden 속성으로만 감춤 → aria-controls가 항상 유효한 대상을 가리킴

export function Tabs({ items, defaultTab, className, ...props }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTab ?? items[0]?.id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const groupId = useId();

  const activeIndex = items.findIndex((item) => item.id === activeId);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % items.length;
    else if (e.key === "ArrowLeft") nextIndex = (index - 1 + items.length) % items.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = items.length - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      setActiveId(items[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={props["aria-label"]} className="flex gap-0.5 border-b-2 border-border">
        {items.map((item, index) => {
          const isActive = item.id === activeId;
          const tabId = `${groupId}-tab-${item.id}`;
          const panelId = `${groupId}-panel-${item.id}`;

          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "bg-transparent border-none border-b-[3px] -mb-0.5 font-bold text-[13px] px-4 py-2.5 cursor-pointer transition-colors",
                "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                isActive ? "border-primary text-primary" : "border-transparent text-muted-light hover:text-muted",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item) => {
        const isActive = item.id === activeId;
        const tabId = `${groupId}-tab-${item.id}`;
        const panelId = `${groupId}-panel-${item.id}`;

        return (
          <div
            key={item.id}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            hidden={!isActive}
            // 패널 자체에 포커스 가능하게 해서, 안의 콘텐츠에 포커스 가능한 요소가
            // 없어도(순수 텍스트 등) 키보드 사용자가 탭 전환 후 내용 쪽으로 이동할 수 있게 함
            tabIndex={0}
            className="pt-4 px-1 text-[13px] text-muted leading-[1.7] outline-none"
          >
            {item.content}
          </div>
        );
      })}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Tabs
//   aria-label="문서 섹션"
//   items={[
//     { id: 'a', label: '개요', content: '기본 정보와 요약이 표시됩니다.' },
//     { id: 'b', label: '스포일러', content: '최신 사건 관련 떡밥이 정리되어 있습니다.' },
//     { id: 'c', label: '토론', content: '이 문서에 대한 토론 12건이 있습니다.' },
//   ]}
// />
//
// 체크리스트
// - aria-controls(탭 → 패널)와 aria-labelledby(패널 → 탭)로 서로 연결
// - 선택 안 된 탭 콘텐츠도 hidden 속성으로만 숨김 (완전히 unmount하지 않음)
//   → aria-controls가 가리키는 대상이 항상 실제로 존재함
// - 페이지 이동이 아니라 같은 화면 안에서 콘텐츠만 바뀔 때 Tabs를 쓰세요.
//   URL이 바뀌어야 하는 경우(다른 문서로 이동 등)엔 Tabs 말고 Nav를 쓰는 게 맞습니다.
