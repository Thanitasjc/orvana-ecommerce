"use client";

import { useEffect, useState } from "react";
import type { AdminCategory, AdminProduct, AdminProductPayload } from "@/lib/api/adminProducts";
import { AdminProductGalleryPicker } from "@/components/admin/AdminProductGalleryPicker";
import { AdminProductImagePicker } from "@/components/admin/AdminProductImagePicker";
import { AdminRichTextEditor } from "@/components/admin/AdminRichTextEditor";
import type { ProductGallerySlide } from "@/lib/api/products";

type VariationFormRow = {
  key: string;
  id?: number;
  color: string;
  size: string;
  sku: string;
  stock: string;
};

type AdminProductFormModalProps = {
  open: boolean;
  product: AdminProduct | null;
  categories: AdminCategory[];
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: AdminProductPayload) => void;
};

const emptyVariation = (): VariationFormRow => ({
  key: crypto.randomUUID(),
  color: "",
  size: "",
  sku: "",
  stock: "0",
});

const emptyForm = {
  category_id: "",
  name: "",
  slug: "",
  description: "",
  detail_content: "",
  price: "",
  cost: "0",
  image: "",
  is_featured: false,
  variations: [emptyVariation()],
};

export function AdminProductFormModal({
  open,
  product,
  categories,
  submitting,
  error,
  onClose,
  onSubmit,
}: AdminProductFormModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [gallery, setGallery] = useState<ProductGallerySlide[]>([]);

  useEffect(() => {
    if (!open) return;

    if (product) {
      setForm({
        category_id: String(product.category?.id ?? ""),
        name: product.name,
        slug: product.slug,
        description: product.description ?? "",
        detail_content: product.detail_content ?? "",
        price: String(product.price),
        cost: String(product.cost ?? 0),
        image: product.image ?? "",
        is_featured: product.is_featured,
        variations:
          product.variations?.length
            ? product.variations.map((variation) => ({
                key: String(variation.id),
                id: variation.id,
                color: variation.color,
                size: variation.size,
                sku: variation.sku,
                stock: String(variation.stock),
              }))
            : [emptyVariation()],
      });
      setGallery(product.images ?? []);
      return;
    }

    setForm({
      ...emptyForm,
      category_id: categories[0] ? String(categories[0].id) : "",
      variations: [emptyVariation()],
    });
    setGallery([]);
  }, [categories, open, product]);

  if (!open) return null;

  function updateVariation(key: string, field: keyof VariationFormRow, value: string) {
    setForm((current) => ({
      ...current,
      variations: current.variations.map((row) =>
        row.key === key ? { ...row, [field]: value } : row,
      ),
    }));
  }

  function addVariation() {
    setForm((current) => ({
      ...current,
      variations: [...current.variations, emptyVariation()],
    }));
  }

  function removeVariation(key: string) {
    setForm((current) => ({
      ...current,
      variations:
        current.variations.length <= 1
          ? current.variations
          : current.variations.filter((row) => row.key !== key),
    }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    onSubmit({
      category_id: Number(form.category_id),
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim() || undefined,
      detail_content: form.detail_content.trim() || undefined,
      price: Number(form.price) || 0,
      cost: Number(form.cost) || 0,
      image: form.image.trim() || undefined,
      images: gallery.length > 0 ? gallery : undefined,
      is_featured: form.is_featured,
      variations: form.variations.map((row) => ({
        id: row.id,
        color: row.color.trim(),
        size: row.size.trim(),
        sku: row.sku.trim() || undefined,
        stock: Number(row.stock) || 0,
      })),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-bold text-white">{product ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ปิด
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-400">ชื่อสินค้า</label>
              <input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">Slug (เว้นว่างได้)</label>
              <input
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                placeholder="auto-from-name"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">หมวดหมู่</label>
              <select
                required
                value={form.category_id}
                onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                <option value="">เลือกหมวด</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">ราคาขาย (บาท)</label>
              <input
                required
                type="number"
                min={0}
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">ต้นทุน (บาท)</label>
              <input
                type="number"
                min={0}
                value={form.cost}
                onChange={(event) => setForm((current) => ({ ...current, cost: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>

            <AdminProductImagePicker
              value={form.image}
              onChange={(image) => setForm((current) => ({ ...current, image }))}
            />

            <AdminProductGalleryPicker value={gallery} onChange={setGallery} />

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-400">
                รายละเอียดสั้น (แสดงใต้ชื่อสินค้า)
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <AdminRichTextEditor
                label="รายละเอียดแท็บ Description (แก้ไขได้ตามสินค้า)"
                showTableHelp
                value={form.detail_content}
                onChange={(detail_content) => setForm((current) => ({ ...current, detail_content }))}
                placeholder="เช่น หัวข้อ คุณภาพจาก AESTHETE และรายละเอียดเพิ่มเติม..."
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(event) => setForm((current) => ({ ...current, is_featured: event.target.checked }))}
                className="rounded border-slate-600"
              />
              แสดงเป็นสินค้าแนะนำ (Featured)
            </label>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">SKU / สต็อก</h4>
              <button
                type="button"
                onClick={addVariation}
                className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
              >
                + เพิ่มตัวเลือก
              </button>
            </div>

            <div className="space-y-2">
              {form.variations.map((row) => (
                <div key={row.key} className="grid gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3 sm:grid-cols-5">
                  <input
                    required
                    value={row.color}
                    onChange={(event) => updateVariation(row.key, "color", event.target.value)}
                    placeholder="สี"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white"
                  />
                  <input
                    required
                    value={row.size}
                    onChange={(event) => updateVariation(row.key, "size", event.target.value)}
                    placeholder="ไซส์"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white"
                  />
                  <input
                    value={row.sku}
                    onChange={(event) => updateVariation(row.key, "sku", event.target.value)}
                    placeholder="SKU (อัตโนมัติ)"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white"
                  />
                  <input
                    required
                    type="number"
                    min={0}
                    value={row.stock}
                    onChange={(event) => updateVariation(row.key, "stock", event.target.value)}
                    placeholder="สต็อก"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariation(row.key)}
                    className="rounded-lg border border-rose-500/40 px-2 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10"
                  >
                    ลบ
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {submitting ? "กำลังบันทึก..." : product ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
          </button>
        </form>
      </div>
    </div>
  );
}
