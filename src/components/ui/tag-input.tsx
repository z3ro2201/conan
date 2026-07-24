"use client";

import cn from "@/lib/utils/cn";
import { KeyboardEvent, useId, useState } from "react";
import { Icon } from "./icon";

interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ label, tags, onChange, placeholder = "태그 입력 후 Enter", className }: TagInputProps) {
  const [value, setValue] = useState("");
  const id = useId();

  const addTag = () => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setValue("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && value === "" && tags.length > 0) {
      // 입력창이 비어있을 때 Backspace를 또 누르면 마지막 태그 삭제 (많은 태그 입력 UI의 관례)
      removeTag(tags[tags.length - 1]);
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
        className={cn(
          "flex flex-wrap items-center gap-2 border-2 border-border rounded-xl px-3 py-2.5",
          "focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15",
          className,
        )}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 bg-info-bg text-info text-xs font-bold px-2.5 py-1.5 rounded-full"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`${tag} 태그 삭제`}
              className="text-info cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
            >
              <Icon name="close" size={11} />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] border-none outline-none text-[13px] bg-transparent placeholder:text-muted-light"
        />
      </div>
    </div>
  );
}

// ===== 사용 예시 =====
//
// const [tags, setTags] = useState(['추리', '스릴러']);
// <TagInput label="장르 태그" tags={tags} onChange={setTags} />
//
// 체크리스트
// - 태그 삭제 버튼은 아이콘만 있어서 "OO 태그 삭제"처럼 태그 이름을 포함한 aria-label 필수
//   (단순히 "삭제"라고만 하면 여러 태그 중 어느 걸 지우는 버튼인지 스크린리더로는 알 수 없음)
// - Enter로 태그 추가, 빈 입력창에서 Backspace로 마지막 태그 삭제 — 흔한 태그 입력 UI 관례
// - onBlur에서도 addTag를 호출 — 입력만 하고 Enter 없이 다른 곳을 클릭해도 태그가 사라지지 않게
