"use client";

import cn from "@/lib/utils/cn";
import { useEffect, useRef } from "react";
import { Avatar } from "./avatar";

export interface MessageData {
  id: string;
  author: string;
  initials: string;
  avatarTone?: "primary" | "danger" | "ink" | "purple";
  text: string;
  /** 내가 보낸 메시지면 true → 오른쪽 정렬 + 강조색 */
  isOwn?: boolean;
}

// ===== 단일 메시지 =====

interface MessageProps {
  message: MessageData;
  className?: string;
}

export function Message({ message, className }: MessageProps) {
  return (
    <div className={cn("flex gap-2 items-start", message.isOwn && "flex-row-reverse", className)}>
      <Avatar initials={message.initials} tone={message.avatarTone} size="xs" className="shrink-0" />
      <div
        className={cn(
          "rounded-xl px-3 py-2 text-xs max-w-[75%]",
          message.isOwn
            ? "bg-info-bg text-foreground rounded-tr-[4px]"
            : "bg-border/60 text-foreground rounded-tl-[4px]",
        )}
      >
        {message.text}
      </div>
    </div>
  );
}

// ===== 스크롤되는 메시지 목록 =====

interface MessageScrollerProps {
  messages: MessageData[];
  height?: number;
  className?: string;
}

// role="log" + aria-live="polite": 채팅처럼 계속 추가되는 콘텐츠 목록에 ARIA가
// 마련해둔 전용 role. 새 메시지가 오면 스크린리더가 자동으로 읽어주고, 목록 전체를
// 매번 처음부터 다시 읽지 않아도 됩니다. 새 메시지가 오면 맨 아래로 자동 스크롤도 처리.

export function MessageScroller({ messages, height = 220, className }: MessageScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-live="polite"
      aria-label="대화 목록"
      style={{ height }}
      className={cn(
        "max-w-[420px] overflow-y-auto border border-border rounded-2xl p-3.5 flex flex-col gap-2.5",
        className,
      )}
    >
      {messages.map((m) => (
        <Message key={m.id} message={m} />
      ))}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Message message={{ id: '1', author: '나비넥타이덕후', initials: '나비', text: '이번 화 떡밥 대박이었어요!' }} />
//
// <MessageScroller
//   messages={[
//     { id: '1', author: '나비넥타이덕후', initials: '나비', text: '범인이 진짜 그 사람 맞아?' },
//     { id: '2', author: '추리광', initials: '추리', avatarTone: 'danger', text: '근거가 좀 부족한듯요', isOwn: true },
//   ]}
// />
