import Link from "next/link";
import { ShopFilters } from "@/components/shop/ShopFilters";
import {
  defaultProductImageForId,
  formatPriceTHB,
  getProductsPage,
  getStorefrontCategories,
  resolveProductImage,
  type StorefrontProductQuery,
} from "@/lib/api/products";

type ShopSearchParams = {
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
};

function normalizeSort(sort?: string): StorefrontProductQuery["sort"] {
  if (sort === "newest" || sort === "price_asc" || sort === "price_desc" || sort === "name" || sort === "popular") {
    return sort;
  }
  return "popular";
}

function buildPageHref(query: ShopSearchParams, page: number) {
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.category) params.set("category", query.category);
  if (query.sort && query.sort !== "popular") params.set("sort", query.sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const sp = await searchParams;
  const sort = normalizeSort(sp.sort);
  const page = Math.max(1, Number(sp.page) || 1);
  const query = {
    q: sp.q?.trim() || undefined,
    category: sp.category || undefined,
    sort,
  };

  const [result, categories] = await Promise.all([
    getProductsPage({
      search: query.q,
      category: query.category,
      sort,
      page,
    }),
    getStorefrontCategories(),
  ]);

  const products = result.data;

  return (
    <section className="tp-shop-area pt-80 pb-120">
      <div className="container">
        <div className="row mb-30">
          <div className="col-12">
            <h1 className="tp-section-title-2 mb-10">ร้านค้า</h1>
            <p style={{ color: "#64748b", marginBottom: 0 }}>ค้นหาและกรองสินค้าที่ต้องการได้ที่นี่</p>
          </div>
        </div>

        <ShopFilters categories={categories} query={query} total={result.total} />

        {products.length === 0 ? (
          <div
            className="text-center"
            style={{
              padding: "64px 20px",
              border: "1px dashed #e5e7eb",
              borderRadius: 16,
              background: "#fafafa",
            }}
          >
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>ไม่พบสินค้า</h3>
            <p style={{ color: "#64748b", marginBottom: 20 }}>ลองเปลี่ยนคำค้นหา หรือเลือกหมวดอื่น</p>
            <Link href="/shop" className="tp-btn">
              ดูสินค้าทั้งหมด
            </Link>
          </div>
        ) : (
          <div className="row">
            {products.map((product) => (
              <div key={product.id} className="col-xl-3 col-lg-3 col-md-4 col-sm-6">
                <div className="tp-product-item-2 mb-40">
                  <div className="tp-product-thumb-2">
                    <Link href={`/products/${product.slug}`}>
                      <img
                        src={resolveProductImage(product.image, defaultProductImageForId(product.id))}
                        alt={product.name}
                      />
                    </Link>
                  </div>
                  <div className="tp-product-content-2">
                    {product.category?.name ? (
                      <span style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                        {product.category.name}
                      </span>
                    ) : null}
                    <h4 className="tp-product-title-2">
                      <Link href={`/products/${product.slug}`}>{product.name}</Link>
                    </h4>
                    <span className="tp-product-price-2">{formatPriceTHB(product.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {result.last_page > 1 ? (
          <div className="d-flex justify-content-center flex-wrap gap-2 mt-20">
            {Array.from({ length: result.last_page }, (_, index) => {
              const pageNumber = index + 1;
              const active = pageNumber === result.current_page;
              return (
                <Link
                  key={pageNumber}
                  href={buildPageHref(sp, pageNumber)}
                  className="tp-btn"
                  style={{
                    minWidth: 40,
                    padding: "8px 12px",
                    background: active ? undefined : "transparent",
                    color: active ? undefined : "#0f172a",
                    border: active ? undefined : "1px solid #e5e7eb",
                  }}
                >
                  {pageNumber}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
