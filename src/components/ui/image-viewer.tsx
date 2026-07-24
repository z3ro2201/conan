"use client";

import cn from "@/lib/utils/cn";
import { useId, useRef, useState } from "react";
import { useDialogBehavior } from "@/lib/utils/use-dialog-behavior";
import { IconButton } from "./button";
import { Icon } from "./icon";

export interface GalleryImage {
  src?: string;
  alt: string;
}

interface ImageViewerProps {
  images: GalleryImage[];
  className?: string;
}

export function ImageViewer({ images, className }: ImageViewerProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const close = () => setOpenIndex(null);
  useDialogBehavior(openIndex !== null, close, containerRef);

  const current = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <div className={cn("grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 max-w-[520px]", className)}>
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={`${img.alt} 크게 보기`}
            className={cn(
              "aspect-square rounded-xl overflow-hidden cursor-pointer",
              "outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
              !img.src &&
                "bg-[repeating-linear-gradient(135deg,var(--info-bg),var(--info-bg)_10px,#E1E9FA_10px,#E1E9FA_20px)] flex items-center justify-center text-[11px] font-mono text-[#8FA3CC]",
            )}
          >
            {img.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
            ) : (
              img.alt
            )}
          </button>
        ))}
      </div>

      {current && (
        <div className="fixed inset-0 z-[220] bg-[#0a0c14]/85 flex flex-col items-center justify-center p-10">
          <div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="flex flex-col items-center"
          >
            <IconButton
              icon={<Icon name="close" size={15} />}
              aria-label="닫기"
              onClick={close}
              className="absolute top-6 right-6 bg-white/15 text-white hover:bg-white/25"
            />
            <div className="flex items-center gap-5">
              <button
                type="button"
                aria-label="이전 이미지"
                disabled={openIndex === 0}
                onClick={() => setOpenIndex((i) => Math.max((i ?? 0) - 1, 0))}
                className="w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icon name="chevron-left" size={18} />
              </button>

              <div className="w-[min(480px,70vw)] aspect-square rounded-2xl overflow-hidden bg-[#2E3750] flex items-center justify-center">
                {current.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={current.src} alt={current.alt} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-white/60 font-mono text-[13px]">[ 확대 이미지 ]</span>
                )}
              </div>

              <button
                type="button"
                aria-label="다음 이미지"
                disabled={openIndex === images.length - 1}
                onClick={() => setOpenIndex((i) => Math.min((i ?? 0) + 1, images.length - 1))}
                className="w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icon name="chevron-right" size={18} />
              </button>
            </div>
            <div id={titleId} aria-live="polite" className="text-white text-[13px] mt-5">
              {current.alt} ({(openIndex ?? 0) + 1} / {images.length})
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ===== 사용 예시 =====
//
// <ImageViewer
//   images={[
//     { src: '/case-849/1.jpg', alt: '사건 현장 스케치 1' },
//     { src: '/case-849/2.jpg', alt: '사건 현장 스케치 2' },
//   ]}
// />
//
// 체크리스트
// - Dialog/Modal/Drawer와 동일한 useDialogBehavior — 포커스 트랩·Escape·스크롤 잠금·포커스 복귀
// - 라이트박스 하단 캡션에 aria-live="polite" — 이전/다음 버튼으로 이미지가 바뀔 때마다
//   "N / 전체" 값이 자동으로 스크린리더에 안내됨
// - 첫/마지막 이미지에서 이전/다음 버튼은 disabled (Pagination과 같은 원칙)
