import { API_URL } from "@/lib/api/client";

export type ApiProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
  images?: ProductGallerySlide[] | null;
  description?: string | null;
  detail_content?: string | null;
  is_featured?: boolean;
  sales_count?: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  variations?: ProductDetailVariation[];
};

export type ProductDetailVariation = {
  id: number;
  color: string;
  size: string;
  stock: number;
  sku?: string;
};

export type ProductDetail = ApiProduct;

export function slugFromProductHref(href: string) {
  const match = href.match(/\/products\/([^/?#]+)/);
  return match?.[1] ?? "";
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export type ProductGallerySlide = {
  thumb: string;
  main: string;
};

export type ProductTabKey = "shoes" | "clothing" | "bags";

const CATEGORY_TAB_MAP: Record<string, ProductTabKey> = {
  tops: "clothing",
  outerwear: "clothing",
  dresses: "clothing",
  bottoms: "clothing",
  accessories: "bags",
};

const CATEGORY_IMAGES = [
  "/assets/img/category/category-1.jpg",
  "/assets/img/category/category-2.jpg",
  "/assets/img/category/category-3.jpg",
  "/assets/img/category/category-4.jpg",
  "/assets/img/category/category-5.jpg",
  "/assets/img/category/category-6.jpg",
];

const TAB_PRODUCT_IMAGES = [
  "/assets/img/product/2/prodcut-1.jpg",
  "/assets/img/product/2/prodcut-2.jpg",
  "/assets/img/product/2/prodcut-3.jpg",
  "/assets/img/product/2/prodcut-4.jpg",
  "/assets/img/product/2/prodcut-5.jpg",
  "/assets/img/product/2/prodcut-6.jpg",
  "/assets/img/product/2/prodcut-7.jpg",
  "/assets/img/product/2/prodcut-8.jpg",
];

const FEATURED_SLIDER_IMAGES = [
  "/assets/img/product/slider/product-slider-1.jpg",
  "/assets/img/product/slider/product-slider-2.jpg",
  "/assets/img/product/slider/product-slider-3.jpg",
  "/assets/img/product/slider/product-slider-4.jpg",
  "/assets/img/product/slider/product-slider-5.jpg",
];

const TRENDING_IMAGES = [
  "/assets/img/product/trending/trending-1.jpg",
  "/assets/img/product/trending/trending-2.jpg",
  "/assets/img/product/trending/trending-3.jpg",
];

const BEST_SELLER_IMAGES = [
  "/assets/img/product/2/prodcut-9.jpg",
  "/assets/img/product/2/prodcut-10.jpg",
  "/assets/img/product/2/prodcut-11.jpg",
  "/assets/img/product/2/prodcut-12.jpg",
];

export const DEFAULT_PRODUCT_IMAGE = "/assets/img/product/2/prodcut-1.jpg";

export const PRODUCT_PICKER_IMAGES = Array.from(
  new Set([
    ...TAB_PRODUCT_IMAGES,
    ...FEATURED_SLIDER_IMAGES,
    ...TRENDING_IMAGES,
    ...BEST_SELLER_IMAGES,
    ...CATEGORY_IMAGES,
    ...[1, 2, 3, 4, 5].flatMap((index) => [
      `/assets/img/product/details/nav/product-details-nav-${index}.jpg`,
      `/assets/img/product/details/main/product-details-main-${index}.jpg`,
    ]),
    "/assets/img/product/boys-graphic-t-shirt/orange.png",
    "/assets/img/product/boys-graphic-t-shirt/tan.png",
    "/assets/img/product/boys-graphic-t-shirt/green.png",
    "/assets/img/product/boys-graphic-t-shirt/pink.png",
  ]),
);

function detailGallerySlides(indexes: number[]): ProductGallerySlide[] {
  return indexes.map((index) => ({
    thumb: `/assets/img/product/details/nav/product-details-nav-${index}.jpg`,
    main: `/assets/img/product/details/main/product-details-main-${index}.jpg`,
  }));
}

const DEFAULT_DETAIL_GALLERY_SETS: ProductGallerySlide[][] = [
  detailGallerySlides([1, 2, 3, 4, 5]),
  detailGallerySlides([2, 3, 4, 5, 1]),
  detailGallerySlides([3, 4, 5, 1, 2]),
  detailGallerySlides([4, 5, 1, 2, 3]),
  detailGallerySlides([5, 1, 2, 3, 4]),
  detailGallerySlides([1, 3, 5, 2, 4]),
];

function normalizeGalleryInput(images: unknown): ProductGallerySlide[] {
  if (!Array.isArray(images)) return [];

  const slides: ProductGallerySlide[] = [];

  for (const item of images) {
    if (typeof item === "string" && item) {
      slides.push({ thumb: item, main: item });
      continue;
    }

    if (item && typeof item === "object") {
      const record = item as { thumb?: string | null; main?: string | null };
      const main = record.main ?? record.thumb;
      const thumb = record.thumb ?? main;
      if (main) {
        slides.push({
          thumb: resolveProductImage(thumb ?? main),
          main: resolveProductImage(main),
        });
      }
    }
  }

  return slides;
}

export function productDetailGallery(product: {
  id: number;
  image?: string | null;
  images?: unknown;
}): ProductGallerySlide[] {
  const fromDb = normalizeGalleryInput(product.images);
  if (fromDb.length > 0) {
    return fromDb;
  }

  const cover = resolveProductImage(product.image, defaultProductImageForId(product.id));
  const fallbackSet = DEFAULT_DETAIL_GALLERY_SETS[(product.id - 1) % DEFAULT_DETAIL_GALLERY_SETS.length];

  return fallbackSet.map((slide, index) =>
    index === 0 ? { thumb: cover, main: cover } : slide,
  );
}

function backendOrigin() {
  return API_URL.replace(/\/api\/v1\/?$/, "");
}

/** Paths served from Next.js `public/` (same paths stored in Laravel `products.image`). */
export function resolveProductImage(
  image: string | null | undefined,
  fallback = DEFAULT_PRODUCT_IMAGE,
): string {
  if (!image) return fallback;

  let path = image;
  if (path.includes("/product/2/product-")) {
    path = path.replace(/\/product\/2\/product-/g, "/product/2/prodcut-");
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/storage/")) {
    return `${backendOrigin()}${path}`;
  }
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  return path;
}

export function defaultProductImageForId(productId: number) {
  const index = ((productId - 1) % 15) + 1;
  return `/assets/img/product/2/prodcut-${index}.jpg`;
}

const GALLERY_IMAGE_POOL = [
  ...TAB_PRODUCT_IMAGES,
  ...FEATURED_SLIDER_IMAGES,
  ...TRENDING_IMAGES,
  ...BEST_SELLER_IMAGES,
];

/** @deprecated Use productDetailGallery for product detail pages */
export function productGalleryImages(product: { id: number; image?: string | null }, count = 4) {
  return productDetailGallery(product)
    .slice(0, count)
    .map((slide) => slide.main);
}

export function productHref(slug: string) {
  return `/products/${slug}`;
}

export function formatPriceTHB(price: number) {
  return `฿${Number(price).toLocaleString("th-TH")}`;
}

export function productImage(product: ApiProduct, fallback: string) {
  return resolveProductImage(product.image, fallback);
}

function categoryToTab(categorySlug?: string): ProductTabKey {
  if (!categorySlug) return "clothing";
  return CATEGORY_TAB_MAP[categorySlug] ?? "clothing";
}

export async function getRelatedProducts(
  currentSlug: string,
  categorySlug?: string,
  limit = 8,
): Promise<ApiProduct[]> {
  const products = await getProducts({ category: categorySlug });
  return products.filter((product) => product.slug !== currentSlug).slice(0, limit);
}

export async function getProducts(params?: {
  featured?: boolean;
  category?: string;
}): Promise<ApiProduct[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.featured) searchParams.set("featured", "1");
    if (params?.category) searchParams.set("category", params.category);

    const query = searchParams.toString();
    const res = await fetch(`${API_URL}/products${query ? `?${query}` : ""}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export function mapToCategorySliderItems(products: ApiProduct[]) {
  return products.map((product, index) => ({
    image: productImage(product, CATEGORY_IMAGES[index % CATEGORY_IMAGES.length]),
    fromPrice: `From ${formatPriceTHB(product.price)}`,
    title: product.name,
    href: productHref(product.slug),
    productId: product.id,
    priceValue: product.price,
  }));
}

export function mapToProductTabsItems(products: ApiProduct[]) {
  return products.map((product, index) => ({
    id: String(product.id),
    productId: product.id,
    title: product.name,
    store: product.category?.name ?? "AESTHETE",
    tags: [product.category?.name ?? "Shop"],
    image: productImage(product, TAB_PRODUCT_IMAGES[index % TAB_PRODUCT_IMAGES.length]),
    href: productHref(product.slug),
    price: formatPriceTHB(product.price),
    priceValue: product.price,
    rating: 5,
    tab: categoryToTab(product.category?.slug),
  }));
}

export function mapToFeaturedSliderItems(products: ApiProduct[]) {
  return products.map((product, index) => ({
    id: String(product.id),
    productId: product.id,
    title: product.name,
    image: productImage(product, FEATURED_SLIDER_IMAGES[index % FEATURED_SLIDER_IMAGES.length]),
    href: productHref(product.slug),
    price: formatPriceTHB(product.price),
    priceValue: product.price,
  }));
}

export function mapToTrendingItems(products: ApiProduct[]) {
  return products.slice(0, 6).map((product, index) => ({
    id: String(product.id),
    productId: product.id,
    image: productImage(product, TRENDING_IMAGES[index % TRENDING_IMAGES.length]),
    title: product.name,
    href: productHref(product.slug),
    tags: [product.category?.name ?? "AESTHETE"],
    price: formatPriceTHB(product.price),
    priceValue: product.price,
  }));
}

export function mapToBestSellerItems(products: ApiProduct[]) {
  const sorted = [...products].sort((a, b) => (b.sales_count ?? 0) - (a.sales_count ?? 0));
  return sorted.slice(0, 4).map((product, index) => ({
    id: String(product.id),
    productId: product.id,
    image: productImage(product, BEST_SELLER_IMAGES[index % BEST_SELLER_IMAGES.length]),
    title: product.name,
    href: productHref(product.slug),
    tags: [product.category?.name ?? "Shop"],
    price: formatPriceTHB(product.price),
    priceValue: product.price,
  }));
}

