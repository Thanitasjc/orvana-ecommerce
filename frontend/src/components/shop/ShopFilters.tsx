"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { StorefrontCategory } from "@/lib/api/products";

export type ShopQuery = {
  q?: string;
  category?: string;
  sort?: string;
};

type ShopFiltersProps = {
  categories: StorefrontCategory[];
  query: ShopQuery;
  total: number;
};

const SORT_OPTIONS = [
  { value: "popular", label: "ยอดนิยม" },
  { value: "newest", label: "ใหม่ล่าสุด" },
  { value: "price_asc", label: "ราคาต่ำ → สูง" },
  { value: "price_desc", label: "ราคาสูง → ต่ำ" },
  { value: "name", label: "ชื่อ A-Z" },
] as const;

function buildShopHref(next: ShopQuery) {
  const params = new URLSearchParams();
  if (next.q?.trim()) params.set("q", next.q.trim());
  if (next.category) params.set("category", next.category);
  if (next.sort && next.sort !== "popular") params.set("sort", next.sort);
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export function ShopFilters({ categories, query, total }: ShopFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(query.q ?? "");
  const sort = query.sort || "popular";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(buildShopHref({ ...query, q: search }));
  }

  return (
    <div className="mb-40">
      <form onSubmit={onSubmit} className="mb-25" role="search">
        <div className="d-flex flex-wrap gap-2 align-items-stretch">
          <input
            type="search"
            name="q"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาสินค้า เช่น เสื้อ กางเกง กระเป๋า"
            aria-label="ค้นหาสินค้า"
            className="form-control"
            style={{
              flex: "1 1 240px",
              minHeight: 48,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              padding: "10px 14px",
            }}
          />
          <button type="submit" className="tp-btn" style={{ minHeight: 48, whiteSpace: "nowrap" }}>
            ค้นหา
          </button>
          {query.q || query.category ? (
            <Link href="/shop" className="tp-btn tp-btn-border" style={{ minHeight: 48, display: "inline-flex", alignItems: "center" }}>
              ล้างตัวกรอง
            </Link>
          ) : null}
        </div>
      </form>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-20">
        <p className="mb-0" style={{ color: "#64748b", fontSize: 14 }}>
          พบ <strong style={{ color: "#0f172a" }}>{total.toLocaleString("th-TH")}</strong> รายการ
          {query.q ? (
            <>
              {" "}
              สำหรับ “<strong style={{ color: "#0f172a" }}>{query.q}</strong>”
            </>
          ) : null}
        </p>
        <label className="d-flex align-items-center gap-2 mb-0" style={{ fontSize: 14, color: "#64748b" }}>
          เรียงตาม
          <select
            value={sort}
            aria-label="เรียงสินค้า"
            onChange={(event) => router.push(buildShopHref({ ...query, sort: event.target.value }))}
            style={{
              minHeight: 40,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              padding: "6px 10px",
              background: "#fff",
              color: "#0f172a",
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {categories.length > 0 ? (
        <div className="d-flex flex-wrap gap-2" aria-label="กรองตามหมวดหมู่">
          <Link
            href={buildShopHref({ ...query, category: undefined })}
            className="tp-btn"
            style={{
              padding: "8px 14px",
              fontSize: 13,
              background: !query.category ? undefined : "transparent",
              color: !query.category ? undefined : "#0f172a",
              border: !query.category ? undefined : "1px solid #e5e7eb",
            }}
          >
            ทั้งหมด
          </Link>
          {categories.map((category) => {
            const active = query.category === category.slug;
            return (
              <Link
                key={category.id}
                href={buildShopHref({ ...query, category: category.slug })}
                className="tp-btn"
                style={{
                  padding: "8px 14px",
                  fontSize: 13,
                  background: active ? undefined : "transparent",
                  color: active ? undefined : "#0f172a",
                  border: active ? undefined : "1px solid #e5e7eb",
                }}
              >
                {category.name}
                {typeof category.products_count === "number" ? (
                  <span style={{ opacity: 0.7, marginLeft: 6 }}>({category.products_count})</span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
