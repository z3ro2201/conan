"use client";

import cn from "@/lib/utils/cn";
import { useState } from "react";
import { Icon } from "./icon";
import { Button, IconButton } from "./button";

// ===== 프로모션 배너 =====

interface PromoBannerProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function PromoBanner({ title, description, actionLabel, onAction, className }: PromoBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 flex-wrap rounded-2xl px-7 py-6 text-white",
        "bg-gradient-to-br from-primary to-primary-dark",
        className,
      )}
    >
      <div>
        <div className="font-black text-lg mb-1">{title}</div>
        {description && <div className="text-[13px] opacity-85">{description}</div>}
      </div>
      {actionLabel && (
        <Button variant="secondary" size="sm" onClick={onAction} className="bg-white text-primary shrink-0">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// ===== 닫기 가능한 알림 배너 =====

interface DismissibleBannerProps {
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

// role="status"로 등장 자체를 스크린리더가 인지할 수 있게 함. 닫힘은 사용자가
// 직접 누른 결과라 별도 aria-live 안내는 불필요(자기가 한 행동의 결과는 이미 알고 있음).
export function DismissibleBanner({ children, onDismiss, className }: DismissibleBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="status"
      className={cn("flex items-center justify-between gap-3 bg-info-bg rounded-xl px-[18px] py-3.5", className)}
    >
      <span className="text-[13px] font-bold text-info flex items-center gap-2">
        <Icon name="bell" size={14} className="shrink-0" />
        {children}
      </span>
      <IconButton
        icon={<Icon name="close" size={13} />}
        aria-label="배너 닫기"
        size="sm"
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
        className="bg-transparent text-info hover:bg-primary/10"
      />
    </div>
  );
}

// ===== 사용 예시 =====
//
// <PromoBanner
//   title="이 주의 추천 문서 공개!"
//   description="사건 EP.851 완전 정리 문서를 확인해보세요."
//   actionLabel="보러 가기"
//   onAction={() => router.push('/case/851')}
// />
//
// <DismissibleBanner onDismiss={() => localStorage.setItem('bannerDismissed', '1')}>
//   로그인 없이도 편집 내용이 즉시 반영됩니다.
// </DismissibleBanner>
