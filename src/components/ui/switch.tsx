import cn from "@/lib/utils/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

// 원본 UI킷은 <div role="switch" tabIndex="0" onClick=...>로 구현돼 있어서
// Space/Enter 키 활성화를 직접 만들어줘야 했음.
// <button role="switch">로 바꾸면 네이티브 버튼이 Space/Enter를 이미 처리해주기 때문에
// 별도 onKeyDown 없이도 키보드로 켜고 끌 수 있음.

type SwitchSize = "sm" | "md" | "lg";

// md가 원본 트랙 크기(52x30, thumb 24)와 동일. sm/lg는 그 비율로 확장/축소.
const trackSizeStyles: Record<SwitchSize, string> = {
  sm: "w-9 h-5 p-0.5",
  md: "w-[52px] h-[30px] p-[3px]",
  lg: "w-16 h-9 p-1",
};

const thumbSizeStyles: Record<SwitchSize, string> = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-7 h-7",
};

// on일 때 이동 거리는 트랙 너비 - thumb 너비 - padding*2 만큼
const thumbTranslate: Record<SwitchSize, string> = {
  sm: "translate-x-4",
  md: "translate-x-[22px]",
  lg: "translate-x-7",
};

interface SwitchBaseProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "children"> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: SwitchSize;
}

// label을 넣으면 <label>로 감싸서 접근 가능한 이름을 자동으로 얻고(버튼은 labelable element),
// label 없이 쓰려면(예: 아이콘만 있는 UI) aria-label을 직접 지정해야 함 — 둘 중 하나는 필수.
type SwitchProps =
  | (SwitchBaseProps & { label: React.ReactNode; "aria-label"?: never })
  | (SwitchBaseProps & { label?: undefined; "aria-label": string });

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onChange, size = "md", disabled, label, className, ...props }, ref) => {
    const track = (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "inline-flex items-center rounded-full cursor-pointer transition-colors shrink-0",
          "outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          trackSizeStyles[size],
          // 팔레트에 스위치 off 전용 회색 토큰이 없어 border 토큰으로 근사치 처리
          checked ? "bg-primary" : "bg-border",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "rounded-full bg-white shadow transition-transform",
            thumbSizeStyles[size],
            checked && thumbTranslate[size],
          )}
        />
      </button>
    );

    if (!label) return track;

    return (
      <label
        className={cn("inline-flex items-center gap-2 cursor-pointer", disabled && "cursor-not-allowed opacity-50")}
      >
        {track}
        <span className="text-sm text-foreground">{label}</span>
      </label>
    );
  },
);
Switch.displayName = "Switch";

// ===== 사용 예시 =====
//
// // 라벨 있는 경우 (권장) — <label>이 접근 가능한 이름을 자동으로 제공
// <Switch checked={notifOn} onChange={setNotifOn} label="알림 받기" />
//
// // 라벨 없이 아이콘 등과 함께 쓸 때 — aria-label 필수
// <Switch checked={darkMode} onChange={setDarkMode} aria-label="다크모드 전환" />
//
// <Switch checked={v} onChange={setV} size="sm" label="컴팩트" />
// <Switch checked={v} onChange={setV} disabled label="비활성" />
//
// 체크리스트
// - <div role="switch" tabIndex="0"> 대신 <button role="switch">를 쓰면 Space/Enter 키
//   활성화를 직접 구현할 필요가 없음 (네이티브 버튼이 이미 처리)
// - label prop을 쓰면 <label>로 감싸져서 스위치 자체뿐 아니라 옆의 텍스트를 눌러도 토글됨
//   (클릭 가능 영역이 넓어져서 모바일에서 오조작이 줄어듦)
// - label도 aria-label도 없이 쓰면 TypeScript가 막음 — 스크린리더 사용자가
//   "스위치, 켜짐/꺼짐"까지만 듣고 뭘 켜는 스위치인지 알 방법이 없기 때문
