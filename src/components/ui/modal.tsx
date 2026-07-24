"use client";

import cn from "@/lib/utils/cn";
import { useId, useRef } from "react";
import { useDialogBehavior } from "@/lib/utils/use-dialog-behavior";
import { IconButton } from "./button";
import { Icon } from "./icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdropClick?: boolean;
  className?: string;
}

// 원본의 role="dialog"(alertdialog가 아님)를 유지. Dialog(alertdialog)와 달리
// "예/아니오"가 아니라 긴 콘텐츠(이력, 상세 정보, 폼 등)를 보여줄 때 씁니다.

export function Modal({ open, onClose, title, children, footer, closeOnBackdropClick = true, className }: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useDialogBehavior(open, onClose, containerRef);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#14192a]/45 p-6"
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-[560px] max-h-[80vh] bg-surface rounded-2xl flex flex-col overflow-hidden",
          className,
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <div id={titleId} className="font-black text-lg text-foreground">
            {title}
          </div>
          <IconButton icon={<Icon name="close" size={16} />} aria-label="닫기" onClick={onClose} />
        </div>

        <div className="px-6 py-6 overflow-y-auto">{children}</div>

        {footer && <div className="px-6 py-4 border-t border-border flex justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

// ===== 사용 예시 =====
//
// const [historyOpen, setHistoryOpen] = useState(false);
// <Button variant="secondary" onClick={() => setHistoryOpen(true)}>수정 이력 보기</Button>
// <Modal
//   open={historyOpen}
//   onClose={() => setHistoryOpen(false)}
//   title="수정 이력 상세"
//   footer={<Button variant="primary" size="sm" onClick={() => setHistoryOpen(false)}>닫기</Button>}
// >
//   {history.map((h) => (
//     <div key={h.id} className="flex justify-between py-3 border-b border-border/60 text-[13px]">
//       <span className="font-bold text-foreground">{h.editor}</span>
//       <span className="text-muted-light">{h.summary}</span>
//       <span className="text-muted-light">{h.time}</span>
//     </div>
//   ))}
// </Modal>
//
// 체크리스트
// - Dialog(alertdialog)와 구분: 결정을 물어보는 게 아니라 콘텐츠를 보여줄 땐 Modal
// - 본문(children)만 스크롤되고 헤더/푸터는 고정 — 긴 목록이 들어가도 닫기 버튼이 안 잘림
// - Dialog/Modal 둘 다 useDialogBehavior 공용 훅으로 포커스 트랩·Escape·스크롤 잠금·
//   포커스 복귀를 동일하게 처리 (원본엔 이 네 가지가 다 빠져있었음)
