import Link from "next/link";
import { API_URL } from "@/lib/api/client";
import { defaultProductImageForId, resolveProductImage } from "@/lib/api/products";

async function getProducts(searchParams: { category?: string }) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category", searchParams.category);
  const res = await fetch(`${API_URL}/products?${params}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return { data: [] };
  return res.json();
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const { data: products } = await getProducts(sp);

  return (
    <section className="tp-shop-area pt-80 pb-120">
      <div className="container">
        <div className="row mb-40">
          <div className="col-12">
            <h1 className="tp-section-title-2">ร้านค้า</h1>
          </div>
        </div>
        <div className="row">
          {products.map(
            (product: {
              id: number;
              name: string;
              slug: string;
              price: number;
              image?: string;
            }) => (
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
                    <h4 className="tp-product-title-2">
                      <Link href={`/products/${product.slug}`}>{product.name}</Link>
                    </h4>
                    <span className="tp-product-price-2">
                      ฿{product.price.toLocaleString("th-TH")}
                    </span>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
