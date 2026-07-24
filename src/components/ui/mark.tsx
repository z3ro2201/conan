import cn from "@/lib/utils/cn";

interface MarkProps {
  children: React.ReactNode;
  color?: "yellow" | "blue";
  className?: string;
}

// 진짜 <mark> 태그를 씁니다 — 브라우저/스크린리더가 "강조 표시된 텍스트"로 인식하는
// 시맨틱 요소라 div+배경색보다 의미가 명확합니다.

const colorStyles: Record<NonNullable<MarkProps["color"]>, string> = {
  yellow: "bg-[#FFF3A0]",
  blue: "bg-[#D7ECFF]",
};

export function Mark({ children, color = "yellow", className }: MarkProps) {
  return <mark className={cn("px-1 py-px rounded", colorStyles[color], className)}>{children}</mark>;
}

// ===== 사용 예시 =====
//
// <p>진범은 <Mark>이 인물</Mark>일 가능성이 높으며, <Mark color="blue">알리바이</Mark>에 모순이 있어요.</p>
