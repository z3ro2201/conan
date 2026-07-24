import cn from "@/lib/utils/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Icon } from "./icon";

type CloseButtonVariant = "filled" | "outline" | "overlay" | "ghost";
type CloseButtonSize = "sm" | "md";

interface CloseButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: CloseButtonVariant;
  size?: CloseButtonSize;
  "aria-label": string;
}

const variantStyles: Record<CloseButtonVariant, string> = {
  filled: "bg-border/60 text-muted hover:bg-danger hover:text-white",
  outline: "bg-transparent border border-border text-muted-light hover:border-primary hover:text-primary",
  overlay: "bg-black/40 text-white hover:bg-black/55",
  ghost: "bg-transparent text-muted-light hover:text-danger",
};

const sizeStyles: Record<CloseButtonSize, { box: string; icon: number }> = {
  sm: { box: "w-6 h-6", icon: 11 },
  md: { box: "w-8 h-8", icon: 13 },
};

// 라벨이 붙은 "✕ 닫기" 버튼은 별도 컴포넌트 없이 기존 Button을 그대로 쓰면 됩니다:
// <Button variant="ghost" icon={<Icon name="close" size={13} />}>닫기</Button>

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ variant = "filled", size = "md", className, ...props }, ref) => {
    const { box, icon } = sizeStyles[size];
    return (
      <button
        ref={ref}
        type="button"
        title={props["aria-label"]}
        className={cn(
          box,
          "rounded-full flex items-center justify-center cursor-pointer transition-colors",
          "outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        <Icon name="close" size={icon} />
      </button>
    );
  },
);
CloseButton.displayName = "CloseButton";

// ===== 사용 예시 =====
//
// <CloseButton aria-label="닫기" />
// <CloseButton aria-label="닫기" variant="outline" />
// <CloseButton aria-label="닫기" variant="overlay" /> {/* 이미지/영상 위에 얹을 때 */}
// <CloseButton aria-label="닫기" variant="ghost" size="sm" />
// <Button variant="ghost" icon={<Icon name="close" size={13} />}>닫기</Button>
