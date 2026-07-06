export type HeroMediaType = "image" | "youtube";

export type HeroSlideRecord = {
  id: string;
  adminName: string;
  mediaType: HeroMediaType;
  sortOrder: number;
  enabled: boolean;
  image: string;
  badge?: string;
  title?: string;
  titleHighlight?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  showCta?: boolean;
  youtubeId?: string;
};

export type ProductCurationItem = {
  id: string;
  productId: number;
  sortOrder: number;
  enabled: boolean;
};

export type CmsSectionConfig = {
  title: string;
  subtitle: string;
  enabled: boolean;
  items: ProductCurationItem[];
};

export type HomepageCmsState = {
  heroSlides: HeroSlideRecord[];
  customerFavorite: CmsSectionConfig;
  featuredProducts: CmsSectionConfig;
};

const STORAGE_KEY = "aesthete_cms_homepage_v1";

export const defaultHeroSlides: HeroSlideRecord[] = [
  {
    id: "hero-1",
    adminName: "Slide 1 — Hero with text",
    mediaType: "image",
    sortOrder: 0,
    enabled: true,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
    title: "Apple Style Ecommerce",
    subtitle: "ประสบการณ์ช้อปปิ้งระดับพรีเมียม พร้อมสินค้าและโปรโมชั่นพิเศษ",
    ctaLabel: "Shop Now",
    ctaUrl: "/shop",
    showCta: true,
  },
  {
    id: "hero-2",
    adminName: "Slide 2 — New Collection",
    mediaType: "image",
    sortOrder: 1,
    enabled: true,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
    title: "New Collection 2026",
    subtitle: "ดีไซน์เรียบหรู พร้อมเทคโนโลยีล่าสุดสำหรับทุกไลฟ์สไตล์",
    ctaLabel: "Explore",
    ctaUrl: "/shop",
    showCta: true,
  },
  {
    id: "hero-3",
    adminName: "Slide 3 — Premium Accessories",
    mediaType: "youtube",
    sortOrder: 2,
    enabled: true,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    youtubeId: "x5hkD526A5M",
    title: "Premium Accessories",
    subtitle: "อุปกรณ์เสริมคุณภาพสูง",
    showCta: false,
  },
];

const defaultSection = (title: string, subtitle: string): CmsSectionConfig => ({
  title,
  subtitle,
  enabled: true,
  items: [],
});

export const defaultHomepageCms: HomepageCmsState = {
  heroSlides: defaultHeroSlides,
  customerFavorite: defaultSection(
    "Customer Favorite Style Product",
    "สินค้ายอดนิยมที่ลูกค้าเลือกซื้อมากที่สุด",
  ),
  featuredProducts: defaultSection(
    "Featured Products",
    "สินค้าแนะนำพิเศษบนหน้าแรก",
  ),
};

export function loadHomepageCms(): HomepageCmsState {
  if (typeof window === "undefined") return defaultHomepageCms;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultHomepageCms;
    const parsed = JSON.parse(raw) as HomepageCmsState;
    return {
      heroSlides: parsed.heroSlides?.length ? parsed.heroSlides : defaultHomepageCms.heroSlides,
      customerFavorite: parsed.customerFavorite ?? defaultHomepageCms.customerFavorite,
      featuredProducts: parsed.featuredProducts ?? defaultHomepageCms.featuredProducts,
    };
  } catch {
    return defaultHomepageCms;
  }
}

export function saveHomepageCms(state: HomepageCmsState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
