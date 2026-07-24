"use client";

import cn from "@/lib/utils/cn";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./icon";
import { Button } from "./button";
import { getMonthMatrix, isSameDay, WEEKDAYS } from "./datepicker";

function formatDateTimeLabel(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}. ${h}:${m}`;
}

interface DateTimePickerProps {
  label?: string;
  value?: Date | null;
  onChange: (date: Date) => void;
  minuteStep?: number;
  "aria-label"?: string;
  className?: string;
}

// DatePicker + TimePicker를 한 팝오버에 합친 버전 ("로컬타임" 입력용).
// 날짜/시간 각각은 고르는 즉시 닫히면 "아직 시간도 골라야 하는데 팝업이 닫혀버렸다"는
// 혼란이 생기기 때문에, 여기서는 팝오버 안에 "확인" 버튼을 둬서 날짜+시간을 다 고른 뒤
// 한 번에 확정하는 방식으로 만들었습니다. (DatePicker/TimePicker 단독은 즉시 확정 방식 유지)

export function DateTimePicker({ label, value, onChange, minuteStep = 10, className, ...props }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ?? new Date());
  const [draftDay, setDraftDay] = useState<Date>(value ?? new Date());
  const [draftHour, setDraftHour] = useState(value?.getHours() ?? 0);
  const [draftMinute, setDraftMinute] = useState(value?.getMinutes() ?? 0);
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
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep);

  const confirm = () => {
    const result = new Date(draftDay);
    result.setHours(draftHour, draftMinute, 0, 0);
    onChange(result);
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
        <span className={!value ? "text-muted-light" : undefined}>
          {value ? formatDateTimeLabel(value) : "날짜와 시간 선택"}
        </span>
        <Icon name="calendar" size={16} className="text-muted-light" />
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={props["aria-label"] ?? "날짜와 시간 선택"}
          className="absolute top-full mt-1.5 left-0 w-[280px] bg-surface border border-border rounded-2xl shadow-[0_12px_28px_rgba(20,30,60,0.14)] p-3.5 z-20 flex flex-col gap-3"
        >
          {/* 날짜 */}
          <div>
            <div className="flex items-center justify-between mb-2">
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
                const selected = isSameDay(d, draftDay);
                const isToday = isSameDay(d, today);
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    onClick={() => setDraftDay(d)}
                    aria-current={isToday ? "date" : undefined}
                    aria-pressed={selected || undefined}
                    aria-label={`${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`}
                    className={cn(
                      "w-7 h-7 rounded-lg text-xs cursor-pointer transition-colors",
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

          {/* 시간 */}
          <div className="flex gap-1.5 border-t border-border pt-3">
            <div role="listbox" aria-label="시" className="flex-1 max-h-28 overflow-y-auto flex flex-col gap-0.5">
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  role="option"
                  aria-selected={draftHour === h}
                  onClick={() => setDraftHour(h)}
                  className={cn(
                    "text-xs text-center py-1.5 rounded-md cursor-pointer",
                    draftHour === h ? "bg-primary text-white font-bold" : "text-muted hover:bg-background",
                  )}
                >
                  {String(h).padStart(2, "0")}
                </button>
              ))}
            </div>
            <div role="listbox" aria-label="분" className="flex-1 max-h-28 overflow-y-auto flex flex-col gap-0.5">
              {minutes.map((m) => (
                <button
                  key={m}
                  type="button"
                  role="option"
                  aria-selected={draftMinute === m}
                  onClick={() => setDraftMinute(m)}
                  className={cn(
                    "text-xs text-center py-1.5 rounded-md cursor-pointer",
                    draftMinute === m ? "bg-primary text-white font-bold" : "text-muted hover:bg-background",
                  )}
                >
                  {String(m).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-1.5 border-t border-border pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
            >
              취소
            </Button>
            <Button variant="primary" size="sm" onClick={confirm}>
              확인
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 사용 예시 =====
//
// const [when, setWhen] = useState<Date | null>(null);
// <DateTimePicker label="예약 발행 시각" value={when} onChange={setWhen} />
//
// // 네이티브로 충분하면 이쪽이 훨씬 가볍습니다 (브라우저가 로캘/키보드 다 처리)
// <TextField label="예약 발행 시각" type="datetime-local" />
