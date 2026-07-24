"use client";

import cn from "@/lib/utils/cn";
import { useState } from "react";

interface RatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label?: string;
  className?: string;
}

// RadioGroup과 마찬가지로 "5개 중 하나를 고르는" 컨트롤이라 radiogroup 패턴을 씁니다.
// 다만 여긴 네이티브 radio 대신 버튼을 쓰는데, 마우스 호버 시 "여기까지 선택하면 몇 점"을
// 미리 보여주는 상호작용이 필요해서(네이티브 radio는 그런 미리보기가 어려움) 버튼 +
// 방향키 직접 구현 조합으로 만들었습니다 (ButtonGroup 때와 같은 패턴).

export function Rating({ value, onChange, max = 5, label = "평점", className }: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  const handleKeyDown = (e: React.KeyboardEvent, current: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(current + 1, max));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(current - 1, 1));
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div
        role="radiogroup"
        aria-label={label}
        onMouseLeave={() => setHoverValue(null)}
        className="flex items-center gap-0.5"
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
          const filled = star <= displayValue;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={star === value}
              aria-label={`${star}점`}
              tabIndex={star === value || (value === 0 && star === 1) ? 0 : -1}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverValue(star)}
              onKeyDown={(e) => handleKeyDown(e, value || 0)}
              className={cn(
                "text-2xl leading-none cursor-pointer outline-none rounded",
                "focus-visible:ring-2 focus-visible:ring-primary/50",
                filled ? "text-danger" : "text-border",
              )}
            >
              ★
            </button>
          );
        })}
      </div>
      <span className="text-[13px] text-muted-light ml-1.5">
        {value} / {max}
      </span>
    </div>
  );
}

// ===== 사용 예시 =====
//
// const [rating, setRating] = useState(3);
// <Rating value={rating} onChange={setRating} label="이 문서 평점" />
//
// 체크리스트
// - 마우스를 올리면 "여기까지 선택 시 몇 점"이 미리 보이고, 벗어나면 실제 선택값으로 복귀
// - role="radiogroup"/role="radio"라 스크린리더가 "5개 중 3번째 선택됨"으로 안내
// - 방향키(←→/↑↓)로 점수 조절 가능 (roving tabindex — 선택된 별만 Tab 순서에 포함)
