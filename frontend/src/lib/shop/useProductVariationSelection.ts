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

  const sizesForColor = useMemo(() => {
    const sizes =
      product?.variations
        ?.filter((variation) => variation.color === selectedColor)
        .map((variation) => variation.size?.trim())
        .filter(Boolean) ?? [];

    return [...new Set(sizes)] as string[];
  }, [product?.variations, selectedColor]);

  const selectedVariation = useMemo(() => {
    if (!product?.variations?.length) return null;

    return (
      product.variations.find(
        (variation) => variation.color === selectedColor && variation.size === selectedSize,
      ) ??
      product.variations.find((variation) => variation.color === selectedColor) ??
      product.variations[0]
    );
  }, [product?.variations, selectedColor, selectedSize]);

  const activeSlide = gallery[activeImage] ?? gallery[0];
  const displayImage =
    activeSlide?.main ??
    resolveProductImage(product?.image, product ? defaultProductImageForId(product.id) : undefined);

  useEffect(() => {
    if (!product) return;

    const firstVariation = product.variations?.[0];
    const initialColor = firstVariation?.color ?? uniqueColors[0] ?? "";
    const initialSize = firstVariation?.size ?? "";

    setSelectedColor(initialColor);
    setSelectedSize(initialSize);
    setActiveImage(galleryIndexForColor(initialColor, uniqueColors, gallery.length));
    setQuantity(1);
  }, [gallery.length, product, uniqueColors]);

  function handleColorSelect(color: string) {
    setSelectedColor(color);

    const nextSizes =
      product?.variations
        ?.filter((variation) => variation.color === color)
        .map((variation) => variation.size?.trim())
        .filter(Boolean) ?? [];

    if (!nextSizes.includes(selectedSize)) {
      setSelectedSize(nextSizes[0] ?? "");
    }

    setActiveImage(galleryIndexForColor(color, uniqueColors, gallery.length));
  }

  function handleGallerySelect(index: number) {
    setActiveImage(index);

    const matchedColor = uniqueColors[index];
    if (!matchedColor) return;

    setSelectedColor(matchedColor);

    const nextSizes =
      product?.variations
        ?.filter((variation) => variation.color === matchedColor)
        .map((variation) => variation.size?.trim())
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
    sizesForColor,
    selectedVariation,
    displayImage,
    handleColorSelect,
    handleGallerySelect,
  };
}
