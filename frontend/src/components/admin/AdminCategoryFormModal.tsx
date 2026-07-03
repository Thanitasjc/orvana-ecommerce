"use client";

import { useEffect, useState } from "react";
import { AdminCategoryImagePicker } from "@/components/admin/AdminCategoryImagePicker";
import type { AdminCategory, AdminCategoryPayload } from "@/lib/api/adminCategories";

type AdminCategoryFormModalProps = {
  open: boolean;
  category: AdminCategory | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: AdminCategoryPayload) => void;
};

const emptyForm = {
  name: "",
  slug: "",
  image: "",
};

export function AdminCategoryFormModal({
  open,
  category,
  submitting,
  error,
  onClose,
  onSubmit,
}: AdminCategoryFormModalProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (category) {
      setForm({
        name: category.name,
        slug: category.slug,
        image: category.image ?? "",
      });
      return;
    }

    setForm(emptyForm);
  }, [category, open]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    onSubmit({
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      image: form.image.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{category ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ปิด
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">ชื่อหมวดหมู่</label>
            <input
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">
              Slug (เว้นว่างเพื่อสร้างอัตโนมัติ)
            </label>
            <input
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              placeholder="tops"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500"
            />
          </div>

          <AdminCategoryImagePicker
            value={form.image}
            onChange={(image) => setForm((current) => ({ ...current, image }))}
          />

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {submitting ? "กำลังบันทึก..." : category ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
          </button>
        </form>
      </div>
    </div>
  );
}
