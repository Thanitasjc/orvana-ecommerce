"use client";

import { useEffect, useState } from "react";
import type { HeaderMenuItem } from "@/lib/cms/headerCms";

type AdminHeaderMenuFormModalProps = {
  open: boolean;
  item: HeaderMenuItem | null;
  nextSortOrder: number;
  onClose: () => void;
  onSave: (item: HeaderMenuItem) => void;
};

const emptyItem = (sortOrder: number): HeaderMenuItem => ({
  id: "",
  label: "",
  href: "/",
  sortOrder,
  enabled: true,
});

export function AdminHeaderMenuFormModal({
  open,
  item,
  nextSortOrder,
  onClose,
  onSave,
}: AdminHeaderMenuFormModalProps) {
  const [form, setForm] = useState<HeaderMenuItem>(emptyItem(0));

  useEffect(() => {
    if (!open) return;
    setForm(item ?? emptyItem(nextSortOrder));
  }, [item, nextSortOrder, open]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.label.trim() || !form.href.trim()) return;
    onSave({
      ...form,
      label: form.label.trim(),
      href: form.href.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{item ? "แก้ไขเมนู" : "เพิ่มเมนู"}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ปิด
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">ชื่อเมนู</label>
            <input
              required
              value={form.label}
              onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              placeholder="ร้านค้า"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">ลิงก์ (URL)</label>
            <input
              required
              value={form.href}
              onChange={(event) => setForm((current) => ({ ...current, href: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              placeholder="/shop"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))}
            />
            แสดงบนหน้าร้าน
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
          >
            {item ? "บันทึกการแก้ไข" : "เพิ่มเมนู"}
          </button>
        </form>
      </div>
    </div>
  );
}
