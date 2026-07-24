import cn from "@/lib/utils/cn";
import { Button } from "./button";

interface LoadMoreProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  loading?: boolean;
  hasMore?: boolean;
  className?: string;
}

// 목록 자체는 children으로 자유롭게 구성하고, 이 컴포넌트는 "더보기" 버튼과
// 로딩 상태만 담당합니다. Button에 이미 loading prop이 있어서 새로 만들 게 없었어요.

export function LoadMore({ children, onLoadMore, loading, hasMore = true, className }: LoadMoreProps) {
  return (
    <div className={cn("max-w-[360px] flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-2 mb-2">{children}</div>
      {hasMore && (
        <Button variant="secondary" size="sm" loading={loading} onClick={onLoadMore}>
          더보기
        </Button>
      )}
    </div>
  );
}

// ===== 사용 예시 =====
//
// const [items, setItems] = useState(initialItems);
// const [loading, setLoading] = useState(false);
//
// <LoadMore
//   loading={loading}
//   hasMore={items.length < total}
//   onLoadMore={async () => {
//     setLoading(true);
//     const more = await fetchMore();
//     setItems((prev) => [...prev, ...more]);
//     setLoading(false);
//   }}
// >
//   {items.map((item) => (
//     <div key={item.id} className="bg-background rounded-lg px-3.5 py-2.5 text-[13px] text-muted">
//       {item.label}
//     </div>
//   ))}
// </LoadMore>
