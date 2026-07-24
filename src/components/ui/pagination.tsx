import cn from "@/lib/utils/cn";
import { Icon } from "./icon";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** 한쪽에 몇 개의 페이지 번호를 현재 페이지 옆에 보여줄지 (기본 1 → 예: … 4 [5] 6 …) */
  siblingCount?: number;
  /** "처음/끝 페이지로" 버튼 표시 여부 (기본 true) */
  showFirstLast?: boolean;
  "aria-label"?: string;
  className?: string;
}

type PageToken = number | "ellipsis";

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// 원본은 pageCount=5 고정이라 페이지가 많아지면 번호가 끝없이 늘어남.
// 위키처럼 문서/이력이 수백 페이지가 될 수 있는 경우를 위해 "가운데 생략" 로직을 추가.
// 예: 총 20페이지, 현재 8페이지, siblingCount=1 → 1 … 7 [8] 9 … 20
function getPageTokens(current: number, total: number, siblingCount: number): PageToken[] {
  const totalVisible = siblingCount * 2 + 5; // 처음 + 끝 + 현재 + 양옆 + 생략 2개 여유

  if (total <= totalVisible) return range(1, total);

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, 3 + siblingCount * 2), "ellipsis", total];
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, "ellipsis", ...range(total - (2 + siblingCount * 2), total)];
  }
  return [1, "ellipsis", ...range(leftSibling, rightSibling), "ellipsis", total];
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  className,
  ...props
}: PaginationProps) {
  const tokens = getPageTokens(currentPage, totalPages, siblingCount);
  const ariaLabel = props["aria-label"] ?? "페이지네이션";
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  const navButtonClasses = cn(
    "w-[34px] h-[34px] flex items-center justify-center rounded-lg border border-border bg-surface text-muted cursor-pointer",
    "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    "disabled:cursor-not-allowed disabled:text-muted-light disabled:opacity-60",
  );

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ul className="flex items-center gap-1.5 list-none m-0">
        {showFirstLast && (
          <li>
            <button
              type="button"
              aria-label="첫 페이지로"
              disabled={isFirst}
              onClick={() => onPageChange(1)}
              className={navButtonClasses}
            >
              <Icon name="chevron-double-left" size={14} />
            </button>
          </li>
        )}

        <li>
          <button
            type="button"
            aria-label="이전 페이지"
            disabled={isFirst}
            onClick={() => onPageChange(currentPage - 1)}
            className={navButtonClasses}
          >
            <Icon name="chevron-left" size={14} />
          </button>
        </li>

        {tokens.map((token, index) =>
          token === "ellipsis" ? (
            <li key={`ellipsis-${index}`} aria-hidden="true" className="w-[34px] text-center text-muted-light">
              …
            </li>
          ) : (
            <li key={token}>
              <button
                type="button"
                aria-current={token === currentPage ? "page" : undefined}
                onClick={() => onPageChange(token)}
                className={cn(
                  "w-[34px] h-[34px] rounded-lg border-none font-bold text-[13px] cursor-pointer transition-colors",
                  "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  token === currentPage ? "bg-primary text-white" : "bg-border text-muted hover:bg-border/70",
                )}
              >
                {token}
              </button>
            </li>
          ),
        )}

        <li>
          <button
            type="button"
            aria-label="다음 페이지"
            disabled={isLast}
            onClick={() => onPageChange(currentPage + 1)}
            className={navButtonClasses}
          >
            <Icon name="chevron-right" size={14} />
          </button>
        </li>

        {showFirstLast && (
          <li>
            <button
              type="button"
              aria-label="마지막 페이지로"
              disabled={isLast}
              onClick={() => onPageChange(totalPages)}
              className={navButtonClasses}
            >
              <Icon name="chevron-double-right" size={14} />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

// ===== 사용 예시 =====
//
// const [page, setPage] = useState(1);
// <Pagination currentPage={page} totalPages={20} onPageChange={setPage} />
//
// // 양옆에 페이지를 더 넉넉히 보여주고 싶을 때
// <Pagination currentPage={page} totalPages={50} onPageChange={setPage} siblingCount={2} />
//
// // 페이지가 적어서 처음/끝 버튼이 필요 없을 때
// <Pagination currentPage={page} totalPages={5} onPageChange={setPage} showFirstLast={false} />
//
// 체크리스트
// - nav로 감싸서 랜드마크로 인식되게 함 (Breadcrumb와 같은 이유)
// - 이전/다음/처음/끝 버튼은 아이콘만 있어서 aria-label 필수로 넣어둠
// - 현재 페이지엔 aria-current="page" — 시각적 강조뿐 아니라 스크린리더에도 "여기가 현재 페이지"를 전달
// - 첫 페이지에서 이전·처음 버튼, 마지막 페이지에서 다음·끝 버튼은 disabled 처리
// - "…" 생략 표시는 클릭할 수 없는 장식이라 aria-hidden 처리
