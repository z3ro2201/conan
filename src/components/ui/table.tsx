"use client";

import cn from "@/lib/utils/cn";
import { useState } from "react";

// 원본에 있던 두 섹션(Table / Responsive Table)이 사실 같은 데이터를 다르게 그리는 것뿐이라
// (responsiveRows === tableRows) 하나의 컴포넌트로 합쳤습니다.
// sm 이상에서는 <table>, 그 아래에서는 카드 목록(ul/li)으로 CSS만으로 자동 전환됩니다.

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  /** 카드 뷰에서 이 컬럼을 "제목"처럼 크게 보여줄지 (보통 첫 컬럼 하나만 true) */
  isTitle?: boolean;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  /** 가로 스크롤 안내 오버레이 표시 여부 (기본 true, 한 번 닫으면 다시 안 뜸) */
  showScrollHint?: boolean;
  "aria-label"?: string;
  className?: string;
}

export function Table<T>({ columns, data, getRowKey, showScrollHint = true, className, ...props }: TableProps<T>) {
  const [hintDismissed, setHintDismissed] = useState(false);
  const ariaLabel = props["aria-label"] ?? "데이터 테이블";
  const titleColumn = columns.find((c) => c.isTitle) ?? columns[0];
  const restColumns = columns.filter((c) => c.key !== titleColumn.key);

  return (
    <div className={className}>
      {/* ===== 데스크톱: 진짜 table (sm 이상에서만 표시) ===== */}
      <div className="relative hidden sm:block">
        {showScrollHint && !hintDismissed && (
          <button
            type="button"
            onClick={() => setHintDismissed(true)}
            className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[#22252E]/85 cursor-pointer border-none"
          >
            <span className="flex items-center gap-2 bg-transparent text-white text-[13px] font-bold px-5 py-3 rounded-xl">
              ↔ 옆으로 스크롤하면 더 볼 수 있어요
              <span aria-hidden="true" className="opacity-60">
                ✕
              </span>
            </span>
          </button>
        )}

        {/* tabIndex=0 + role="region": 키보드 사용자가 이 영역에 포커스해서 화살표/스크롤로
            가로 스크롤할 수 있게 함. 스크린리더에도 "스크롤 가능한 영역"임을 알려줌 */}
        <div role="region" aria-label={ariaLabel} tabIndex={0} className="overflow-x-auto rounded-xl">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b-2 border-border">
                {columns.map((col) => (
                  <th key={col.key} scope="col" className="text-left px-2 py-2.5 text-muted-light font-bold">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={getRowKey(row)} className="border-b border-border/60">
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-2 py-3", col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 모바일: 카드 목록 (sm 미만에서만 표시) ===== */}
      <ul className="sm:hidden list-none m-0 p-0 flex flex-col gap-2.5">
        {data.map((row) => (
          <li key={getRowKey(row)} className="border border-border rounded-xl px-4 py-3.5">
            <div className="font-bold text-sm text-foreground mb-2">{titleColumn.render(row)}</div>
            {restColumns.map((col) => (
              <div
                key={col.key}
                className="flex justify-between text-xs text-muted-light py-1 border-t border-border/60"
              >
                <span>{col.header}</span>
                <span className="text-muted font-semibold">{col.render(row)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ===== 사용 예시 =====
//
// import { Badge } from './badge';
//
// interface DocRow {
//   id: string;
//   title: string;
//   editor: string;
//   time: string;
//   status: '반영됨' | '검토중' | '분쟁';
// }
//
// const statusVariant = { 반영됨: 'success', 검토중: 'warning', 분쟁: 'danger' } as const;
//
// <Table<DocRow>
//   aria-label="최근 수정 문서"
//   getRowKey={(row) => row.id}
//   data={rows}
//   columns={[
//     { key: 'title', header: '문서', isTitle: true, render: (row) => row.title },
//     { key: 'editor', header: '편집자', render: (row) => row.editor },
//     { key: 'time', header: '시간', render: (row) => row.time },
//     {
//       key: 'status',
//       header: '상태',
//       render: (row) => <Badge variant={statusVariant[row.status]}>{row.status}</Badge>,
//     },
//   ]}
// />
//
// 체크리스트
// - th에 scope="col" 추가 (원본엔 없었음) — 스크린리더가 "이 셀은 어느 컬럼에 속한 값인지"를
//   각 데이터 셀마다 다시 안내해줄 수 있게 하는 최소한의 표 시맨틱
// - 가로 스크롤 영역에 role="region" + tabIndex={0} — 마우스 없이 키보드만으로도
//   테이블을 좌우로 스크롤할 수 있고, 스크린리더도 "스크롤 가능한 콘텐츠"로 인식
// - 스크롤 힌트 오버레이는 원본처럼 div onClick이 아니라 실제 <button>으로 (Enter/Space로도 닫힘)
// - 카드 뷰(모바일)는 별도 컴포넌트가 아니라 CSS breakpoint(sm)로 자동 전환 — 데이터/로직 중복 없음
