"use client";

import cn from "@/lib/utils/cn";
import { useState } from "react";

interface VoteProps {
  initialCount?: number;
  label?: string;
  onVoteChange?: (count: number, state: "up" | "down" | null) => void;
  className?: string;
}

// 원본의 토글 로직 그대로: 같은 버튼을 다시 누르면 취소, 반대쪽을 누르면 한 번에 전환
// (예: 추천 상태에서 비추천 누르면 -2 만큼 변화). count는 aria-live로 변경을 알림 —
// 버튼을 누를 때마다 바뀌는 숫자를 시각적으로만 보여주면 스크린리더 사용자가 못 따라감.

export function Vote({ initialCount = 0, label = "이 댓글이 도움이 되었나요?", onVoteChange, className }: VoteProps) {
  const [count, setCount] = useState(initialCount);
  const [state, setState] = useState<"up" | "down" | null>(null);

  const vote = (direction: "up" | "down") => {
    let nextCount = count;
    let nextState: "up" | "down" | null = direction;

    if (state === direction) {
      nextState = null;
      nextCount = direction === "up" ? count - 1 : count + 1;
    } else {
      const delta = state !== null ? 2 : 1;
      nextCount = direction === "up" ? count + delta : count - delta;
    }

    setCount(nextCount);
    setState(nextState);
    onVoteChange?.(nextCount, nextState);
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <button
        type="button"
        aria-label="추천"
        aria-pressed={state === "up"}
        onClick={() => vote("up")}
        className={cn(
          "w-9 h-9 rounded-[10px] flex items-center justify-center text-sm cursor-pointer transition-colors",
          "outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
          state === "up" ? "bg-primary text-white" : "bg-border text-muted hover:bg-border/70",
        )}
      >
        ▲
      </button>
      <div aria-live="polite" className="font-black text-lg text-foreground w-8 text-center">
        {count}
      </div>
      <button
        type="button"
        aria-label="비추천"
        aria-pressed={state === "down"}
        onClick={() => vote("down")}
        className={cn(
          "w-9 h-9 rounded-[10px] flex items-center justify-center text-sm cursor-pointer transition-colors",
          "outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
          state === "down" ? "bg-danger text-white" : "bg-border text-muted hover:bg-border/70",
        )}
      >
        ▼
      </button>
      {label && <span className="text-xs text-muted-light ml-1">{label}</span>}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Vote initialCount={24} onVoteChange={(count, state) => saveVote(commentId, state)} />
