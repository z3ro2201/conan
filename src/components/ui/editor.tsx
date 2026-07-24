"use client";

import cn from "@/lib/utils/cn";
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { ButtonGroup } from "./button";
import { Icon } from "./icon";
import { marked } from "marked";
import DOMPurify from "dompurify";

// ⚠️ 참고: document.execCommand는 W3C 표준에서 deprecated 상태지만
// 모든 주요 브라우저가 아직 지원하고, 간단한 서식 에디터엔 여전히 실용적입니다.
// 이미지 업로드/멘션/AI 요약 연동처럼 기능이 커지면
// Tiptap이나 Lexical 같은 전용 에디터 엔진으로 옮기는 걸 추천드려요.
//
// npm install marked dompurify
// (마크다운 미리보기 렌더링 + XSS 방지용 sanitize)

type EditorMode = "wysiwyg" | "markdown";

// ===== 공용 툴바 버튼 =====

interface ToolbarButtonProps {
  label: string; // aria-label (아이콘만 있는 버튼이라 필수)
  pressed?: boolean;
  onClick: () => void;
  tabIndex: number;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

// 토글형이면 aria-pressed로 on/off 상태를 스크린리더에 전달.
// 눌린 상태 색상은 info 토큰(bg-info-bg + text-primary)을 재사용.
function ToolbarButton({ label, pressed, onClick, tabIndex, onKeyDown, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn(
        "w-[30px] h-7 flex items-center justify-center rounded-md text-[13px] cursor-pointer",
        "border border-border text-muted bg-surface transition-colors",
        "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        pressed && "bg-info-bg border-primary text-primary",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div role="separator" aria-orientation="vertical" className="w-px h-5 bg-border mx-1" />;
}

// WAI-ARIA Toolbar 패턴 공용 훅: Tab은 툴바에 한 번만 멈추고, 버튼 간 이동은 방향키로.
function useToolbarRovingIndex(buttonCount: number) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") nextIndex = (focusedIndex + 1) % buttonCount;
    else if (e.key === "ArrowLeft") nextIndex = (focusedIndex - 1 + buttonCount) % buttonCount;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = buttonCount - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      setFocusedIndex(nextIndex);
      const buttons = toolbarRef.current?.querySelectorAll("button");
      (buttons?.[nextIndex] as HTMLButtonElement | undefined)?.focus();
    }
  };

  const tabIndexFor = (index: number) => (index === focusedIndex ? 0 : -1);

  return { toolbarRef, handleKeyDown, tabIndexFor };
}

// ===================================================================
// ===== 위지윅 에디터 =====
// ===================================================================

type ToggleCommand = "bold" | "italic" | "underline" | "strikeThrough" | "insertUnorderedList" | "insertOrderedList";

const TOGGLE_BUTTONS: { id: ToggleCommand; label: string; icon: React.ReactNode }[] = [
  { id: "bold", label: "굵게", icon: <span className="font-black">B</span> },
  { id: "italic", label: "기울임", icon: <span className="italic">I</span> },
  { id: "underline", label: "밑줄", icon: <span className="underline">U</span> },
  { id: "strikeThrough", label: "취소선", icon: <span className="line-through">S</span> },
];

const LIST_BUTTONS: { id: ToggleCommand; label: string; icon: React.ReactNode }[] = [
  { id: "insertUnorderedList", label: "글머리 목록", icon: "☰" },
  { id: "insertOrderedList", label: "번호 목록", icon: "1." },
];

interface SubEditorProps {
  defaultValue?: string;
  onChange?: (content: string) => void;
  "aria-label"?: string;
}

export function WysiwygEditor({ defaultValue, onChange, ...props }: SubEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [spoilerActive, setSpoilerActive] = useState(false);
  const buttonCount = TOGGLE_BUTTONS.length + 4 /* link/image/quote/code */ + LIST_BUTTONS.length + 1; /* spoiler */
  const { toolbarRef, handleKeyDown, tabIndexFor } = useToolbarRovingIndex(buttonCount);

  const ariaLabel = props["aria-label"] ?? "본문 편집기";

  const refreshActiveFormats = useCallback(() => {
    if (typeof document === "undefined") return;
    const next = new Set<string>();
    [...TOGGLE_BUTTONS, ...LIST_BUTTONS].forEach(({ id }) => {
      try {
        if (document.queryCommandState(id)) next.add(id);
      } catch {
        // 일부 브라우저/컨텍스트에서 queryCommandState가 예외를 던질 수 있어 방어
      }
    });
    setActiveFormats(next);
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", refreshActiveFormats);
    return () => document.removeEventListener("selectionchange", refreshActiveFormats);
  }, [refreshActiveFormats]);

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    refreshActiveFormats();
    onChange?.(editorRef.current?.innerHTML ?? "");
  };

  const insertLink = () => {
    const url = window.prompt("링크 URL을 입력하세요");
    if (url) exec("createLink", url);
  };

  const insertImage = () => {
    const url = window.prompt("이미지 URL을 입력하세요");
    if (url) exec("insertImage", url);
  };

  const insertQuote = () => exec("formatBlock", "blockquote");

  const insertCode = () => {
    const selection = window.getSelection()?.toString() ?? "";
    exec("insertHTML", `<code>${selection || "코드"}</code>`);
  };

  const toggleSpoiler = () => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      exec("insertHTML", `<span class="spoiler" data-spoiler="true">${selection}</span>`);
    }
    setSpoilerActive((v) => !v);
  };

  return (
    <div>
      <div
        ref={toolbarRef}
        role="toolbar"
        aria-label="서식 도구모음"
        aria-controls="wysiwyg-editor-content"
        className="flex items-center gap-1 p-2 bg-background border-b border-border flex-wrap"
      >
        <label className="sr-only" htmlFor="editor-format-select">
          텍스트 서식
        </label>
        <select
          id="editor-format-select"
          onChange={(e) => exec("formatBlock", e.target.value)}
          className="border border-border rounded-md px-2 py-[5px] text-xs bg-surface text-muted"
        >
          <option value="p">본문</option>
          <option value="h1">제목 1</option>
          <option value="h2">제목 2</option>
        </select>

        <Divider />

        {TOGGLE_BUTTONS.map((btn, i) => (
          <ToolbarButton
            key={btn.id}
            label={btn.label}
            pressed={activeFormats.has(btn.id)}
            onClick={() => exec(btn.id)}
            tabIndex={tabIndexFor(i)}
            onKeyDown={handleKeyDown}
          >
            {btn.icon}
          </ToolbarButton>
        ))}

        <Divider />

        <ToolbarButton label="링크 삽입" onClick={insertLink} tabIndex={tabIndexFor(4)} onKeyDown={handleKeyDown}>
          🔗
        </ToolbarButton>
        <ToolbarButton label="이미지 삽입" onClick={insertImage} tabIndex={tabIndexFor(5)} onKeyDown={handleKeyDown}>
          <Icon name="image" size={16} />
        </ToolbarButton>
        <ToolbarButton label="인용구 삽입" onClick={insertQuote} tabIndex={tabIndexFor(6)} onKeyDown={handleKeyDown}>
          ❝
        </ToolbarButton>
        <ToolbarButton label="코드 삽입" onClick={insertCode} tabIndex={tabIndexFor(7)} onKeyDown={handleKeyDown}>
          {"{ }"}
        </ToolbarButton>

        <Divider />

        {LIST_BUTTONS.map((btn, i) => (
          <ToolbarButton
            key={btn.id}
            label={btn.label}
            pressed={activeFormats.has(btn.id)}
            onClick={() => exec(btn.id)}
            tabIndex={tabIndexFor(8 + i)}
            onKeyDown={handleKeyDown}
          >
            {btn.icon}
          </ToolbarButton>
        ))}

        <div className="flex-1" />

        <button
          type="button"
          aria-pressed={spoilerActive}
          tabIndex={tabIndexFor(10)}
          onClick={toggleSpoiler}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-7 px-2.5 rounded-md text-[11px] font-bold cursor-pointer",
            "bg-warning-bg border border-[#E8B94A] text-warning",
            "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          )}
        >
          ⚠ 스포일러
        </button>
      </div>

      <div
        id="wysiwyg-editor-content"
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        onInput={() => onChange?.(editorRef.current?.innerHTML ?? "")}
        onKeyUp={refreshActiveFormats}
        onMouseUp={refreshActiveFormats}
        dangerouslySetInnerHTML={defaultValue !== undefined ? { __html: defaultValue } : undefined}
        className={cn(
          "min-h-[180px] px-5 py-[18px] text-sm leading-[1.8] text-foreground outline-none",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-light",
        )}
        data-placeholder="여기에 이어서 작성하세요..."
      />
    </div>
  );
}

// ===================================================================
// ===== 마크다운 에디터 =====
// ===================================================================

function wrapSelection(textarea: HTMLTextAreaElement, before: string, after: string = before) {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);
  const newValue = value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
  const cursorStart = selectionStart + before.length;
  const cursorEnd = cursorStart + selected.length;
  return { newValue, cursorStart, cursorEnd };
}

function prefixLines(textarea: HTMLTextAreaElement, prefix: string) {
  const { selectionStart, selectionEnd, value } = textarea;
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineEndIndex = value.indexOf("\n", selectionEnd);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;

  const block = value.slice(lineStart, lineEnd);
  const prefixed = block
    .split("\n")
    .map((line) => (line.length ? prefix + line : line))
    .join("\n");

  const newValue = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
  return { newValue, cursorStart: lineStart, cursorEnd: lineStart + prefixed.length };
}

const MARKDOWN_BUTTONS = ["bold", "italic", "link", "image", "quote", "code", "ul", "ol", "spoiler"] as const;

export function MarkdownEditor({ defaultValue = "", onChange, ...props }: SubEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toolbarRef, handleKeyDown, tabIndexFor } = useToolbarRovingIndex(MARKDOWN_BUTTONS.length);

  const ariaLabel = props["aria-label"] ?? "본문 편집기 (마크다운)";

  const applyChange = (newValue: string, cursorStart: number, cursorEnd: number) => {
    setValue(newValue);
    onChange?.(newValue);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const applyWrap = (before: string, after?: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const { newValue, cursorStart, cursorEnd } = wrapSelection(el, before, after);
    applyChange(newValue, cursorStart, cursorEnd);
  };

  const applyPrefix = (prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const { newValue, cursorStart, cursorEnd } = prefixLines(el, prefix);
    applyChange(newValue, cursorStart, cursorEnd);
  };

  const insertLink = () => {
    const el = textareaRef.current;
    if (!el) return;
    const url = window.prompt("링크 URL을 입력하세요") ?? "";
    const { newValue, cursorStart, cursorEnd } = wrapSelection(el, "[", `](${url})`);
    applyChange(newValue, cursorStart, cursorEnd);
  };

  const insertImage = () => {
    const el = textareaRef.current;
    if (!el) return;
    const url = window.prompt("이미지 URL을 입력하세요") ?? "";
    const { newValue, cursorStart, cursorEnd } = wrapSelection(el, "![", `](${url})`);
    applyChange(newValue, cursorStart, cursorEnd);
  };

  // marked가 반환하는 HTML을 DOMPurify로 한 번 걸러서 XSS 방지 후 렌더링
  const previewHtml = (() => {
    try {
      const raw = marked.parse(value, { async: false }) as string;
      return DOMPurify.sanitize(raw);
    } catch {
      return "";
    }
  })();

  return (
    <div>
      <div
        ref={toolbarRef}
        role="toolbar"
        aria-label="마크다운 서식 도구모음"
        aria-controls="markdown-editor-content"
        className="flex items-center gap-1 p-2 bg-background border-b border-border flex-wrap"
      >
        <ToolbarButton label="굵게" onClick={() => applyWrap("**")} tabIndex={tabIndexFor(0)} onKeyDown={handleKeyDown}>
          <span className="font-black">B</span>
        </ToolbarButton>
        <ToolbarButton
          label="기울임"
          onClick={() => applyWrap("*")}
          tabIndex={tabIndexFor(1)}
          onKeyDown={handleKeyDown}
        >
          <span className="italic">I</span>
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="링크 삽입" onClick={insertLink} tabIndex={tabIndexFor(2)} onKeyDown={handleKeyDown}>
          🔗
        </ToolbarButton>
        <ToolbarButton label="이미지 삽입" onClick={insertImage} tabIndex={tabIndexFor(3)} onKeyDown={handleKeyDown}>
          <Icon name="image" size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="인용구"
          onClick={() => applyPrefix("> ")}
          tabIndex={tabIndexFor(4)}
          onKeyDown={handleKeyDown}
        >
          ❝
        </ToolbarButton>
        <ToolbarButton label="코드" onClick={() => applyWrap("`")} tabIndex={tabIndexFor(5)} onKeyDown={handleKeyDown}>
          {"{ }"}
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          label="글머리 목록"
          onClick={() => applyPrefix("- ")}
          tabIndex={tabIndexFor(6)}
          onKeyDown={handleKeyDown}
        >
          ☰
        </ToolbarButton>
        <ToolbarButton
          label="번호 목록"
          onClick={() => applyPrefix("1. ")}
          tabIndex={tabIndexFor(7)}
          onKeyDown={handleKeyDown}
        >
          1.
        </ToolbarButton>

        <div className="flex-1" />

        <button
          type="button"
          aria-pressed={previewOpen}
          tabIndex={tabIndexFor(8)}
          onClick={() => setPreviewOpen((v) => !v)}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-7 px-2.5 rounded-md text-[11px] font-bold cursor-pointer border border-border bg-surface text-muted",
            "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            previewOpen && "bg-info-bg border-primary text-primary",
          )}
        >
          미리보기
        </button>
      </div>

      <div className={cn("grid", previewOpen && "grid-cols-2 divide-x divide-border")}>
        <label className="sr-only" htmlFor="markdown-editor-content">
          {ariaLabel}
        </label>
        <textarea
          id="markdown-editor-content"
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onChange?.(e.target.value);
          }}
          placeholder="마크다운으로 작성하세요..."
          className={cn(
            "min-h-[180px] w-full px-5 py-[18px] text-sm leading-[1.8] text-foreground outline-none resize-y",
            "font-mono bg-surface placeholder:text-muted-light",
          )}
        />
        {previewOpen && (
          <div
            role="region"
            aria-label="마크다운 미리보기"
            className="min-h-[180px] px-5 py-[18px] text-sm leading-[1.8] text-foreground overflow-auto prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </div>
    </div>
  );
}

// ===================================================================
// ===== Editor (모드 전환 래퍼) =====
// ===================================================================

interface EditorProps {
  defaultMode?: EditorMode;
  defaultHtml?: string;
  defaultMarkdown?: string;
  onChangeHtml?: (html: string) => void;
  onChangeMarkdown?: (markdown: string) => void;
  "aria-label"?: string;
  className?: string;
}

// 위지윅 ↔ 마크다운은 서로 자동 변환하지 않습니다.
// (HTML↔MD 변환은 복잡한 서식에서 깨지기 쉬워서, 각 모드가 자기 내용을 따로 유지하는 쪽이 안전합니다.
//  전환 시 이미 작성된 내용이 있으면 confirm으로 한 번 알려줍니다.)
export function Editor({
  defaultMode = "wysiwyg",
  defaultHtml,
  defaultMarkdown,
  onChangeHtml,
  onChangeMarkdown,
  className,
  ...props
}: EditorProps) {
  const [mode, setMode] = useState<EditorMode>(defaultMode);
  const hasContentRef = useRef(false);

  const handleModeChange = (next: EditorMode) => {
    if (next === mode) return;
    if (hasContentRef.current) {
      const ok = window.confirm(
        "모드를 전환하면 현재 모드에서 작성한 내용은 자동으로 변환되지 않고 그대로 남아있습니다. 계속할까요?",
      );
      if (!ok) return;
    }
    setMode(next);
  };

  return (
    <div className={cn("max-w-[560px] border-2 border-border rounded-[14px] overflow-hidden", className)}>
      <div className="flex justify-end p-2 bg-background border-b border-border">
        <ButtonGroup
          aria-label="편집 모드 선택"
          value={mode}
          onChange={handleModeChange}
          options={[
            { id: "wysiwyg", label: "위지윅" },
            { id: "markdown", label: "마크다운" },
          ]}
        />
      </div>

      {mode === "wysiwyg" ? (
        <WysiwygEditor
          aria-label={props["aria-label"]}
          defaultValue={defaultHtml}
          onChange={(html) => {
            hasContentRef.current = html.trim().length > 0;
            onChangeHtml?.(html);
          }}
        />
      ) : (
        <MarkdownEditor
          aria-label={props["aria-label"]}
          defaultValue={defaultMarkdown}
          onChange={(md) => {
            hasContentRef.current = md.trim().length > 0;
            onChangeMarkdown?.(md);
          }}
        />
      )}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Editor
//   aria-label="문서 본문 편집기"
//   defaultMode="markdown"
//   defaultMarkdown={post.contentMd}
//   onChangeMarkdown={(md) => setContent(md)}
// />
//
// // 위지윅/마크다운 중 하나만 단독으로 쓰고 싶으면:
// <WysiwygEditor aria-label="본문" onChange={setHtml} />
// <MarkdownEditor aria-label="본문" onChange={setMarkdown} />
//
// 체크리스트
// - 굵게/기울임/목록처럼 "on/off가 있는" 버튼 → aria-pressed로 현재 상태 전달
// - 링크/이미지 삽입처럼 "누르면 실행되고 끝나는" 버튼 → aria-label만
// - 방향키(←→)로 툴바 버튼 간 이동, Tab은 툴바 전체에서 한 번만 멈춤 (WAI-ARIA Toolbar 패턴)
// - 위지윅 본문은 contentEditable이라 role="textbox" + aria-multiline 필요
// - 마크다운 본문은 진짜 <textarea>라 별도 role 불필요, <label>로 연결하면 충분
// - 마크다운 미리보기(dangerouslySetInnerHTML)는 반드시 DOMPurify로 sanitize 후 렌더링
//   (marked가 만든 HTML을 그대로 꽂으면 사용자가 입력한 <script> 등이 그대로 실행될 수 있음)
// - 모드 전환 시 자동 변환 없음 — 각 모드가 자기 내용을 독립적으로 유지
