"use client";

import cn from "@/lib/utils/cn";
import { useId, useRef } from "react";
import { useDialogBehavior } from "@/lib/utils/use-dialog-behavior";
import { IconButton, Button } from "./button";
import { Icon } from "./icon";

type PopupPosition = "top" | "bottom" | "center";

interface PopupProps {
  open: boolean;
  onClose: () => void;
  position?: PopupPosition;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm?: () => void;
  closeOnBackdropClick?: boolean;
}

// 세 위치 모두 같은 useDialogBehavior(포커스 트랩·Escape·스크롤 잠금·포커스 복귀)를 공유하고
// 레이아웃/애니메이션 방향만 다릅니다. 용도는 원본 설명 그대로:
// top = 공지/배너형, bottom = 모바일 액션시트, center = 확인/경고 메시지

export function Popup({
  open,
  onClose,
  position = "center",
  title,
  description,
  confirmLabel = position === "center" ? "확인" : "닫기",
  onConfirm,
  closeOnBackdropClick = true,
}: PopupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useDialogBehavior(open, onClose, containerRef);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[230] flex",
        position === "top" && "items-start bg-[#14192a]/35",
        position === "bottom" && "items-end bg-[#14192a]/35",
        position === "center" && "items-center justify-center bg-[#14192a]/45 p-6",
      )}
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "bg-surface",
          position === "top" &&
            "w-full max-w-[480px] mx-auto rounded-b-[18px] px-6 py-[22px] flex items-center justify-between gap-4",
          position === "bottom" && "w-full max-w-[480px] mx-auto rounded-t-2xl p-6",
          position === "center" && "w-[320px] rounded-[18px] p-6 text-center",
        )}
      >
        {position === "bottom" && <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />}
        {position === "center" && (
          <div className="w-12 h-12 rounded-full bg-info-bg text-primary flex items-center justify-center font-black text-xl mx-auto mb-3.5">
            !
          </div>
        )}

        <div className={position === "top" ? "flex-1" : undefined}>
          <div id={titleId} className="font-black text-base text-foreground mb-1">
            {title}
          </div>
          {description && <div className="text-xs text-muted-light mb-4">{description}</div>}
        </div>

        {position === "top" ? (
          <IconButton icon={<Icon name="close" size={13} />} aria-label="닫기" size="sm" onClick={onClose} />
        ) : (
          <Button variant="primary" onClick={handleConfirm} className="w-full">
            {confirmLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Popup open={noticeOpen} onClose={() => setNoticeOpen(false)} position="top"
//   title="위에서 내려오는 팝업" description="공지사항, 배너형 알림에 어울려요." />
//
// <Popup open={sheetOpen} onClose={() => setSheetOpen(false)} position="bottom"
//   title="아래서 올라오는 팝업" description="모바일 액션시트, 옵션 선택에 어울려요." />
//
// <Popup open={warnOpen} onClose={() => setWarnOpen(false)} position="center"
//   title="정가운데 팝업" description="확인/경고성 메시지에 어울려요." onConfirm={handleConfirm} />
//
// 체크리스트
// - Dialog/Modal/Drawer와 동일한 useDialogBehavior 재사용
// - position="center"는 Dialog(alertdialog)와 시각적으로 비슷해 보일 수 있는데,
//   Dialog는 "예/아니오 결정"이 핵심이고 Popup center는 "확인만 누르면 끝"인
//   단순 알림에 가깝습니다 — 취소 옵션이 필요하면 Dialog를 쓰세요
