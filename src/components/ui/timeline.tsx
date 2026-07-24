import cn from "@/lib/utils/cn";

export interface TimelineItem {
  year: string;
  title: string;
  desc?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

// ol로 감싸서 "시간 순서가 있는 목록"임을 스크린리더에 전달. 점/선은 순수 장식이라 aria-hidden.

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn("max-w-[420px] list-none m-0 p-0", className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <li key={i} className="flex gap-4">
            <div aria-hidden="true" className="flex flex-col items-center shrink-0">
              <div className="w-3 h-3 rounded-full bg-primary mt-1" />
              {!isLast && <div className="w-0.5 flex-1 bg-border" />}
            </div>
            <div className={cn(!isLast && "pb-5")}>
              <div className="font-black text-[13px] text-primary">{item.year}</div>
              <div className="font-bold text-sm text-foreground mt-0.5">{item.title}</div>
              {item.desc && <div className="text-xs text-muted-light mt-0.5">{item.desc}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ===== 사용 예시 =====
//
// <Timeline
//   items={[
//     { year: '1994', title: '연재 시작', desc: '주간 소년 선데이에 첫 연재' },
//     { year: '1996', title: '애니메이션 방영 시작' },
//     { year: '2000', title: '첫 극장판 개봉' },
//   ]}
// />
