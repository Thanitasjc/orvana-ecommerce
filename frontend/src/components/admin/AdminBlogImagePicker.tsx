"use client";

import { useRef, useState } from "react";
import { uploadAdminBlogImage } from "@/lib/api/adminBlogs";
import { resolveProductImage } from "@/lib/api/products";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

const BLOG_PICKER_IMAGES = [
  "/assets/img/blog/2/blog-1.jpg",
  "/assets/img/blog/2/blog-2.jpg",
  "/assets/img/blog/2/blog-3.jpg",
  "/assets/img/blog/list/blog-list-1.jpg",
  "/assets/img/blog/list/blog-list-2.jpg",
  "/assets/img/blog/list/blog-list-3.jpg",
  "/assets/img/blog/grid/blog-grid-1.jpg",
  "/assets/img/blog/grid/blog-grid-2.jpg",
  "/assets/img/blog/details/blog-big-1.jpg",
];

type AdminBlogImagePickerProps = {
  value: string;
  onChange: (path: string) => void;
};

export function AdminBlogImagePicker({ value, onChange }: AdminBlogImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewSrc = value ? resolveProductImage(value) : "";

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) {
      setUploadError("กรุณาเข้าสู่ระบบ admin");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const res = await uploadAdminBlogImage(file, token);
      onChange(res.path);
      setOpen(true);
    } catch {
      setUploadError("อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-400">รูปปกบทความ</label>
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
            {previewSrc ? (
              <img src={previewSrc} alt="ตัวอย่างรูปบล็อก" className="h-full w-full object-cover" />
            ) : (
              <span className="px-2 text-center text-[10px] text-slate-500">ยังไม่เลือกรูป</span>
            )}
          </div>
          <div className="flex flex-1 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
            >
              {open ? "ซ่อนแกลเลอรี" : "เลือกจากแกลเลอรี"}
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปใหม่"}
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => void handleFileChange(event)}
        />

        {uploadError ? <p className="mt-2 text-xs text-rose-400">{uploadError}</p> : null}

        {open ? (
          <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-2">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {BLOG_PICKER_IMAGES.map((imagePath) => {
                const selected = value === imagePath;
                return (
                  <button
                    key={imagePath}
                    type="button"
                    onClick={() => onChange(imagePath)}
                    className={`overflow-hidden rounded-lg border-2 transition ${
                      selected ? "border-blue-500 ring-2 ring-blue-500/40" : "border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <img src={resolveProductImage(imagePath)} alt="" className="aspect-[4/3] w-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
