import cn from "@/lib/utils/cn";

type AdSize = "leaderboard" | "mediumRectangle";

interface AdAreaProps {
  size?: AdSize;
  className?: string;
}

const sizeMap: Record<AdSize, { w: number; h: number; label: string }> = {
  leaderboard: { w: 728, h: 90, label: "728×90" },
  mediumRectangle: { w: 300, h: 250, label: "300×250" },
};

// role="complementary"로 감싸서 "본문과 무관한 부가 콘텐츠(광고)"임을 스크린리더에 명확히 전달.
// 광고 자체는 실제 로드된 콘텐츠(iframe 등)로 대체되므로, 이 컴포넌트는 그 전/실패 시의
// 자리표시자 역할만 합니다.

export function AdArea({ size = "leaderboard", className }: AdAreaProps) {
  const { w, h, label } = sizeMap[size];

  return (
    <div
      role="complementary"
      aria-label="광고"
      style={{ maxWidth: w, height: h }}
      className={cn(
        "w-full border-[1.5px] border-dashed border-muted-light/40 rounded-[10px] bg-background",
        "flex items-center justify-center font-mono text-xs text-muted-light",
        className,
      )}
    >
      AD · {label}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <AdArea size="leaderboard" />       {/* 728×90, 상단 배너용 */}
// <AdArea size="mediumRectangle" />   {/* 300×250, 사이드바용 */}
//
// 체크리스트
// - role="complementary" + aria-label="광고"로 본문과 구분되는 부가 영역임을 명시
//   (스크린리더 사용자가 "랜드마크 건너뛰기"로 광고 영역을 건너뛸 수 있게 됨)
// - 실제 광고 스크립트(구글 애드센스 등)를 넣을 땐 이 컴포넌트의 자리에 iframe이
//   삽입되는 식으로 쓰고, 로드 실패/광고 차단 시 자리표시자로 되돌아가게 하면 좋습니다
