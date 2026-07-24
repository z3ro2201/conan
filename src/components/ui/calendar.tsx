"use client";

import cn from "@/lib/utils/cn";
import { useState } from "react";
import { Icon } from "./icon";
import { getMonthMatrix, isSameDay, WEEKDAYS } from "./date-picker";

interface CalendarProps {
  title?: string;
  value?: Date | null;
  onChange?: (date: Date) => void;
  /** 연도 드롭다운에 보여줄 범위. 기본은 현재 연도 기준 -80 ~ +5년 (생년월일 선택 등도 커버) */
  yearRange?: [number, number];
  className?: string;
}

const MONTH_NAMES = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

// 원본의 "Calendar"(연표 이벤트) 섹션은 2026년 7월 하나로 고정된 정적 그리드였는데,
// 실제로 쓰려면 다른 달/연도로 이동할 수 있어야 해서 연/월 드롭다운과 이전/다음 버튼을
// 추가했습니다. DatePicker의 팝오버 안 달력과 로직은 같고(getMonthMatrix 등 공유),
// 이건 팝오버 없이 페이지에 바로 박혀있는 "인라인" 버전입니다.

export function Calendar({ title, value, onChange, yearRange, className }: CalendarProps) {
  const [viewDate, setViewDate] = useState(value ?? new Date());
  const today = new Date();

  const currentYear = new Date().getFullYear();
  const [minYear, maxYear] = yearRange ?? [currentYear - 80, currentYear + 5];
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const matrix = getMonthMatrix(viewDate.getFullYear(), viewDate.getMonth());

  const setYear = (year: number) => setViewDate(new Date(year, viewDate.getMonth(), 1));
  const setMonth = (month: number) => setViewDate(new Date(viewDate.getFullYear(), month, 1));

  return (
    <div className={cn("max-w-[360px]", className)}>
      {title && <div className="font-bold text-[15px] text-foreground mb-3">{title}</div>}

      <div className="flex items-center justify-between mb-3 gap-1">
        <button
          type="button"
          aria-label="이전 달"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="w-7 h-7 flex items-center justify-center rounded-md text-muted cursor-pointer hover:bg-background shrink-0"
        >
          <Icon name="chevron-left" size={14} />
        </button>

        {/* 연/월을 텍스트가 아니라 드롭다운으로 — 몇 달씩 화살표로 넘기지 않고 바로 이동 가능 */}
        <div className="flex items-center gap-1">
          <label className="sr-only" htmlFor="calendar-year-select">
            연도
          </label>
          <select
            id="calendar-year-select"
            value={viewDate.getFullYear()}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-sm font-bold text-foreground bg-transparent outline-none cursor-pointer rounded px-1 focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="calendar-month-select">
            월
          </label>
          <select
            id="calendar-month-select"
            value={viewDate.getMonth()}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="text-sm font-bold text-foreground bg-transparent outline-none cursor-pointer rounded px-1 focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          aria-label="다음 달"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="w-7 h-7 flex items-center justify-center rounded-md text-muted cursor-pointer hover:bg-background shrink-0"
        >
          <Icon name="chevron-right" size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[11px] text-muted-light text-center mb-1.5">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {matrix.map((d) => {
          const inMonth = d.getMonth() === viewDate.getMonth();
          const selected = value ? isSameDay(d, value) : false;
          const isToday = isSameDay(d, today);
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={!inMonth}
              onClick={() => onChange?.(d)}
              aria-current={isToday ? "date" : undefined}
              aria-pressed={selected || undefined}
              aria-label={`${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`}
              className={cn(
                "aspect-square rounded-lg text-xs transition-colors",
                !inMonth && "invisible",
                inMonth && !selected && "text-foreground cursor-pointer hover:bg-background",
                selected && "bg-primary text-white font-bold cursor-pointer",
                isToday && !selected && "ring-1 ring-primary text-primary font-bold",
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===== 사용 예시 =====
//
// const [day, setDay] = useState<Date | null>(null);
// <Calendar title="연표 이벤트" value={day} onChange={setDay} />
//
// // 생년월일처럼 훨씬 넓은 연도 범위가 필요할 때
// <Calendar value={birthday} onChange={setBirthday} yearRange={[1900, 2026]} />
//
// 체크리스트
// - 연/월은 화살표로 한 달씩 넘기는 것 외에 드롭다운으로 바로 이동 가능
//   (예: 1990년생 생일을 찾으려고 화살표를 400번 누르는 상황 방지)
// - DatePicker와 그리드 로직(getMonthMatrix, isSameDay)을 공유해서 동작이 서로 일관됨
// - 팝오버로 띄우고 싶으면 DatePicker, 페이지에 항상 펼쳐져 있어야 하면 Calendar
