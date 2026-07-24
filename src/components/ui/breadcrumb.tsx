import cn from "@/lib/utils/cn";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

// 마지막 항목은 href 유무와 상관없이 "현재 페이지"로 취급 (링크가 있어도 자기 자신으로 이동시키지 않음).
// nav > ol 구조로 감싸는 이유: 스크린리더가 이걸 "탐색 랜드마크"로 인식해서
// 원하면 바로 건너뛸 수 있게 하기 위함 (breadcrumb 하나하나를 다 들을 필요 없게).

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="이동 경로" className={className}>
      <ol className={cn("flex items-center gap-1.5 text-[13px]")}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={index}>
              <li className="flex items-center gap-1.5">
                {isLast || !item.href ? (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={cn("font-bold", isLast ? "text-primary" : "text-muted")}
                  >
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.href}
                    className={cn(
                      "font-bold text-muted no-underline hover:text-primary hover:underline",
                      "outline-none rounded focus-visible:ring-2 focus-visible:ring-primary/50",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    )}
                  >
                    {item.label}
                  </a>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className="select-none">
                  <span className="text-muted-light/70">/</span>
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// ===== 사용 예시 =====
//
// <Breadcrumb
//   items={[
//     { label: '홈', href: '/' },
//     { label: '인물', href: '/character' },
//     { label: '명탐정 OOO' }, // 마지막 항목은 href 없어도 되고, 있어도 현재 페이지로 처리됨
//   ]}
// />
//
// Next.js 프로젝트라면 <a> 자리를 next/link의 <Link>로 바꿔서 쓰시면 됩니다
// (LinkButton 때와 같은 이유 — prefetch 이점, 클라이언트 라우팅).
//
// 체크리스트
// - nav로 감싸고 aria-label을 붙인 이유: 스크린리더의 "랜드마크 목록"에 잡혀서
//   원하면 브레드크럼 전체를 건너뛰고 본문으로 바로 이동할 수 있게 하기 위함
// - 마지막(현재 페이지) 항목은 링크가 아니라 <span> + aria-current="page" —
//   지금 보고 있는 페이지로 다시 이동하는 링크는 의미가 없고, aria-current가
//   "이게 현재 위치"라는 걸 스크린리더에 명확히 알려줌
// - "/" 구분자는 순수 장식이라 aria-hidden 처리 (screen reader가 "슬래시"라고
//   매번 읽어주면 오히려 방해됨)
