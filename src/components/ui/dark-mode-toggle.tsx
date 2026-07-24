"use client";

import { useEffect, useState } from "react";
import cn from "@/lib/utils/cn";
import { Switch } from "./switch";
import { Icon } from "./icon";

const STORAGE_KEY = "theme";

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    // 시크릿 모드 등 localStorage 접근이 막힌 환경 — 조용히 무시 (테마 저장만 안 될 뿐 앱은 정상 동작)
  }
}

interface DarkModeToggleProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function DarkModeToggle({ size = "md", className }: DarkModeToggleProps) {
  // 서버 렌더링 시점엔 document가 없어서 항상 false로 시작 — 실제 값은 마운트 후
  // useEffect에서 <html>에 이미 붙어있는 클래스를 읽어와 동기화합니다.
  // (그 클래스는 아래 <head> 인라인 스크립트가 hydration 이전에 미리 붙여둔 것이라
  //  페이지 배경 자체는 깜빡이지 않고, 이 스위치의 손잡이 위치만 마운트 직후 한 번 맞춰집니다.)
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = (next: boolean) => {
    setDark(next);
    applyTheme(next);
  };

  return (
    <Switch
      checked={dark}
      onChange={toggle}
      size={size}
      aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className={className}
    />
  );
}

// 텍스트 라벨 대신 해/달 아이콘을 스위치 양옆에 두고 싶다면:
// (아이콘을 Switch의 label 슬롯에 넣지 않는 이유: label 콘텐츠가 곧 접근 가능한 이름이 되는데,
//  아이콘만 있고 텍스트가 없으면 그 이름이 빈 값이 됩니다 — 그래서 아이콘은 순수 장식으로
//  옆에 따로 두고, 접근 가능한 이름은 그대로 aria-label로 전달합니다.)
export function DarkModeToggleWithIcons({ size = "md", className }: DarkModeToggleProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = (next: boolean) => {
    setDark(next);
    applyTheme(next);
  };

  const iconSize = size === "sm" ? 12 : size === "lg" ? 16 : 14;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Icon name="sun" size={iconSize} aria-hidden="true" className={dark ? "text-muted-light" : "text-warning"} />
      <Switch
        checked={dark}
        onChange={toggle}
        size={size}
        aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      />
      <Icon name="moon" size={iconSize} aria-hidden="true" className={dark ? "text-primary" : "text-muted-light"} />
    </div>
  );
}

// ===== 사용 예시 =====
//
// <DarkModeToggle />
// <DarkModeToggle size="sm" />
// <DarkModeToggleWithIcons size="sm" />
//
// ===== 필수: 페이지 깜빡임(FOUC) 방지 스크립트 =====
//
// React가 hydrate되기 전, 첫 페인트 시점에 이미 .dark 클래스가 붙어있어야
// "잠깐 흰 화면 → 다크로 전환" 같은 깜빡임이 안 생깁니다.
// app/layout.tsx의 <head> 안(children보다 위)에 아래를 그대로 추가하세요:
//
// <script
//   dangerouslySetInnerHTML={{
//     __html: `
//       try {
//         const theme = localStorage.getItem('theme');
//         const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//         if (theme === 'dark' || (!theme && prefersDark)) {
//           document.documentElement.classList.add('dark');
//         }
//       } catch (_) {}
//     `,
//   }}
// />
//
// 체크리스트
// - 이 스크립트가 없으면: 저장된 테마가 다크여도 페이지가 항상 라이트로 먼저 그려졌다가
//   React가 로드된 뒤에야 다크로 바뀌는 깜빡임(FOUC)이 생김
// - 스위치 자체의 초기 상태는 useEffect에서 동기화 — 서버와 클라이언트의 첫 렌더가
//   항상 같아야 하는 React hydration 규칙 때문에 document를 useState 초기값에서 바로 읽으면 안 됨
