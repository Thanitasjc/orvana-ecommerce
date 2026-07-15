"use client";

import { useEffect, useMemo, useState } from "react";
import type { PosProduct, PosVariation } from "@/lib/api/pos";
import { defaultProductImageForId, productDetailGallery, resolveProductImage } from "@/lib/api/products";
import {
  colorNameToHex,
  galleryIndexForColor,
  uniqueVariationColors,
} from "@/lib/shop/productColors";
import { uniqueVariationSizes } from "@/lib/shop/useProductVariationSelection";

type PosVariationPickerModalProps = {
  product: PosProduct | null;
  onClose: () => void;
  onConfirm: (variation: PosVariation) => void;
};

function normalizeOption(value?: string | null) {
  return value?.trim() ?? "";
}

function normalizeVariations(variations: PosVariation[]) {
  return variations.map((variation) => ({
    ...variation,
    color: normalizeOption(variation.color),
    size: normalizeOption(variation.size),
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
    () => uniqueVariationSizes(variations.map((variation) => variation.size)),
    [variations],
  );

  const hasColorOptions = colors.length > 0;
  const hasSizeOptions = sizes.length > 0;

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");

  const gallery = useMemo(() => (product ? productDetailGallery(product) : []), [product]);

  useEffect(() => {
    if (!product) return;

    const firstInStock = variations.find((variation) => variation.stock > 0);
    const initialColor = hasColorOptions
      ? (firstInStock?.color || colors[0] || "")
      : "";
    const sizesForInitial = hasSizeOptions
      ? variations
          .filter((variation) => (hasColorOptions ? variation.color === initialColor : true))
          .map((variation) => variation.size)
          .filter(Boolean)
      : [];
    const initialSize = hasSizeOptions
      ? (firstInStock?.size ||
          sizesForInitial.find((item) =>
            variations.some(
              (variation) =>
                (!hasColorOptions || variation.color === initialColor) &&
                variation.size === item &&
                variation.stock > 0,
            ),
          ) ||
          sizesForInitial[0] ||
          "")
      : "";

    setColor(initialColor);
    setSize(initialSize);
  }, [colors, hasColorOptions, hasSizeOptions, product, variations]);

  const sizesForColor = useMemo(() => {
    if (!hasSizeOptions) return [] as string[];

    const matched = variations
      .filter((variation) => (hasColorOptions ? variation.color === color : true))
      .map((variation) => variation.size)
      .filter(Boolean);

    return [...new Set(matched)];
  }, [color, hasColorOptions, hasSizeOptions, variations]);

  const selectedVariation = useMemo(() => {
    return (
      variations.find((variation) => {
        const colorOk = hasColorOptions ? variation.color === color : true;
        const sizeOk = hasSizeOptions ? variation.size === size : true;
        return colorOk && sizeOk;
      }) ?? null
    );
  }, [color, hasColorOptions, hasSizeOptions, size, variations]);

  const displayImage = useMemo(() => {
    if (!product) return "";
    const imageIndex = galleryIndexForColor(color, colors, gallery.length);
    const slide = gallery[imageIndex];
    return slide?.main ?? resolveProductImage(product.image, defaultProductImageForId(product.id));
  }, [color, colors, gallery, product]);

  useEffect(() => {
    if (!hasSizeOptions) return;
    if (sizesForColor.includes(size)) return;

    const nextSize =
      sizesForColor.find((item) =>
        variations.some(
          (variation) =>
            (!hasColorOptions || variation.color === color) &&
            variation.size === item &&
            variation.stock > 0,
        ),
      ) ??
      sizesForColor[0] ??
      "";
    setSize(nextSize);
  }, [color, hasColorOptions, hasSizeOptions, size, sizesForColor, variations]);

  if (!product) return null;

  const title =
    hasColorOptions && hasSizeOptions
      ? "เลือกสีและไซส์"
      : hasColorOptions
        ? "เลือกสี"
        : hasSizeOptions
          ? "เลือกไซส์"
          : "ยืนยันสินค้า";

  const summaryParts = [
    color ? `สี: ${color}` : null,
    size ? `ไซส์: ${size}` : null,
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-base font-extrabold text-slate-950">{title}</h4>
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
              {summaryParts.length > 0 ? summaryParts.join(" · ") : "ไม่มีตัวเลือกสี/ไซส์"}
            </p>
            {selectedVariation ? (
              <p className="mt-1 text-xs text-emerald-700">สต็อก: {selectedVariation.stock} ชิ้น</p>
            ) : null}
          </div>
        </div>

        {hasColorOptions ? (
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
        ) : null}

        {hasSizeOptions && sizesForColor.length > 0 ? (
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">ไซส์</label>
            <div className="flex flex-wrap gap-2">
              {sizesForColor.map((item) => {
                const variation = variations.find(
                  (entry) =>
                    (!hasColorOptions || entry.color === color) && entry.size === item,
                );
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
          เพิ่มลงตะกร้า
        </button>
      </div>
    </div>
  );
}
