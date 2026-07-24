"use client";

import cn from "@/lib/utils/cn";
import { useState } from "react";
import { Icon } from "./icon";

export interface CarouselSlide {
  src?: string;
  alt: string;
}

interface CarouselProps {
  slides: CarouselSlide[];
  className?: string;
}

export function Carousel({ slides, className }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const current = slides[index];

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <div className={cn("max-w-[520px]", className)}>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="이미지 목록"
        className="relative aspect-video rounded-2xl overflow-hidden bg-[repeating-linear-gradient(135deg,var(--info-bg),var(--info-bg)_12px,#E1E9FA_12px,#E1E9FA_24px)] flex items-center justify-center"
      >
        {/* 슬라이드가 바뀔 때마다 스크린리더에 안내 — 이미지 자체는 배경이라 못 읽으니
            대신 alt 텍스트를 여기서 실시간으로 알려줌 */}
        <div aria-live="polite" className="font-mono text-xs text-[#7B93C4]">
          {current.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.src} alt={current.alt} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            `[ ${current.alt} ]`
          )}
        </div>

        <button
          type="button"
          aria-label="이전 이미지"
          onClick={prev}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 text-primary flex items-center justify-center cursor-pointer"
        >
          <Icon name="chevron-left" size={16} />
        </button>
        <button
          type="button"
          aria-label="다음 이미지"
          onClick={next}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 text-primary flex items-center justify-center cursor-pointer"
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>

      <div role="tablist" aria-label="슬라이드 선택" className="flex justify-center gap-1.5 mt-3.5">
        {slides.map((slide, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`${i + 1}번째 이미지: ${slide.alt}`}
            onClick={() => setIndex(i)}
            className={cn(
              "w-2 h-2 rounded-full cursor-pointer transition-all",
              i === index ? "bg-primary w-5" : "bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Carousel
//   slides={[
//     { src: '/case-849/1.jpg', alt: '현장 사진 1' },
//     { src: '/case-849/2.jpg', alt: '현장 사진 2' },
//     { src: '/case-849/3.jpg', alt: '현장 사진 3' },
//   ]}
// />
//
// 체크리스트
// - role="tablist"/role="tab" 패턴으로 점 인디케이터를 구현 — "여러 슬라이드 중 하나를
//   선택하는 컨트롤"이라는 의미가 Tabs 컴포넌트와 동일해서 같은 패턴을 재사용했습니다
// - aria-live="polite"로 슬라이드가 바뀔 때마다 새 alt 텍스트를 스크린리더에 안내
// - 자동 재생(autoplay) 캐러셀은 일부러 안 넣었습니다 — 스크린리더/저시력 사용자에게
//   불리하고 WCAG 2.2.2(일시정지 가능)를 지키려면 정지 버튼이 필수라 사용자 조작 전용으로 유지
