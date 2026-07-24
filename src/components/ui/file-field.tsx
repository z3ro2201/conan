"use client";

import cn from "@/lib/utils/cn";
import { ChangeEvent, DragEvent, KeyboardEvent, useId, useRef, useState } from "react";
import { Icon } from "./icon";

interface FileFieldProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  /** 안내 문구 (예: "PNG, JPG (최대 10MB)") */
  hint?: string;
  error?: string;
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

// input type="file"은 텍스트 입력이 아니라 "영역 전체가 버튼"인 완전히 다른 UI라
// TextField의 type prop에 넣지 않고 원본의 "Upload" 섹션(드래그앤드롭 대시 박스)을
// 기반으로 별도 컴포넌트로 만들었습니다.
//
// 접근성 핵심: 진짜 <input type="file">은 화면에서 숨기되(sr-only, display:none 아님) 여전히
// DOM/접근성 트리에는 존재하게 하고, 클릭 가능한 바깥 영역은 role="button"+tabIndex로
// 키보드 Enter/Space에도 파일 선택창이 뜨게 했습니다.

export function FileField({ label, accept, multiple, hint, error, onFilesSelected, className }: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setFileNames(files.map((f) => f.name));
    onFilesSelected(files);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-muted-light">
          {label}
        </label>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        aria-describedby={[hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined}
        className={cn(
          "border-2 border-dashed rounded-2xl px-5 py-9 text-center cursor-pointer transition-colors",
          "outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
          error
            ? "border-danger bg-danger-bg"
            : dragOver
              ? "border-primary bg-info-bg/40"
              : "border-muted-light/40 hover:border-primary hover:bg-info-bg/20",
          className,
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
          className="sr-only"
        />
        <Icon name="upload" size={26} className="mx-auto mb-2.5 text-muted-light" />
        <div className="font-bold text-sm text-foreground mb-1">
          {fileNames.length > 0 ? fileNames.join(", ") : "파일을 드래그하거나 클릭해서 업로드"}
        </div>
        {hint && !error && (
          <div id={hintId} className="text-xs text-muted-light">
            {hint}
          </div>
        )}
      </div>

      {error && (
        <span id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <FileField
//   label="대표 이미지"
//   accept="image/png,image/jpeg"
//   hint="PNG, JPG (최대 10MB)"
//   onFilesSelected={(files) => {
//     const file = files[0];
//     if (file.size > 10 * 1024 * 1024) {
//       setError('파일 크기는 10MB를 넘을 수 없어요');
//       return;
//     }
//     uploadFile(file);
//   }}
// />
//
// <FileField label="첨부파일" multiple onFilesSelected={setFiles} />
//
// 체크리스트
// - 실제 <input type="file">은 sr-only로 숨기되 DOM엔 남겨둠 — display:none이면
//   일부 스크린리더/자동화 도구가 아예 인식을 못 함
// - 바깥 클릭 영역에 role="button" + tabIndex={0} + Enter/Space 핸들러 —
//   마우스로 드래그앤드롭만 되고 키보드로는 못 여는 업로드 박스가 되는 걸 방지
// - 파일 크기/형식 검증은 이 컴포넌트가 강제하지 않고 onFilesSelected 콜백에서
//   직접 처리하도록 열어뒀습니다 (검증 규칙이 프로젝트마다 다르기 때문)
