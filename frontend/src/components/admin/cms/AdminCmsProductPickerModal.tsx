"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAdminProducts, type AdminProduct } from "@/lib/api/adminProducts";
import { defaultProductImageForId, formatPriceTHB, resolveProductImage } from "@/lib/api/products";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

type AdminCmsProductPickerModalProps = {
  open: boolean;
  excludeIds: number[];
  onClose: () => void;
  onPick: (product: AdminProduct) => void;
};

export function AdminCmsProductPickerModal({
  open,
  excludeIds,
  onClose,
  onPick,
}: AdminCmsProductPickerModalProps) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setLoading(true);
    void fetchAdminProducts(token)
      .then((res) => setProducts(res.data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (excludeIds.includes(p.id)) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    });
  }, [excludeIds, products, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-xl rounded-2xl border border-slate-800 bg-[#111827] shadow-2xl">
        <div className="border-b border-slate-800 px-6 py-4">
          <h2 className="text-lg font-bold text-white">เลือกสินค้า</h2>
          <p className="mt-1 text-sm text-slate-400">ค้นหาและเพิ่มสินค้าใน section นี้</p>
        </div>

        <div className="p-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อสินค้า..."
            className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />

          {loading ? <p className="text-sm text-slate-400">กำลังโหลด...</p> : null}

          <ul className="max-h-80 space-y-2 overflow-y-auto">
            {filtered.length === 0 && !loading ? (
              <li className="py-8 text-center text-sm text-slate-500">ไม่พบสินค้า</li>
            ) : (
              filtered.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onPick(product);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-left hover:border-slate-600 hover:bg-slate-800/80"
                  >
                    <img
                      src={resolveProductImage(product.image, defaultProductImageForId(product.id))}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white">{product.name}</p>
                      <p className="text-xs text-emerald-300">{formatPriceTHB(product.price)}</p>
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-xl border border-slate-700 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}
