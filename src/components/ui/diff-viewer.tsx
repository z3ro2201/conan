import cn from "@/lib/utils/cn";

export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  text: string;
}

interface DiffViewerProps {
  title?: string;
  lines: DiffLine[];
  className?: string;
}

// 원본은 +/- 기호가 이미 텍스트로 붙어있어서 색상에만 의존하지 않는 점이 좋았습니다.
// 다만 스크린리더가 "+ 첫 등장은..."을 그냥 텍스트로만 읽어서 "이게 추가된 줄이다"라는
// 맥락이 명확하지 않았는데, 시각적으로는 안 보이는 sr-only 접두어를 추가해서
// "추가됨: 첫 등장은..."처럼 명확하게 전달되게 했습니다.

const lineStyles: Record<DiffLine["type"], string> = {
  added: "bg-success-bg text-[#1E5C39]",
  removed: "bg-danger-bg text-[#8A2622] line-through",
  unchanged: "text-[#3A3E48]",
};

const linePrefix: Record<DiffLine["type"], string> = {
  added: "+",
  removed: "—",
  unchanged: "",
};

const srPrefix: Record<DiffLine["type"], string> = {
  added: "추가됨: ",
  removed: "삭제됨: ",
  unchanged: "",
};

export function DiffViewer({ title, lines, className }: DiffViewerProps) {
  return (
    <div className={className}>
      {title && <div className="text-xs font-bold text-muted-light mb-2.5">{title}</div>}
      <div className="border border-border rounded-xl overflow-hidden text-[13px] leading-[1.9] font-mono">
        {lines.map((line, i) => (
          <div key={i} className={cn("px-4 py-2", lineStyles[line.type])}>
            <span aria-hidden="true">{linePrefix[line.type]} </span>
            <span className="sr-only">{srPrefix[line.type]}</span>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== 사용 예시 =====
//
// <DiffViewer
//   title="v12 → v13 변경사항"
//   lines={[
//     { type: 'unchanged', text: '이 인물은 고등학생 탐정으로 활동하며,' },
//     { type: 'removed', text: '첫 등장은 EP.001로 알려져 있다.' },
//     { type: 'added', text: '첫 등장은 EP.001이며, 이후 다수의 극장판에도 출연했다.' },
//     { type: 'unchanged', text: '현재까지 활발히 활동 중이다.' },
//   ]}
// />
