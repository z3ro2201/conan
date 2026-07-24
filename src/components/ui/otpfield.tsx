"use client";

import cn from "@/lib/utils/cn";
import { ClipboardEvent, KeyboardEvent, useRef } from "react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
  className?: string;
}

// 원본은 6개의 독립된 input(otp0~otp5)이 각자 onChange 핸들러를 가진 구조였는데,
// 실제로 이런 UI를 쓸 때 기대되는 동작(입력하면 자동으로 다음 칸, Backspace로 이전 칸 이동,
// 인증코드 통째로 붙여넣기)이 원본엔 없었어서 여기서 추가했습니다.

export function OtpInput({ length = 6, value, onChange, className, ...props }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(""));
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/[^0-9]/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setDigit(index - 1, "");
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!pasted) return;
    e.preventDefault();
    const next = digits.slice();
    for (let i = 0; i < pasted.length && index + i < length; i++) {
      next[index + i] = pasted[i];
    }
    onChange(next.join(""));
    const lastFilled = Math.min(index + pasted.length, length - 1);
    inputRefs.current[lastFilled]?.focus();
  };

  return (
    <div role="group" aria-label={props["aria-label"] ?? "인증 코드 입력"} className={cn("flex gap-2", className)}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`인증 코드 ${index + 1}번째 자리`}
          className={cn(
            "w-[42px] h-12 text-center text-lg font-bold border-2 rounded-[10px] outline-none transition-colors",
            "bg-surface text-foreground border-border focus:border-primary",
            "focus-visible:ring-4 focus-visible:ring-primary/30",
          )}
        />
      ))}
    </div>
  );
}

// ===== 사용 예시 =====
//
// const [otp, setOtp] = useState('');
// <OtpInput value={otp} onChange={setOtp} aria-label="이메일 인증 코드" />
//
// {otp.length === 6 && <p>입력 완료: {otp}</p>}
//
// 체크리스트
// - 숫자 입력 시 자동으로 다음 칸 포커스, 빈 칸에서 Backspace 시 이전 칸으로 이동
// - 문자 하나를 붙여넣어도, 6자리 전체를 붙여넣어도(SMS 코드 복사 등) 알아서 분배됨
// - 각 입력칸에 "인증 코드 N번째 자리" aria-label — 안 그러면 스크린리더가
//   "편집, 빈 텍스트"만 6번 반복해서 사용자가 뭘 입력 중인지 알기 어려움
// - autoComplete="one-time-code"를 첫 칸에 지정 — 모바일에서 SMS로 받은 코드를
//   키보드 상단에 자동완성 제안으로 띄워주는 브라우저 기능과 연동됨
// - inputMode="numeric"으로 모바일에서 숫자 키패드가 뜨게 함 (type="number"는
//   스피너가 생기고 앞자리 0이 씹히는 등 이런 용도엔 오히려 안 맞음)
