"use client";

import Link from "next/link";
import { useCart } from "@/components/shop/cart/CartProvider";
import { useCompare } from "@/components/shop/compare/CompareProvider";
import { useWishlist } from "@/components/shop/wishlist/WishlistProvider";
import { ProductDetailGallery } from "@/components/shop/product/ProductDetailGallery";
import { ProductDetailSmActions } from "@/components/shop/product/ProductDetailSmActions";
import { ProductDetailTabs } from "@/components/shop/product/ProductDetailTabs";
import type { ProductGallerySlide } from "@/lib/api/products";
import { colorNameToHex } from "@/lib/shop/productColors";
import { useProductVariationSelection } from "@/lib/shop/useProductVariationSelection";

type ProductVariation = {
  id: number;
  color?: string | null;
  size?: string | null;
  stock?: number | null;
  sku?: string | null;
};

type ProductCategory = {
  id: number;
  name: string;
  slug: string;
};

type ProductDetailData = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  detail_content?: string | null;
  price: number | string;
  image?: string | null;
  images?: ProductGallerySlide[] | null;
  category?: string | ProductCategory | null;
  variations?: ProductVariation[] | null;
};

function categoryLabel(category: ProductDetailData["category"]) {
  if (!category) return "Product";
  if (typeof category === "string") return category;
  return category.name;
}

const toPriceNumber = (value: number | string) => {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function ProductDetailContent({ product }: { product: ProductDetailData }) {
  const { addItem } = useCart();
  const { addItem: addCompareItem } = useCompare();
  const { addItem: addWishlistItem } = useWishlist();
  const {
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
  } = useProductVariationSelection(product);

  const unitPrice = toPriceNumber(product.price);

  return (
    <section className="tp-product-details-area pb-120 pt-50">
      <div className="container">
        <div className="tp-product-details-top pb-115">
          <div className="row">
            <div className="col-xl-7 col-lg-6">
              <ProductDetailGallery
                productName={product.name}
                slides={gallery}
                activeIndex={activeImage}
                onSelect={handleGallerySelect}
              />
            </div>

            <div className="col-xl-5 col-lg-6">
              <div className="tp-product-details-wrapper">
                <div className="tp-product-details-category">
                  <span>{categoryLabel(product.category)}</span>
                </div>
                <h3 className="tp-product-details-title">{product.name}</h3>

                <div className="tp-product-details-inventory d-flex align-items-center mb-10">
                  <div className="tp-product-details-stock mb-10">
                    <span>{(selectedVariation?.stock ?? 1) > 0 ? "In Stock" : "Out of Stock"}</span>
                  </div>
                </div>

                <p>{product.description ?? "No description available for this product."}</p>

                <div className="tp-product-details-price-wrapper mb-20">
                  <span className="tp-product-details-price new-price">฿{unitPrice.toLocaleString("th-TH")}</span>
                </div>

                {uniqueColors.length > 0 ? (
                  <div className="tp-product-details-variation mb-30">
                    <div className="tp-product-details-variation-item">
                      <h4 className="tp-product-details-variation-title">Color :</h4>
                      <div className="tp-product-details-variation-list">
                        {uniqueColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`color tp-color-variation-btn ${selectedColor === color ? "active" : ""}`}
                            onClick={() => handleColorSelect(color)}
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

                    {sizesForColor.length > 1 ? (
                      <div className="tp-product-details-variation-item mt-20">
                        <h4 className="tp-product-details-variation-title">Size :</h4>
                        <div className="tp-product-details-variation-list d-flex flex-wrap" style={{ gap: "8px" }}>
                          {sizesForColor.map((size) => (
                            <button
                              key={size}
                              type="button"
                              className={`tp-size-variation-btn ${selectedSize === size ? "active" : ""}`}
                              onClick={() => setSelectedSize(size)}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {selectedVariation?.sku ? (
                      <p className="mb-0 mt-10">
                        SKU: <span>{selectedVariation.sku}</span>
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="tp-product-details-action-wrapper">
                  <h3 className="tp-product-details-action-title">Quantity</h3>
                  <div className="tp-product-details-action-item-wrapper d-sm-flex align-items-center">
                    <div className="tp-product-details-quantity">
                      <div className="tp-product-quantity mb-15 mr-15">
                        <button type="button" className="tp-cart-minus" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                          -
                        </button>
                        <input className="tp-cart-input" type="text" value={quantity} readOnly />
                        <button type="button" className="tp-cart-plus" onClick={() => setQuantity((prev) => prev + 1)}>
                          +
                        </button>
                      </div>
                    </div>
                    <div className="tp-product-details-add-to-cart mb-15 w-100">
                      <button
                        type="button"
                        className="tp-product-details-add-to-cart-btn w-100"
                        onClick={() =>
                          addItem({
                            id: selectedVariation?.id ?? product.id,
                            variationId: selectedVariation?.id,
                            title: product.name,
                            href: `/products/${product.slug}`,
                            image: displayImage,
                            price: unitPrice,
                            quantity,
                          })
                        }
                      >
                        Add To Cart
                      </button>
                    </div>
                  </div>
                  <Link href="/cart" className="tp-product-details-buy-now-btn w-100 d-inline-block text-center">
                    Go to Cart
                  </Link>
                </div>

                <div className="tp-product-details-query mb-20">
                  <div className="tp-product-details-query-item d-flex align-items-center">
                    <span>SKU: </span>
                    <p>{selectedVariation?.sku ?? "N/A"}</p>
                  </div>
                </div>

                <ProductDetailSmActions
                  onCompare={() =>
                    addCompareItem({
                      id: product.id,
                      title: product.name,
                      href: `/products/${product.slug}`,
                      image: displayImage,
                      price: unitPrice,
                      description: product.description ?? undefined,
                      rating: 5,
                    })
                  }
                  onAddWishlist={() =>
                    addWishlistItem({
                      id: product.id,
                      title: product.name,
                      href: `/products/${product.slug}`,
                      image: displayImage,
                      price: unitPrice,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="tp-product-details-bottom pb-140">
          <div className="row">
            <div className="col-xl-12">
              <ProductDetailTabs
                product={{
                  name: product.name,
                  description: product.description,
                  detail_content: product.detail_content,
                  price: product.price,
                  category: product.category,
                  variations: product.variations,
                  image: displayImage,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
