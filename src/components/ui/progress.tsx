import cn from "@/lib/utils/cn";

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  /** 우측에 "68%"처럼 값을 텍스트로도 보여줄지 */
  showValue?: boolean;
  color?: "primary" | "success" | "warning" | "danger";
  className?: string;
}

const colorStyles: Record<NonNullable<ProgressProps["color"]>, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function Progress({ value, max = 100, label, showValue = true, color = "primary", className }: ProgressProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between text-xs text-muted-light mb-1.5">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(percent)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-2 bg-border rounded-full overflow-hidden"
      >
        <div
          className={cn("h-full rounded-full transition-[width]", colorStyles[color])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Progress label="이미지 업로드 중" value={68} />
// <Progress label="문서 완성도" value={100} color="success" />
// <Progress value={30} showValue={false} /> {/* 라벨/퍼센트 없이 바만 */}
//
// 체크리스트
// - role="progressbar" + aria-valuenow/min/max로 스크린리더가 "68% 진행됨"을 읽어줌
// - 값이 바뀔 때마다 aria-valuenow도 같이 갱신되므로, value prop을 실시간 진행률과
//   그대로 연결해서 쓰면 별도 처리 없이 접근성이 유지됨
