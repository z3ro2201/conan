"use client";

import cn from "@/lib/utils/cn";
import { InputHTMLAttributes, forwardRef, useId, KeyboardEvent, MouseEvent } from "react";

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: React.ReactNode;
  readOnly?: boolean;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className, disabled, readOnly, onClick, onKeyDown, id: idProp, ...props }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    const guardReadOnly = (e: MouseEvent<HTMLInputElement> | KeyboardEvent<HTMLInputElement>) => {
      if (readOnly) e.preventDefault();
    };

    return (
      <label
        htmlFor={id}
        className={cn(
          "inline-flex items-center gap-2 text-[13px] text-foreground select-none",
          disabled ? "cursor-not-allowed text-muted-light" : readOnly ? "cursor-default" : "cursor-pointer",
        )}
      >
        <span className="relative inline-flex w-[18px] h-[18px] shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={id}
            type="radio"
            disabled={disabled}
            aria-readonly={readOnly || undefined}
            onClick={(e) => {
              guardReadOnly(e);
              onClick?.(e);
            }}
            onKeyDown={(e) => {
              if (e.key === " ") guardReadOnly(e);
              onKeyDown?.(e);
            }}
            className={cn(
              "peer appearance-none w-[18px] h-[18px] rounded-full border-2 m-0 transition-colors",
              "outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
              disabled
                ? "cursor-not-allowed border-border bg-background"
                : "cursor-pointer border-muted-light/60 checked:border-primary",
              readOnly && "cursor-default",
              className,
            )}
            {...props}
          />
          {/* 체크 아이콘 대신 가운데 점 — peer-checked일 때만 보임, 원본의 "링 안에 점" 모양 재현 */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute w-[9px] h-[9px] rounded-full opacity-0 peer-checked:opacity-100 pointer-events-none",
              disabled ? "bg-muted-light" : "bg-primary",
            )}
          />
        </span>
        {label}
      </label>
    );
  },
);
Radio.displayName = "Radio";

// ===== RadioGroup =====
// 원본의 "RADIO GROUP"(최신순/인기순/댓글순)을 네이티브 radio로 재구현.
// 같은 name을 공유하는 radio들은 브라우저가 자동으로 "그룹"으로 인식해서
// Tab은 그룹당 한 번만 멈추고, 방향키(↑↓ 또는 ←→)로 그룹 안 이동이 됩니다 —
// 지난번 ButtonGroup/Tabs에서 직접 구현했던 roving tabindex를 여기선 공짜로 얻는 셈.

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

interface RadioGroupProps {
  legend: string;
  /** 같은 그룹의 radio들을 하나로 묶는 값. 페이지에 여러 RadioGroup이 있다면 각기 다른 name 필요 */
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  displayType: "row" | "col";
  className?: string;
}

export function RadioGroup({
  legend,
  name,
  options,
  displayType = "col",
  value,
  onChange,
  className,
}: RadioGroupProps) {
  return (
    <fieldset className={cn("flex flex-col gap-2.5 border-none m-0 p-0", className)}>
      <legend className="text-xs font-bold text-muted-light mb-1 p-0">{legend}</legend>
      <div
        className={cn(
          "h-full flex",
          displayType === "row" ? "items-center flex-row" : "justify-center flex-col",
          "gap-2",
        )}
      >
        {options.map((opt) => (
          <Radio
            key={opt.value}
            name={name}
            value={opt.value}
            label={opt.label}
            checked={value === opt.value}
            disabled={opt.disabled}
            onChange={() => onChange(opt.value)}
          />
        ))}
      </div>
    </fieldset>
  );
}

// ===== 사용 예시 =====
//
// // 단일 라디오 (거의 안 쓰지만 필요할 수도)
// <Radio name="agree" label="동의합니다" checked={agreed} onChange={() => setAgreed(true)} />
//
// // 그룹 (원본 예시와 동일한 정렬 옵션)
// const [sort, setSort] = useState('a');
// <RadioGroup
//   legend="정렬 방식"
//   name="sort-order"
//   value={sort}
//   onChange={setSort}
//   options={[
//     { value: 'a', label: '최신순' },
//     { value: 'b', label: '인기순' },
//     { value: 'c', label: '댓글순' },
//   ]}
// />
//
// 체크리스트
// - RadioGroup은 반드시 고유한 name을 줘야 함 — 페이지에 같은 name의 다른 그룹이 있으면
//   서로 섞여서 하나만 선택되는 버그가 생김
// - fieldset/legend로 감싸는 이유는 CheckboxGroup과 동일 (그룹 맥락을 스크린리더에 전달)
// - 체크박스와 달리 라디오 그룹은 방향키 이동이 브라우저 기본 기능이라 별도 JS 불필요
