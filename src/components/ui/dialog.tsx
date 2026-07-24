"use client";

import cn from "@/lib/utils/cn";
import { useId, useRef } from "react";
import { useDialogBehavior } from "@/lib/utils/use-dialog-behavior";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  /** 삭제처럼 되돌리기 부담이 큰 동작이면 확인 버튼을 danger 색으로 */
  danger?: boolean;
  closeOnBackdropClick?: boolean;
}

// 원본의 role="alertdialog"를 그대로 유지. Modal(role="dialog")과 달리
// "예/아니오로 즉시 답해야 하는 중요한 확인창"에 씁니다 — 삭제 확인, 저장 안 함 경고 등.
// 안전을 위해 기본 포커스는 확인(위험한 동작)이 아니라 취소 버튼에 먼저 갑니다.

export function Dialog({
  open,
  onClose,
  title,
  description,
  cancelLabel = "취소",
  confirmLabel = "확인",
  onConfirm,
  danger = false,
  closeOnBackdropClick = true,
}: DialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  useDialogBehavior(open, onClose, containerRef);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#14192a]/45 p-6"
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div
        ref={containerRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        onClick={(e) => e.stopPropagation()}
        className="w-[320px] bg-surface rounded-[18px] p-6"
      >
        <div id={titleId} className="font-black text-[17px] text-foreground mb-2">
          {title}
        </div>
        {description && (
          <div id={descId} className="text-[13px] text-muted-light leading-relaxed mb-5">
            {description}
          </div>
        )}
        <div className="flex gap-2 justify-end">
          {/* 취소가 먼저(왼쪽/DOM 순서상 앞)에 오는 게 안전 — 다이얼로그가 열리자마자
              포커스가 여기부터 가서, 무심코 Enter를 눌러도 취소가 되게 */}
          <Button variant="ghost" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ===== 사용 예시 =====
//
// const [confirmOpen, setConfirmOpen] = useState(false);
// <Button variant="danger" onClick={() => setConfirmOpen(true)}>문서 삭제</Button>
// <Dialog
//   open={confirmOpen}
//   onClose={() => setConfirmOpen(false)}
//   title="문서를 삭제할까요?"
//   description="삭제된 문서는 수정 이력에서 되돌릴 수 있어요."
//   confirmLabel="삭제"
//   danger
//   onConfirm={() => { deleteDocument(); setConfirmOpen(false); }}
// />
//
// 체크리스트
// - alertdialog는 "결정이 필요한 순간"에만 — 단순 정보 표시나 긴 콘텐츠는 Modal을 쓰세요
// - 기본 포커스가 취소 버튼에 가는 건 의도적 설계입니다 (실수로 삭제 확정되는 걸 방지)
// - Escape, 배경 클릭, 취소 버튼 셋 다 onClose로 연결 — onConfirm은 확인 버튼에서만 실행
