"use client";

import cn from "@/lib/utils/cn";
import { useState } from "react";
import { Avatar } from "./avatar";
import { Button } from "./button";

export interface CommentData {
  id: string;
  author: string;
  initials: string;
  avatarTone?: "primary" | "danger" | "ink" | "purple";
  time: string;
  text: string;
  replies?: CommentData[];
}

interface CommentThreadProps {
  comments: CommentData[];
  onReply?: (parentId: string, text: string) => void;
  className?: string;
}

export function CommentThread({ comments, onReply, className }: CommentThreadProps) {
  return (
    <div className={cn("max-w-[480px] flex flex-col gap-5", className)}>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} onReply={onReply} />
      ))}
    </div>
  );
}

function Comment({
  comment,
  onReply,
  depth = 0,
}: {
  comment: CommentData;
  onReply?: (parentId: string, text: string) => void;
  depth?: number;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  const submitReply = () => {
    if (!replyText.trim()) return;
    onReply?.(comment.id, replyText);
    setReplyText("");
    setReplyOpen(false);
  };

  return (
    <div className={cn("flex gap-2.5", depth > 0 && "mt-2 pl-4 border-l-2 border-border/60")}>
      <Avatar
        initials={comment.initials}
        tone={comment.avatarTone}
        size={depth > 0 ? "xs" : "sm"}
        className="shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="text-[13px]">
          <span className="font-bold text-foreground">{comment.author}</span>{" "}
          <span className="text-muted-light text-[11px]">· {comment.time}</span>
        </div>
        <div className="text-[13px] text-muted mt-1 leading-relaxed">{comment.text}</div>

        {depth === 0 && (
          <button
            type="button"
            onClick={() => setReplyOpen((v) => !v)}
            aria-expanded={replyOpen}
            className="text-xs font-bold text-muted-light bg-transparent border-none cursor-pointer py-1.5 outline-none focus-visible:underline"
          >
            답글달기
          </button>
        )}

        {replyOpen && (
          <div className="flex gap-2 mt-1.5 mb-2.5">
            <label className="sr-only" htmlFor={`reply-${comment.id}`}>
              {comment.author}님에게 답글
            </label>
            <input
              id={`reply-${comment.id}`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitReply()}
              placeholder="답글을 입력하세요"
              className="flex-1 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary"
            />
            <Button variant="primary" size="sm" onClick={submitReply}>
              등록
            </Button>
          </div>
        )}

        {comment.replies?.map((reply) => (
          <Comment key={reply.id} comment={reply} onReply={onReply} depth={depth + 1} />
        ))}
      </div>
    </div>
  );
}

// ===== 사용 예시 =====
//
// <CommentThread
//   comments={[
//     {
//       id: 'c1', author: '추리광', initials: '추', time: '5분 전',
//       text: '지난 화 마지막 장면 다시 보니까 복선이 있었던 것 같은데 다들 어떻게 생각해?',
//       replies: [
//         { id: 'c1-1', author: '나비넥타이덕후', initials: '나', avatarTone: 'danger', time: '3분 전', text: '오 그거 나도 느낌! 다시보기 해봐야겠다' },
//       ],
//     },
//   ]}
//   onReply={(parentId, text) => postReply(parentId, text)}
// />
//
// 체크리스트
// - 답글 입력창의 label은 "OO님에게 답글"처럼 대상이 누군지 sr-only로 명확히 함
//   (여러 댓글에 답글창이 동시에 열려있을 때 "답글 입력"이라고만 하면 어느 댓글에 대한 건지 헷갈림)
// - depth로 중첩 깊이를 관리하되, 답글달기 버튼은 depth 0(최상위 댓글)에만 노출 —
//   대댓글의 대댓글까지 무한히 허용하면 UI가 옆으로 한없이 밀려남
