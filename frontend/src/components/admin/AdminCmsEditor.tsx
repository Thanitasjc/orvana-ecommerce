"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AdminHeaderCmsEditor } from "@/components/admin/cms/AdminHeaderCmsEditor";
import { AdminCmsHeroFormModal } from "@/components/admin/cms/AdminCmsHeroFormModal";
import { AdminCmsProductPickerModal } from "@/components/admin/cms/AdminCmsProductPickerModal";
import { fetchAdminProducts, type AdminProduct } from "@/lib/api/adminProducts";
import { defaultProductImageForId, formatPriceTHB, resolveProductImage } from "@/lib/api/products";
import { fetchAdminHomepageCms, saveAdminHomepageCms } from "@/lib/api/cms";
import {
  defaultHomepageCms,
  newId,
  type CmsSectionConfig,
  type HeroSlideRecord,
  type HomepageCmsState,
  type ProductCurationItem,
} from "@/lib/cms/homepageCms";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

type CmsTab = "hero_banner" | "customer_favorite" | "featured_products" | "header";

const TABS: { key: CmsTab; label: string; title: string; description: string; addLabel: string }[] = [
  {
    key: "header",
    label: "Header",
    title: "Header",
    description: "จัดการโลโก้และเมนูบน Header",
    addLabel: "+ เพิ่มเมนู",
  },
  {
    key: "hero_banner",
    label: "Hero Banner",
    title: "Hero Banners",
    description: "จัดการสไลด์หน้าแรก — รูปภาพ, YouTube และข้อความทับ",
    addLabel: "+ เพิ่มสไลด์",
  },
  {
    key: "customer_favorite",
    label: "Customer Favorite",
    title: "Customer Favorite",
    description: "เลือกสินค้าแสดงในแท็บ Customer Favorite บนหน้าแรก",
    addLabel: "+ เพิ่มสินค้า",
  },
  {
    key: "featured_products",
    label: "Featured Products",
    title: "Featured Products",
    description: "เลือกสินค้าแนะนำใน slider Featured Products",
    addLabel: "+ เพิ่มสินค้า",
  },
];

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

function StatusBadge({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <span className="text-sm font-medium text-emerald-400">Active</span>
  ) : (
    <span className="text-sm text-slate-500">Disabled</span>
  );
}

type ProductSectionKey = "customer_favorite" | "featured_products";

const SECTION_STATE_KEY: Record<
  ProductSectionKey,
  keyof Pick<HomepageCmsState, "customerFavorite" | "featuredProducts">
> = {
  customer_favorite: "customerFavorite",
  featured_products: "featuredProducts",
};

function getSectionFromState(cms: HomepageCmsState, key: ProductSectionKey): CmsSectionConfig {
  return cms[SECTION_STATE_KEY[key]];
}

function patchSectionInState(
  cms: HomepageCmsState,
  key: ProductSectionKey,
  patch: Partial<CmsSectionConfig>,
): HomepageCmsState {
  const stateKey = SECTION_STATE_KEY[key];
  return { ...cms, [stateKey]: { ...cms[stateKey], ...patch } };
}

export function AdminCmsEditor() {
  const [cms, setCms] = useState<HomepageCmsState>(defaultHomepageCms);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CmsTab>("hero_banner");
  const [message, setMessage] = useState("");
  const [productMap, setProductMap] = useState<Record<number, AdminProduct>>({});

  const [heroFormOpen, setHeroFormOpen] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroSlideRecord | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSection, setPickerSection] = useState<"customer_favorite" | "featured_products">(
    "customer_favorite",
  );

  const activeMeta = TABS.find((t) => t.key === activeTab)!;

  const persist = useCallback(async (next: HomepageCmsState) => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) {
      setLoadError("กรุณาเข้าสู่ระบบ admin");
      return;
    }

    setSaving(true);
    setLoadError(null);

    try {
      const saved = await saveAdminHomepageCms(next, token);
      setCms(saved);
    } catch {
      setLoadError("บันทึก CMS ไม่สำเร็จ");
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

    void fetchAdminHomepageCms(token)
      .then((data) => setCms(data))
      .catch(() => setLoadError("โหลด CMS ไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    void fetchAdminProducts(token)
      .then((res) => {
        const map: Record<number, AdminProduct> = {};
        for (const p of res.data ?? []) map[p.id] = p;
        setProductMap(map);
      })
      .catch(() => setProductMap({}));
  }, []);

  const sortedHeroSlides = useMemo(
    () => [...cms.heroSlides].sort((a, b) => a.sortOrder - b.sortOrder),
    [cms.heroSlides],
  );

  function patchSection(key: ProductSectionKey, patch: Partial<CmsSectionConfig>) {
    void persist(patchSectionInState(cms, key, patch));
  }

  async function saveHeroSlide(slide: HeroSlideRecord) {
    const isNew = !slide.id;
    const record = { ...slide, id: slide.id || newId("hero") };
    const heroSlides = isNew
      ? [...cms.heroSlides, record]
      : cms.heroSlides.map((s) => (s.id === record.id ? record : s));
    await persist({ ...cms, heroSlides });
    setHeroFormOpen(false);
    setEditingHero(null);
    showMessage(isNew ? "เพิ่มสไลด์แล้ว" : "บันทึกสไลด์แล้ว");
  }

  async function deleteHeroSlide(id: string) {
    if (!window.confirm("ลบสไลด์นี้ใช่หรือไม่?")) return;
    await persist({ ...cms, heroSlides: cms.heroSlides.filter((s) => s.id !== id) });
    showMessage("ลบสไลด์แล้ว");
  }

  async function addProductToSection(
    sectionKey: "customer_favorite" | "featured_products",
    product: AdminProduct,
  ) {
    setProductMap((prev) => ({ ...prev, [product.id]: product }));
    const section = getSectionFromState(cms, sectionKey);
    const item: ProductCurationItem = {
      id: newId("item"),
      productId: product.id,
      sortOrder: section.items.length,
      enabled: true,
    };
    await persist({
      ...cms,
      [SECTION_STATE_KEY[sectionKey]]: { ...section, items: [...section.items, item] },
    });
    showMessage(`เพิ่ม ${product.name} แล้ว`);
  }

  async function deleteProductItem(sectionKey: "customer_favorite" | "featured_products", itemId: string) {
    if (!window.confirm("ลบรายการนี้ใช่หรือไม่?")) return;
    const section = getSectionFromState(cms, sectionKey);
    await persist({
      ...cms,
      [SECTION_STATE_KEY[sectionKey]]: { ...section, items: section.items.filter((i) => i.id !== itemId) },
    });
    showMessage("ลบรายการแล้ว");
  }

  function toggleProductItem(sectionKey: "customer_favorite" | "featured_products", itemId: string) {
    const section = getSectionFromState(cms, sectionKey);
    void persist({
      ...cms,
      [SECTION_STATE_KEY[sectionKey]]: {
        ...section,
        items: section.items.map((i) => (i.id === itemId ? { ...i, enabled: !i.enabled } : i)),
      },
    });
  }

  function renderHeroTable() {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-700 text-slate-400">
            <tr>
              <th className="px-3 py-2 font-medium">ลำดับ</th>
              <th className="px-3 py-2 font-medium">Preview</th>
              <th className="px-3 py-2 font-medium">ชื่อ</th>
              <th className="px-3 py-2 font-medium">ประเภท</th>
              <th className="px-3 py-2 font-medium">สถานะ</th>
              <th className="px-3 py-2 font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {sortedHeroSlides.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-slate-500">
                  ยังไม่มีสไลด์ — กด &quot;เพิ่มสไลด์&quot; เพื่อเริ่มต้น
                </td>
              </tr>
            ) : (
              sortedHeroSlides.map((slide) => (
                <tr key={slide.id} className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/30">
                  <td className="px-3 py-3 text-slate-300">{slide.sortOrder}</td>
                  <td className="px-3 py-3">
                    {slide.mediaType === "youtube" ? (
                      <div className="flex h-14 w-20 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-xs font-bold text-red-400">
                        YT
                      </div>
                    ) : slide.image ? (
                      <img
                        src={resolveProductImage(slide.image)}
                        alt=""
                        className="h-14 w-20 rounded-lg border border-slate-700 object-cover"
                      />
                    ) : (
                      <div className="h-14 w-20 rounded-lg border border-dashed border-slate-700 bg-slate-900" />
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-white">{slide.adminName}</p>
                    {slide.title ? <p className="text-xs text-slate-500">{slide.title}</p> : null}
                  </td>
                  <td className="px-3 py-3 uppercase text-slate-400">{slide.mediaType === "youtube" ? "YOUTUBE" : "IMAGE"}</td>
                  <td className="px-3 py-3">
                    <StatusBadge enabled={slide.enabled} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingHero(slide);
                          setHeroFormOpen(true);
                        }}
                        className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
                      >
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteHeroSlide(slide.id)}
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
    );
  }

  function renderProductSection(sectionKey: "customer_favorite" | "featured_products") {
    const section = getSectionFromState(cms, sectionKey);
    const sortedItems = [...section.items].sort((a, b) => a.sortOrder - b.sortOrder);

    return (
      <>
        <div className="mb-6 grid gap-4 rounded-xl border border-slate-800 bg-slate-900/30 p-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-slate-500">หัวข้อ Section</label>
            <input
              value={section.title}
              onChange={(e) => patchSection(sectionKey, { title: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">สถานะ Section</label>
            <label className="flex h-[38px] items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={section.enabled}
                onChange={(e) => patchSection(sectionKey, { enabled: e.target.checked })}
              />
              {section.enabled ? "Active" : "Disabled"}
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-slate-500">คำอธิบาย</label>
            <textarea
              value={section.subtitle}
              onChange={(e) => patchSection(sectionKey, { subtitle: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-700 text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">ลำดับ</th>
                <th className="px-3 py-2 font-medium">Preview</th>
                <th className="px-3 py-2 font-medium">ชื่อ</th>
                <th className="px-3 py-2 font-medium">ราคา</th>
                <th className="px-3 py-2 font-medium">สถานะ</th>
                <th className="px-3 py-2 font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-slate-500">
                    ยังไม่มีสินค้า — กด &quot;เพิ่มสินค้า&quot; เพื่อเลือกจาก catalog
                  </td>
                </tr>
              ) : (
                sortedItems.map((item, index) => {
                  const product = productMap[item.productId];
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/30"
                    >
                      <td className="px-3 py-3 text-slate-300">{item.sortOrder}</td>
                      <td className="px-3 py-3">
                        {product ? (
                          <img
                            src={resolveProductImage(product.image, defaultProductImageForId(product.id))}
                            alt={product.name}
                            className="h-14 w-14 rounded-lg border border-slate-700 object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-500">
                            #{item.productId}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-white">{product?.name ?? `Product #${item.productId}`}</p>
                        <p className="text-xs text-slate-500">{product?.slug ?? "—"}</p>
                      </td>
                      <td className="px-3 py-3 text-emerald-300">
                        {product ? formatPriceTHB(product.price) : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => toggleProductItem(sectionKey, item.id)}
                          className="text-left"
                        >
                          <StatusBadge enabled={item.enabled} />
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              const items = [...sortedItems];
                              [items[index - 1], items[index]] = [items[index], items[index - 1]];
                              patchSection(
                                sectionKey,
                                { items: items.map((it, i) => ({ ...it, sortOrder: i })) },
                              );
                            }}
                            className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400 disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={index === sortedItems.length - 1}
                            onClick={() => {
                              const items = [...sortedItems];
                              [items[index], items[index + 1]] = [items[index + 1], items[index]];
                              patchSection(
                                sectionKey,
                                { items: items.map((it, i) => ({ ...it, sortOrder: i })) },
                              );
                            }}
                            className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400 disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProductItem(sectionKey, item.id)}
                            className="flex items-center gap-1 rounded-md bg-rose-600 px-2.5 py-1.5 text-xs text-white hover:bg-rose-500"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  const excludeProductIds =
    activeTab === "customer_favorite"
      ? cms.customerFavorite.items.map((i) => i.productId)
      : activeTab === "featured_products"
        ? cms.featuredProducts.items.map((i) => i.productId)
        : [];

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "border border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "header" ? <AdminHeaderCmsEditor /> : null}

      {activeTab !== "header" ? (
      <AdminPanel
        title={activeMeta.title}
        action={
          <button
            type="button"
            onClick={() => {
              if (activeTab === "hero_banner") {
                setEditingHero(null);
                setHeroFormOpen(true);
              } else {
                setPickerSection(activeTab);
                setPickerOpen(true);
              }
            }}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
          >
            {activeMeta.addLabel}
          </button>
        }
      >
        <p className="mb-4 text-sm text-slate-400">{activeMeta.description}</p>
        {loading ? <p className="mb-3 text-sm text-slate-400">กำลังโหลด...</p> : null}
        {loadError ? <p className="mb-3 text-sm text-rose-400">{loadError}</p> : null}
        {saving ? <p className="mb-3 text-sm text-slate-400">กำลังบันทึก...</p> : null}
        {message ? <p className="mb-3 text-sm text-emerald-400">{message}</p> : null}

        {!loading && activeTab === "hero_banner" ? renderHeroTable() : null}
        {!loading && activeTab === "customer_favorite" ? renderProductSection("customer_favorite") : null}
        {!loading && activeTab === "featured_products" ? renderProductSection("featured_products") : null}

        <p className="mt-4 text-xs text-slate-600">
          บันทึกลง backend — หน้าร้านจะอ่านจาก API `/cms/homepage`
        </p>
      </AdminPanel>
      ) : null}

      {activeTab !== "header" ? (
      <>
      <AdminCmsHeroFormModal
        open={heroFormOpen}
        slide={editingHero}
        nextSortOrder={cms.heroSlides.length}
        onClose={() => {
          setHeroFormOpen(false);
          setEditingHero(null);
        }}
        onSave={saveHeroSlide}
      />

      <AdminCmsProductPickerModal
        open={pickerOpen}
        excludeIds={excludeProductIds}
        onClose={() => setPickerOpen(false)}
        onPick={(product) => addProductToSection(pickerSection, product)}
      />
      </>
      ) : null}
    </>
  );
}
