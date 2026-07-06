"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type QuillType from "quill";

import "quill/dist/quill.snow.css";
import "quill-table-better/dist/quill-table-better.css";

type EditorMode = "visual" | "html";

type AdminRichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  showTableHelp?: boolean;
  id?: string;
};

const QUILL_TOOLBAR = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ size: ["small", false, "large", "huge"] }],
  [{ font: [] }],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ["table-better"],
  ["clean"],
  ["link", "image", "video"],
];

let quillModulesRegistered = false;

function normalizeHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed || trimmed === "<p><br></p>" || trimmed === "<p></p>") {
    return "";
  }
  return html;
}

function loadHtmlIntoQuill(
  quill: QuillType,
  Quill: typeof import("quill").default,
  html: string,
) {
  const length = quill.getLength();
  quill.deleteText(0, length, Quill.sources.SILENT);
  if (!html) return;

  const delta = quill.clipboard.convert({ html });
  quill.updateContents(delta, Quill.sources.SILENT);
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="m18 16 4-4-4-4" />
      <path d="m6 8-4 4 4 4" />
      <path d="m14.5 4-5 16" />
    </svg>
  );
}

export function AdminRichTextEditor({
  value,
  onChange,
  placeholder = "เริ่มพิมพ์เนื้อหา...",
  label,
  required = false,
  showTableHelp = false,
  id,
}: AdminRichTextEditorProps) {
  const generatedId = useId();
  const fieldId = id ?? `rte-${generatedId.replace(/:/g, "")}`;
  const [mode, setMode] = useState<EditorMode>("visual");
  const [htmlSource, setHtmlSource] = useState(value);
  const mountRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<QuillType | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const isInternalChangeRef = useRef(false);

  onChangeRef.current = onChange;
  valueRef.current = value;

  useEffect(() => {
    if (mode !== "visual") return;

    let disposed = false;

    async function initEditor() {
      const [{ default: Quill }, { default: QuillTableBetter }] = await Promise.all([
        import("quill"),
        import("quill-table-better"),
      ]);

      if (!quillModulesRegistered) {
        Quill.register({ "modules/table-better": QuillTableBetter }, true);
        quillModulesRegistered = true;
      }

      if (disposed || !mountRef.current) return;

      mountRef.current.innerHTML = "";
      const editorEl = document.createElement("div");
      mountRef.current.appendChild(editorEl);

      const quill = new Quill(editorEl, {
        theme: "snow",
        placeholder,
        modules: {
          table: false,
          toolbar: QUILL_TOOLBAR,
          "table-better": {
            language: "en_US",
            menus: ["column", "row", "merge", "table", "cell", "wrap", "copy", "delete"],
            toolbarTable: true,
          },
          keyboard: {
            bindings: QuillTableBetter.keyboardBindings,
          },
        },
      });

      quillRef.current = quill;
      loadHtmlIntoQuill(quill, Quill, valueRef.current);

      quill.on("text-change", () => {
        const html = normalizeHtml(quill.root.innerHTML);
        isInternalChangeRef.current = true;
        valueRef.current = html;
        onChangeRef.current(html);
        setHtmlSource(html);
      });
    }

    void initEditor();

    return () => {
      disposed = true;
      quillRef.current = null;
      if (mountRef.current) {
        mountRef.current.innerHTML = "";
      }
    };
  }, [mode, placeholder]);

  useEffect(() => {
    setHtmlSource(value);

    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }

    if (mode !== "visual" || !quillRef.current) return;

    const current = normalizeHtml(quillRef.current.root.innerHTML);
    if (current === normalizeHtml(value)) return;

    void import("quill").then(({ default: Quill }) => {
      if (!quillRef.current) return;
      loadHtmlIntoQuill(quillRef.current, Quill, value);
    });
  }, [value, mode]);

  const switchToHtml = useCallback(() => {
    const html = quillRef.current
      ? normalizeHtml(quillRef.current.root.innerHTML)
      : normalizeHtml(value);

    setHtmlSource(html);
    valueRef.current = html;
    onChange(html);
    setMode("html");
  }, [value, onChange]);

  const switchToVisual = useCallback(() => {
    const html = normalizeHtml(htmlSource);
    valueRef.current = html;
    onChange(html);
    setMode("visual");
  }, [htmlSource, onChange]);

  const handleHtmlChange = (nextHtml: string) => {
    setHtmlSource(nextHtml);
    valueRef.current = nextHtml;
    onChange(nextHtml);
  };

  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor={fieldId}
            className="text-sm font-medium leading-none text-slate-200"
          >
            {label}
            {required ? " *" : null}
          </label>

          <div className="flex gap-1 rounded-lg border border-slate-600 p-0.5">
            <button
              type="button"
              onClick={() => {
                if (mode !== "visual") switchToVisual();
              }}
              className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                mode === "visual"
                  ? "bg-slate-700 text-white hover:bg-slate-600"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <EyeIcon />
              Visual
            </button>
            <button
              type="button"
              onClick={() => {
                if (mode !== "html") switchToHtml();
              }}
              className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                mode === "html"
                  ? "bg-slate-700 text-white hover:bg-slate-600"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <CodeIcon />
              HTML
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <div className="flex gap-1 rounded-lg border border-slate-600 p-0.5">
            <button
              type="button"
              onClick={() => {
                if (mode !== "visual") switchToVisual();
              }}
              className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors ${
                mode === "visual"
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <EyeIcon />
              Visual
            </button>
            <button
              type="button"
              onClick={() => {
                if (mode !== "html") switchToHtml();
              }}
              className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors ${
                mode === "html"
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <CodeIcon />
              HTML
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-700 bg-slate-900">
        {mode === "visual" ? (
          <div
            className="admin-quill-editor relative overflow-visible [&_.ql-container]:rounded-b-lg [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[280px] [&_.ql-editor]:text-sm [&_.ql-toolbar]:rounded-t-lg [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-700 [&_.ql-toolbar]:bg-slate-950/60"
            ref={mountRef}
          />
        ) : (
          <textarea
            id={fieldId}
            value={htmlSource}
            onChange={(event) => handleHtmlChange(event.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            className="min-h-[320px] w-full resize-y rounded-lg bg-slate-900 px-3 py-3 font-mono text-sm text-white outline-none"
          />
        )}
      </div>

      {showTableHelp ? (
        <div className="space-y-1 text-xs text-slate-400">
          <p>โหมด Visual — สลับ HTML เพื่อแก้ source โดยตรง</p>
          <p className="font-medium text-slate-300">ตาราง (ใช้ได้เฉพาะใน editor นี้)</p>
          <ol className="list-decimal space-y-0.5 pl-4">
            <li>กดปุ่มตารางบนแถบเครื่องมือ แล้วเลือกขนาด</li>
            <li>คลิกในเซลล์ — จะมีแถบเมนูลอยเหนือตาราง</li>
            <li>
              ปรับเส้นขอบ/สี:{" "}
              <span className="text-slate-200">คุณสมบัติตาราง</span> /{" "}
              <span className="text-slate-200">คุณสมบัติเซลล์</span> — สีที่ตั้งจะแสดงบนหน้าเว็บ
              (ไม่มีกรอบ = ใช้สีธีมเว็บ)
            </li>
          </ol>
        </div>
      ) : null}
    </div>
  );
}
