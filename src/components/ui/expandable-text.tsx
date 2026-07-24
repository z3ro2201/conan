"use client";

import { useId, useState } from "react";

interface ExpandableTextProps {
  text: string;
  moreText: string;
  className?: string;
}

// 원본의 "확장형 링크"를 실제 <button>으로 재구현. 원본은 <a href="javascript:void(0)">를
// 눌러서 텍스트를 펼치는 방식이었는데, 페이지 이동이 없는 동작에 <a>를 쓰면 스크린리더가
// "링크"라고 안내해서 실제 동작(버튼처럼 뭔가를 토글함)과 어긋납니다 → <button>이 맞습니다.

export function ExpandableText({ text, moreText, className }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();

  return (
    <div className={className}>
      <p id={id} className="text-[13px] text-muted leading-relaxed mb-1.5">
        {text}
        {expanded && <span> {moreText}</span>}
      </p>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded((v) => !v)}
        className="text-primary font-bold text-[13px] bg-transparent border-none cursor-pointer p-0 outline-none focus-visible:underline"
      >
        {expanded ? "접기 ▲" : "더보기 ▼"}
      </button>
    </div>
  );
}

// ===== 사용 예시 =====
//
// <ExpandableText
//   text="이 문서는 예시 구조 확인용 텍스트입니다."
//   moreText="로그인 없이 누구나 즉시 수정·삭제할 수 있으며, 문서별 토론과 전체 토론 게시판을 함께 제공합니다."
// />
//
// ===== 링크 색상 (컴포넌트 아님, 유틸리티 클래스로 바로 사용) =====
//
// <a href="..." className="text-primary no-underline hover:underline">기본 링크</a>
// <a href="..." className="text-danger no-underline hover:underline">위험 링크</a>
// <a href="..." className="text-success no-underline hover:underline">완료 링크</a>
// <a href="..." className="text-muted-light no-underline">방문한 링크</a>
//
// // 아이콘 링크
// <a href="..." className="text-primary no-underline inline-flex items-center gap-1.5">
//   <Icon name="search" size={14} /> 문서 검색
// </a>
// <a href="..." target="_blank" rel="noopener noreferrer" className="text-primary no-underline inline-flex items-center gap-1.5">
//   외부 링크 <Icon name="arrow-right" size={13} className="-rotate-45" />
// </a>
//
// 체크리스트
// - 페이지 이동이 없는 토글 동작엔 <a href="javascript:void(0)">가 아니라 <button> —
//   원본의 다른 곳(빈 href 링크)들도 실제로는 대부분 이 원칙 적용 대상입니다
// - 외부 링크는 target="_blank" rel="noopener noreferrer" 세트로 (새 탭이 이전 페이지를
//   window.opener로 조작할 수 있는 보안 허점을 막음)
