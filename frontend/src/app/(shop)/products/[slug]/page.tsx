import { API_URL } from "@/lib/api/client";
import { getRelatedProducts } from "@/lib/api/products";
import { notFound } from "next/navigation";
import { ProductDetailContent } from "@/components/shop/product/ProductDetailContent";
import { ProductDetailBreadcrumb } from "@/components/shop/product/ProductDetailBreadcrumb";
import { ProductRelatedProducts } from "@/components/shop/product/ProductRelatedProducts";

async function getProduct(slug: string) {
  const res = await fetch(`${API_URL}/products/${slug}`, { next: { revalidate: 60 } });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const categorySlug =
    product.category && typeof product.category === "object" ? product.category.slug : undefined;
  const relatedProducts = await getRelatedProducts(slug, categorySlug);

  return (
    <>
      <ProductDetailBreadcrumb productName={product.name} category={product.category} />
      <ProductDetailContent product={product} />
      <ProductRelatedProducts products={relatedProducts} />
    </>
  );
}
