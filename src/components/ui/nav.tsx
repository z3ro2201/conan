import cn from "@/lib/utils/cn";

// Nav/Sidebar 공용 아이템 타입.
// href가 있으면 실제 페이지 이동 링크로, 없으면 (onClick만 있으면) 같은 페이지 안에서
// 섹션/필터를 바꾸는 버튼으로 렌더링됩니다. 실제 사이트 내비게이션은 대부분 href가 있는 게 맞고,
// href 없는 쪽은 "탭처럼 보이지만 페이지 이동은 아닌" 특수 케이스용입니다.
export interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

interface NavProps {
  items: NavItem[];
  /** 페이지에 nav가 여러 개 있을 수 있어서(사이드바 nav 등) 필수로 구분자를 줌 */
  "aria-label": string;
  className?: string;
}

function navItemClasses(active?: boolean) {
  return cn(
    "font-bold text-[13px] px-4 py-2 rounded-lg whitespace-nowrap cursor-pointer transition-colors no-underline",
    "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    active
      ? "bg-surface text-primary shadow-[0_1px_4px_rgba(20,30,60,0.12)]"
      : "bg-transparent text-muted hover:text-foreground",
  );
}

export function Nav({ items, className, ...props }: NavProps) {
  return (
    <nav aria-label={props["aria-label"]} className={className}>
      <ul className="flex gap-1 bg-background p-1.5 rounded-xl w-fit overflow-x-auto list-none m-0">
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <a
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={navItemClasses(item.active)}
              >
                {item.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                aria-current={item.active ? "page" : undefined}
                className={navItemClasses(item.active)}
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ===== 사용 예시 =====
//
// <Nav
//   aria-label="주요 메뉴"
//   items={[
//     { label: '홈', href: '/', active: pathname === '/' },
//     { label: '인물', href: '/character', active: pathname === '/character' },
//     { label: '사건', href: '/case' },
//   ]}
// />
//
// Next.js 프로젝트라면 <a> 자리를 next/link의 <Link>로 바꾸는 걸 추천 (LinkButton과 같은 이유).
//
// 체크리스트
// - href가 있으면 실제 페이지 이동 → <a> (아니면 Ctrl+클릭으로 새 탭 못 엶, 스크린리더가 "버튼"으로 오인)
// - active 항목엔 aria-current="page" — 시각적으로 강조된 것뿐 아니라
//   "지금 여기 있다"는 걸 스크린리더에도 알려줌
