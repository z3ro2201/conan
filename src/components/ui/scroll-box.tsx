import cn from "@/lib/utils/cn";

interface ScrollBoxProps {
  children: React.ReactNode;
  thickness?: "thin" | "thick";
  maxHeight?: number | string;
  className?: string;
}

// 스크롤바 자체(::-webkit-scrollbar)는 Tailwind 유틸리티만으로 못 건드려서
// globals.css의 .scrollbar-thin/.scrollbar-thick 클래스를 붙이는 방식으로 처리했습니다.
// role="region" + tabIndex은 Table/CardCarousel의 가로 스크롤 영역과 같은 이유로,
// 세로 스크롤 영역도 키보드로 스크롤 가능해야 하기 때문에 넣었습니다.

export function ScrollBox({ children, thickness = "thin", maxHeight = 160, className }: ScrollBoxProps) {
  return (
    <div
      role="region"
      aria-label="스크롤 가능한 콘텐츠"
      tabIndex={0}
      style={{ maxHeight }}
      className={cn(
        "w-[280px] overflow-y-auto border border-border rounded-xl px-4 py-3.5 outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        thickness === "thin" ? "scrollbar-thin" : "scrollbar-thick",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <ScrollBox thickness="thin">
//   {lines.map((line, i) => (
//     <div key={i} className="text-[13px] text-muted py-1.5 border-b border-border/60 last:border-none">
//       {line}
//     </div>
//   ))}
// </ScrollBox>
//
// <ScrollBox thickness="thick" maxHeight={240}>...</ScrollBox>
