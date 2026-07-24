"use client";

import cn from "@/lib/utils/cn";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./icon";

export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function getMonthMatrix(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDateLabel(date: Date) {
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}

interface DatePickerProps {
  label?: string;
  value?: Date | null;
  onChange: (date: Date) => void;
  "aria-label"?: string;
  className?: string;
}

// 원본의 "DATE + 커스텀 datepicker 연동" 팝오버를 컴포넌트화.
// - 바깥 클릭/Escape로 닫힘, 닫힐 때 포커스는 트리거 버튼으로 복귀 (포커스를 허공에 잃지 않게)
// - 오늘 날짜는 링으로, 선택된 날짜는 채워진 배경으로 구분

export function DatePicker({ label, value, onChange, className, ...props }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ?? new Date());
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

  const today = new Date();
  const matrix = getMonthMatrix(viewDate.getFullYear(), viewDate.getMonth());

  const selectDay = (d: Date) => {
    onChange(d);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className={cn("relative flex flex-col gap-1.5", className)}>
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
        <span className={!value ? "text-muted-light" : undefined}>{value ? formatDateLabel(value) : "날짜 선택"}</span>
        <Icon name="calendar" size={16} className="text-muted-light" />
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={props["aria-label"] ?? "날짜 선택"}
          className="absolute top-full mt-1.5 left-0 w-[260px] bg-surface border border-border rounded-2xl shadow-[0_12px_28px_rgba(20,30,60,0.14)] p-3.5 z-20"
        >
          <div className="flex items-center justify-between mb-2.5">
            <button
              type="button"
              aria-label="이전 달"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-md text-muted cursor-pointer hover:bg-background"
            >
              <Icon name="chevron-left" size={14} />
            </button>
            <span className="font-bold text-sm text-foreground">
              {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
            </span>
            <button
              type="button"
              aria-label="다음 달"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-md text-muted cursor-pointer hover:bg-background"
            >
              <Icon name="chevron-right" size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-[10px] text-muted-light text-center mb-1">
            {WEEKDAYS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {matrix.map((d) => {
              const inMonth = d.getMonth() === viewDate.getMonth();
              const selected = value ? isSameDay(d, value) : false;
              const isToday = isSameDay(d, today);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => selectDay(d)}
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={selected || undefined}
                  aria-label={`${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs cursor-pointer transition-colors",
                    !inMonth && "text-muted-light/50",
                    inMonth && !selected && "text-foreground hover:bg-background",
                    selected && "bg-primary text-white font-bold",
                    isToday && !selected && "ring-1 ring-primary text-primary font-bold",
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 사용 예시 =====
//
// const [date, setDate] = useState<Date | null>(null);
// <DatePicker label="발행일" value={date} onChange={setDate} />
//
// 체크리스트
// - 트리거는 aria-haspopup="dialog" + aria-expanded로 "이 버튼을 누르면 팝업이 뜬다"를 미리 안내
// - 팝오버는 role="dialog" — 페이지의 나머지 부분과 별개의 임시 UI임을 스크린리더에 전달
// - 닫을 때(Escape, 바깥 클릭, 날짜 선택) 포커스를 트리거 버튼으로 되돌림 —
//   안 그러면 포커스가 사라진 팝업 내부 요소에 남아 다음 Tab이 어디로 갈지 예측 불가능해짐
// - 오늘 날짜엔 aria-current="date", 선택된 날짜엔 aria-pressed
