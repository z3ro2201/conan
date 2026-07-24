"use client";

import { useState } from "react";
import { Nav } from "@/components/ui/nav";
import { SearchBar } from "@/components/ui/search-bar";
import { NotificationBell } from "@/components/ui/notification-bell";
import { UserMenu } from "@/components/ui/user-menu";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Vote } from "@/components/ui/vote";
import { Tabs } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import { Mark } from "@/components/ui/mark";
import { ImageBox } from "@/components/ui/image-box";
import { Box } from "@/components/ui/box";
import { Accordion } from "@/components/ui/accordion";
import { DiffViewer } from "@/components/ui/diff-viewer";
import { Timeline } from "@/components/ui/timeline";
import { CommentThread, type CommentData } from "@/components/ui/comment-thread";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import { TocRail } from "@/components/ui/toc";
import { CardCarousel } from "@/components/ui/card-carousel";
import { Pagination } from "@/components/ui/pagination";
import { Divider } from "@/components/ui/divider";
import { DarkModeToggleWithIcons } from "@/components/ui/dark-mode-toggle";

// 지금까지 만든 UI킷 컴포넌트들을 실제로 조합하면 어떤 모습이 되는지 보여주는 예시 페이지.
// "코난위키"에 있을 법한 인물 문서 하나를 가정해서 구성했습니다 — 모든 컴포넌트를
// 억지로 다 욱여넣기보다, 실제 문서 페이지라면 자연스럽게 쓰일 조합 위주로 골랐습니다.

const TOC_ITEMS = [
  { id: "overview", label: "개요" },
  { id: "identity", label: "정체", level: 2 },
  { id: "spoiler", label: "스포일러 정보" },
  { id: "discussion", label: "토론" },
];

const NAV_ITEMS = [
  { label: "홈", href: "/", active: false },
  { label: "인물", href: "/character", active: true },
  { label: "사건", href: "/case" },
  { label: "조직", href: "/org" },
];

const RELATED_CARDS = [
  { label: "검은 조직 코드명 목록" },
  { label: "탐정단 인물관계도" },
  { label: "사건 EP.849 정리" },
  { label: "경시청 인물 목록" },
  { label: "극장판 목록" },
];

const INITIAL_COMMENTS: CommentData[] = [
  {
    id: "c1",
    author: "추리광",
    initials: "추",
    time: "5분 전",
    text: "지난 화 마지막 장면 다시 보니까 복선이 있었던 것 같은데 다들 어떻게 생각해?",
    replies: [
      {
        id: "c1-1",
        author: "나비넥타이덕후",
        initials: "나",
        avatarTone: "danger",
        time: "3분 전",
        text: "오 그거 나도 느낌! 다시보기 해봐야겠다",
      },
    ],
  },
];

export default function CharacterExamplePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentPage, setCommentPage] = useState(1);

  const allTitles = ["명탐정 OOO", "검은 조직 코드명 목록", "사건 EP.851 완전 정리", "탐정단 인물관계도"];
  const suggestions = searchQuery ? allTitles.filter((t) => t.includes(searchQuery)).slice(0, 5) : [];

  const addReply = (parentId: string, text: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? {
              ...c,
              replies: [
                ...(c.replies ?? []),
                { id: `${parentId}-${Date.now()}`, author: "나", initials: "나", time: "방금", text },
              ],
            }
          : c,
      ),
    );
  };

  const addTopLevelComment = () => {
    if (!commentDraft.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, author: "나", initials: "나", time: "방금", text: commentDraft },
    ]);
    setCommentDraft("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ===== 상단 헤더 ===== */}
      <header className="border-b border-border bg-surface px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-6">
          <span className="font-black text-lg text-primary shrink-0">코난위키</span>
          <Nav aria-label="주요 메뉴" items={NAV_ITEMS} />
        </div>
        <div className="flex items-center gap-3">
          <SearchBar
            aria-label="문서 검색"
            value={searchQuery}
            onChange={setSearchQuery}
            suggestions={suggestions}
            onSelect={(title) => setSearchQuery(title)}
            className="w-[260px]"
          />
          <NotificationBell
            notifications={[
              { id: "n1", text: "나비넥타이덕후님이 댓글을 남겼어요", time: "5분 전", read: false },
              { id: "n2", text: "문서가 수정되었어요", time: "1시간 전", read: true },
            ]}
          />
          <DarkModeToggleWithIcons size="sm" />
          <UserMenu
            name="추리광"
            initials="추"
            items={[
              { label: "내 프로필", onClick: () => {} },
              { label: "설정", onClick: () => {} },
              { label: "로그아웃", onClick: () => {}, danger: true },
            ]}
          />
        </div>
      </header>

      {/* ===== 본문 ===== */}
      <main className="max-w-[1080px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-10">
        <div className="min-w-0">
          <Breadcrumb
            items={[{ label: "홈", href: "/" }, { label: "인물", href: "/character" }, { label: "명탐정 OOO" }]}
          />

          <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
            <PageHeader title="명탐정 OOO" subtitle="고등학생 탐정 · 214개 문서 중 · 최근 수정 3분 전" />
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="info">주요인물</Badge>
              <Badge variant="warning">스포일러</Badge>
            </div>
          </div>

          <div className="mt-4">
            <Vote initialCount={128} label="이 문서가 도움이 되었나요?" />
          </div>

          <div className="mt-7">
            <Tabs
              aria-label="문서 섹션"
              items={[
                { id: "overview", label: "개요", content: <OverviewSection /> },
                { id: "spoiler", label: "스포일러", content: <SpoilerSection /> },
                {
                  id: "discussion",
                  label: "토론",
                  content: (
                    <DiscussionSection
                      comments={comments}
                      onReply={addReply}
                      commentDraft={commentDraft}
                      setCommentDraft={setCommentDraft}
                      onSubmit={addTopLevelComment}
                      page={commentPage}
                      onPageChange={setCommentPage}
                    />
                  ),
                },
              ]}
            />
          </div>

          <Divider className="my-10" />

          <section aria-label="관련 문서">
            <Typography variant="h3" className="mb-4">
              관련 문서
            </Typography>
            <CardCarousel items={RELATED_CARDS} />
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <TocRail items={TOC_ITEMS} />
          </div>
        </aside>
      </main>
    </div>
  );
}

// ===== 탭별 콘텐츠 =====

function OverviewSection() {
  return (
    <div className="flex flex-col gap-6">
      <div id="overview">
        <Typography variant="body">
          진범은 <Mark>이 인물</Mark>일 가능성이 높으며, <Mark color="blue">알리바이</Mark>에 모순이 있다는 의견이
          커뮤니티에서 꾸준히 제기되고 있습니다.
        </Typography>
      </div>

      <div id="identity" className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[420px]">
        <ImageBox alt="명탐정 OOO 예시 이미지" caption="그림 1. 활동 초기 모습 (가상 이미지)" />
      </div>

      <Box variant="tint" role="note">
        이 문서는 특정 개인/단체를 지칭하지 않는 가상의 예시 콘텐츠입니다.
      </Box>

      <div>
        <Typography variant="h4" className="mb-2">
          자주 묻는 질문
        </Typography>
        <Accordion
          items={[
            { id: "a1", title: "이 인물의 정체는 무엇인가요?", content: "문서 내 스포일러 탭을 참고하세요." },
            {
              id: "a2",
              title: "스포일러 정책이 궁금해요",
              content: "스포일러는 별도 탭으로 분리되어 있으며 기본적으로 접혀 있습니다.",
            },
          ]}
        />
      </div>
    </div>
  );
}

function SpoilerSection() {
  return (
    <div className="flex flex-col gap-6">
      <Box variant="accent" role="note">
        ⚠ 이 섹션은 최신 사건의 결말을 포함하고 있습니다.
      </Box>

      <div>
        <Typography variant="h4" className="mb-2">
          변경 이력
        </Typography>
        <DiffViewer
          title="v12 → v13 변경사항"
          lines={[
            { type: "unchanged", text: "이 인물은 고등학생 탐정으로 활동하며," },
            { type: "removed", text: "첫 등장은 EP.001로 알려져 있다." },
            { type: "added", text: "첫 등장은 EP.001이며, 이후 다수의 극장판에도 출연했다." },
            { type: "unchanged", text: "현재까지 활발히 활동 중이다." },
          ]}
        />
      </div>

      <div>
        <Typography variant="h4" className="mb-3">
          연표
        </Typography>
        <Timeline
          items={[
            { year: "1994", title: "연재 시작", desc: "주간 소년 선데이에 첫 연재" },
            { year: "1996", title: "애니메이션 방영 시작" },
            { year: "2000", title: "첫 극장판 개봉" },
          ]}
        />
      </div>
    </div>
  );
}

function DiscussionSection({
  comments,
  onReply,
  commentDraft,
  setCommentDraft,
  onSubmit,
  page,
  onPageChange,
}: {
  comments: CommentData[];
  onReply: (parentId: string, text: string) => void;
  commentDraft: string;
  setCommentDraft: (v: string) => void;
  onSubmit: () => void;
  page: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 items-start">
        <TextField
          label="댓글 작성"
          placeholder="이 문서에 대한 의견을 남겨보세요"
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          className="flex-1"
        />
        <Button variant="primary" onClick={onSubmit} className="mt-[22px]">
          등록
        </Button>
      </div>

      <CommentThread comments={comments} onReply={onReply} />

      <Pagination currentPage={page} totalPages={6} onPageChange={onPageChange} showFirstLast={false} />
    </div>
  );
}
