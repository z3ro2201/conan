"use client";

import cn from "@/lib/utils/cn";
import { InputHTMLAttributes, forwardRef, useId } from "react";

interface ColorFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  hint?: string;
}

// 네이티브 <input type="color">를 감쌌습니다. 브라우저 기본 컬러피커(OS 레벨 다이얼로그)를
// 그대로 띄우기 때문에, 색상환/그라디언트를 직접 그리는 것보다 구현 부담이 훨씬 적고
// 접근성도 OS가 보장합니다. 완전히 커스텀된 팔레트 그리드나 HSL 슬라이더 형태가
// 필요하시면 별도로 말씀해주세요 (원본 UI킷엔 그런 커스텀 버전이 없었습니다).

export const ColorField = forwardRef<HTMLInputElement, ColorFieldProps>(
  ({ label, hint, className, disabled, value, id: idProp, ...props }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const hintId = `${id}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-bold text-muted-light">
            {label}
          </label>
        )}
        <div className="flex items-center gap-2.5">
          <input
            ref={ref}
            id={id}
            type="color"
            value={value}
            disabled={disabled}
            aria-describedby={hint ? hintId : undefined}
            className={cn(
              "w-11 h-11 rounded-[10px] border-2 border-border p-1 cursor-pointer outline-none",
              "focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            {...props}
          />
          {typeof value === "string" && <span className="text-sm font-mono text-muted uppercase">{value}</span>}
        </div>
        {hint && (
          <span id={hintId} className="text-xs text-muted-light">
            {hint}
          </span>
        )}
      </div>
    );
  },
);
ColorField.displayName = "ColorField";

// ===== 사용 예시 =====
//
// const [color, setColor] = useState('#1B4FA0');
// <ColorField label="테마 색상" value={color} onChange={(e) => setColor(e.target.value)} />
// <ColorField label="비활성" value="#9AA1B2" disabled />
