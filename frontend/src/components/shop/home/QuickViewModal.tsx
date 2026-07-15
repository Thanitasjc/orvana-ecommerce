/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/shop/cart/CartProvider";
import { ProductDetailGallery } from "@/components/shop/product/ProductDetailGallery";
import {
  fetchProductBySlug,
  formatPriceTHB,
  slugFromProductHref,
  type ProductDetail,
} from "@/lib/api/products";
import { colorNameToHex } from "@/lib/shop/productColors";
import { useProductVariationSelection } from "@/lib/shop/useProductVariationSelection";

export type QuickViewProduct = {
  id: string;
  title: string;
  href: string;
  image: string;
  price: string;
  oldPrice?: string;
  tags?: string[];
};

type QuickViewModalProps = {
  product: QuickViewProduct | null;
  onClose: () => void;
};

function categoryLabel(category: ProductDetail["category"]) {
  if (!category) return "Product";
  return category.name;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selection = useProductVariationSelection(detail);

  useEffect(() => {
    if (!product) {
      setDetail(null);
      setError(null);
      return;
    }

    const slug = slugFromProductHref(product.href);
    if (!slug) {
      setError("ไม่พบสินค้า");
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetchProductBySlug(slug).then((data) => {
      if (cancelled) return;
      if (!data) {
        setError("โหลดรายละเอียดสินค้าไม่สำเร็จ");
        setDetail(null);
      } else {
        setDetail(data);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [product]);

  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  if (!product) return null;

  const unitPrice = detail?.price ?? (Number(product.price.replace(/[^0-9.]/g, "")) || 0);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
        style={{ width: "100%", maxWidth: "980px", borderRadius: "10px", overflow: "hidden" }}
      >
        <div className="tp-product-modal-content d-lg-flex align-items-start white-bg p-25">
          <button type="button" className="tp-product-modal-close-btn" onClick={onClose}>
            <i className="fa-regular fa-xmark" />
          </button>

          {loading ? (
            <div className="w-100 py-5 text-center text-slate-500">กำลังโหลดรายละเอียด...</div>
          ) : error ? (
            <div className="w-100 py-5 text-center text-rose-500">{error}</div>
          ) : detail ? (
            <>
              <ProductDetailGallery
                productName={detail.name}
                slides={selection.gallery}
                activeIndex={selection.activeImage}
                onSelect={selection.handleGallerySelect}
              />

              <div className="tp-product-details-wrapper">
                <div className="tp-product-details-category">
                  <span>{categoryLabel(detail.category)}</span>
                </div>
                <h3 className="tp-product-details-title">{detail.name}</h3>

                <div className="tp-product-details-inventory d-flex align-items-center mb-10">
                  <div className="tp-product-details-stock mb-10">
                    <span>{(selection.selectedVariation?.stock ?? 0) > 0 ? "In Stock" : "Out of Stock"}</span>
                  </div>
                </div>

                <p>{detail.description ?? "No description available for this product."}</p>

                <div className="tp-product-details-price-wrapper mb-20">
                  {product.oldPrice ? (
                    <span className="tp-product-details-price old-price">{product.oldPrice}</span>
                  ) : null}
                  <span className="tp-product-details-price new-price">{formatPriceTHB(unitPrice)}</span>
                </div>

                {selection.hasColorOptions || selection.hasSizeOptions ? (
                  <div className="tp-product-details-variation mb-30">
                    {selection.hasColorOptions ? (
                      <div className="tp-product-details-variation-item">
                        <h4 className="tp-product-details-variation-title">Color :</h4>
                        <div className="tp-product-details-variation-list">
                          {selection.uniqueColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`color tp-color-variation-btn ${selection.selectedColor === color ? "active" : ""}`}
                              onClick={() => selection.handleColorSelect(color)}
                            >
                              <span
                                data-bg-color={colorNameToHex(color)}
                                style={{ backgroundColor: colorNameToHex(color) }}
                              />
                              <span className="tp-color-variation-tootltip">{color}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {selection.hasSizeOptions && selection.sizesForColor.length > 0 ? (
                      <div
                        className={`tp-product-details-variation-item ${selection.hasColorOptions ? "mt-20" : ""}`}
                      >
                        <h4 className="tp-product-details-variation-title">Size :</h4>
                        <div className="tp-product-details-variation-list d-flex flex-wrap" style={{ gap: "8px" }}>
                          {selection.sizesForColor.map((size) => (
                            <button
                              key={size}
                              type="button"
                              className={`tp-size-variation-btn ${selection.selectedSize === size ? "active" : ""}`}
                              onClick={() => selection.setSelectedSize(size)}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="tp-product-details-action-wrapper">
                  <h3 className="tp-product-details-action-title">Quantity</h3>
                  <div className="tp-product-details-action-item-wrapper d-sm-flex align-items-center">
                    <div className="tp-product-details-quantity">
                      <div className="tp-product-quantity mb-15 mr-15">
                        <button
                          type="button"
                          className="tp-cart-minus"
                          onClick={() => selection.setQuantity((q) => Math.max(1, q - 1))}
                        >
                          -
                        </button>
                        <input className="tp-cart-input" type="text" value={selection.quantity} readOnly />
                        <button
                          type="button"
                          className="tp-cart-plus"
                          onClick={() => selection.setQuantity((q) => q + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="tp-product-details-add-to-cart mb-15 w-100">
                      <button
                        type="button"
                        className="tp-product-details-add-to-cart-btn w-100"
                        disabled={(selection.selectedVariation?.stock ?? 0) <= 0}
                        onClick={() =>
                          addItem({
                            id: selection.selectedVariation?.id ?? detail.id,
                            variationId: selection.selectedVariation?.id,
                            title: detail.name,
                            href: `/products/${detail.slug}`,
                            image: selection.displayImage,
                            price: unitPrice,
                            quantity: selection.quantity,
                          })
                        }
                      >
                        Add To Cart
                      </button>
                    </div>
                  </div>
                  <Link
                    href={`/products/${detail.slug}`}
                    className="tp-product-details-buy-now-btn w-100 d-inline-block text-center"
                    onClick={onClose}
                  >
                    View Details
                  </Link>
                </div>

                <div className="tp-product-details-action-sm">
                  <Link href={`/products/${detail.slug}`} className="tp-product-details-action-sm-btn" onClick={onClose}>
                    Full Details
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
