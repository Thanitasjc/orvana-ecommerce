"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AdminProductImagePicker } from "@/components/admin/AdminProductImagePicker";
import { AdminHeaderMenuFormModal } from "@/components/admin/cms/AdminHeaderMenuFormModal";
import { AdminHeaderMegaMenuModal } from "@/components/admin/cms/AdminHeaderMegaMenuModal";
import { fetchAdminHeaderCms, saveAdminHeaderCms } from "@/lib/api/headerCms";
import { newId } from "@/lib/cms/homepageCms";
import {
  defaultHeaderCms,
  defaultShopMegaMenu,
  TOPBAR_SOCIAL_PLATFORM_PRESETS,
  type HeaderCmsState,
  type HeaderMegaMenuConfig,
  type HeaderMenuItem,
  type HeaderTopbarLanguage,
  type HeaderTopbarSocialLink,
  type HeaderTopbarSocialPlatform,
} from "@/lib/cms/headerCms";
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
  const [draft, setDraft] = useState<HeaderCmsState>(defaultHeaderCms);
  const [baseline, setBaseline] = useState<HeaderCmsState>(defaultHeaderCms);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [menuFormOpen, setMenuFormOpen] = useState(false);
  const [megaFormOpen, setMegaFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<HeaderMenuItem | null>(null);
  const [editingMegaMenu, setEditingMegaMenu] = useState<HeaderMenuItem | null>(null);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(baseline), [draft, baseline]);

  const sortedMenuItems = useMemo(
    () => [...draft.menuItems].sort((a, b) => a.sortOrder - b.sortOrder),
    [draft.menuItems],
  );

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
      .then((data) => {
        setDraft(data);
        setBaseline(data);
      })
      .catch(() => setLoadError("โหลด Header CMS ไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  async function handleSave() {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) {
      setLoadError("กรุณาเข้าสู่ระบบ admin");
      return;
    }

    setSaving(true);
    setLoadError(null);

    try {
      const saved = await saveAdminHeaderCms(draft, token);
      setDraft(saved);
      setBaseline(saved);
      showMessage("บันทึก Header แล้ว");
    } catch {
      setLoadError("บันทึก Header ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  function updateTopbar(patch: Partial<HeaderCmsState["topbar"]>) {
    setDraft((current) => ({ ...current, topbar: { ...current.topbar, ...patch } }));
  }

  function addLanguage() {
    const code = `lang-${draft.topbar.languages.length + 1}`;
    updateTopbar({
      languages: [
        ...draft.topbar.languages,
        { code, label: "New Language", enabled: true },
      ],
    });
  }

  function updateLanguage(index: number, patch: Partial<HeaderTopbarLanguage>) {
    updateTopbar({
      languages: draft.topbar.languages.map((language, languageIndex) =>
        languageIndex === index ? { ...language, ...patch } : language,
      ),
    });
  }

  function deleteLanguage(index: number) {
    const languages = draft.topbar.languages.filter((_, languageIndex) => languageIndex !== index);
    const defaultLanguage = languages.some((language) => language.code === draft.topbar.defaultLanguage)
      ? draft.topbar.defaultLanguage
      : languages[0]?.code || "th";
    updateTopbar({ languages, defaultLanguage });
  }

  function addSocialLink(platform: HeaderTopbarSocialPlatform = "facebook") {
    const preset = TOPBAR_SOCIAL_PLATFORM_PRESETS[platform];
    updateTopbar({
      socialLinks: [
        ...draft.topbar.socialLinks,
        {
          id: newId("social"),
          platform,
          label: preset.label,
          url: "",
          iconClass: preset.iconClass,
          imageUrl: "",
          sortOrder: draft.topbar.socialLinks.length,
          enabled: true,
        },
      ],
    });
  }

  function updateSocialLink(index: number, patch: Partial<HeaderTopbarSocialLink>) {
    updateTopbar({
      socialLinks: draft.topbar.socialLinks.map((link, linkIndex) => {
        if (linkIndex !== index) return link;
        const next = { ...link, ...patch };
        if (patch.platform && patch.platform !== link.platform) {
          const preset = TOPBAR_SOCIAL_PLATFORM_PRESETS[patch.platform];
          next.label = preset.label;
          next.iconClass = preset.iconClass;
        }
        return next;
      }),
    });
  }

  function deleteSocialLink(index: number) {
    updateTopbar({
      socialLinks: draft.topbar.socialLinks
        .filter((_, linkIndex) => linkIndex !== index)
        .map((link, sortOrder) => ({ ...link, sortOrder })),
    });
  }

  function saveMenuItem(item: HeaderMenuItem) {
    const exists = draft.menuItems.some((entry) => entry.id === item.id);
    const menuItems = exists
      ? draft.menuItems.map((entry) => (entry.id === item.id ? item : entry))
      : [...draft.menuItems, { ...item, id: item.id || newId("menu") }];

    setDraft((current) => ({ ...current, menuItems }));
    setMenuFormOpen(false);
    setEditingMenu(null);
    showMessage(exists ? "อัปเดตเมนูในแบบร่างแล้ว" : "เพิ่มเมนูในแบบร่างแล้ว");
  }

  function saveMegaMenu(menuId: string, megaMenu: HeaderMegaMenuConfig | null) {
    setDraft((current) => ({
      ...current,
      menuItems: current.menuItems.map((item) =>
        item.id === menuId ? { ...item, megaMenu } : item,
      ),
    }));
    setMegaFormOpen(false);
    setEditingMegaMenu(null);
    showMessage("อัปเดต Mega Menu ในแบบร่างแล้ว");
  }

  function deleteMenuItem(id: string) {
    if (!window.confirm("ลบเมนูนี้ใช่หรือไม่?")) return;
    setDraft((current) => ({
      ...current,
      menuItems: current.menuItems
        .filter((item) => item.id !== id)
        .map((item, index) => ({ ...item, sortOrder: index })),
    }));
    showMessage("ลบเมนูจากแบบร่างแล้ว");
  }

  function moveMenuItem(index: number, direction: -1 | 1) {
    const items = [...sortedMenuItems];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
    setDraft((current) => ({
      ...current,
      menuItems: items.map((item, sortOrder) => ({ ...item, sortOrder })),
    }));
  }

  function enableMegaMenu(menuItem: HeaderMenuItem) {
    setEditingMegaMenu(menuItem);
    setMegaFormOpen(true);
  }

  function createMegaMenu(menuItem: HeaderMenuItem) {
    setEditingMegaMenu({
      ...menuItem,
      megaMenu: defaultShopMegaMenu,
    });
    setMegaFormOpen(true);
  }

  const logoPreview = resolveProductImage(draft.logoUrl);

  return (
    <>
      <AdminPanel
        title="Header — Topbar, Menu & Mega Menu"
        action={
          <div className="flex items-center gap-2">
            {dirty ? <span className="text-xs text-amber-300">มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</span> : null}
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={() => void handleSave()}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก Header"}
            </button>
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
          </div>
        }
      >
        <p className="mb-4 text-sm text-slate-400">
          จัดการ Topbar, โลโก้, เมนูหลัก และ Mega Menu ของหน้าร้าน
        </p>
        {loading ? <p className="mb-3 text-sm text-slate-400">กำลังโหลด...</p> : null}
        {loadError ? <p className="mb-3 text-sm text-rose-400">{loadError}</p> : null}
        {message ? <p className="mb-3 text-sm text-emerald-400">{message}</p> : null}

        {!loading ? (
          <>
            <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Topbar</h4>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={draft.topbar.enabled}
                    onChange={(event) => updateTopbar({ enabled: event.target.checked })}
                  />
                  แสดง Topbar
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">เบอร์โทร</label>
                  <input
                    value={draft.topbar.phone}
                    onChange={(event) => updateTopbar({ phone: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">ภาษาเริ่มต้น</label>
                  <select
                    value={draft.topbar.defaultLanguage}
                    onChange={(event) => updateTopbar({ defaultLanguage: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  >
                    {draft.topbar.languages.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    โซเชียล (แสดงเป็นไอคอน)
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(TOPBAR_SOCIAL_PLATFORM_PRESETS) as HeaderTopbarSocialPlatform[]).map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => addSocialLink(platform)}
                        className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                      >
                        + {TOPBAR_SOCIAL_PLATFORM_PRESETS[platform].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {draft.topbar.socialLinks.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
                      ยังไม่มีลิงก์โซเชียล
                    </p>
                  ) : (
                    draft.topbar.socialLinks.map((link, index) => (
                      <div key={link.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                        <div className="mb-3 grid gap-2 md:grid-cols-[140px_1fr_1fr_auto]">
                          <select
                            value={link.platform}
                            onChange={(event) =>
                              updateSocialLink(index, { platform: event.target.value as HeaderTopbarSocialPlatform })
                            }
                            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                          >
                            {(Object.keys(TOPBAR_SOCIAL_PLATFORM_PRESETS) as HeaderTopbarSocialPlatform[]).map(
                              (platform) => (
                                <option key={platform} value={platform}>
                                  {TOPBAR_SOCIAL_PLATFORM_PRESETS[platform].label}
                                </option>
                              ),
                            )}
                          </select>
                          <input
                            value={link.label}
                            onChange={(event) => updateSocialLink(index, { label: event.target.value })}
                            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                            placeholder="ชื่อ (aria-label)"
                          />
                          <input
                            value={link.url}
                            onChange={(event) => updateSocialLink(index, { url: event.target.value })}
                            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                            placeholder="https://..."
                          />
                          <label className="flex items-center gap-2 text-xs text-slate-300">
                            <input
                              type="checkbox"
                              checked={link.enabled}
                              onChange={(event) => updateSocialLink(index, { enabled: event.target.checked })}
                            />
                            แสดง
                          </label>
                        </div>
                        {link.platform === "custom" ? (
                          <div className="mb-3">
                            <label className="mb-1 block text-xs font-semibold text-slate-400">Icon class (Font Awesome)</label>
                            <input
                              value={link.iconClass}
                              onChange={(event) => updateSocialLink(index, { iconClass: event.target.value })}
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                              placeholder="fa-brands fa-facebook-f"
                            />
                          </div>
                        ) : null}
                        <div className="mb-3">
                          <label className="mb-1 block text-xs font-semibold text-slate-400">
                            รูปไอคอน (ถ้ามี จะใช้แทน Font Awesome)
                          </label>
                          <AdminProductImagePicker
                            value={link.imageUrl}
                            onChange={(imageUrl) => updateSocialLink(index, { imageUrl })}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteSocialLink(index)}
                          className="flex items-center gap-1 rounded-md bg-rose-600 px-2.5 py-1.5 text-xs text-white hover:bg-rose-500"
                        >
                          <TrashIcon />
                          ลบ
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-400">ภาษาใน Topbar</h5>
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                  >
                    + เพิ่มภาษา
                  </button>
                </div>
                <div className="space-y-2">
                  {draft.topbar.languages.map((language, index) => (
                    <div key={`${language.code}-${index}`} className="grid gap-2 md:grid-cols-[120px_1fr_auto_auto]">
                      <input
                        value={language.code}
                        onChange={(event) => updateLanguage(index, { code: event.target.value })}
                        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                        placeholder="th"
                      />
                      <input
                        value={language.label}
                        onChange={(event) => updateLanguage(index, { label: event.target.value })}
                        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                        placeholder="ไทย"
                      />
                      <label className="flex items-center gap-2 text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={language.enabled}
                          onChange={(event) => updateLanguage(index, { enabled: event.target.checked })}
                        />
                        แสดง
                      </label>
                      <button
                        type="button"
                        onClick={() => deleteLanguage(index)}
                        className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
                      >
                        ลบ
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h4 className="mb-3 text-sm font-semibold text-white">โลโก้</h4>
              <div className="mb-4 flex h-16 items-center rounded-lg border border-slate-800 bg-slate-950 px-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoPreview} alt={draft.logoAlt} className="max-h-10 w-auto" />
              </div>
              <AdminProductImagePicker
                value={draft.logoUrl}
                onChange={(logoUrl) => setDraft((current) => ({ ...current, logoUrl }))}
              />
              <div className="mt-4">
                <label className="mb-1 block text-xs font-semibold text-slate-400">Alt text (SEO)</label>
                <input
                  value={draft.logoAlt}
                  onChange={(event) => setDraft((current) => ({ ...current, logoAlt: event.target.value }))}
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
                    <th className="px-3 py-2 font-medium">Mega</th>
                    <th className="px-3 py-2 font-medium">สถานะ</th>
                    <th className="px-3 py-2 font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMenuItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                        ยังไม่มีเมนู
                      </td>
                    </tr>
                  ) : (
                    sortedMenuItems.map((item, index) => (
                      <tr key={item.id} className="border-b border-slate-800 last:border-b-0">
                        <td className="px-3 py-3 font-medium text-white">{item.label}</td>
                        <td className="px-3 py-3 font-mono text-slate-300">{item.href}</td>
                        <td className="px-3 py-3">
                          {item.megaMenu?.enabled ? (
                            <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">
                              เปิด ({item.megaMenu.columns.length} คอลัมน์)
                            </span>
                          ) : item.megaMenu ? (
                            <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">ปิด</span>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                menuItems: current.menuItems.map((entry) =>
                                  entry.id === item.id ? { ...entry, enabled: !entry.enabled } : entry,
                                ),
                              }))
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
                          <div className="flex flex-wrap gap-2">
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
                              onClick={() => (item.megaMenu ? enableMegaMenu(item) : createMegaMenu(item))}
                              className="rounded-md border border-violet-700 px-2 py-1 text-xs text-violet-200 hover:bg-violet-950"
                            >
                              Mega
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
        nextSortOrder={draft.menuItems.length}
        onClose={() => {
          setMenuFormOpen(false);
          setEditingMenu(null);
        }}
        onSave={saveMenuItem}
      />

      <AdminHeaderMegaMenuModal
        open={megaFormOpen}
        menuLabel={editingMegaMenu?.label ?? "Menu"}
        value={editingMegaMenu?.megaMenu ?? null}
        onClose={() => {
          setMegaFormOpen(false);
          setEditingMegaMenu(null);
        }}
        onSave={(megaMenu) => {
          if (!editingMegaMenu) return;
          saveMegaMenu(editingMegaMenu.id, megaMenu);
        }}
      />
    </>
  );
}
