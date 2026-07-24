"use client";

import cn from "@/lib/utils/cn";
import { useRef } from "react";
import { Icon } from "./icon";

export interface CardCarouselItem {
  label: string;
  content?: React.ReactNode;
}

interface CardCarouselProps {
  items: CardCarouselItem[];
  cardWidth?: number;
  className?: string;
}

// 원본은 translateX 오프셋을 직접 계산해서 카드 묶음을 통째로 밀어내는 방식이었는데,
// 네이티브 스크롤 컨테이너(overflow-x-auto + scroll-snap)로 바꿨습니다.
// 그러면 트랙패드 스와이프, 마우스 휠 가로 스크롤, 모바일 터치 스크롤이 전부
// 별도 구현 없이 브라우저 기본 동작으로 되고, 좌우 버튼은 그 위에 살짝 얹는 보조 수단이 됩니다.

export function CardCarousel({ items, cardWidth = 150, className }: CardCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: direction * (cardWidth + 16), behavior: "smooth" });
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <button
        type="button"
        aria-label="이전 카드"
        onClick={() => scrollByCard(-1)}
        className="w-9 h-9 rounded-full border border-border bg-surface text-primary flex items-center justify-center cursor-pointer shrink-0"
      >
        <Icon name="chevron-left" size={15} />
      </button>

      <div
        ref={scrollRef}
        role="region"
        aria-label="카드 목록"
        tabIndex={0}
        className="flex gap-4 overflow-x-auto [scroll-snap-type:x_mandatory] max-w-[520px] scroll-smooth"
      >
        {items.map((item, i) => (
          <div key={i} style={{ width: cardWidth }} className="shrink-0 [scroll-snap-align:start]">
            <div className="aspect-square rounded-xl mb-2 overflow-hidden bg-[repeating-linear-gradient(135deg,var(--info-bg),var(--info-bg)_10px,#E1E9FA_10px,#E1E9FA_20px)] flex items-center justify-center">
              {item.content}
            </div>
            <div className="text-xs font-bold text-foreground">{item.label}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="다음 카드"
        onClick={() => scrollByCard(1)}
        className="w-9 h-9 rounded-full border border-border bg-surface text-primary flex items-center justify-center cursor-pointer shrink-0"
      >
        <Icon name="chevron-right" size={15} />
      </button>
    </div>
  );
}

// ===== 사용 예시 =====
//
// <CardCarousel
//   items={[
//     { label: '명탐정 OOO' }, { label: '검은 조직' }, { label: '탐정단' },
//     { label: '경시청' }, { label: '범죄조직 코드명' }, { label: '극장판 목록' },
//   ]}
// />
//
// 체크리스트
// - 원본의 translateX 계산 대신 네이티브 스크롤 + scroll-snap → 트랙패드/휠/터치 스크롤이
//   전부 공짜로 지원됨 (원본은 버튼 클릭으로만 이동 가능했음)
// - role="region" + tabIndex={0}으로 Table의 가로 스크롤 영역과 같은 이유로 키보드 접근 보장
