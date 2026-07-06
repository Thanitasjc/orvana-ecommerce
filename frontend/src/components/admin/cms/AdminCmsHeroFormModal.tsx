"use client";

import { useEffect, useState } from "react";
import { AdminProductImagePicker } from "@/components/admin/AdminProductImagePicker";
import type { HeroMediaType, HeroSlideRecord } from "@/lib/cms/homepageCms";
import { parseYouTubeId } from "@/lib/cms/youtube";

type AdminCmsHeroFormModalProps = {
  open: boolean;
  slide: HeroSlideRecord | null;
  nextSortOrder?: number;
  onClose: () => void;
  onSave: (slide: HeroSlideRecord) => void;
};

const emptySlide = (sortOrder: number): HeroSlideRecord => ({
  id: "",
  adminName: "",
  mediaType: "image",
  sortOrder,
  enabled: true,
  image: "",
  showCta: true,
  ctaLabel: "Shop Now",
  ctaUrl: "/shop",
});

export function AdminCmsHeroFormModal({
  open,
  slide,
  nextSortOrder = 0,
  onClose,
  onSave,
}: AdminCmsHeroFormModalProps) {
  const [form, setForm] = useState<HeroSlideRecord>(emptySlide(0));

  useEffect(() => {
    if (!open) return;
    setForm(slide ?? emptySlide(nextSortOrder));
  }, [open, slide, nextSortOrder]);

  if (!open) return null;

  function patch(patch: Partial<HeroSlideRecord>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.adminName.trim()) return;

    const youtubeId =
      form.mediaType === "youtube" ? parseYouTubeId(form.youtubeId) ?? form.youtubeId?.trim() : undefined;

    onSave({
      ...form,
      youtubeId: youtubeId || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#111827] shadow-2xl">
        <div className="border-b border-slate-800 px-6 py-4">
          <h2 className="text-lg font-bold text-white">{slide ? "แก้ไข Hero Slide" : "เพิ่ม Hero Slide"}</h2>
          <p className="mt-1 text-sm text-slate-400">{form.adminName || "สไลด์ใหม่บนหน้าแรก"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-slate-400">ชื่อ (สำหรับ Admin)</label>
              <input
                required
                value={form.adminName}
                onChange={(e) => patch({ adminName: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                placeholder="Slide 1 — Hero with text"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">ประเภทสื่อ</label>
              <select
                value={form.mediaType}
                onChange={(e) => patch({ mediaType: e.target.value as HeroMediaType })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="image">รูปภาพ (JPG/PNG/WebP)</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">ลำดับ</label>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => patch({ sortOrder: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => patch({ enabled: e.target.checked })}
                  className="rounded border-slate-600"
                />
                เปิดใช้งานบนหน้าแรก
              </label>
            </div>

            {form.mediaType === "image" ? (
              <div className="md:col-span-2">
                <AdminProductImagePicker
                  value={form.image}
                  onChange={(path) => patch({ image: path })}
                />
              </div>
            ) : (
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-slate-400">YouTube URL หรือ Video ID</label>
                <input
                  value={form.youtubeId ?? ""}
                  onChange={(e) => patch({ youtubeId: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="https://www.youtube.com/watch?v=x5hkD526A5M"
                />
                <p className="mt-2 text-xs text-slate-500">
                  รองรับลิงก์เต็มหรือ Video ID เช่น x5hkD526A5M — รูปภาพด้านล่างเป็นตัวเลือก (poster) ไม่บังคับ
                </p>
                <div className="mt-3">
                  <AdminProductImagePicker
                    value={form.image}
                    onChange={(path) => patch({ image: path })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-700/80 bg-slate-900/40 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-200">ข้อความทับสไลด์ (Optional)</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-slate-500">Badge</label>
                <input
                  value={form.badge ?? ""}
                  onChange={(e) => patch({ badge: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">หัวข้อ</label>
                <input
                  value={form.title ?? ""}
                  onChange={(e) => patch({ title: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">หัวข้อ (ไฮไลท์)</label>
                <input
                  value={form.titleHighlight ?? ""}
                  onChange={(e) => patch({ titleHighlight: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-slate-500">คำอธิบาย</label>
                <textarea
                  value={form.subtitle ?? ""}
                  onChange={(e) => patch({ subtitle: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={form.showCta ?? false}
                    onChange={(e) => patch({ showCta: e.target.checked })}
                    className="rounded border-slate-600"
                  />
                  แสดงปุ่ม CTA
                </label>
              </div>
              {form.showCta ? (
                <>
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">ป้ายปุ่ม</label>
                    <input
                      value={form.ctaLabel ?? ""}
                      onChange={(e) => patch({ ctaLabel: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">ลิงก์ปุ่ม</label>
                    <input
                      value={form.ctaUrl ?? ""}
                      onChange={(e) => patch({ ctaUrl: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              ) : null}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              ระบบจะใส่ gradient มืดทับสไลด์เพื่อให้อ่านข้อความได้ชัด
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              บันทึก
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
