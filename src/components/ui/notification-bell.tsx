"use client";

import cn from "@/lib/utils/cn";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./icon";

export interface NotificationItem {
  id: string;
  text: string;
  time: string;
  read?: boolean;
  href?: string;
}

interface NotificationBellProps {
  notifications: NotificationItem[];
  onItemClick?: (item: NotificationItem) => void;
  className?: string;
}

export function NotificationBell({ notifications, onItemClick, className }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!popoverRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className={cn("relative w-fit", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `알림, 읽지 않음 ${unreadCount}개` : "알림"}
        onClick={() => setOpen((v) => !v)}
        className="relative w-[42px] h-[42px] rounded-full bg-border/60 text-muted flex items-center justify-center cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
      >
        <Icon name="bell" size={18} />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="region"
          aria-label="알림 목록"
          className="absolute top-full mt-1.5 left-0 w-[280px] bg-surface border border-border rounded-2xl shadow-[0_12px_28px_rgba(20,30,60,0.14)] overflow-hidden z-20"
        >
          <div className="px-4 py-3.5 font-bold text-[13px] text-foreground border-b border-border">알림</div>
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted-light">새 알림이 없어요</div>
          ) : (
            <ul className="list-none m-0 p-0">
              {notifications.map((n) => (
                <li key={n.id} className="border-b border-border/60 last:border-none">
                  <button
                    type="button"
                    onClick={() => onItemClick?.(n)}
                    className={cn("w-full text-left px-4 py-3 cursor-pointer", !n.read && "bg-info-bg/40")}
                  >
                    <div className="text-xs text-foreground">{n.text}</div>
                    <div className="text-[11px] text-muted-light mt-0.5">{n.time}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <NotificationBell
//   notifications={[
//     { id: '1', text: '나비넥타이덕후님이 댓글을 남겼어요', time: '5분 전', read: false },
//     { id: '2', text: '문서가 수정되었어요', time: '1시간 전', read: true },
//   ]}
//   onItemClick={(n) => router.push(`/notifications/${n.id}`)}
// />
//
// 체크리스트
// - 벨 버튼의 aria-label에 읽지 않은 개수를 문장으로 포함 ("알림, 읽지 않음 3개") —
//   뱃지 숫자(원본의 빨간 동그라미)는 시각 정보뿐이라 그대로 두면 스크린리더가 놓침
