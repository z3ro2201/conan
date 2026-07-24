import cn from "@/lib/utils/cn";
import { SelectHTMLAttributes, forwardRef, useId } from "react";
import { Icon } from "./icon";

type FieldSize = "sm" | "md" | "lg" | "xl";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "size"> {
  label?: string;
  error?: string;
  hint?: string;
  size?: FieldSize;
  options: SelectOption[];
  placeholder?: string;
}

// TextField와 톤을 맞춘 네이티브 select. 옵션 개수가 많거나(수십 개), 모바일에서
// 네이티브 휠 선택 UI가 더 편한 경우엔 이쪽을, 디자인을 완전히 통제하고 싶으면
// CustomSelect를 쓰세요.

const sizeStyles: Record<FieldSize, string> = {
  sm: "text-xs pl-3 pr-8 py-2",
  md: "text-sm pl-[14px] pr-9 py-[11px]",
  lg: "text-base pl-4 pr-10 py-3",
  xl: "text-lg pl-5 pr-11 py-3.5",
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, size = "md", options, placeholder, className, required, name, disabled, ...props }, ref) => {
    const generatedId = useId();
    const id = name ?? generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy = [hint && !error && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-bold text-muted-light">
            {label}
            {required && (
              <span aria-hidden="true" className="text-danger ml-0.5">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            name={name}
            required={required}
            disabled={disabled}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
            defaultValue={props.defaultValue ?? (placeholder ? "" : undefined)}
            className={cn(
              "w-full appearance-none border-2 rounded-[10px] outline-none transition-colors cursor-pointer",
              "bg-surface text-foreground",
              sizeStyles[size],
              error ? "border-danger" : "border-border focus:border-primary focus:ring-4 focus:ring-primary/15",
              "disabled:cursor-not-allowed disabled:bg-background disabled:text-muted-light disabled:border-border/60",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* 네이티브 select의 기본 화살표를 지우고(appearance-none) 우리 아이콘으로 교체.
              pointer-events-none이라 클릭은 그대로 select 자체가 받음 */}
          <Icon
            name="chevron-down"
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-light pointer-events-none"
          />
        </div>
        {hint && !error && (
          <span id={hintId} className="text-xs text-muted-light">
            {hint}
          </span>
        )}
        {error && (
          <span id={errorId} role="alert" className="text-xs text-danger">
            {error}
          </span>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";

// ===== 사용 예시 =====
//
// <Select
//   label="문서 분류"
//   placeholder="분류를 선택하세요"
//   options={[
//     { value: 'character', label: '인물' },
//     { value: 'case', label: '사건/에피소드' },
//     { value: 'org', label: '범죄조직' },
//   ]}
// />
