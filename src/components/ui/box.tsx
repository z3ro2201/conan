import cn from "@/lib/utils/cn";
import { HTMLAttributes } from "react";
import { Shadow, shadowStyles } from "@/lib/utils/shadow";

type BoxVariant = "outline" | "filled" | "tint" | "elevated" | "dashed" | "accent";

interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BoxVariant;
  /**
   * 지정 안 하면 variant="elevated"일 때만 자동으로 md 그림자가 붙고,
   * 나머지 variant는 그림자 없음. 명시적으로 넘기면 그 값이 항상 우선.
   */
  shadow?: Shadow;
}

// dashed의 #C9CEDB, accent의 #F7F9FF는 팔레트(BRAND/NEUTRAL/SEMANTIC)에 정확히 대응하는
// 토큰이 없어서 가장 가까운 기존 토큰의 투명도 버전으로 근사치 처리했습니다.
// elevated의 그림자는 shadow prop 쪽으로 옮겨서(기본값 md), 다른 variant에서도 shadow를 재사용할 수 있게 함.
const variantStyles: Record<BoxVariant, string> = {
  outline: "border border-border bg-transparent text-muted-light",
  filled: "bg-background text-muted-light",
  tint: "bg-info-bg text-info",
  elevated: "bg-surface text-muted-light",
  dashed: "border-[1.5px] border-dashed border-muted-light/50 bg-transparent text-muted-light",
  accent: "rounded-l-none border-l-[3px] border-primary bg-info-bg/40 text-foreground",
};

export function Box({ variant = "outline", shadow, className, children, ...props }: BoxProps) {
  const resolvedShadow = shadow ?? (variant === "elevated" ? "md" : "none");

  return (
    <div
      className={cn("rounded-xl p-5 text-xs", variantStyles[variant], shadowStyles[resolvedShadow], className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Box variant="outline">Outline Box</Box>
// <Box variant="filled">Filled Box</Box>
// <Box variant="tint">Tint Box</Box>
// <Box variant="elevated">Elevated Box</Box>  {/* shadow="md" 자동 적용 */}
// <Box variant="dashed">Dashed Box (주로 업로드 영역, 빈 상태 표시용)</Box>
// <Box variant="accent">Accent Box (인용/노트용 좌측 강조선)</Box>
//
// // 다른 variant에도 그림자를 얹고 싶을 때
// <Box variant="outline" shadow="sm">살짝 뜬 아웃라인 박스</Box>
// <Box variant="tint" shadow="lg">더 강하게 뜬 틴트 박스</Box>
// <Box variant="elevated" shadow="none">그림자 없는 elevated (배경/텍스트 스타일만)</Box>
//
// 체크리스트
// - Box는 순수 장식용 컨테이너라 기본적으로 ARIA 불필요
// - 다만 tint/accent를 "주의사항", "참고" 같은 알림성 문구에 쓴다면
//   role="note" 를 추가해서 스크린리더가 이걸 본문과 구분된 부가 정보로 인식하게 하는 게 좋음
//   (예: <Box variant="accent" role="note">이 문서는 스포일러를 포함합니다.</Box>)
