"use client";

import { useEffect, useMemo, useState } from "react";
import type { PosProduct, PosVariation } from "@/lib/api/pos";
import { defaultProductImageForId, productDetailGallery, resolveProductImage } from "@/lib/api/products";
import {
  colorNameToHex,
  galleryIndexForColor,
  uniqueVariationColors,
} from "@/lib/shop/productColors";

type PosVariationPickerModalProps = {
  product: PosProduct | null;
  onClose: () => void;
  onConfirm: (variation: PosVariation) => void;
};

function normalizeVariations(variations: PosVariation[]) {
  return variations.map((variation) => ({
    ...variation,
    color: variation.color.trim(),
    size: variation.size.trim(),
  }));
}

export function PosVariationPickerModal({ product, onClose, onConfirm }: PosVariationPickerModalProps) {
  const variations = useMemo(
    () => (product ? normalizeVariations(product.variations) : []),
    [product],
  );

  const colors = useMemo(
    () => uniqueVariationColors(variations.map((variation) => variation.color)),
    [variations],
  );

  const sizes = useMemo(
    () => [...new Set(variations.map((variation) => variation.size))],
    [variations],
  );

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");

  const gallery = useMemo(() => (product ? productDetailGallery(product) : []), [product]);

  useEffect(() => {
    if (!product) return;

    const firstInStock = variations.find((variation) => variation.stock > 0);
    const initialColor = firstInStock?.color ?? colors[0] ?? "";
    const sizesForInitial = variations
      .filter((variation) => variation.color === initialColor)
      .map((variation) => variation.size);
    const initialSize =
      firstInStock?.size ??
      sizesForInitial.find((item) =>
        variations.some((variation) => variation.color === initialColor && variation.size === item && variation.stock > 0),
      ) ??
      sizesForInitial[0] ??
      "";

    setColor(initialColor);
    setSize(initialSize);
  }, [product, variations, colors]);

  const sizesForColor = useMemo(() => {
    const matched = variations.filter((variation) => variation.color === color).map((variation) => variation.size);
    return [...new Set(matched)];
  }, [color, variations]);

  const selectedVariation = useMemo(
    () => variations.find((variation) => variation.color === color && variation.size === size) ?? null,
    [color, size, variations],
  );

  const displayImage = useMemo(() => {
    if (!product) return "";
    const imageIndex = galleryIndexForColor(color, colors, gallery.length);
    const slide = gallery[imageIndex];
    return slide?.main ?? resolveProductImage(product.image, defaultProductImageForId(product.id));
  }, [color, colors, gallery, product]);

  useEffect(() => {
    if (!sizesForColor.includes(size)) {
      const nextSize =
        sizesForColor.find((item) =>
          variations.some((variation) => variation.color === color && variation.size === item && variation.stock > 0),
        ) ?? sizesForColor[0] ?? "";
      setSize(nextSize);
    }
  }, [color, size, sizesForColor, variations]);

  if (!product) return null;

  const hasSingleVariation = variations.length === 1 && variations[0]?.stock > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-base font-extrabold text-slate-950">เลือกสีและไซส์</h4>
            <p className="text-sm text-slate-500">{product.name}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ปิด
          </button>
        </div>

        <div className="flex gap-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            <img src={displayImage} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">฿{product.price.toLocaleString("th-TH")}</p>
            <p className="text-xs text-slate-500">
              {color ? `สี: ${color}` : "เลือกสี"}
              {size ? ` · ไซส์: ${size}` : ""}
            </p>
            {selectedVariation ? (
              <p className="mt-1 text-xs text-emerald-700">สต็อก: {selectedVariation.stock} ชิ้น</p>
            ) : null}
          </div>
        </div>

        {colors.length > 0 ? (
          <div className="space-y-3">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">สี</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((item) => {
                  const stockForColor = variations
                    .filter((variation) => variation.color === item)
                    .reduce((sum, variation) => sum + variation.stock, 0);
                  const disabled = stockForColor <= 0;

                  return (
                    <button
                      key={item}
                      type="button"
                      disabled={disabled}
                      onClick={() => setColor(item)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        color === item
                          ? "border-emerald-700 bg-emerald-600 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
                    >
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-slate-300"
                        style={{ backgroundColor: colorNameToHex(item) }}
                      />
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {sizesForColor.length > 0 && !(sizes.length === 1 && sizesForColor.length === 1) ? (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">ไซส์</label>
                <div className="flex flex-wrap gap-2">
                  {sizesForColor.map((item) => {
                    const variation = variations.find((entry) => entry.color === color && entry.size === item);
                    const stock = variation?.stock ?? 0;
                    const disabled = stock <= 0;

                    return (
                      <button
                        key={item}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSize(item)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                          size === item
                            ? "border-emerald-700 bg-emerald-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
                      >
                        {item} ({stock})
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          disabled={!selectedVariation || selectedVariation.stock <= 0}
          onClick={() => {
            if (!selectedVariation || selectedVariation.stock <= 0) return;
            onConfirm(selectedVariation);
            onClose();
          }}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {hasSingleVariation ? "เพิ่มลงตะกร้า" : "เพิ่มลงตะกร้า"}
        </button>
      </div>
    </div>
  );
}
