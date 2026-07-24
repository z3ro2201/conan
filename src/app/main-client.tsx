"use client";

import { useState } from "react";
import { Nav } from "@/components/ui/nav";
import { SearchBar } from "@/components/ui/search-bar";
import { NotificationBell } from "@/components/ui/notification-bell";
import { UserMenu } from "@/components/ui/user-menu";
import { DarkModeToggleWithIcons } from "@/components/ui/dark-mode-toggle";
import { DismissibleBanner } from "@/components/ui/banner";
import { Card, CardIcon, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

// 원본 코난위키 메인 시안 중 "VARIANT A: 나무위키풍 카드 그리드" 구조를 UI킷 컴포넌트로 재구성.
// 히어로 배너 → 카테고리 카드 그리드 → 최근 수정/인기 문서/활발한 토론 3단 레이아웃.

const NAV_ITEMS = [
  { label: "홈", href: "/", active: true },
  { label: "인물", href: "/character" },
  { label: "사건", href: "/case" },
  { label: "조직", href: "/org" },
];

const CATEGORIES = [
  { label: "인물", glyph: "人", tone: "primary" as const, count: 214 },
  { label: "사건/에피소드", glyph: "事", tone: "danger" as const, count: 388 },
  { label: "범죄조직", glyph: "組", tone: "primary" as const, count: 47 },
  { label: "극장판", glyph: "劇", tone: "warning" as const, count: 26 },
  { label: "트리비아", glyph: "?", tone: "success" as const, count: 132 },
  { label: "연표", glyph: "年", tone: "warning" as const, count: 18 },
  { label: "떡밥/추리이론", glyph: "推", tone: "danger" as const, count: 76 },
  { label: "음악", glyph: "♪", tone: "success" as const, count: 54 },
];

const RECENT_EDITS = [
  { tag: "문서", title: "명탐정 OOO", editor: "익명탐정42", time: "3분 전", summary: "EP.851 내용 추가" },
  { tag: "조직", title: "검은 조직 코드명 목록", editor: "나비넥타이덕후", time: "18분 전", summary: "오타 수정" },
  { tag: "사건", title: "사건 EP.849 정리", editor: "추리광", time: "41분 전", summary: "떡밥 섹션 추가" },
  { tag: "극장판", title: "극장판 시리즈 총정리", editor: "익명탐정07", time: "1시간 전", summary: "표 정리" },
  { tag: "인물", title: "탐정단 인물관계도", editor: "코난덕후", time: "2시간 전", summary: "오류 수정 및 되돌림" },
  { tag: "음악", title: "OST 앨범 연대기", editor: "음악탐정", time: "3시간 전", summary: "신규 항목 추가" },
];

const POPULAR_DOCS = [
  { rank: 1, title: "명탐정 OOO 정체 떡밥 총정리", views: "18.2만" },
  { rank: 2, title: "검은 조직 코드명 목록", views: "15.7만" },
  { rank: 3, title: "사건 EP.851 완전 정리", views: "12.1만" },
  { rank: 4, title: "탐정단 인물관계도", views: "9.8만" },
  { rank: 5, title: "극장판 시리즈 총정리", views: "8.4만" },
];

const HOT_THREADS = [
  { title: "범인이 진짜 그 사람 맞아?? 근거 토론", replies: 89, time: "5분 전" },
  { title: "EP.851 떡밥 해석 다르게 봄", replies: 54, time: "22분 전" },
  { title: "극장판 신작 예상 시나리오", replies: 31, time: "1시간 전" },
];

export default function MainClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSpoilerBanner, setShowSpoilerBanner] = useState(true);

  const allTitles = [...RECENT_EDITS.map((r) => r.title), ...POPULAR_DOCS.map((p) => p.title)];
  const suggestions = searchQuery ? allTitles.filter((t) => t.includes(searchQuery)).slice(0, 5) : [];

  return (
    <div className="min-h-screen bg-background">
      {showSpoilerBanner && (
        <div className="bg-[#1B1F2A] text-[#FFE9A8] text-sm font-bold text-center px-4 py-2 flex items-center justify-center gap-2.5 flex-wrap">
          <span>⚠ 이 사이트는 최신 에피소드 스포일러를 포함할 수 있어요! 문서 내 [스포일러] 표시를 확인하세요.</span>
          <button
            type="button"
            onClick={() => setShowSpoilerBanner(false)}
            className="bg-transparent border border-[#FFE9A8] text-[#FFE9A8] rounded-full px-3 py-0.5 text-xs font-bold cursor-pointer"
          >
            닫기
          </button>
        </div>
      )}

      {/* ===== 헤더 ===== */}
      <header className="sticky top-0 z-50 border-b-[3px] border-primary bg-surface px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-6">
          <span className="font-black text-lg text-primary shrink-0">
            코난위키 <span className="text-danger">FAN</span>
          </span>
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
            notifications={[{ id: "n1", text: "나비넥타이덕후님이 댓글을 남겼어요", time: "5분 전", read: false }]}
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

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        {/* ===== 히어로 배너 ===== */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white px-9 py-10 mb-7">
          <div aria-hidden="true" className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-danger/25" />
          <div className="relative max-w-[560px]">
            <Typography variant="h1" className="text-white text-[34px] mb-2">
              모두가 함께 만드는
              <br />
              명탐정 코난 정보위키
            </Typography>
            <p className="text-[15px] opacity-85 mb-4">
              인물 · 사건 · 조직 · 극장판 · 떡밥까지, 로그인 없이 누구나 바로 수정할 수 있어요!
            </p>
            <div className="flex gap-2.5 flex-wrap">
              <Button variant="danger">+ 새 문서 작성하기</Button>
              <Button variant="secondary" className="bg-white/15 text-white border-2 border-white/40 hover:bg-white/25">
                토론 둘러보기
              </Button>
            </div>
          </div>
        </div>

        {/* ===== 카테고리 카드 그리드 ===== */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3 mb-8">
          {CATEGORIES.map((cat) => (
            <Card key={cat.label} liftOnHover className="text-center cursor-pointer">
              <CardIcon tone={cat.tone} className="mx-auto">
                {cat.glyph}
              </CardIcon>
              <CardTitle className="mb-0">{cat.label}</CardTitle>
              <CardDescription>문서 {cat.count}개</CardDescription>
            </Card>
          ))}
        </div>

        {/* ===== 3단 레이아웃: 최근 수정 / 인기 문서 / 활발한 토론 ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-start">
          <Card>
            <Typography variant="h4" className="text-primary mb-3.5">
              📝 최근 수정된 문서
            </Typography>
            <ul className="list-none m-0 p-0">
              {RECENT_EDITS.map((edit) => (
                <li key={edit.title} className="flex items-center gap-3 py-3 border-b border-border last:border-none">
                  <span className="w-[34px] h-[34px] rounded-lg bg-info-bg text-primary font-bold text-xs flex items-center justify-center shrink-0">
                    {edit.tag}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-foreground truncate">{edit.title}</div>
                    <div className="text-xs text-muted-light">
                      {edit.editor} · {edit.time} · {edit.summary}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0">
                    되돌리기
                  </Button>
                </li>
              ))}
            </ul>
          </Card>

          <div className="flex flex-col gap-5">
            <Card>
              <Typography variant="h4" className="text-danger mb-3.5">
                🔥 인기 문서 TOP5
              </Typography>
              <ul className="list-none m-0 p-0">
                {POPULAR_DOCS.map((doc) => (
                  <li key={doc.rank} className="flex items-center gap-2.5 py-2.5 cursor-pointer">
                    <span className="font-black text-base text-danger w-5">{doc.rank}</span>
                    <span className="text-[13px] font-semibold text-foreground flex-1">{doc.title}</span>
                    <span className="text-[11px] text-muted-light">조회 {doc.views}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <Typography variant="h4" className="text-primary mb-3.5">
                💬 활발한 토론
              </Typography>
              <ul className="list-none m-0 p-0">
                {HOT_THREADS.map((th) => (
                  <li key={th.title} className="py-2.5 border-b border-border last:border-none cursor-pointer">
                    <div className="text-[13px] font-bold text-foreground">{th.title}</div>
                    <div className="text-[11px] text-muted-light mt-0.5">
                      댓글 {th.replies} · {th.time}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
