import cn from "@/lib/utils/cn";

interface NoImageProps {
  message?: string;
  caption?: string;
  aspectRatio?: string;
  className?: string;
}

// "깨진 이미지" 아이콘을 자체 SVG로 그렸습니다 (공용 아이콘 세트엔 이 특정 모양이 없어서).
// ImageBox와 짝을 이루는 컴포넌트로, 실제로는 <img onError>에서 이걸로 교체하는 식으로 씁니다.

function BrokenImageGlyph() {
  return (
    <svg width="32" height="26" viewBox="0 0 32 26" aria-hidden="true" className="text-[#C9CEDB]">
      <rect x="1" y="1" width="30" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="4" y1="21" x2="16" y2="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function NoImage({
  message = "이미지를 불러올 수 없어요",
  caption,
  aspectRatio = "1",
  className,
}: NoImageProps) {
  const placeholder = (
    <div
      role="img"
      aria-label={message}
      style={{ aspectRatio }}
      className="w-full flex flex-col items-center justify-center gap-2 border-[1.5px] border-dashed border-[#D9DCE3] bg-[#FAFAFA]"
    >
      <BrokenImageGlyph />
      <span className="text-[11px] font-bold text-muted-light">{message}</span>
    </div>
  );

  if (!caption) {
    return <div className={cn("rounded-2xl overflow-hidden", className)}>{placeholder}</div>;
  }

  return (
    <figure className={cn("border border-border rounded-2xl overflow-hidden m-0", className)}>
      {placeholder}
      <figcaption className="px-3.5 py-3 text-xs text-muted leading-relaxed">{caption}</figcaption>
    </figure>
  );
}

// ===== 사용 예시 =====
//
// // ImageBox와 짝을 이뤄 로드 실패 시 대체
// const [failed, setFailed] = useState(false);
// {failed ? (
//   <NoImage caption="그림 1. 예시 캡션" />
// ) : (
//   <ImageBox src={url} alt="..." caption="그림 1. 예시 캡션" onError={() => setFailed(true)} />
// )}
//
// 체크리스트
// - role="img" + aria-label로 "이미지를 못 불러왔다"는 상태 자체를 스크린리더에 전달
//   (장식 취급해서 aria-hidden 하면 안 됨 — 이건 실패했다는 의미 있는 정보임)
