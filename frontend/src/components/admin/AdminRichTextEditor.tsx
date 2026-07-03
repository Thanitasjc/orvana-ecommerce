"use client";

import { useEffect, useRef } from "react";

type AdminRichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const TOOLBAR_BUTTONS: Array<{
  command: string;
  label: string;
  title: string;
  value?: string;
}> = [
  { command: "bold", label: "B", title: "ตัวหนา" },
  { command: "italic", label: "I", title: "ตัวเอียง" },
  { command: "insertUnorderedList", label: "•", title: "รายการ" },
  { command: "formatBlock", label: "H3", title: "หัวข้อ", value: "h3" },
];

export function AdminRichTextEditor({
  value,
  onChange,
  placeholder = "พิมพ์รายละเอียดเพิ่มเติม...",
}: AdminRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value || "";
    }
  }, [value]);

  function applyCommand(command: string, commandValue?: string) {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    document.execCommand(command, false, commandValue);
    onChange(editor.innerHTML);
  }

  function handleInput() {
    const editor = editorRef.current;
    if (!editor) return;
    onChange(editor.innerHTML);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
      <div className="flex flex-wrap gap-1 border-b border-slate-700 bg-slate-950/60 px-2 py-2">
        {TOOLBAR_BUTTONS.map((button) => (
          <button
            key={button.command + (button.value ?? "")}
            type="button"
            title={button.title}
            onMouseDown={(event) => {
              event.preventDefault();
              applyCommand(button.command, button.value);
            }}
            className="min-w-[32px] rounded-md border border-slate-600 px-2 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800"
          >
            {button.label}
          </button>
        ))}
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="admin-rich-text-editor min-h-[140px] px-3 py-3 text-sm text-white outline-none"
      />
    </div>
  );
}
