import cn from "@/lib/utils/cn";
import { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

// TextField/Select/Checkbox 등은 이미 자체적으로 label을 그리지만, 커스텀 레이아웃에서
// input과 label을 직접 배치해야 할 때를 위해 같은 스타일의 단독 버전을 빼놨습니다.
// htmlFor는 필수로 넘기세요 — 안 그러면 label과 input이 연결되지 않습니다.

export function Label({ required, className, children, ...props }: LabelProps) {
  return (
    <label className={cn("block text-xs font-bold text-muted-light mb-1.5", className)} {...props}>
      {children}
      {required && (
        <span aria-hidden="true" className="text-danger ml-0.5">
          *
        </span>
      )}
    </label>
  );
}

// ===== 사용 예시 =====
//
// <Label htmlFor="nickname" required>닉네임</Label>
// <input id="nickname" placeholder="예: 나비넥타이덕후" className="..." />
// <p className="text-xs text-muted-light mt-1">다른 이용자에게 표시되는 이름이에요.</p>
//
// TextField/Select/Checkbox 등을 쓰고 있다면 이미 label prop이 내장돼 있어서
// 이 컴포넌트를 따로 쓸 필요는 없습니다 — 완전히 커스텀 레이아웃일 때만 사용하세요.
