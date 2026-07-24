import cn from "@/lib/utils/cn";
import { AnchorHTMLAttributes, ButtonHTMLAttributes, KeyboardEvent, forwardRef, useRef } from "react";
import { Icon } from "./icon";

// ===== Button =====

type ButtonVariant = "primary" | "danger" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 비동기 작업 중일 때. 클릭 방지 + 스크린리더에 "busy" 상태 전달 */
  loading?: boolean;
  /** 텍스트 왼쪽에 아이콘을 같이 보여줄 때. 아이콘 전용 버튼은 IconButton을 쓰세요 */
  icon?: React.ReactNode;
}

// 팔레트에 hover/active 전용 톤이 따로 없는 variant(secondary/outline/ghost)는
// brightness 필터로 살짝 어둡게 처리. primary/danger는 -dark 토큰이 있어서 그대로 사용.
const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark active:brightness-90 active:scale-[0.97]",
  danger: "bg-danger text-white hover:bg-danger-dark",
  secondary: "bg-info-bg text-info hover:brightness-95",
  outline: "bg-transparent text-primary border-2 border-primary hover:bg-info-bg",
  ghost: "bg-transparent text-muted hover:bg-border/60",
};

// md가 기존 버튼(13px, padding 18/10)의 기본값. 나머지는 그 비율로 확장/축소.
// 터치 타겟 44px 권장(WCAG 2.5.5 AAA 기준) 고려해서 sm도 세로 높이가 너무 작아지지 않게 유지.
const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-[7px] rounded-lg",
  md: "text-[13px] px-[18px] py-[10px] rounded-[10px]",
  lg: "text-sm px-6 py-3 rounded-xl",
  xl: "text-base px-8 py-4 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, disabled, loading, icon, children, ...props }, ref) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={cn(
          "font-bold cursor-pointer inline-flex items-center justify-center gap-2",
          "transition-colors outline-none",
          // 마우스 클릭 시엔 링이 안 뜨고, 키보드(Tab) 포커스에만 표시
          "focus-visible:ring-4 focus-visible:ring-primary/30",
          // 고대비 모드(Windows Forced Colors)에서 box-shadow 기반 링이 무시되므로 outline도 함께 지정
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          // 팔레트에 disabled 전용 토큰이 없어 border/muted-light로 근사치 처리
          "disabled:cursor-not-allowed disabled:bg-border disabled:text-muted-light disabled:border-transparent",
          sizeStyles[size],
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {loading && (
          <span
            aria-hidden="true"
            className={cn(
              "inline-block border-2 border-current border-t-transparent rounded-full animate-spin",
              size === "sm" ? "w-3 h-3" : size === "xl" ? "w-4 h-4" : "w-3.5 h-3.5",
            )}
          />
        )}
        {/* 로딩 중엔 아이콘 대신 스피너만 — 아이콘+스피너가 같이 있으면 뭘 봐야 할지 헷갈림 */}
        {icon && !loading && (
          <span aria-hidden="true" className="shrink-0">
            {icon}
          </span>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

// ===== Icon-only Button =====
// 텍스트 라벨 없이 아이콘만 있는 버튼은 aria-label이 없으면 스크린리더 사용자가
// "버튼"이라고만 듣고 어떤 기능인지 알 수 없음 → aria-label 필수 prop으로 강제

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  icon: React.ReactNode;
  "aria-label": string;
  variant?: Extract<ButtonVariant, "primary" | "ghost">;
  size?: ButtonSize;
}

// sm은 시각적으로 작아 보여도 실제 클릭 영역은 최소 32px 유지 (그 이하는 터치 오조작 유발)
const iconButtonSizeStyles: Record<ButtonSize, string> = {
  sm: "w-8 h-8",
  md: "w-9 h-9",
  lg: "w-11 h-11",
  xl: "w-14 h-14",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, variant = "ghost", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        title={props["aria-label"]}
        className={cn(
          "flex items-center justify-center rounded-full cursor-pointer",
          "transition-colors outline-none",
          "focus-visible:ring-4 focus-visible:ring-primary/30",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "disabled:cursor-not-allowed disabled:text-muted-light",
          iconButtonSizeStyles[size],
          variant === "ghost" && "bg-border/60 text-muted hover:bg-border",
          variant === "primary" && "bg-primary text-white hover:bg-primary-dark",
          className,
        )}
        {...props}
      >
        <span aria-hidden="true">{icon}</span>
      </button>
    );
  },
);
IconButton.displayName = "IconButton";

// ===== Link Button =====
// 페이지 이동(URL 변경)이 목적이면 <button onClick={router.push}> 대신 이걸 사용.
// 시각적으로는 Button과 동일하지만 실제 엘리먼트는 <a>라서
// 새 탭 열기(Ctrl+클릭/우클릭), 링크 미리보기, 스크린리더의 "링크" 안내가 정상 동작함.
// Next.js 프로젝트라면 실무에선 이 <a> 자리를 next/link의 <Link>로 감싸는 걸 추천 (prefetch 이점).

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href: string;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ variant = "primary", size = "md", className, children, onClick, ...props }, ref) => {
    const isDisabled = props["aria-disabled"] === true || props["aria-disabled"] === "true";

    return (
      <a
        ref={ref}
        // pointer-events-none은 마우스 클릭만 막고 키보드 Enter는 못 막기 때문에 직접 차단
        onClick={isDisabled ? (e) => e.preventDefault() : onClick}
        // 비활성 링크는 Tab 이동 대상에서 제외 (남겨두면 스크린리더가 "선택 불가"만 반복 안내함)
        tabIndex={isDisabled ? -1 : props.tabIndex}
        className={cn(
          "inline-block font-bold cursor-pointer no-underline",
          "transition-colors outline-none",
          "focus-visible:ring-4 focus-visible:ring-primary/30",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "aria-disabled:cursor-not-allowed aria-disabled:bg-border aria-disabled:text-muted-light aria-disabled:pointer-events-none",
          sizeStyles[size],
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {children}
      </a>
    );
  },
);
LinkButton.displayName = "LinkButton";

// ===== Button Group (세그먼트 컨트롤) =====
// 시각적으로는 버튼 묶음이지만 기능적으로는 "여러 옵션 중 하나 선택"이므로
// radiogroup 패턴(역할 + 방향키 이동 + roving tabindex)을 적용.
// 스크린리더는 이걸 버튼 3개가 아니라 "일간, 주간, 월간 중 주간 선택됨"으로 읽어줌.

interface ButtonGroupOption<T extends string> {
  id: T;
  label: string;
}

interface ButtonGroupProps<T extends string> {
  options: ButtonGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 스크린리더에 이 그룹이 무엇을 고르는 컨트롤인지 알려줌 (예: "기간 선택") */
  "aria-label": string;
  className?: string;
}

export function ButtonGroup<T extends string>({ options, value, onChange, className, ...props }: ButtonGroupProps<T>) {
  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = options.findIndex((o) => o.id === value);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % options.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      onChange(options[nextIndex].id);
      const buttons = groupRef.current?.querySelectorAll("button");
      (buttons?.[nextIndex] as HTMLButtonElement | undefined)?.focus();
    }
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={props["aria-label"]}
      onKeyDown={handleKeyDown}
      className={cn("inline-flex gap-1.5 bg-border/60 p-1 rounded-[10px] w-fit", className)}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            role="radio"
            aria-checked={active}
            // roving tabindex: 그룹 안에서 Tab은 한 번만 멈추고, 이동은 방향키로
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.id)}
            className={cn(
              "font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors",
              "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              active ? "bg-primary text-white" : "bg-transparent text-muted",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Button variant="primary">등록하기</Button>
// <Button variant="danger" size="sm">삭제</Button>
// <Button variant="secondary" size="lg">취소</Button>
// <Button variant="outline" size="xl">더 보기</Button>
// <Button variant="ghost">닫기</Button>
// <Button variant="primary" disabled>비활성</Button>
// <Button variant="primary" loading>저장 중...</Button>
// <Button variant="secondary" icon={<Icon name="plus" size={14} />}>새 문서 작성</Button>
//
// <IconButton icon={<Icon name="close" />} aria-label="닫기" size="sm" />
// <IconButton icon={<Icon name="edit" />} aria-label="수정" variant="ghost" />
// <IconButton icon={<Icon name="trash" />} aria-label="삭제" className="text-danger hover:bg-danger-bg" />
//
// <LinkButton href="/character/conan" variant="secondary" size="lg">인물 문서로 이동</LinkButton>
// <LinkButton href="/archive" variant="outline" aria-disabled>준비 중</LinkButton>
//
// <ButtonGroup
//   aria-label="기간 선택"
//   options={[{ id: 'a', label: '일간' }, { id: 'b', label: '주간' }, { id: 'c', label: '월간' }]}
//   value={period}
//   onChange={setPeriod}
// />
//
// 체크리스트
// - 기본 크기는 md. 폼/카드 안 보조 액션엔 sm, 랜딩페이지 CTA 등 눈에 띄어야 할 땐 lg/xl
// - IconButton sm도 실제 클릭 영역은 32px 이상 유지 (그 이하는 모바일에서 오조작 잦음)
// - 페이지 이동(URL 변경) → Button 말고 LinkButton
// - 그 자리에서 동작 실행(저장/삭제/모달 열기) → Button
// - 아이콘만 있는 버튼 → Button 말고 IconButton, aria-label 필수
// - 옵션 중 하나 선택하는 버튼 묶음 → ButtonGroup (radiogroup), aria-label 필수
// - 비동기 처리 중 → loading prop으로 aria-busy 전달 + 중복 클릭 방지
