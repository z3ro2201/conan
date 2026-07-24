import cn from "@/lib/utils/cn";

// 막대/도넛 차트는 순수 시각 정보라 스크린리더는 <div style="height:72%">에서 아무것도
// 못 얻습니다. 그래서 두 컴포넌트 다 눈에는 안 보이지만(sr-only) 스크린리더는 읽을 수 있는
// 실제 수치 표/문장을 같이 넣었습니다. 시각 차트를 못 보는 사용자도 똑같은 정보를 얻습니다.

// ===== Bar Chart =====

export interface BarChartDatum {
  label: string;
  value: number;
  /** 특정 막대만 강조하고 싶을 때 (예: 이번 주 최고치를 danger 색으로) */
  color?: "primary" | "danger" | "success" | "warning";
}

interface BarChartProps {
  title?: string;
  data: BarChartDatum[];
  /** 막대 높이 기준값. 지정 안 하면 데이터 중 최댓값 사용 */
  max?: number;
  className?: string;
}

const barColorStyles: Record<NonNullable<BarChartDatum["color"]>, string> = {
  primary: "bg-primary",
  danger: "bg-danger",
  success: "bg-success",
  warning: "bg-warning",
};

export function BarChart({ title, data, max, className }: BarChartProps) {
  const maxValue = max ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={className}>
      {title && <div className="text-xs font-bold text-muted-light mb-3">{title}</div>}

      <div aria-hidden="true" className="flex items-end gap-3 h-[140px]">
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <div
              className={cn(
                "w-full max-w-[28px] rounded-t-md transition-[height]",
                barColorStyles[d.color ?? "primary"],
              )}
              style={{ height: `${Math.max((d.value / maxValue) * 100, 2)}%` }}
            />
            <div className="text-[11px] text-muted-light">{d.label}</div>
          </div>
        ))}
      </div>

      {/* 스크린리더 전용 데이터 표 — 시각 차트와 같은 정보를 표 형태로 제공 */}
      <table className="sr-only">
        <caption>{title ?? "데이터 차트"}</caption>
        <thead>
          <tr>
            <th scope="col">항목</th>
            <th scope="col">값</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== Donut Chart =====

interface DonutChartProps {
  title?: string;
  /** 0~100 */
  value: number;
  label?: string;
  size?: number;
  color?: "primary" | "danger" | "success" | "warning";
  className?: string;
}

const donutColorVar: Record<NonNullable<DonutChartProps["color"]>, string> = {
  primary: "var(--primary)",
  danger: "var(--danger)",
  success: "var(--success)",
  warning: "var(--warning)",
};

export function DonutChart({ title, value, label, size = 130, color = "primary", className }: DonutChartProps) {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn("text-center", className)}>
      {title && <div className="text-xs font-bold text-muted-light mb-3">{title}</div>}
      <div
        role="img"
        aria-label={`${label ?? "비율"} ${clamped}%`}
        className="rounded-full mx-auto flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${donutColorVar[color]} 0% ${clamped}%, var(--border) ${clamped}% 100%)`,
        }}
      >
        <div
          aria-hidden="true"
          className="rounded-full bg-surface flex items-center justify-center font-black text-foreground"
          style={{ width: size * 0.74, height: size * 0.74, fontSize: size * 0.15 }}
        >
          {clamped}%
        </div>
      </div>
    </div>
  );
}

// ===== 사용 예시 =====
//
// <BarChart
//   title="주간 편집 건수"
//   data={[
//     { label: '월', value: 40 }, { label: '화', value: 65 }, { label: '수', value: 30 },
//     { label: '목', value: 85, color: 'danger' }, { label: '금', value: 55 },
//     { label: '토', value: 100 }, { label: '일', value: 70 },
//   ]}
// />
//
// <DonutChart title="이번 달 기여율" value={72} label="기여율" />
//
// 체크리스트
// - 시각 차트 자체는 aria-hidden, 대신 sr-only 표/aria-label로 같은 정보를 텍스트로 제공
//   (막대 높이나 도넛 각도만으로는 스크린리더가 값을 전혀 알 수 없기 때문)
// - 더 복잡한 차트(멀티 시리즈, 툴팁, 줌 등)가 필요해지면 recharts 같은 라이브러리로
//   옮기는 걸 추천 — 이 두 컴포넌트는 가벼운 대시보드 요약용입니다
