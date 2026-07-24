import cn from "@/lib/utils/cn";
import { HTMLAttributes } from "react";

// UI킷의 badgeDefs 6개를 색상별로 분해하면 info/warning/success/danger 4가지 색상에
// soft(연한 배경 + 진한 글자) / solid(진한 배경 + 흰 글자) 2가지 톤 조합이었음.
// 예: 주요인물=info soft, 스포일러=warning soft, 해결됨=success soft, 미해결=danger soft,
//     NEW=info solid, 인기=danger solid
// 여기에 outline(테두리만) / soft-outline(연한 배경+테두리 결합) / default(색 없는 중립) 추가.

type BadgeVariant = "info" | "warning" | "success" | "danger";
type BadgeTone = "default" | "soft" | "solid" | "outline" | "soft-outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  tone?: BadgeTone;
  /**
   * 알림 개수처럼 화면이동 없이 숫자가 실시간으로 바뀌는 뱃지일 때 true.
   * 스크린리더에 변경을 알려주는 role="status" + aria-live="polite"를 붙임.
   * 자주 안 바뀌는 정적 뱃지(상태 라벨 등)엔 필요 없음 — 오히려 소음이 됨.
   */
  live?: boolean;
}

// 모든 톤에 border를 넣어두고 색만 바꾸는 방식 → outline 유무와 상관없이 뱃지 크기가 항상 동일하게 유지됨
// (outline만 border를 추가하면 그 뱃지만 미세하게 커져서 한 줄에 섞어 쓸 때 삐뚤빼뚤해 보임)

const softStyles: Record<BadgeVariant, string> = {
  info: "bg-info-bg text-info border-transparent",
  warning: "bg-warning-bg text-warning border-transparent",
  success: "bg-success-bg text-success border-transparent",
  danger: "bg-danger-bg text-danger border-transparent",
};

// solid는 원본에서 info=primary(#1B4FA0), danger=accent-red 값을 그대로 흰 글자로 채운 형태
const solidStyles: Record<BadgeVariant, string> = {
  info: "bg-primary text-white border-transparent",
  warning: "bg-warning text-white border-transparent",
  success: "bg-success text-white border-transparent",
  danger: "bg-danger text-white border-transparent",
};

// 배경 없이 테두리 + 글자색만. 카드 안에 여러 뱃지가 몰려있을 때 시각적으로 덜 두꺼워 보임
const outlineStyles: Record<BadgeVariant, string> = {
  info: "bg-transparent text-info border-primary",
  warning: "bg-transparent text-warning border-warning",
  success: "bg-transparent text-success border-success",
  danger: "bg-transparent text-danger border-danger",
};

// soft + outline 결합. soft보다 경계가 또렷해서 흰 배경 카드 위가 아니라
// 색이 있는 배경(예: 어두운 카드) 위에 올릴 때 윤곽이 잘 보임
const softOutlineStyles: Record<BadgeVariant, string> = {
  info: "bg-info-bg text-info border-primary",
  warning: "bg-warning-bg text-warning border-warning",
  success: "bg-success-bg text-success border-success",
  danger: "bg-danger-bg text-danger border-danger",
};

// 특정 상태를 나타내지 않는 뱃지(예: "공식", "번역", 카테고리 태그)용 중립 톤. variant 값은 무시됨
const defaultStyle = "bg-border/60 text-foreground border-transparent";

const toneStyles: Record<Exclude<BadgeTone, "default">, Record<BadgeVariant, string>> = {
  soft: softStyles,
  solid: solidStyles,
  outline: outlineStyles,
  "soft-outline": softOutlineStyles,
};

export function Badge({ variant = "info", tone = "soft", live, className, children, ...props }: BadgeProps) {
  return (
    <span
      role={live ? "status" : undefined}
      aria-live={live ? "polite" : undefined}
      aria-atomic={live ? true : undefined}
      className={cn(
        "inline-flex items-center font-bold text-xs px-3 py-1.5 rounded-full whitespace-nowrap border",
        tone === "default" ? defaultStyle : toneStyles[tone][variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ===== 텍스트 없는 점(dot) 뱃지 =====
// "안 읽음"을 색깔 점 하나로만 표시하는 경우. 텍스트가 전혀 없어서
// aria-label 없이 쓰면 스크린리더 사용자는 이 점의 존재 자체를 알 수 없음 → 필수 prop으로 강제.

interface BadgeDotProps extends Omit<HTMLAttributes<HTMLSpanElement>, "aria-label"> {
  variant?: BadgeVariant;
  "aria-label": string;
}

const dotColor: Record<BadgeVariant, string> = {
  info: "bg-primary",
  warning: "bg-warning",
  success: "bg-success",
  danger: "bg-danger",
};

export function BadgeDot({ variant = "danger", className, ...props }: BadgeDotProps) {
  return (
    <span role="img" className={cn("inline-block w-2 h-2 rounded-full", dotColor[variant], className)} {...props} />
  );
}

// ===== 사용 예시 =====
//
// <Badge variant="info">주요인물</Badge>
// <Badge variant="warning">스포일러</Badge>
// <Badge variant="success">해결됨</Badge>
// <Badge variant="danger">미해결</Badge>
// <Badge variant="info" tone="solid">NEW</Badge>
// <Badge variant="danger" tone="solid">인기</Badge>
//
// <Badge variant="info" tone="outline">아웃라인만</Badge>
// <Badge variant="success" tone="soft-outline">배경+아웃라인</Badge>
// <Badge tone="default">공식</Badge>
//
// 체크리스트
// - 뱃지는 항상 텍스트 라벨과 함께 (색상만으로 상태를 구분하면 색맹 사용자가 구분 못 함).
//   "해결됨"/"미해결"처럼 색+텍스트가 같이 있으면 OK, 색상 점(dot)만 쓰는 건 피하기
// - 링크나 버튼 안에 붙는 장식용 뱃지(예: "NEW" 표시)는 스크린리더가 링크 텍스트에 이어서
//   그대로 읽어도 자연스러운 문구인지 확인 (안 그러면 aria-hidden 처리하고 별도로 안내)
// - tone="default"는 상태/의미가 없는 순수 카테고리 태그용 (variant 지정해도 무시됨)
