"use client";

import cn from "@/lib/utils/cn";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Icon, IconName } from "./icon";

type ToastVariant = "success" | "warning" | "danger" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

const variantIcon: Record<ToastVariant, IconName> = {
  success: "check",
  warning: "bell",
  danger: "close",
  info: "bell",
};

// 원본은 토스트가 한 번에 하나만 뜨는 구조(전역 state 하나)였는데, 실제로는
// 연달아 여러 액션이 일어나면 토스트도 여러 개 쌓여야 자연스러워서 배열로 바꿨습니다.
// Provider를 앱 최상단(layout.tsx)에 한 번 감싸두면, 어디서든 useToast()로 띄울 수 있습니다.

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* aria-live="polite" + role="status"를 목록 전체에 한 번만 둠 —
          토스트마다 각각 role을 주면 스크린리더가 겹쳐서 안내할 수 있음 */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[250] flex flex-col gap-2 items-center"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 bg-[#22252E] text-white text-[13px] font-bold px-[22px] py-3.5 rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.25)]"
          >
            <Icon name={variantIcon[t.variant]} size={14} className={variantStyles[t.variant]} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast는 ToastProvider 안에서만 쓸 수 있습니다.");
  return ctx;
}

// ===== 사용 예시 =====
//
// // app/layout.tsx
// <ToastProvider>{children}</ToastProvider>
//
// // 아무 컴포넌트에서나
// const { showToast } = useToast();
// <Button onClick={() => showToast('변경사항이 저장되었습니다')}>저장</Button>
// <Button onClick={() => showToast('저장에 실패했어요', 'danger')}>실패 테스트</Button>
//
// 체크리스트
// - role="status" + aria-live="polite"를 토스트 목록 컨테이너 하나에만 둠
//   (개별 토스트마다 두면 스크린리더가 중복 안내하거나 순서가 꼬일 수 있음)
// - 2.6초 후 자동으로 사라짐 — 그 안에 다 못 읽는 사용자를 위해 danger/warning처럼
//   중요한 메시지는 Toast 대신 Alert(계속 남아있음)를 쓰는 걸 고려하세요
