import cn from "@/lib/utils/cn";

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

// 진짜 <kbd> 태그 사용 — "이건 키보드 입력을 나타내는 텍스트"라는 의미를 전달하는
// 시맨틱 요소입니다 (스크린리더가 일반 텍스트와 다르게 안내하지는 않지만, 검색엔진/
// 브라우저 확장 등 다른 도구들이 이 의미를 활용할 수 있음).

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-block bg-background border border-border border-b-2 rounded-md px-2 py-1",
        "font-mono text-xs text-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

// ===== 사용 예시 =====
//
// <div className="flex items-center gap-2 text-sm text-muted">
//   <Kbd>⌘</Kbd><span>+</span><Kbd>K</Kbd><span>로 명령 팔레트를 열어요</span>
// </div>
