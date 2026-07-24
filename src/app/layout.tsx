import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "코난위키",
  description: "UI킷 예시 페이지",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* React가 hydrate되기 전, 첫 페인트 시점에 이미 .dark 클래스를 붙여서
            "잠깐 라이트로 그려졌다가 다크로 바뀌는" 깜빡임(FOUC)을 방지합니다.
            DarkModeToggle 컴포넌트와 반드시 짝을 이뤄야 하는 스크립트입니다. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
