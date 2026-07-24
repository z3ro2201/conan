"use client";

import cn from "@/lib/utils/cn";
import { InputHTMLAttributes, forwardRef, useId, KeyboardEvent, MouseEvent } from "react";
import { Icon } from "./icon";

// 원본은 <div role="checkbox" aria-checked tabIndex="0" onClick>로 체크박스를 흉내 냈는데,
// 이렇게 만들면 Space 키 토글, 폼 제출 시 값 포함, iOS VoiceOver 등에서의 기본 동작을
// 전부 직접 구현해야 합니다. 진짜 <input type="checkbox">를 appearance-none으로 스타일만
// 새로 입히면 이 모든 걸 브라우저가 공짜로 처리해줘서, 여기서는 후자로 다시 만들었습니다.

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: React.ReactNode;
  /**
   * 네이티브 readOnly는 체크박스에서 브라우저마다 동작이 달라 신뢰할 수 없어서,
   * 클릭/스페이스를 직접 막고 aria-readonly로 상태만 전달하는 방식으로 구현했습니다.
   */
  readOnly?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
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
        <span className="relative inline-flex w-5 h-5 shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={id}
            type="checkbox"
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
              "peer appearance-none w-5 h-5 rounded-[6px] border-2 m-0 transition-colors",
              "outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
              disabled
                ? "cursor-not-allowed border-border bg-background"
                : "cursor-pointer border-muted-light/60 checked:border-primary checked:bg-primary",
              readOnly && "cursor-default",
              className,
            )}
            {...props}
          />
          <Icon
            name="check"
            size={13}
            className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
          />
        </span>
        {label}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";

// ===== CheckboxGroup =====
// 여러 체크박스를 묶어서 "무엇에 대한 체크박스 묶음인지" 시맨틱하게 전달.
// fieldset/legend를 쓰는 이유: 스크린리더가 그룹 안 체크박스 하나하나를 읽을 때마다
// legend 텍스트를 같이 안내해줘서, 항목만 툭 던져지지 않고 맥락이 유지됨.

export interface CheckboxOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

interface CheckboxGroupProps {
  legend: string;
  options: CheckboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export function CheckboxGroup({ legend, options, value, onChange, className }: CheckboxGroupProps) {
  const toggle = (optValue: string) => {
    onChange(value.includes(optValue) ? value.filter((v) => v !== optValue) : [...value, optValue]);
  };

  return (
    <fieldset className={cn("flex flex-col gap-2.5 border-none m-0 p-0", className)}>
      <legend className="text-xs font-bold text-muted-light mb-1 p-0">{legend}</legend>
      {options.map((opt) => (
        <Checkbox
          key={opt.value}
          label={opt.label}
          checked={value.includes(opt.value)}
          disabled={opt.disabled}
          onChange={() => toggle(opt.value)}
        />
      ))}
    </fieldset>
  );
}

// ===== 사용 예시 =====
//
// // 단일 체크박스
// const [notify, setNotify] = useState(false);
// <Checkbox label="편집 알림 받기" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
// <Checkbox label="비활성" disabled />
// <Checkbox label="읽기전용" checked readOnly />
//
// // 여러 개 묶음
// const [tags, setTags] = useState<string[]>([]);
// <CheckboxGroup
//   legend="알림 종류"
//   value={tags}
//   onChange={setTags}
//   options={[
//     { value: 'edit', label: '편집 알림' },
//     { value: 'comment', label: '댓글 알림' },
//     { value: 'mention', label: '멘션 알림' },
//   ]}
// />
