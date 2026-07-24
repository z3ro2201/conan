import cn from "@/lib/utils/cn";
import { Icon, IconName } from "./icon";

type AlertVariant = "success" | "warning" | "danger" | "info";

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  success: "bg-success-bg text-success border-success/30",
  warning: "bg-warning-bg text-warning border-warning/30",
  danger: "bg-danger-bg text-danger border-danger/30",
  info: "bg-info-bg text-info border-info/30",
};

const variantIcon: Record<AlertVariant, IconName> = {
  success: "check",
  warning: "bell",
  danger: "close",
  info: "bell",
};

// 이 화면에 계속 붙어있는 정적 안내는 Alert, 몇 초 뒤 사라지는 일회성 알림은 Toast.
// role="status"(success/info)와 role="alert"(warning/danger)를 구분해서 씁니다 —
// 경고/에러는 사용자가 지금 하려던 동작을 막을 수도 있는 정보라 좀 더 적극적으로 안내되어야 함.

export function Alert({ variant = "info", children, className }: AlertProps) {
  const isUrgent = variant === "warning" || variant === "danger";

  return (
    <div
      role={isUrgent ? "alert" : "status"}
      className={cn(
        "flex items-center gap-2 border text-[13px] font-bold px-4 py-3 rounded-[10px]",
        variantStyles[variant],
        className,
      )}
    >
      <Icon name={variantIcon[variant]} size={15} className="shrink-0" />
      <span>{children}</span>
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Alert variant="success">문서가 저장되었습니다.</Alert>
// <Alert variant="warning">이 문서는 스포일러를 포함하고 있어요.</Alert>
// <Alert variant="danger">저장에 실패했어요. 다시 시도해주세요.</Alert>
// <Alert variant="info">로그인 없이도 편집 내용이 즉시 반영됩니다.</Alert>
//
// 체크리스트
// - success/info는 role="status" (덜 급함, 조용히 안내), warning/danger는
//   role="alert" (더 적극적으로 스크린리더에 끼어들어 안내)
// - 계속 화면에 남아있는 안내엔 Alert, 몇 초 뒤 사라지는 건 Toast를 쓰세요
