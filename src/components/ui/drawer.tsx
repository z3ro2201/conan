"use client";

import cn from "@/lib/utils/cn";
import { useId, useRef } from "react";
import { useDialogBehavior } from "@/lib/utils/use-dialog-behavior";
import { IconButton } from "./button";
import { Icon } from "./icon";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right";
  closeOnBackdropClick?: boolean;
  className?: string;
}

// Dialog/Modal과 마찬가지로 포커스 트랩·Escape·스크롤 잠금·포커스 복귀를
// useDialogBehavior 공용 훅으로 처리. 다른 점은 화면 중앙이 아니라 옆에서 슬라이드되는 것뿐이라
// 실질적으로 "옆에 붙은 모달"이라고 봐도 됩니다.

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "left",
  closeOnBackdropClick = true,
  className,
}: DrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useDialogBehavior(open, onClose, containerRef);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#14192a]/45" onClick={closeOnBackdropClick ? onClose : undefined}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "absolute top-0 bottom-0 w-[260px] bg-surface p-6 flex flex-col gap-1 overflow-y-auto",
          side === "left" ? "left-0" : "right-0",
          className,
        )}
      >
        <div className="flex items-center justify-between mb-4">
          {title && (
            <div id={titleId} className="font-black text-[17px] text-primary">
              {title}
            </div>
          )}
          <IconButton icon={<Icon name="close" size={14} />} aria-label="닫기" size="sm" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

// ===== 사용 예시 =====
//
// const [menuOpen, setMenuOpen] = useState(false);
// <Button variant="primary" onClick={() => setMenuOpen(true)}>☰ 메뉴 열기</Button>
// <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="코난위키">
//   {navItems.map((item) => (
//     <a
//       key={item.href}
//       href={item.href}
//       className="px-3.5 py-3 rounded-[10px] text-sm font-bold text-foreground no-underline hover:bg-info-bg hover:text-primary"
//     >
//       {item.label}
//     </a>
//   ))}
// </Drawer>
//
// 체크리스트
// - Dialog/Modal과 동일하게 포커스 트랩·Escape·스크롤 잠금·포커스 복귀 전부 적용됨
//   (원본은 배경 클릭 닫기만 있었음)
// - 주로 모바일 내비게이션 메뉴로 쓰이니, 안에 넣는 링크 목록엔 <nav> 시맨틱을
//   추가로 고려해볼 수 있습니다 (필요하면 children으로 Sidebar 컴포넌트를 그대로 넣어도 됨)
