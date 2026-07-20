"use client";

import { useEffect, useState } from "react";
import { AdminProductImagePicker } from "@/components/admin/AdminProductImagePicker";
import { newId } from "@/lib/cms/homepageCms";
import type {
  HeaderMegaMenuColumn,
  HeaderMegaMenuConfig,
  HeaderMegaMenuLink,
  HeaderMegaMenuPromo,
} from "@/lib/cms/headerCms";

type AdminHeaderMegaMenuModalProps = {
  open: boolean;
  menuLabel: string;
  value: HeaderMegaMenuConfig | null;
  onClose: () => void;
  onSave: (value: HeaderMegaMenuConfig | null) => void;
};

const emptyMegaMenu = (): HeaderMegaMenuConfig => ({
  enabled: true,
  columns: [],
  promos: [],
});

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 9.024A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-9.024.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 4.5a.75.75 0 101.5-.06l-.3-4.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 4.5a.75.75 0 101.5.06l.3-4.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function AdminHeaderMegaMenuModal({
  open,
  menuLabel,
  value,
  onClose,
  onSave,
}: AdminHeaderMegaMenuModalProps) {
  const [form, setForm] = useState<HeaderMegaMenuConfig>(emptyMegaMenu());

  useEffect(() => {
    if (!open) return;
    setForm(value ?? emptyMegaMenu());
  }, [open, value]);

  if (!open) return null;

  function updateForm(next: HeaderMegaMenuConfig) {
    setForm(next);
  }

  function addColumn() {
    updateForm({
      ...form,
      columns: [
        ...form.columns,
        {
          id: newId("mega-col"),
          title: "New Column",
          sortOrder: form.columns.length,
          enabled: true,
          links: [],
        },
      ],
    });
  }

  function updateColumn(columnId: string, patch: Partial<HeaderMegaMenuColumn>) {
    updateForm({
      ...form,
      columns: form.columns.map((column) => (column.id === columnId ? { ...column, ...patch } : column)),
    });
  }

  function deleteColumn(columnId: string) {
    updateForm({
      ...form,
      columns: form.columns
        .filter((column) => column.id !== columnId)
        .map((column, index) => ({ ...column, sortOrder: index })),
    });
  }

  function addLink(columnId: string) {
    updateForm({
      ...form,
      columns: form.columns.map((column) => {
        if (column.id !== columnId) return column;
        return {
          ...column,
          links: [
            ...column.links,
            {
              id: newId("mega-link"),
              label: "New Link",
              href: "/shop",
              sortOrder: column.links.length,
              enabled: true,
            },
          ],
        };
      }),
    });
  }

  function updateLink(columnId: string, linkId: string, patch: Partial<HeaderMegaMenuLink>) {
    updateForm({
      ...form,
      columns: form.columns.map((column) => {
        if (column.id !== columnId) return column;
        return {
          ...column,
          links: column.links.map((link) => (link.id === linkId ? { ...link, ...patch } : link)),
        };
      }),
    });
  }

  function deleteLink(columnId: string, linkId: string) {
    updateForm({
      ...form,
      columns: form.columns.map((column) => {
        if (column.id !== columnId) return column;
        return {
          ...column,
          links: column.links
            .filter((link) => link.id !== linkId)
            .map((link, index) => ({ ...link, sortOrder: index })),
        };
      }),
    });
  }

  function addPromo() {
    updateForm({
      ...form,
      promos: [
        ...form.promos,
        {
          id: newId("mega-promo"),
          image: "/assets/img/header/menu/menu-1.jpg",
          label: "Promo",
          href: "/shop",
          sortOrder: form.promos.length,
          enabled: true,
        },
      ],
    });
  }

  function updatePromo(promoId: string, patch: Partial<HeaderMegaMenuPromo>) {
    updateForm({
      ...form,
      promos: form.promos.map((promo) => (promo.id === promoId ? { ...promo, ...patch } : promo)),
    });
  }

  function deletePromo(promoId: string) {
    updateForm({
      ...form,
      promos: form.promos
        .filter((promo) => promo.id !== promoId)
        .map((promo, index) => ({ ...promo, sortOrder: index })),
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSave(form.enabled ? form : { ...form, enabled: false });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Mega Menu — {menuLabel}</h3>
            <p className="text-sm text-slate-400">จัดการคอลัมน์ ลิงก์ และรูปโปรโมชัน</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ปิด
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) => updateForm({ ...form, enabled: event.target.checked })}
            />
            เปิดใช้ Mega Menu สำหรับเมนูนี้
          </label>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">คอลัมน์</h4>
              <button
                type="button"
                onClick={addColumn}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
              >
                + เพิ่มคอลัมน์
              </button>
            </div>

            {form.columns.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
                ยังไม่มีคอลัมน์
              </p>
            ) : (
              form.columns.map((column) => (
                <div key={column.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <input
                      value={column.title}
                      onChange={(event) => updateColumn(column.id, { title: event.target.value })}
                      className="min-w-[180px] flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                      placeholder="ชื่อคอลัมน์"
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={column.enabled}
                        onChange={(event) => updateColumn(column.id, { enabled: event.target.checked })}
                      />
                      แสดง
                    </label>
                    <button
                      type="button"
                      onClick={() => deleteColumn(column.id)}
                      className="flex items-center gap-1 rounded-md bg-rose-600 px-2.5 py-1.5 text-xs text-white hover:bg-rose-500"
                    >
                      <TrashIcon />
                      ลบคอลัมน์
                    </button>
                  </div>

                  <div className="space-y-2">
                    {column.links.map((link) => (
                      <div key={link.id} className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
                        <input
                          value={link.label}
                          onChange={(event) => updateLink(column.id, link.id, { label: event.target.value })}
                          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                          placeholder="ชื่อลิงก์"
                        />
                        <input
                          value={link.href}
                          onChange={(event) => updateLink(column.id, link.id, { href: event.target.value })}
                          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                          placeholder="/shop"
                        />
                        <label className="flex items-center gap-2 text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={link.enabled}
                            onChange={(event) => updateLink(column.id, link.id, { enabled: event.target.checked })}
                          />
                          แสดง
                        </label>
                        <button
                          type="button"
                          onClick={() => deleteLink(column.id, link.id)}
                          className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
                        >
                          ลบ
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addLink(column.id)}
                    className="mt-3 rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
                  >
                    + เพิ่มลิงก์
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">รูปโปรโมชัน</h4>
              <button
                type="button"
                onClick={addPromo}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
              >
                + เพิ่มรูป
              </button>
            </div>

            {form.promos.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
                ยังไม่มีรูปโปรโมชัน
              </p>
            ) : (
              form.promos.map((promo) => (
                <div key={promo.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-400">รูปภาพ</label>
                      <AdminProductImagePicker
                        value={promo.image}
                        onChange={(image) => updatePromo(promo.id, { image })}
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-400">ป้ายปุ่ม</label>
                        <input
                          value={promo.label}
                          onChange={(event) => updatePromo(promo.id, { label: event.target.value })}
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-400">ลิงก์</label>
                        <input
                          value={promo.href}
                          onChange={(event) => updatePromo(promo.id, { href: event.target.value })}
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={promo.enabled}
                            onChange={(event) => updatePromo(promo.id, { enabled: event.target.checked })}
                          />
                          แสดง
                        </label>
                        <button
                          type="button"
                          onClick={() => deletePromo(promo.id)}
                          className="flex items-center gap-1 rounded-md bg-rose-600 px-2.5 py-1.5 text-xs text-white hover:bg-rose-500"
                        >
                          <TrashIcon />
                          ลบ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              ใช้การตั้งค่า Mega Menu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
