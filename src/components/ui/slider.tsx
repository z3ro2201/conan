"use client";

import cn from "@/lib/utils/cn";
import { InputHTMLAttributes, forwardRef, useId } from "react";

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  /** 라벨 옆에 현재 값을 같이 보여줄지 (예: "스포일러 민감도 72%") */
  showValue?: boolean;
  /** 값 뒤에 붙는 단위 (기본 %) */
  unit?: string;
  hint?: string;
}

// 네이티브 <input type="range">를 감싼 버전. 커스텀 트랙/썸을 그리는 슬라이더 라이브러리도
// 많지만, 네이티브가 키보드(방향키/Home/End/PageUp/PageDown) 조작과 스크린리더 값 안내를
// 이미 다 처리해주기 때문에 accent-color만 브랜드 색으로 맞추는 쪽이 실속 있습니다.

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    { label, showValue = true, unit = "%", hint, className, disabled, value, min = 0, max = 100, id: idProp, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const hintId = `${id}-hint`;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={id} className="text-xs font-bold text-muted-light flex items-baseline gap-1">
            <span>{label}</span>
            {showValue && value !== undefined && (
              <span className="text-foreground font-bold">
                {value}
                {unit}
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          aria-describedby={hint ? hintId : undefined}
          // accent-color가 트랙/썸 색을 한 번에 브랜드 색으로 바꿔줌 (모든 최신 브라우저 지원)
          style={{ accentColor: "var(--primary)" }}
          className={cn("w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-40", className)}
          {...props}
        />
        {hint && (
          <span id={hintId} className="text-xs text-muted-light">
            {hint}
          </span>
        )}
      </div>
    );
  },
);
Slider.displayName = "Slider";

// ===== 사용 예시 =====
//
// const [sensitivity, setSensitivity] = useState(50);
// <Slider
//   label="스포일러 민감도"
//   value={sensitivity}
//   onChange={(e) => setSensitivity(Number(e.target.value))}
// />
// <Slider label="비활성" value={30} disabled />
// <Slider label="음량" value={volume} onChange={(e) => setVolume(Number(e.target.value))} showValue={false} />
//
// 체크리스트
// - 네이티브 range는 방향키(←→↑↓), Home/End(최소/최대), PageUp/PageDown(큰 폭 이동)을
//   전부 기본 지원 — 커스텀 슬라이더를 직접 만들면 이걸 다 재구현해야 함
// - 값을 라벨에 텍스트로도 같이 보여주는 이유: 슬라이더 위치만으로는 정확한 값을
//   가늠하기 어렵고, 스크린리더는 어차피 값을 읽어주지만 화면을 보는 사용자에게도 필요
