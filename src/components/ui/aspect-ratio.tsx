import cn from "@/lib/utils/cn";

interface AspectRatioProps {
  ratio?: string;
  children: React.ReactNode;
  className?: string;
}

// CSS aspect-ratio 속성 하나를 감싸는 아주 얇은 유틸리티 컴포넌트. ImageBox/NoImage/
// CardCarousel 등 여러 컴포넌트가 이미 각자 aspect-ratio를 인라인으로 쓰고 있는데,
// 그 패턴을 그대로 재사용하고 싶을 때(예: 지도, iframe 임베드 등 이미지가 아닌 콘텐츠) 씁니다.

export function AspectRatio({ ratio = "1", children, className }: AspectRatioProps) {
  return (
    <div style={{ aspectRatio: ratio }} className={cn("rounded-[10px] overflow-hidden", className)}>
      {children}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <AspectRatio ratio="16/9" className="w-[180px]">
//   <iframe src="..." className="w-full h-full border-none" title="지도" />
// </AspectRatio>
//
// <AspectRatio ratio="1" className="w-36">...</AspectRatio>
// <AspectRatio ratio="3/4" className="w-[110px]">...</AspectRatio>
