"use client";

import cn from "@/lib/utils/cn";
import { useState } from "react";
import { Icon } from "./icon";
import { Checkbox } from "./checkbox";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  /** 행 선택 체크박스 표시 여부 */
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  /** (컬럼 key, 정렬 방향) => void. 서버 정렬이면 여기서 API 호출 후 data를 갱신 */
  onSort?: (key: string, direction: "asc" | "desc") => void;
  "aria-label"?: string;
  className?: string;
}

// 일반 Table과 다른 점 두 가지(행 선택, 정렬)만 추가한 버전. 원본은 체크박스가
// role 없이 그냥 input이었는데, 지난번 만든 Checkbox 컴포넌트를 그대로 가져다 써서
// 개별 체크박스뿐 아니라 "전체 선택" 헤더 체크박스의 부분선택(indeterminate) 상태까지 처리했습니다.

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  selectable,
  selectedKeys = [],
  onSelectionChange,
  onSort,
  className,
  ...props
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const ariaLabel = props["aria-label"] ?? "데이터 테이블";

  const allKeys = data.map(getRowKey);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.includes(k));
  const someSelected = allKeys.some((k) => selectedKeys.includes(k)) && !allSelected;

  const toggleAll = () => {
    onSelectionChange?.(allSelected ? [] : allKeys);
  };

  const toggleRow = (key: string) => {
    onSelectionChange?.(selectedKeys.includes(key) ? selectedKeys.filter((k) => k !== key) : [...selectedKeys, key]);
  };

  const handleSort = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;
    const nextDirection: "asc" | "desc" = sortKey === col.key && sortDirection === "asc" ? "desc" : "asc";
    setSortKey(col.key);
    setSortDirection(nextDirection);
    onSort?.(col.key, nextDirection);
  };

  return (
    <div role="region" aria-label={ariaLabel} tabIndex={0} className={cn("overflow-x-auto rounded-xl", className)}>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b-2 border-border">
            {selectable && (
              <th scope="col" className="w-9 px-2 py-2.5">
                <Checkbox
                  aria-label="전체 선택"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} scope="col" className="text-left px-2 py-2.5 text-muted-light font-bold">
                {col.sortable ? (
                  <button
                    type="button"
                    onClick={() => handleSort(col)}
                    aria-label={`${col.header}, ${sortKey === col.key ? (sortDirection === "asc" ? "오름차순 정렬됨" : "내림차순 정렬됨") : "정렬 안 됨"}`}
                    className="flex items-center gap-1 cursor-pointer select-none bg-transparent border-none p-0 font-bold text-muted-light"
                  >
                    {col.header}
                    <Icon
                      name={sortKey === col.key && sortDirection === "desc" ? "chevron-down" : "chevron-up"}
                      size={11}
                      className={cn(sortKey === col.key ? "text-primary" : "text-muted-light/40")}
                    />
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const key = getRowKey(row);
            const selected = selectedKeys.includes(key);
            return (
              <tr key={key} className={cn("border-b border-border/60", selected && "bg-info-bg/40")}>
                {selectable && (
                  <td className="px-2 py-3">
                    <Checkbox aria-label={`${key} 행 선택`} checked={selected} onChange={() => toggleRow(key)} />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-2 py-3", col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ===== 사용 예시 =====
//
// const [selected, setSelected] = useState<string[]>([]);
//
// <DataTable
//   aria-label="최근 수정 문서"
//   getRowKey={(row) => row.id}
//   data={rows}
//   selectable
//   selectedKeys={selected}
//   onSelectionChange={setSelected}
//   onSort={(key, dir) => setRows((prev) => sortBy(prev, key, dir))}
//   columns={[
//     { key: 'title', header: '문서', sortable: true, render: (row) => row.title },
//     { key: 'editor', header: '편집자', sortable: true, render: (row) => row.editor },
//     { key: 'time', header: '시간', sortable: true, render: (row) => row.time },
//     { key: 'status', header: '상태', render: (row) => <Badge variant={row.statusVariant}>{row.status}</Badge> },
//   ]}
// />
//
// 체크리스트
// - 전체 선택 체크박스는 일부만 선택됐을 때 indeterminate(가로줄) 상태로 표시
// - 정렬 버튼의 aria-label에 현재 정렬 방향까지 문장으로 포함 (아이콘 방향만으로는
//   스크린리더가 오름/내림차순을 구분 못 함)
// - 서버 사이드 정렬이면 onSort에서 API를 호출해 data를 갱신하는 식으로 씁니다
