"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AdminProductImagePicker } from "@/components/admin/AdminProductImagePicker";
import { AdminHeaderMenuFormModal } from "@/components/admin/cms/AdminHeaderMenuFormModal";
import { fetchAdminHeaderCms, saveAdminHeaderCms } from "@/lib/api/headerCms";
import { newId } from "@/lib/cms/homepageCms";
import { defaultHeaderCms, type HeaderCmsState, type HeaderMenuItem } from "@/lib/cms/headerCms";
import { resolveProductImage } from "@/lib/api/products";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

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

export function AdminHeaderCmsEditor() {
  const [header, setHeader] = useState<HeaderCmsState>(defaultHeaderCms);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [menuFormOpen, setMenuFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<HeaderMenuItem | null>(null);

  const sortedMenuItems = useMemo(
    () => [...header.menuItems].sort((a, b) => a.sortOrder - b.sortOrder),
    [header.menuItems],
  );

  const persist = useCallback(async (next: HeaderCmsState) => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) {
      setLoadError("กรุณาเข้าสู่ระบบ admin");
      return;
    }

    setSaving(true);
    setLoadError(null);

    try {
      const saved = await saveAdminHeaderCms(next, token);
      setHeader(saved);
    } catch {
      setLoadError("บันทึก Header ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }, []);

  const showMessage = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2500);
  }, []);

  useEffect(() => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      setLoadError("กรุณาเข้าสู่ระบบ admin");
      return;
    }

    void fetchAdminHeaderCms(token)
      .then((data) => setHeader(data))
      .catch(() => setLoadError("โหลด Header CMS ไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  function patchHeader(patch: Partial<HeaderCmsState>) {
    const next = { ...header, ...patch };
    setHeader(next);
    void persist(next);
    showMessage("บันทึกแล้ว");
  }

  function saveMenuItem(item: HeaderMenuItem) {
    const exists = header.menuItems.some((entry) => entry.id === item.id);
    const menuItems = exists
      ? header.menuItems.map((entry) => (entry.id === item.id ? item : entry))
      : [...header.menuItems, { ...item, id: item.id || newId("menu") }];

    patchHeader({ menuItems });
    setMenuFormOpen(false);
    setEditingMenu(null);
    showMessage(exists ? "แก้ไขเมนูแล้ว" : "เพิ่มเมนูแล้ว");
  }

  function deleteMenuItem(id: string) {
    if (!window.confirm("ลบเมนูนี้ใช่หรือไม่?")) return;
    patchHeader({
      menuItems: header.menuItems
        .filter((item) => item.id !== id)
        .map((item, index) => ({ ...item, sortOrder: index })),
    });
    showMessage("ลบเมนูแล้ว");
  }

  function moveMenuItem(index: number, direction: -1 | 1) {
    const items = [...sortedMenuItems];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
    patchHeader({
      menuItems: items.map((item, sortOrder) => ({ ...item, sortOrder })),
    });
  }

  const logoPreview = resolveProductImage(header.logoUrl);

  return (
    <>
      <AdminPanel
        title="Header — โลโก้ & เมนู"
        action={
          <button
            type="button"
            onClick={() => {
              setEditingMenu(null);
              setMenuFormOpen(true);
            }}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
          >
            + เพิ่มเมนู
          </button>
        }
      >
        <p className="mb-4 text-sm text-slate-400">จัดการโลโก้และรายการเมนูบน Header หน้าร้าน</p>
        {loading ? <p className="mb-3 text-sm text-slate-400">กำลังโหลด...</p> : null}
        {loadError ? <p className="mb-3 text-sm text-rose-400">{loadError}</p> : null}
        {saving ? <p className="mb-3 text-sm text-slate-400">กำลังบันทึก...</p> : null}
        {message ? <p className="mb-3 text-sm text-emerald-400">{message}</p> : null}

        {!loading ? (
          <>
            <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h4 className="mb-3 text-sm font-semibold text-white">โลโก้</h4>
              <div className="mb-4 flex h-16 items-center rounded-lg border border-slate-800 bg-slate-950 px-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoPreview} alt={header.logoAlt} className="max-h-10 w-auto" />
              </div>
              <AdminProductImagePicker
                value={header.logoUrl}
                onChange={(logoUrl) => patchHeader({ logoUrl })}
              />
              <div className="mt-4">
                <label className="mb-1 block text-xs font-semibold text-slate-400">Alt text (SEO)</label>
                <input
                  value={header.logoAlt}
                  onChange={(event) => setHeader((current) => ({ ...current, logoAlt: event.target.value }))}
                  onBlur={() => patchHeader({ logoAlt: header.logoAlt })}
                  className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">ชื่อเมนู</th>
                    <th className="px-3 py-2 font-medium">ลิงก์</th>
                    <th className="px-3 py-2 font-medium">สถานะ</th>
                    <th className="px-3 py-2 font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMenuItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-slate-500">
                        ยังไม่มีเมนู
                      </td>
                    </tr>
                  ) : (
                    sortedMenuItems.map((item, index) => (
                      <tr key={item.id} className="border-b border-slate-800 last:border-b-0">
                        <td className="px-3 py-3 font-medium text-white">{item.label}</td>
                        <td className="px-3 py-3 font-mono text-slate-300">{item.href}</td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              patchHeader({
                                menuItems: header.menuItems.map((entry) =>
                                  entry.id === item.id ? { ...entry, enabled: !entry.enabled } : entry,
                                ),
                              })
                            }
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              item.enabled
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-slate-700 text-slate-400"
                            }`}
                          >
                            {item.enabled ? "แสดง" : "ซ่อน"}
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveMenuItem(index, -1)}
                              className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400 disabled:opacity-30"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              disabled={index === sortedMenuItems.length - 1}
                              onClick={() => moveMenuItem(index, 1)}
                              className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400 disabled:opacity-30"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMenu(item);
                                setMenuFormOpen(true);
                              }}
                              className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              แก้ไข
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteMenuItem(item.id)}
                              className="flex items-center gap-1 rounded-md bg-rose-600 px-2.5 py-1.5 text-xs text-white hover:bg-rose-500"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        <p className="mt-4 text-xs text-slate-600">บันทึกลง backend — หน้าร้านอ่านจาก API `/cms/header`</p>
      </AdminPanel>

      <AdminHeaderMenuFormModal
        open={menuFormOpen}
        item={editingMenu}
        nextSortOrder={header.menuItems.length}
        onClose={() => {
          setMenuFormOpen(false);
          setEditingMenu(null);
        }}
        onSave={saveMenuItem}
      />
    </>
  );
}
