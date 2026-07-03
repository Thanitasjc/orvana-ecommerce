"use client";

import { useMemo, useState } from "react";
import { ProductDetailHtml } from "@/components/shop/product/ProductDetailHtml";
import { uniqueVariationColors } from "@/lib/shop/productColors";

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

type ProductDetailTabsProps = {
  product: {
    name: string;
    description?: string | null;
    detail_content?: string | null;
    price: number | string;
    image?: string | null;
    category?: string | ProductCategory | null;
    variations?: ProductVariation[] | null;
  };
};

type DetailTab = "description" | "additional" | "reviews";

const TAB_LABELS: Record<DetailTab, string> = {
  description: "Description",
  additional: "Additional information",
  reviews: "Reviews (0)",
};

function categoryLabel(category: ProductDetailTabsProps["product"]["category"]) {
  if (!category) return "-";
  if (typeof category === "string") return category;
  return category.name;
}

function toPriceNumber(value: number | string) {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ProductDetailTabs({ product }: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("description");

  const colors = useMemo(
    () => uniqueVariationColors(product.variations?.map((variation) => variation.color) ?? []),
    [product.variations],
  );

  const sizes = useMemo(() => {
    const values =
      product.variations?.map((variation) => variation.size?.trim()).filter(Boolean) ?? [];
    return [...new Set(values)] as string[];
  }, [product.variations]);

  const skus = useMemo(() => {
    const values = product.variations?.map((variation) => variation.sku).filter(Boolean) ?? [];
    return [...new Set(values)] as string[];
  }, [product.variations]);

  const totalStock = useMemo(
    () => product.variations?.reduce((sum, variation) => sum + (variation.stock ?? 0), 0) ?? 0,
    [product.variations],
  );

  const coverImage = product.image ?? null;

  return (
    <div className="tp-product-details-tab-nav tp-tab">
      <nav>
        <div
          className="nav nav-tabs justify-content-center p-relative tp-product-tab"
          id="navPresentationTab"
          role="tablist"
        >
          {(Object.keys(TAB_LABELS) as DetailTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`nav-link ${activeTab === tab ? "active" : ""}`}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
          <span className="tp-product-details-tab-line" />
        </div>
      </nav>

      <div className="tab-content" id="navPresentationTabContent">
        <div
          className={`tab-pane fade ${activeTab === "description" ? "show active" : ""}`}
          role="tabpanel"
        >
          <div className="tp-product-details-desc-wrapper pt-80">
            <div className="row justify-content-center">
              <div className="col-xl-10">
                <div className="tp-product-details-desc-item pb-105">
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="tp-product-details-desc-content pt-25">
                        <span>{categoryLabel(product.category)}</span>
                        <h3 className="tp-product-details-desc-title">{product.name}</h3>
                        <p>{product.description ?? "ยังไม่มีรายละเอียดสินค้า"}</p>
                      </div>
                      {product.detail_content ? (
                        <div className="tp-product-details-desc-content">
                          <ProductDetailHtml html={product.detail_content} />
                        </div>
                      ) : null}
                    </div>
                    {coverImage ? (
                      <div className="col-lg-6">
                        <div className="tp-product-details-desc-thumb">
                          <img src={coverImage} alt={product.name} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`tab-pane fade ${activeTab === "additional" ? "show active" : ""}`}
          role="tabpanel"
        >
          <div className="tp-product-details-additional-info">
            <div className="row justify-content-center">
              <div className="col-xl-10">
                <table>
                  <tbody>
                    <tr>
                      <td>หมวดหมู่</td>
                      <td>{categoryLabel(product.category)}</td>
                    </tr>
                    <tr>
                      <td>ราคา</td>
                      <td>฿{toPriceNumber(product.price).toLocaleString("th-TH")}</td>
                    </tr>
                    <tr>
                      <td>สี</td>
                      <td>{colors.length > 0 ? colors.join(", ") : "-"}</td>
                    </tr>
                    <tr>
                      <td>ไซส์</td>
                      <td>{sizes.length > 0 ? sizes.join(", ") : "-"}</td>
                    </tr>
                    <tr>
                      <td>SKU</td>
                      <td>{skus.length > 0 ? skus.join(", ") : "-"}</td>
                    </tr>
                    <tr>
                      <td>สต็อกรวม</td>
                      <td>{totalStock} ชิ้น</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`tab-pane fade ${activeTab === "reviews" ? "show active" : ""}`}
          role="tabpanel"
        >
          <div className="tp-product-details-review-wrapper pt-60">
            <div className="row justify-content-center">
              <div className="col-xl-8 text-center">
                <h3 className="tp-product-details-review-title">Customer reviews</h3>
                <p className="mt-20 mb-0 text-muted">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
