"use client";

import type { ProductGallerySlide } from "@/lib/api/products";

type ProductDetailGalleryProps = {
  productName: string;
  slides: ProductGallerySlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function ProductDetailGallery({
  productName,
  slides,
  activeIndex,
  onSelect,
}: ProductDetailGalleryProps) {
  return (
    <div className="tp-product-details-thumb-wrapper tp-tab d-sm-flex">
      <nav>
        <div className="nav nav-tabs flex-sm-column" id="productDetailsNavThumb" role="tablist">
          {slides.map((slide, index) => (
            <button
              key={`product-thumb-${index}`}
              type="button"
              className={`nav-link ${activeIndex === index ? "active" : ""}`}
              id={`nav-${index + 1}-tab`}
              role="tab"
              aria-controls={`nav-${index + 1}`}
              aria-selected={activeIndex === index}
              onClick={() => onSelect(index)}
            >
              <img src={slide.thumb} alt={`${productName} ${index + 1}`} />
            </button>
          ))}
        </div>
      </nav>

      <div className="tab-content m-img" id="productDetailsNavContent">
        {slides.map((slide, index) => (
          <div
            key={`product-main-${index}`}
            className={`tab-pane fade ${activeIndex === index ? "show active" : ""}`}
            id={`nav-${index + 1}`}
            role="tabpanel"
            aria-labelledby={`nav-${index + 1}-tab`}
            tabIndex={0}
          >
            <div className="tp-product-details-nav-main-thumb">
              <img src={slide.main} alt={productName} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
