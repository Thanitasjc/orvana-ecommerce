"use client";

import { useState } from "react";
import { uploadAdminProductImage } from "@/lib/api/adminProducts";
import type { ProductGallerySlide } from "@/lib/api/products";
import { PRODUCT_PICKER_IMAGES, resolveProductImage } from "@/lib/api/products";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

function pathToSlide(path: string): ProductGallerySlide {
  if (path.includes("/details/main/")) {
    const thumb = path.replace("/details/main/", "/details/nav/").replace("product-details-main-", "product-details-nav-");
    return { thumb, main: path };
  }
  if (path.includes("/details/nav/")) {
    const main = path.replace("/details/nav/", "/details/main/").replace("product-details-nav-", "product-details-main-");
    return { thumb: path, main };
  }
  return { thumb: path, main: path };
}

type AdminProductGalleryPickerProps = {
  value: ProductGallerySlide[];
  onChange: (slides: ProductGallerySlide[]) => void;
};

export function AdminProductGalleryPicker({ value, onChange }: AdminProductGalleryPickerProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addSlide(path: string) {
    const slide = pathToSlide(path);
    const exists = value.some((item) => item.main === slide.main && item.thumb === slide.thumb);
    if (!exists) {
      onChange([...value, slide]);
    }
  }

  function removeSlide(index: number) {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) {
      setError("กรุณาเข้าสู่ระบบ admin");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const res = await uploadAdminProductImage(file, token);
      addSlide(res.path);
      setOpen(true);
    } catch {
      setError("อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="sm:col-span-2">
      <label className="mb-1 block text-xs font-semibold text-slate-400">แกลเลอรีรายละเอียดสินค้า</label>
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
          >
            {open ? "ซ่อนแกลเลอรี" : "เพิ่มรูปจากแกลเลอรี"}
          </button>
          <label className="cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500">
            {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
            <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleUpload(event)} />
          </label>
        </div>

        {error ? <p className="mb-2 text-xs text-rose-400">{error}</p> : null}

        {value.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {value.map((slide, index) => (
              <div key={`${slide.main}-${index}`} className="relative">
                <img
                  src={resolveProductImage(slide.thumb)}
                  alt=""
                  className="h-16 w-16 rounded-lg border border-slate-700 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeSlide(index)}
                  className="absolute -right-1 -top-1 rounded-full bg-rose-600 px-1.5 text-[10px] text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-3 text-xs text-slate-500">ยังไม่มีรูปในแกลเลอรี (จะใช้ชุดรูป Shofy อัตโนมัติ)</p>
        )}

        {open ? (
          <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-2">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {PRODUCT_PICKER_IMAGES.map((imagePath) => (
                <button
                  key={`gallery-pick-${imagePath}`}
                  type="button"
                  onClick={() => addSlide(imagePath)}
                  className="overflow-hidden rounded-lg border border-slate-700 hover:border-blue-500"
                >
                  <img src={resolveProductImage(imagePath)} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
