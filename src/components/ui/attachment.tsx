import cn from "@/lib/utils/cn";
import { Icon, IconName } from "./icon";
import { CloseButton } from "./close-button";

interface AttachmentProps {
  name: string;
  size: string;
  kind?: "file" | "image";
  onRemove?: () => void;
  className?: string;
}

const kindIcon: Record<NonNullable<AttachmentProps["kind"]>, IconName> = {
  file: "upload",
  image: "image",
};

// FileField로 파일을 선택한 뒤, 선택된 파일 목록을 보여줄 때 짝으로 쓰는 칩 컴포넌트.

export function Attachment({ name, size, kind = "file", onRemove, className }: AttachmentProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 bg-background border border-border rounded-[10px] px-3 py-2",
        className,
      )}
    >
      <Icon name={kindIcon[kind]} size={15} className="text-muted-light shrink-0" />
      <span className="text-xs font-bold text-foreground">{name}</span>
      <span className="text-[11px] text-muted-light">{size}</span>
      {onRemove && <CloseButton aria-label={`${name} 첨부 삭제`} variant="ghost" size="sm" onClick={onRemove} />}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <div className="flex gap-2.5 flex-wrap">
//   <Attachment name="사건정리.pdf" size="1.2MB" onRemove={() => removeFile('사건정리.pdf')} />
//   <Attachment name="스크린샷.png" size="840KB" kind="image" onRemove={() => removeFile('스크린샷.png')} />
// </div>
