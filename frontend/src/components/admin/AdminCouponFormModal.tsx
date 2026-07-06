"use client";

import { useEffect, useState } from "react";
import type { AdminCoupon, AdminCouponPayload } from "@/lib/api/adminCoupons";
import { fetchAdminCategories } from "@/lib/api/adminCategories";
import { fetchAdminProducts } from "@/lib/api/adminProducts";
import {
  APPLY_TO_OPTIONS,
  CHANNEL_OPTIONS,
  COUPON_TYPE_OPTIONS,
  CUSTOMER_RULE_OPTIONS,
  type CouponApplyTo,
  type CouponBogoRule,
  type CouponChannel,
  type CouponCustomerRule,
  type CouponDiscountType,
  type CouponRules,
  type CouponTierRule,
} from "@/lib/coupons/constants";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

type AdminCouponFormModalProps = {
  open: boolean;
  coupon: AdminCoupon | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: AdminCouponPayload) => void;
};

type CategoryOption = { id: number; name: string };
type ProductOption = { id: number; name: string };

const emptyForm = {
  code: "",
  name: "",
  description: "",
  type: "fixed" as CouponDiscountType,
  apply_to: "order" as CouponApplyTo,
  customer_rule: "all" as CouponCustomerRule,
  value: "100",
  min_order: "0",
  max_uses: "",
  per_user_limit: "",
  starts_at: "",
  ends_at: "",
  is_active: true,
  channel: "both" as CouponChannel,
  category_ids: [] as number[],
  product_ids: [] as number[],
  free_shipping_min: "",
  max_discount: "",
  tiers: [{ min_spend: 1000, discount_type: "percent" as const, value: 5 }] as CouponTierRule[],
  bogo: { buy_qty: 2, get_qty: 1, mode: "same_product" as CouponBogoRule["mode"], product_id: "", get_product_id: "" },
};

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function buildRules(form: typeof emptyForm): CouponRules | null {
  const rules: CouponRules = {};

  if (form.type === "tier") {
    rules.tiers = form.tiers.filter((tier) => tier.min_spend > 0 && tier.value > 0);
  }

  if (form.type === "bogo") {
    rules.bogo = {
      buy_qty: Number(form.bogo.buy_qty) || 2,
      get_qty: Number(form.bogo.get_qty) || 1,
      mode: form.bogo.mode,
      ...(form.bogo.mode === "product"
        ? {
            product_id: Number(form.bogo.product_id) || undefined,
            get_product_id: Number(form.bogo.get_product_id) || undefined,
          }
        : {}),
    } satisfies CouponBogoRule;
  }

  if (form.apply_to === "category" && form.category_ids.length > 0) {
    rules.category_ids = form.category_ids;
  }

  if (form.apply_to === "product" && form.product_ids.length > 0) {
    rules.product_ids = form.product_ids;
  }

  if (form.type === "free_shipping" && form.free_shipping_min) {
    rules.free_shipping_min = Number(form.free_shipping_min);
  }

  if (form.type === "percent" && form.max_discount) {
    const cap = Number(form.max_discount);
    if (cap > 0) {
      rules.max_discount = cap;
    }
  }

  return Object.keys(rules).length > 0 ? rules : null;
}

export function AdminCouponFormModal({
  open,
  coupon,
  submitting,
  error,
  onClose,
  onSubmit,
}: AdminCouponFormModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);

  useEffect(() => {
    if (!open) return;
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    void fetchAdminCategories(token, { page: 1 })
      .then((res) => setCategories(res.data.map((item) => ({ id: item.id, name: item.name }))))
      .catch(() => setCategories([]));

    void fetchAdminProducts(token, { page: 1 })
      .then((res) => setProducts(res.data.map((item) => ({ id: item.id, name: item.name }))))
      .catch(() => setProducts([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (coupon) {
      setForm({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description ?? "",
        type: coupon.type,
        apply_to: coupon.apply_to ?? "order",
        customer_rule: coupon.customer_rule ?? "all",
        value: String(coupon.value ?? 0),
        min_order: String(coupon.min_order ?? 0),
        max_uses: coupon.max_uses ? String(coupon.max_uses) : "",
        per_user_limit: coupon.per_user_limit ? String(coupon.per_user_limit) : "",
        starts_at: toDatetimeLocal(coupon.starts_at),
        ends_at: toDatetimeLocal(coupon.ends_at),
        is_active: coupon.is_active,
        channel: coupon.channel,
        category_ids: coupon.rules?.category_ids ?? [],
        product_ids: coupon.rules?.product_ids ?? [],
        free_shipping_min: coupon.rules?.free_shipping_min ? String(coupon.rules.free_shipping_min) : "",
        max_discount: coupon.rules?.max_discount ? String(coupon.rules.max_discount) : "",
        tiers: coupon.rules?.tiers?.length
          ? coupon.rules.tiers
          : [{ min_spend: 1000, discount_type: "percent", value: 5 }],
        bogo: {
          buy_qty: coupon.rules?.bogo?.buy_qty ?? 2,
          get_qty: coupon.rules?.bogo?.get_qty ?? 1,
          mode: coupon.rules?.bogo?.mode ?? "same_product",
          product_id: coupon.rules?.bogo?.product_id ? String(coupon.rules.bogo.product_id) : "",
          get_product_id: coupon.rules?.bogo?.get_product_id ? String(coupon.rules.bogo.get_product_id) : "",
        },
      });
      return;
    }

    setForm(emptyForm);
  }, [coupon, open]);

  if (!open) return null;

  function toggleId(list: number[], id: number) {
    return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    onSubmit({
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      type: form.type,
      apply_to: form.apply_to,
      customer_rule: form.customer_rule,
      value: form.type === "tier" || form.type === "bogo" || form.type === "free_shipping" ? 0 : Number(form.value) || 0,
      min_order: Number(form.min_order) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      per_user_limit: form.per_user_limit ? Number(form.per_user_limit) : null,
      rules: buildRules(form),
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      is_active: form.is_active,
      channel: form.channel,
    });
  }

  const typeHint = COUPON_TYPE_OPTIONS.find((option) => option.value === form.type)?.hint;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="my-6 w-full max-w-3xl rounded-2xl border border-slate-800 bg-[#111827] shadow-2xl">
        <div className="border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-bold text-white">{coupon ? "แก้ไขคูปอง" : "เพิ่มคูปองใหม่"}</h3>
          <p className="mt-1 text-sm text-slate-400">รองรับส่วนลดหลายรูปแบบ + เงื่อนไข + จำกัดสิทธิ์</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">รหัสคูปอง</label>
              <input
                required
                value={form.code}
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm uppercase text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">ชื่อคูปอง</label>
              <input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">คำอธิบาย (แสดงหน้าร้าน)</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={2}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">ประเภทส่วนลด</label>
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({ ...current, type: event.target.value as CouponDiscountType }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                {COUPON_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {typeHint ? <p className="mt-1 text-xs text-slate-500">{typeHint}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">ใช้กับ</label>
              <select
                value={form.apply_to}
                onChange={(event) =>
                  setForm((current) => ({ ...current, apply_to: event.target.value as CouponApplyTo }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                {APPLY_TO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(form.type === "percent" || form.type === "fixed") && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">
                  {form.type === "percent" ? "เปอร์เซ็นต์ (%)" : "จำนวนเงิน (บาท)"}
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  max={form.type === "percent" ? 100 : undefined}
                  value={form.value}
                  onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">ยอดขั้นต่ำ (บาท)</label>
                <input
                  type="number"
                  min={0}
                  value={form.min_order}
                  onChange={(event) => setForm((current) => ({ ...current, min_order: event.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
          )}

          {form.type === "percent" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">
                ส่วนลดสูงสุด (บาท) — ไม่บังคับ
              </label>
              <input
                type="number"
                min={0}
                placeholder="เช่น 500"
                value={form.max_discount}
                onChange={(event) => setForm((current) => ({ ...current, max_discount: event.target.value }))}
                className="w-full max-w-xs rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              <p className="mt-1 text-xs text-slate-500">ว่างไว้ = ไม่จำกัดเพดาน (เช่น ลด 20% สูงสุด 500 บาท)</p>
            </div>
          )}

          {form.type === "free_shipping" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">ส่งฟรีเมื่อซื้อครบ (บาท)</label>
                <input
                  type="number"
                  min={0}
                  value={form.free_shipping_min}
                  onChange={(event) => setForm((current) => ({ ...current, free_shipping_min: event.target.value }))}
                  placeholder="0 = ส่งฟรีทุกออเดอร์"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">ยอดขั้นต่ำเพิ่มเติม</label>
                <input
                  type="number"
                  min={0}
                  value={form.min_order}
                  onChange={(event) => setForm((current) => ({ ...current, min_order: event.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
          )}

          {form.type === "tier" && (
            <div className="rounded-xl border border-slate-800 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">ขั้นส่วนลด (Tier)</h4>
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      tiers: [...current.tiers, { min_spend: 0, discount_type: "percent", value: 5 }],
                    }))
                  }
                  className="text-xs text-blue-400 hover:underline"
                >
                  + เพิ่มขั้น
                </button>
              </div>
              <div className="space-y-2">
                {form.tiers.map((tier, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="ยอดขั้นต่ำ"
                      value={tier.min_spend}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          tiers: current.tiers.map((item, i) =>
                            i === index ? { ...item, min_spend: Number(event.target.value) } : item,
                          ),
                        }))
                      }
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-white"
                    />
                    <select
                      value={tier.discount_type}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          tiers: current.tiers.map((item, i) =>
                            i === index
                              ? { ...item, discount_type: event.target.value as "percent" | "fixed" }
                              : item,
                          ),
                        }))
                      }
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-white"
                    >
                      <option value="percent">%</option>
                      <option value="fixed">บาท</option>
                    </select>
                    <input
                      type="number"
                      min={1}
                      placeholder="มูลค่า"
                      value={tier.value}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          tiers: current.tiers.map((item, i) =>
                            i === index ? { ...item, value: Number(event.target.value) } : item,
                          ),
                        }))
                      }
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          tiers: current.tiers.filter((_, i) => i !== index),
                        }))
                      }
                      className="rounded-lg border border-rose-500/40 px-2 text-xs text-rose-300"
                    >
                      ลบ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {form.type === "bogo" && (
            <div className="rounded-xl border border-slate-800 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-white">เงื่อนไข BOGO</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">ซื้อ (ชิ้น)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.bogo.buy_qty}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        bogo: { ...current.bogo, buy_qty: Number(event.target.value) || 1 },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">แถม (ชิ้น)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.bogo.get_qty}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        bogo: { ...current.bogo, get_qty: Number(event.target.value) || 1 },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">โหมด</label>
                  <select
                    value={form.bogo.mode}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        bogo: {
                          ...current.bogo,
                          mode: event.target.value as CouponBogoRule["mode"],
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-white"
                  >
                    <option value="same_product">สินค้าเดียวกัน</option>
                    <option value="cheapest">แถมรายการถูกสุด</option>
                    <option value="product">ซื้อ A แถม B</option>
                  </select>
                </div>
              </div>
              {form.bogo.mode === "product" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">สินค้าที่ต้องซื้อ (ID)</label>
                    <input
                      value={form.bogo.product_id}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          bogo: { ...current.bogo, product_id: event.target.value },
                        }))
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">สินค้าที่แถม (ID)</label>
                    <input
                      value={form.bogo.get_product_id}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          bogo: { ...current.bogo, get_product_id: event.target.value },
                        }))
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {form.apply_to === "category" && (
            <div className="rounded-xl border border-slate-800 p-4">
              <h4 className="mb-2 text-sm font-semibold text-white">เลือกหมวดหมู่</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.category_ids.includes(category.id)}
                      onChange={() =>
                        setForm((current) => ({
                          ...current,
                          category_ids: toggleId(current.category_ids, category.id),
                        }))
                      }
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {form.apply_to === "product" && (
            <div className="rounded-xl border border-slate-800 p-4">
              <h4 className="mb-2 text-sm font-semibold text-white">เลือกสินค้า</h4>
              <div className="max-h-40 overflow-y-auto flex flex-wrap gap-2">
                {products.map((product) => (
                  <label key={product.id} className="flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.product_ids.includes(product.id)}
                      onChange={() =>
                        setForm((current) => ({
                          ...current,
                          product_ids: toggleId(current.product_ids, product.id),
                        }))
                      }
                    />
                    {product.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">กลุ่มลูกค้า</label>
              <select
                value={form.customer_rule}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    customer_rule: event.target.value as CouponCustomerRule,
                  }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                {CUSTOMER_RULE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">ช่องทาง</label>
              <select
                value={form.channel}
                onChange={(event) =>
                  setForm((current) => ({ ...current, channel: event.target.value as CouponChannel }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                {CHANNEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">จำกัดจำนวนครั้งทั้งหมด</label>
              <input
                type="number"
                min={1}
                value={form.max_uses}
                onChange={(event) => setForm((current) => ({ ...current, max_uses: event.target.value }))}
                placeholder="ว่าง = ไม่จำกัด"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">จำกัดต่อผู้ใช้ (One-time)</label>
              <input
                type="number"
                min={1}
                value={form.per_user_limit}
                onChange={(event) => setForm((current) => ({ ...current, per_user_limit: event.target.value }))}
                placeholder="เช่น 1 = ใช้ได้ครั้งเดียว/คน"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">เริ่มใช้</label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">หมดอายุ</label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(event) => setForm((current) => ({ ...current, ends_at: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
            />
            เปิดใช้งาน
          </label>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {submitting ? "กำลังบันทึก..." : coupon ? "บันทึกการแก้ไข" : "เพิ่มคูปอง"}
          </button>
        </form>

        <div className="border-t border-slate-800 px-6 py-3 text-right">
          <button type="button" onClick={onClose} className="text-sm text-slate-400 hover:text-white">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
