"use client";

import { useRef, useState } from "react";
import { uploadAdminProductImage } from "@/lib/api/adminProducts";
import { PRODUCT_PICKER_IMAGES, resolveProductImage } from "@/lib/api/products";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

type AdminProductImagePickerProps = {
  value: string;
  onChange: (path: string) => void;
};

export function AdminProductImagePicker({ value, onChange }: AdminProductImagePickerProps) {
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
      const res = await uploadAdminProductImage(file, token);
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
    <div className="sm:col-span-2">
      <label className="mb-1 block text-xs font-semibold text-slate-400">รูปภาพ</label>

      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
            {previewSrc ? (
              <img src={previewSrc} alt="ตัวอย่างรูปสินค้า" className="h-full w-full object-cover" />
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => void handleFileChange(event)}
        />

        {uploadError ? <p className="mt-2 text-xs text-rose-400">{uploadError}</p> : null}
        {value ? <p className="mt-2 truncate text-[10px] text-slate-500">{value}</p> : null}

        {open ? (
          <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-2">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {PRODUCT_PICKER_IMAGES.map((imagePath) => {
                const selected = value === imagePath;
                return (
                  <button
                    key={imagePath}
                    type="button"
                    onClick={() => onChange(imagePath)}
                    className={`overflow-hidden rounded-lg border-2 transition ${
                      selected ? "border-blue-500 ring-2 ring-blue-500/40" : "border-slate-700 hover:border-slate-500"
                    }`}
                    title={imagePath}
                  >
                    <img
                      src={resolveProductImage(imagePath)}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
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
