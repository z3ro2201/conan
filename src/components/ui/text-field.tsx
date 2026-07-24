import cn from "@/lib/utils/cn";
import { InputHTMLAttributes, forwardRef, useId } from "react";

// text, date, time, datetime-local(로컬타임), search 전부 시각적으로 거의 동일한 네이티브 input이라
// 하나의 컴포넌트로 통일했습니다. 원본 Form Controls의 INPUT, Input Types의 TEXT/DATE(네이티브)/
// TIME, Input States(Default/Focus/Readonly/Disabled/Error/Success)가 전부 이 컴포넌트로 커버됩니다.

type FieldType =
  | "text"
  | "email"
  | "password"
  | "tel"
  | "url"
  | "number"
  | "date"
  | "time"
  | "datetime-local"
  | "search";
type FieldSize = "sm" | "md" | "lg" | "xl";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "size"> {
  label?: string;
  error?: string;
  /** 성공 상태 메시지 (예: "사용 가능한 닉네임") */
  success?: string;
  hint?: string;
  type?: FieldType;
  size?: FieldSize;
  /** 데이터를 불러오는 중이라 입력을 잠시 막아야 할 때. disabled 대신 readOnly를 써서
   *  폼 제출 시 값 자체는 유지됨 (disabled 필드는 제출값에서 아예 빠짐) */
  loading?: boolean;
  /** 왼쪽에 넣을 아이콘 (검색 아이콘 등) */
  icon?: React.ReactNode;
  /** type="number"일 때 브라우저 기본 스피너(위아래 화살표)를 숨김 */
  hideSpinner?: boolean;
}

const sizeStyles: Record<FieldSize, string> = {
  sm: "text-xs px-3 py-2",
  md: "text-sm px-[14px] py-[11px]",
  lg: "text-base px-4 py-3",
  xl: "text-lg px-5 py-3.5",
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      success,
      hint,
      type = "text",
      size = "md",
      loading,
      icon,
      hideSpinner,
      className,
      required,
      name,
      readOnly,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = name ?? generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const successId = `${id}-success`;
    const describedBy =
      [hint && !error && !success && hintId, error && errorId, success && !error && successId]
        .filter(Boolean)
        .join(" ") || undefined;

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
          {icon && (
            <span aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            name={name}
            type={type}
            required={required}
            disabled={disabled}
            readOnly={readOnly || loading}
            aria-invalid={!!error || undefined}
            aria-busy={loading || undefined}
            aria-describedby={describedBy}
            className={cn(
              "w-full border-2 rounded-[10px] outline-none transition-colors",
              "bg-surface text-foreground placeholder:text-muted-light",
              sizeStyles[size],
              icon && "pl-10",
              loading && "pr-10",
              // 크롬/사파리(웹킷)와 파이어폭스는 스피너를 없애는 방식이 서로 달라서 둘 다 처리
              hideSpinner &&
                "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              // 상태 우선순위: error > success > 기본. 포커스 링은 입력창이라 마우스 클릭에도 보여야 해서
              // (버튼과 달리) focus-visible이 아니라 focus를 씀
              error
                ? "border-danger bg-danger-bg text-danger"
                : success
                  ? "border-success bg-success-bg text-success"
                  : "border-border focus:border-primary focus:ring-4 focus:ring-primary/15",
              // readOnly: 값은 보이되 편집 불가 — 배경만 살짝 죽여서 "지금은 못 건드림"을 표시
              "read-only:bg-background read-only:text-muted read-only:cursor-default",
              // disabled: readOnly보다 한 단계 더 흐리게 (아예 관련 없는 필드라는 느낌)
              "disabled:cursor-not-allowed disabled:bg-background disabled:text-muted-light disabled:border-border/60",
              className,
            )}
            {...props}
          />
          {loading && (
            <span
              aria-hidden="true"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-muted-light border-t-transparent rounded-full animate-spin"
            />
          )}
        </div>
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
    );
  },
);
TextField.displayName = "TextField";

// ===== 사용 예시 =====
//
// <TextField label="문서 제목" placeholder="문서 제목을 입력하세요" />
// <TextField label="이메일" type="email" required />
// <TextField label="생년월일" type="date" />
// <TextField label="닉네임" size="sm" />
// <TextField label="나이" type="number" min={0} max={120} />
// <TextField label="나이" type="number" hideSpinner />{/* 스피너(위아래 화살표) 없는 버전 */}
// <TextField label="닉네임" error="이미 사용 중인 닉네임이에요" />
// <TextField label="닉네임" success="사용 가능한 닉네임" />
// <TextField label="닉네임" value="명탐정 OOO" readOnly />
// <TextField label="닉네임" value="편집 권한 없음" disabled />
// <TextField label="저장 중" value="자동 저장..." loading />
// <TextField type="search" placeholder="검색" icon={<Icon name="search" size={16} />} />
//
// 체크리스트
// - label과 input을 htmlFor/id로 명시적으로 연결
// - error/success 메시지는 aria-describedby로 input과 연결, error는 role="alert"로 즉시 안내
// - loading은 disabled가 아니라 readOnly를 씀 — disabled 필드는 폼 제출 시 값 자체가 빠지는데,
//   "지금 서버에 저장 중"인 값은 화면에 계속 보여야 하는 경우가 많아서
// - hideSpinner는 시각적으로 화살표만 숨길 뿐, 키보드 ↑↓로 값 증감하는 기능은 그대로 남아있음
