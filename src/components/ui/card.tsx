import cn from "@/lib/utils/cn";
import { HTMLAttributes } from "react";
import { Shadow, shadowStyles } from "@/lib/utils/shadow";

type CardVariant = "default" | "highlight";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** 기본은 그림자 없음(원본 카드 타일과 동일). 목록에서 다른 요소 위에 뜬 느낌을 주고 싶을 때 지정 */
  shadow?: Shadow;
  /**
   * 카드가 링크/버튼으로 감싸져 클릭 가능할 때, 마우스를 올리면 그림자가 커지면서 살짝 뜨는 효과.
   * shadow 미지정 시 기본 sm → 호버 시 lg로 전환.
   */
  liftOnHover?: boolean;
}

// CardTitle/CardDescription은 색상을 직접 지정하지 않고 부모(Card)로부터 상속받습니다.
// default는 진한 텍스트, highlight는 흰 텍스트인데, 색상을 고정해버리면
// highlight 카드 안에서 매번 className으로 덮어써야 하는 번거로움이 생기기 때문입니다.

export function Card({ variant = "default", shadow = "none", liftOnHover, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 transition-shadow",
        variant === "default" && "bg-background border border-border text-foreground",
        variant === "highlight" && "bg-gradient-to-br from-primary to-primary-dark text-white",
        liftOnHover
          ? cn(shadowStyles[shadow === "none" ? "sm" : shadow], "hover:shadow-[0_8px_24px_rgba(20,30,60,0.14)]")
          : shadowStyles[shadow],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardIconProps extends HTMLAttributes<HTMLDivElement> {
  /** 배경색 토큰. 인물=primary, 사건=danger처럼 카드 종류별로 구분할 때 사용 */
  tone?: "primary" | "danger" | "success" | "warning";
}

const iconToneStyles: Record<NonNullable<CardIconProps["tone"]>, string> = {
  primary: "bg-primary",
  danger: "bg-danger",
  success: "bg-success",
  warning: "bg-warning",
};

export function CardIcon({ tone = "primary", className, children, ...props }: CardIconProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-10 h-10 rounded-[10px] text-white flex items-center justify-center font-black mb-3",
        iconToneStyles[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("font-bold text-[15px] mb-1", className)} {...props}>
      {children}
    </div>
  );
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-xs opacity-70", className)} {...props}>
      {children}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Card>
//   <CardIcon tone="primary">人</CardIcon>
//   <CardTitle>인물 문서 카드</CardTitle>
//   <CardDescription>문서 214개 · 오늘 5건 수정</CardDescription>
// </Card>
//
// <Card>
//   <CardIcon tone="danger">事</CardIcon>
//   <CardTitle>사건 문서 카드</CardTitle>
//   <CardDescription>문서 388개 · 오늘 12건 수정</CardDescription>
// </Card>
//
// <Card variant="highlight">
//   <CardTitle>강조 카드</CardTitle>
//   <CardDescription>배경색이 다른 하이라이트 카드</CardDescription>
// </Card>
//
// // 그림자 직접 지정
// <Card shadow="sm">살짝 뜬 카드</Card>
// <Card shadow="lg">더 강하게 뜬 카드</Card>
//
// // 클릭 가능한 카드 목록에서 호버 시 뜨는 효과
// <LinkButton href="/character/conan" className="block no-underline">
//   <Card liftOnHover>
//     <CardIcon tone="primary">人</CardIcon>
//     <CardTitle>명탐정 OOO</CardTitle>
//     <CardDescription>고등학생 탐정 · 214개 문서</CardDescription>
//   </Card>
// </LinkButton>
//
// // 클릭 가능한 카드로 쓰고 싶으면 (예: 문서 목록에서 카드 자체가 링크인 경우)
// <LinkButton href="/character/list" className="block no-underline">
//   <Card>...</Card>
// </LinkButton>
//
// 체크리스트
// - CardIcon의 문자(人/事 등)는 장식용이라 aria-hidden 처리해뒀음 — 정보는 CardTitle에 이미 있음
// - Card 전체를 클릭 가능하게 만들 때 <div onClick>으로 감싸지 말고 <a>/<button>으로 감쌀 것
//   (그래야 키보드 포커스, Enter 키 활성화, 스크린리더 "링크"/"버튼" 안내가 자동으로 딸려옴)
// - highlight variant 안에서 CardIcon을 쓰면 배경(그라데이션)과 아이콘 배경이 겹쳐 보일 수 있어
//   보통 highlight 카드는 아이콘 없이 제목+설명만 쓰는 걸 추천
// - liftOnHover는 시각 효과일 뿐 클릭 가능함을 스크린리더에 알려주진 않음 — 반드시 실제
//   <a>/<button>으로 감싸서 키보드/스크린리더 사용자도 "클릭 가능"임을 알 수 있게 할 것
