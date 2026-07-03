"use client";

import type { Category, PosProduct } from "@/lib/api/pos";
import { defaultProductImageForId, resolveProductImage } from "@/lib/api/products";
import { getProductTotalStock } from "@/components/pos/usePosCart";

type PosProductGridProps = {
  products: PosProduct[];
  categories: Category[];
  search: string;
  categoryId: number | "all";
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: number | "all") => void;
  onAddProduct: (product: PosProduct) => void;
};

export function PosProductGrid({
  products,
  categories,
  search,
  categoryId,
  onSearchChange,
  onCategoryChange,
  onAddProduct,
}: PosProductGridProps) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ค้นหาสินค้าด้วยชื่อ..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ล้าง
              </button>
            ) : null}
          </div>
          <div className="flex shrink-0 gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => onCategoryChange("all")}
              className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition ${
                categoryId === "all"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              ทั้งหมด
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryChange(category.id)}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition ${
                  categoryId === category.id
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500">
          ไม่พบสินค้าในหมวดนี้
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const totalStock = getProductTotalStock(product);
            const colorCount = new Set(product.variations.map((v) => v.color.trim())).size;
            const sizeCount = new Set(product.variations.map((v) => v.size.trim())).size;
            const image = resolveProductImage(product.image, defaultProductImageForId(product.id));

            return (
              <button
                key={product.id}
                type="button"
                disabled={totalStock === 0}
                onClick={() => onAddProduct(product)}
                className={`relative flex flex-col rounded-2xl border bg-white p-3 text-left shadow-sm transition hover:border-emerald-500 ${
                  totalStock === 0 ? "cursor-not-allowed opacity-60" : ""
                }`}
              >
                <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
                  <img src={image} alt={product.name} className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 right-1 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[10px] text-white">
                    สต็อกรวม: {totalStock}
                  </span>
                </div>
                <h5 className="mb-1 line-clamp-2 text-xs font-bold leading-tight text-slate-800">{product.name}</h5>
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-1.5">
                  <span className="text-sm font-black text-slate-900">฿{product.price.toLocaleString("th-TH")}</span>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    {colorCount} สี / {sizeCount} ไซส์
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
