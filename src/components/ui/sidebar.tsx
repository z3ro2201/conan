import cn from "@/lib/utils/cn";
import { NavItem } from "./nav";

interface SidebarProps {
  items: NavItem[];
  "aria-label": string;
  className?: string;
}

function sidebarItemClasses(active?: boolean) {
  return cn(
    "block w-full text-left font-bold text-[13px] px-3 py-2.5 rounded-lg cursor-pointer transition-colors no-underline",
    "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    active
      ? "bg-surface text-primary shadow-[0_1px_4px_rgba(20,30,60,0.1)]"
      : "bg-transparent text-muted hover:text-foreground",
  );
}

// Nav와 같은 NavItem 타입을 쓰지만 세로 배치. 콘텐츠 영역과의 그리드 레이아웃은
// 컴포넌트 안에 강제하지 않고 사용하는 쪽(예: 설정 페이지)에서 직접 짜도록 열어뒀습니다 —
// 사이드바 하나로 그리드/2단 레이아웃/드로어 등 여러 맥락에 재사용하기 위해서.
export function Sidebar({ items, className, ...props }: SidebarProps) {
  return (
    <nav aria-label={props["aria-label"]} className={cn("bg-background p-3.5", className)}>
      <ul className="flex flex-col gap-1 list-none m-0">
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <a
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={sidebarItemClasses(item.active)}
              >
                {item.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                aria-current={item.active ? "page" : undefined}
                className={sidebarItemClasses(item.active)}
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
// <div className="grid grid-cols-[180px_1fr] gap-4 border border-border rounded-2xl overflow-hidden">
//   <Sidebar
//     aria-label="설정 메뉴"
//     items={[
//       { label: '홈', href: '/settings', active: true },
//       { label: '인물', href: '/settings/character' },
//       { label: '사건', href: '/settings/case' },
//       { label: '설정', href: '/settings/preferences' },
//     ]}
//   />
//   <div className="p-5 text-sm text-muted">선택된 섹션의 콘텐츠 영역</div>
// </div>
//
// 체크리스트 (Nav와 동일)
// - href 있으면 <a>, 페이지 이동 없이 필터만 바꾸면 onClick 버튼
// - active 항목엔 aria-current="page"
