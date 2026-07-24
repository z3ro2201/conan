import cn from "@/lib/utils/cn";

interface ImageBoxProps {
  src?: string;
  alt: string;
  caption?: string;
  aspectRatio?: string;
  className?: string;
}

// caption이 있으면 figure/figcaption으로, 없으면 단순 이미지 박스로.
// figure/figcaption을 쓰는 이유: 스크린리더가 "이 캡션이 저 이미지에 대한 설명"이라는
// 관계를 이해하게 되고, 이미지를 인쇄하거나 다른 곳으로 옮겨도 캡션이 같이 따라다닙니다.

export function ImageBox({ src, alt, caption, aspectRatio = "1", className }: ImageBoxProps) {
  const image = src ? (
    // eslint-disable-next-line @next/next/no-img-element -- Next.js 프로젝트면 next/image로 교체 권장
    <img src={src} alt={alt} className="w-full h-full object-cover" style={{ aspectRatio }} />
  ) : (
    <div
      role="img"
      aria-label={alt}
      style={{ aspectRatio }}
      className={cn(
        "w-full flex items-center justify-center font-mono text-[11px] text-[#8FA3CC]",
        "bg-[repeating-linear-gradient(135deg,var(--info-bg),var(--info-bg)_10px,#E1E9FA_10px,#E1E9FA_20px)]",
      )}
    >
      [ 이미지 ]
    </div>
  );

  if (!caption) {
    return <div className={cn("rounded-2xl overflow-hidden", className)}>{image}</div>;
  }

  return (
    <figure className={cn("border border-border rounded-2xl overflow-hidden m-0", className)}>
      {image}
      <figcaption className="px-3.5 py-3 text-xs text-muted leading-relaxed">{caption}</figcaption>
    </figure>
  );
}

// ===== 사용 예시 =====
//
// // 단독 이미지 (실제 src 없이 자리표시자만)
// <ImageBox alt="사건 현장 스케치 예시 이미지" />
//
// // 실제 이미지 + 캡션
// <ImageBox
//   src="/case-849/scene.jpg"
//   alt="사건 EP.849 현장 스케치"
//   caption="그림 1. 예시 캡션 — 사건 현장 스케치"
// />
//
// // 가로로 긴 비율
// <ImageBox src="..." alt="..." aspectRatio="16/10" caption="..." />
//
// 체크리스트
// - src 없이 자리표시자만 보여줄 때도 role="img" + aria-label로 "여기 이미지가
//   들어갈 자리"임을 스크린리더에 전달 (안 그러면 그냥 빈 장식 div로 지나쳐버림)
// - caption이 있으면 figure/figcaption으로 자동 전환 — 일반 div로 감싸면
//   이미지와 캡션의 연관관계가 스크린리더에 전달되지 않음
