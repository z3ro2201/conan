import cn from "@/lib/utils/cn";

// ===== Spinner =====

type SpinnerSize = "sm" | "md" | "lg";
type SpinnerColor = "primary" | "danger" | "white";

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  /** 스크린리더에 "로딩 중"임을 알림. 이미 주변에 "저장 중..." 같은 텍스트가 있으면 비워도 됨 */
  label?: string;
  className?: string;
}

const spinnerSizeStyles: Record<SpinnerSize, string> = {
  sm: "w-[18px] h-[18px] border-2",
  md: "w-8 h-8 border-[3px]",
  lg: "w-11 h-11 border-4",
};

const spinnerColorStyles: Record<SpinnerColor, string> = {
  primary: "border-info-bg border-t-primary",
  danger: "border-danger-bg border-t-danger",
  white: "border-white/30 border-t-white",
};

export function Spinner({ size = "md", color = "primary", label = "로딩 중", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block rounded-full animate-spin",
        spinnerSizeStyles[size],
        spinnerColorStyles[color],
        className,
      )}
    />
  );
}

// ===== LoadingBar =====
// 페이지 최상단에 붙는 "진행률을 모르는" 인디케이터형 로딩바 (Progress와 짝을 이루는 컴포넌트 —
// 값을 아는 진행이면 Progress, 얼마나 걸릴지 모르는 진행이면 LoadingBar).

interface LoadingBarProps {
  label?: string;
  className?: string;
}

export function LoadingBar({ label = "페이지 불러오는 중", className }: LoadingBarProps) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      // 값이 없는 progressbar는 aria-valuenow를 생략 → 스크린리더가 "진행률 알 수 없음"으로 안내
      className={cn("relative h-1 bg-border rounded-full overflow-hidden", className)}
    >
      <div className="absolute inset-y-0 w-2/5 rounded-full bg-gradient-to-r from-primary to-[#5B8FE0] animate-[loadbar_1.1s_ease-in-out_infinite]" />
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Spinner />
// <Spinner size="sm" color="danger" />
// <Button variant="primary" icon={<Spinner size="sm" color="white" label="" />} disabled>저장 중...</Button>
// {/* ↑ 사실 Button엔 이미 loading prop이 있어서 대개는 <Button loading>을 바로 쓰는 게 더 간단합니다 */}
//
// <LoadingBar /> {/* 페이지/라우트 전환 시 최상단에 */}
//
// 값을 아는 진행률(퍼센트)이면 Spinner/LoadingBar 말고 Progress를 쓰세요.
