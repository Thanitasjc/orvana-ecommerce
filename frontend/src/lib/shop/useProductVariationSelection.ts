"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultProductImageForId, productDetailGallery, resolveProductImage } from "@/lib/api/products";
import type { ProductGallerySlide } from "@/lib/api/products";
import { galleryIndexForColor, uniqueVariationColors } from "@/lib/shop/productColors";

export type ProductVariationSelection = {
  id: number;
  color?: string | null;
  size?: string | null;
  stock?: number | null;
  sku?: string | null;
};

export type ProductWithVariations = {
  id: number;
  image?: string | null;
  images?: ProductGallerySlide[] | null;
  variations?: ProductVariationSelection[] | null;
};

function normalizeOption(value?: string | null) {
  return value?.trim() ?? "";
}

export function uniqueVariationSizes(sizes: Array<string | null | undefined>) {
  return [...new Set(sizes.map((value) => normalizeOption(value)).filter(Boolean))];
}

export function useProductVariationSelection(product: ProductWithVariations | null) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const gallery = useMemo(
    () => (product ? productDetailGallery(product) : []),
    [product],
  );

  const uniqueColors = useMemo(
    () => uniqueVariationColors(product?.variations?.map((variation) => variation.color) ?? []),
    [product?.variations],
  );

  const uniqueSizes = useMemo(
    () => uniqueVariationSizes(product?.variations?.map((variation) => variation.size) ?? []),
    [product?.variations],
  );

  const hasColorOptions = uniqueColors.length > 0;
  const hasSizeOptions = uniqueSizes.length > 0;

  const sizesForColor = useMemo(() => {
    if (!hasSizeOptions) return [] as string[];

    const sizes =
      product?.variations
        ?.filter((variation) => {
          if (!hasColorOptions) return true;
          return normalizeOption(variation.color) === selectedColor;
        })
        .map((variation) => normalizeOption(variation.size))
        .filter(Boolean) ?? [];

    return [...new Set(sizes)];
  }, [hasColorOptions, hasSizeOptions, product?.variations, selectedColor]);

  const selectedVariation = useMemo(() => {
    if (!product?.variations?.length) return null;

    const matched = product.variations.find((variation) => {
      const color = normalizeOption(variation.color);
      const size = normalizeOption(variation.size);

      const colorOk = hasColorOptions ? color === selectedColor : true;
      const sizeOk = hasSizeOptions ? size === selectedSize : true;

      return colorOk && sizeOk;
    });

    return matched ?? product.variations[0];
  }, [hasColorOptions, hasSizeOptions, product?.variations, selectedColor, selectedSize]);

  const activeSlide = gallery[activeImage] ?? gallery[0];
  const displayImage =
    activeSlide?.main ??
    resolveProductImage(product?.image, product ? defaultProductImageForId(product.id) : undefined);

  useEffect(() => {
    if (!product) return;

    const firstVariation = product.variations?.[0];
    const initialColor = hasColorOptions
      ? (normalizeOption(firstVariation?.color) || uniqueColors[0] || "")
      : "";
    const initialSize = hasSizeOptions
      ? (normalizeOption(firstVariation?.size) || uniqueSizes[0] || "")
      : "";

    setSelectedColor(initialColor);
    setSelectedSize(initialSize);
    setActiveImage(galleryIndexForColor(initialColor, uniqueColors, gallery.length));
    setQuantity(1);
  }, [gallery.length, hasColorOptions, hasSizeOptions, product, uniqueColors, uniqueSizes]);

  function handleColorSelect(color: string) {
    setSelectedColor(color);

    if (!hasSizeOptions) {
      setActiveImage(galleryIndexForColor(color, uniqueColors, gallery.length));
      return;
    }

    const nextSizes =
      product?.variations
        ?.filter((variation) => normalizeOption(variation.color) === color)
        .map((variation) => normalizeOption(variation.size))
        .filter(Boolean) ?? [];

    if (!nextSizes.includes(selectedSize)) {
      setSelectedSize(nextSizes[0] ?? "");
    }

    setActiveImage(galleryIndexForColor(color, uniqueColors, gallery.length));
  }

  function handleGallerySelect(index: number) {
    setActiveImage(index);

    if (!hasColorOptions) return;

    const matchedColor = uniqueColors[index];
    if (!matchedColor) return;

    setSelectedColor(matchedColor);

    if (!hasSizeOptions) return;

    const nextSizes =
      product?.variations
        ?.filter((variation) => normalizeOption(variation.color) === matchedColor)
        .map((variation) => normalizeOption(variation.size))
        .filter(Boolean) ?? [];

    if (!nextSizes.includes(selectedSize)) {
      setSelectedSize(nextSizes[0] ?? "");
    }
  }

  return {
    quantity,
    setQuantity,
    activeImage,
    selectedColor,
    selectedSize,
    setSelectedSize,
    gallery,
    uniqueColors,
    uniqueSizes,
    hasColorOptions,
    hasSizeOptions,
    sizesForColor,
    selectedVariation,
    displayImage,
    handleColorSelect,
    handleGallerySelect,
  };
}
