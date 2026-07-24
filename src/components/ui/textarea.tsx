import cn from "@/lib/utils/cn";
import { TextareaHTMLAttributes, forwardRef, useId } from "react";

type FieldSize = "sm" | "md" | "lg" | "xl";

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "size"> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  size?: FieldSize;
  /** 최대 글자 수. 지정하면 우측 하단에 실시간 글자 수 카운터가 표시됨 */
  maxLength?: number;
}

const sizeStyles: Record<FieldSize, string> = {
  sm: "text-xs px-3 py-2",
  md: "text-sm px-[14px] py-[11px]",
  lg: "text-base px-4 py-3",
  xl: "text-lg px-5 py-3.5",
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      success,
      hint,
      size = "md",
      maxLength,
      className,
      required,
      name,
      readOnly,
      disabled,
      value,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = name ?? generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const successId = `${id}-success`;
    const countId = `${id}-count`;
    const describedBy =
      [hint && !error && !success && hintId, error && errorId, success && !error && successId, maxLength && countId]
        .filter(Boolean)
        .join(" ") || undefined;

    const currentLength = typeof value === "string" ? value.length : 0;
    const nearLimit = maxLength ? currentLength >= maxLength * 0.9 : false;

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
        <textarea
          ref={ref}
          id={id}
          name={name}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          maxLength={maxLength}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full min-h-[100px] border-2 rounded-[10px] outline-none transition-colors resize-y",
            "bg-surface text-foreground placeholder:text-muted-light leading-relaxed",
            sizeStyles[size],
            error
              ? "border-danger bg-danger-bg text-danger"
              : success
                ? "border-success bg-success-bg text-success"
                : "border-border focus:border-primary focus:ring-4 focus:ring-primary/15",
            "read-only:bg-background read-only:text-muted read-only:cursor-default",
            "disabled:cursor-not-allowed disabled:bg-background disabled:text-muted-light disabled:border-border/60",
            className,
          )}
          {...props}
        />
        <div className="flex justify-between items-start gap-2">
          <div>
            {hint && !error && !success && (
              <span id={hintId} className="text-xs text-muted-light">
                {hint}
              </span>
            )}
            {success && !error && (
              <span id={successId} className="text-xs text-success">
                {success}
              </span>
            )}
            {error && (
              <span id={errorId} role="alert" className="text-xs text-danger">
                {error}
              </span>
            )}
          </div>
          {maxLength && (
            <span
              id={countId}
              className={cn("text-xs shrink-0", nearLimit ? "text-danger font-bold" : "text-muted-light")}
            >
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

// ===== 사용 예시 =====
//
// <Textarea label="문서 요약" placeholder="한 줄 요약을 입력하세요" />
// <Textarea label="본문 초안" maxLength={500} value={draft} onChange={(e) => setDraft(e.target.value)} />
// <Textarea label="신고 사유" error="신고 사유를 입력해주세요" />
//
// 체크리스트
// - TextField와 동일한 size/error/success/hint 패턴 — 한 폼 안에서 같이 써도 톤이 어긋나지 않음
// - maxLength 지정 시 카운터가 aria-describedby로 연결돼서, 스크린리더 사용자도
//   포커스했을 때 "500자 중 0자"처럼 제한을 알 수 있음 (카운터가 시각 정보로만 있으면 놓침)
// - 90% 이상 채워지면 카운터가 danger 색으로 바뀌어서 한도 임박을 시각적으로도 알림
