import cn from "@/lib/utils/cn";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full";
  className?: string;
}

const roundedStyles: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-2xl",
  full: "rounded-full",
};

// 기본 뼈대 하나. 원본의 아바타+텍스트/문단/카드/버튼/테이블 로우 데모는 전부 이 사각형
// 하나를 크기/모양만 바꿔가며 조합한 것뿐이라 별도 컴포넌트를 만들지 않고
// 이 하나로 다 커버합니다 (레이아웃은 사용하는 쪽에서 flex/grid로 배치).

export function Skeleton({ width = "100%", height = 12, rounded = "sm", className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      style={{ width, height }}
      className={cn(
        "bg-[linear-gradient(90deg,#F0F1F5_25%,#E4E6ED_37%,#F0F1F5_63%)] bg-[length:400px_100%] animate-[shimmer_1.4s_infinite_linear]",
        roundedStyles[rounded],
        className,
      )}
    />
  );
}

// ===== SkeletonGroup =====
// 여러 Skeleton을 감싸서 "지금 로딩 중"임을 스크린리더에 한 번만 알림.
// Skeleton 하나하나는 aria-hidden이라(어차피 셰이프일 뿐 정보가 없음) 개별적으로는
// 아무것도 안 읽히는데, 이 래퍼가 없으면 스크린리더 사용자는 로딩 중인지조차 모릅니다.

export function SkeletonGroup({ label = "로딩 중", children }: { label?: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      {children}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <SkeletonGroup label="프로필 불러오는 중">
//   <div className="flex gap-4 items-center">
//     <Skeleton width={56} height={56} rounded="full" />
//     <div className="flex-1 max-w-[320px] flex flex-col gap-2">
//       <Skeleton width="60%" height={14} rounded="md" />
//       <Skeleton width="85%" />
//       <Skeleton width="40%" />
//     </div>
//   </div>
// </SkeletonGroup>
//
// // 카드
// <div className="w-[180px]">
//   <Skeleton height={112} rounded="lg" className="mb-2.5" />
//   <Skeleton width="80%" height={12} rounded="md" className="mb-1.5" />
//   <Skeleton width="50%" height={11} rounded="md" />
// </div>
//
// // 버튼 / 뱃지
// <div className="flex gap-2.5 items-center">
//   <Skeleton width={90} height={36} rounded="md" />
//   <Skeleton width={60} height={24} rounded="full" />
// </div>
//
// // 테이블 로우 3개
// {Array.from({ length: 3 }).map((_, i) => (
//   <div key={i} className="flex items-center gap-4">
//     <Skeleton width="30%" />
//     <Skeleton width="20%" />
//     <Skeleton width="15%" />
//   </div>
// ))}
