"use client";

import { useRef, useState } from "react";
import { uploadAdminCategoryImage } from "@/lib/api/adminCategories";
import { resolveProductImage } from "@/lib/api/products";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

type AdminCategoryImagePickerProps = {
  value: string;
  onChange: (path: string) => void;
};

export function AdminCategoryImagePicker({ value, onChange }: AdminCategoryImagePickerProps) {
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
      const res = await uploadAdminCategoryImage(file, token);
      onChange(res.path);
    } catch {
      setUploadError("อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-400">รูปหมวดหมู่</label>

      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
            {previewSrc ? (
              <img src={previewSrc} alt="ตัวอย่างรูปหมวดหมู่" className="h-full w-full object-cover" />
            ) : (
              <span className="px-2 text-center text-[10px] text-slate-500">ยังไม่มีรูป</span>
            )}
          </div>

          <div className="flex flex-1 flex-wrap gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-lg border border-rose-500/40 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/10"
              >
                ลบรูป
              </button>
            ) : null}
          </div>
        </div>

        {uploadError ? <p className="mt-2 text-xs text-rose-400">{uploadError}</p> : null}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
    </div>
  );
}
