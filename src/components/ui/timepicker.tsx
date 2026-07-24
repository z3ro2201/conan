"use client";

import cn from "@/lib/utils/cn";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./icon";

export interface TimeValue {
  hour: number;
  minute: number;
}

export function formatTimeLabel(t: TimeValue) {
  return `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`;
}

interface TimePickerProps {
  label?: string;
  value?: TimeValue | null;
  onChange: (time: TimeValue) => void;
  /** 분 목록 간격 (기본 10분 단위: 00, 10, 20...) */
  minuteStep?: number;
  "aria-label"?: string;
  className?: string;
}

// 원본의 "Time Picker (커스텀)" 팝오버(시/분 두 개의 스크롤 리스트)를 컴포넌트화.
// 원본은 role 없이 그냥 div였는데, listbox/option 패턴으로 바꿔서
// 스크린리더가 "24개 중 하나 고르는 목록"으로 인식하게 했습니다.

export function TimePicker({ label, value, onChange, minuteStep = 10, className, ...props }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!popoverRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep);

  const pick = (hour: number, minute: number) => onChange({ hour, minute });

  return (
    <div className={cn("relative flex flex-col gap-1.5 max-w-[200px]", className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-muted-light">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between border-2 rounded-[10px] px-[14px] py-[11px] text-sm bg-surface text-foreground cursor-pointer",
          "outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
          open ? "border-primary" : "border-border",
        )}
      >
        <span className={!value ? "text-muted-light" : undefined}>{value ? formatTimeLabel(value) : "시간 선택"}</span>
        <Icon name="stopwatch" size={16} className="text-muted-light" />
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={props["aria-label"] ?? "시간 선택"}
          className="absolute top-full mt-1.5 left-0 w-[200px] flex gap-1.5 bg-surface border border-border rounded-2xl shadow-[0_12px_28px_rgba(20,30,60,0.14)] p-2.5 z-20"
        >
          <div role="listbox" aria-label="시" className="flex-1 max-h-40 overflow-y-auto flex flex-col gap-0.5">
            {hours.map((h) => (
              <button
                key={h}
                type="button"
                role="option"
                aria-selected={value?.hour === h}
                onClick={() => pick(h, value?.minute ?? 0)}
                className={cn(
                  "text-xs text-center py-1.5 rounded-md cursor-pointer",
                  value?.hour === h ? "bg-primary text-white font-bold" : "text-muted hover:bg-background",
                )}
              >
                {String(h).padStart(2, "0")}
              </button>
            ))}
          </div>
          <div role="listbox" aria-label="분" className="flex-1 max-h-40 overflow-y-auto flex flex-col gap-0.5">
            {minutes.map((m) => (
              <button
                key={m}
                type="button"
                role="option"
                aria-selected={value?.minute === m}
                onClick={() => pick(value?.hour ?? 0, m)}
                className={cn(
                  "text-xs text-center py-1.5 rounded-md cursor-pointer",
                  value?.minute === m ? "bg-primary text-white font-bold" : "text-muted hover:bg-background",
                )}
              >
                {String(m).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 사용 예시 =====
//
// const [time, setTime] = useState<TimeValue | null>(null);
// <TimePicker label="방송 시작 시간" value={time} onChange={setTime} />
// <TimePicker label="예약 시간" value={time} onChange={setTime} minuteStep={30} />
