import { apiFetch } from "@/lib/api/client";
import { resolveProductImage } from "@/lib/api/products";
import type { ApiProduct } from "@/lib/api/products";
import type {
  CmsSectionConfig,
  HeroSlideRecord,
  HomepageCmsState,
  ProductCurationItem,
} from "@/lib/cms/homepageCms";
import { defaultHomepageCms } from "@/lib/cms/homepageCms";

export type StorefrontHeroSlide = {
  image: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export async function fetchHomepageCms(): Promise<HomepageCmsState> {
  try {
    const res = await apiFetch<{ data: HomepageCmsState }>("/cms/homepage", {
      cache: "no-store",
    });
    return normalizeHomepageCms(res.data);
  } catch {
    return defaultHomepageCms;
  }
}

export async function fetchAdminHomepageCms(token: string): Promise<HomepageCmsState> {
  const res = await apiFetch<{ data: HomepageCmsState }>("/admin/cms/homepage", { token });
  return normalizeHomepageCms(res.data);
}

export async function saveAdminHomepageCms(state: HomepageCmsState, token: string) {
  const res = await apiFetch<{ data: HomepageCmsState }>("/admin/cms/homepage", {
    method: "PATCH",
    token,
    body: JSON.stringify(state),
  });
  return normalizeHomepageCms(res.data);
}

function normalizeHomepageCms(data: HomepageCmsState | undefined): HomepageCmsState {
  if (!data) return defaultHomepageCms;
  return {
    heroSlides: data.heroSlides?.length ? data.heroSlides : defaultHomepageCms.heroSlides,
    customerFavorite: { ...defaultHomepageCms.customerFavorite, ...data.customerFavorite },
    featuredProducts: { ...defaultHomepageCms.featuredProducts, ...data.featuredProducts },
  };
}

export function mapHeroSlidesForBanner(slides: HeroSlideRecord[]): StorefrontHeroSlide[] {
  return [...slides]
    .filter((slide) => slide.enabled && slide.image)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((slide) => {
      const title = [slide.title, slide.titleHighlight].filter(Boolean).join(" ").trim();
      return {
        image: resolveProductImage(slide.image),
        title: title || undefined,
        subtitle: slide.subtitle || undefined,
        ctaLabel: slide.showCta ? slide.ctaLabel : undefined,
        ctaUrl: slide.showCta ? slide.ctaUrl : undefined,
      };
    });
}

export function pickCuratedProducts(
  products: ApiProduct[],
  section: CmsSectionConfig,
): ApiProduct[] | undefined {
  if (!section.enabled || section.items.length === 0) return undefined;

  const byId = new Map(products.map((product) => [product.id, product]));
  const picked = [...section.items]
    .filter((item: ProductCurationItem) => item.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => byId.get(item.productId))
    .filter((product): product is ApiProduct => Boolean(product));

  return picked.length > 0 ? picked : undefined;
}
