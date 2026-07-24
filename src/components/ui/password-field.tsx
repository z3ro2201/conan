"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import cn from "@/lib/utils/cn";
import { Icon } from "./icon";
import { TextField } from "./text-field";

type FieldSize = "sm" | "md" | "lg" | "xl";

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "size"> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  size?: FieldSize;
}

// TextField를 그대로 감싸되 type만 password/text로 토글.
// TextField 자체는 <div className="relative">로 input을 내부에서 감싸고 왼쪽 icon slot만
// 지원하기 때문에, 오른쪽 표시/숨김 토글 버튼은 이 컴포넌트에서 별도 래퍼로 겹쳐 올립니다.
// 원본 Input Types의 PASSWORD엔 표시/숨김 토글이 없었는데, 사실상 표준 UX라 추가했습니다.
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ size = "md", className, label, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <TextField
          ref={ref}
          type={visible ? "text" : "password"}
          size={size}
          label={label}
          className={cn("pr-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
          aria-pressed={visible}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-muted-light cursor-pointer",
            "outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded",
            label && "mt-3",
          )}
        >
          <Icon name={visible ? "eye-off" : "eye"} size={17} />
        </button>
      </div>
    );
  },
);
PasswordField.displayName = "PasswordField";

// ===== 사용 예시 =====
//
// <PasswordField label="비밀번호" required />
// <PasswordField label="비밀번호 확인" error="비밀번호가 일치하지 않아요" />
// <PasswordField label="새 비밀번호" size="lg" hint="8자 이상, 특수문자 포함" />
//
// 체크리스트
// - 토글 버튼은 aria-pressed로 현재 "보임/숨김" 상태를 스크린리더에 전달
// - 토글해도 포커스와 커서 위치가 유지됨 (input의 type만 바뀌고 value/ref는 그대로라
//   브라우저 기본 동작에 맡기면 별도 처리 불필요)
// - autoComplete="new-password" / "current-password"는 상황에 맞게 직접 지정하세요
//   (회원가입 폼 vs 로그인 폼에서 브라우저 자동완성 동작이 달라짐)
