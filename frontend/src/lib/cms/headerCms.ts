export type HeaderMegaMenuLink = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  enabled: boolean;
};

export type HeaderMegaMenuColumn = {
  id: string;
  title: string;
  links: HeaderMegaMenuLink[];
  sortOrder: number;
  enabled: boolean;
};

export type HeaderMegaMenuPromo = {
  id: string;
  image: string;
  label: string;
  href: string;
  sortOrder: number;
  enabled: boolean;
};

export type HeaderMegaMenuConfig = {
  enabled: boolean;
  columns: HeaderMegaMenuColumn[];
  promos: HeaderMegaMenuPromo[];
};

export type HeaderMenuItem = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  enabled: boolean;
  megaMenu: HeaderMegaMenuConfig | null;
};

export type HeaderTopbarLanguage = {
  code: string;
  label: string;
  enabled: boolean;
};

export type HeaderTopbarSocialPlatform =
  | "facebook"
  | "line"
  | "youtube"
  | "instagram"
  | "tiktok"
  | "x"
  | "custom";

export type HeaderTopbarSocialLink = {
  id: string;
  platform: HeaderTopbarSocialPlatform;
  label: string;
  url: string;
  iconClass: string;
  imageUrl: string;
  sortOrder: number;
  enabled: boolean;
};

export const TOPBAR_SOCIAL_PLATFORM_PRESETS: Record<
  HeaderTopbarSocialPlatform,
  { label: string; iconClass: string }
> = {
  facebook: { label: "Facebook", iconClass: "fa-brands fa-facebook-f" },
  line: { label: "LINE", iconClass: "fa-brands fa-line" },
  youtube: { label: "YouTube", iconClass: "fa-brands fa-youtube" },
  instagram: { label: "Instagram", iconClass: "fa-brands fa-instagram" },
  tiktok: { label: "TikTok", iconClass: "fa-brands fa-tiktok" },
  x: { label: "X (Twitter)", iconClass: "fa-brands fa-x-twitter" },
  custom: { label: "อื่นๆ", iconClass: "fa-light fa-link" },
};

export type HeaderTopbarConfig = {
  enabled: boolean;
  phone: string;
  defaultLanguage: string;
  languages: HeaderTopbarLanguage[];
  socialLinks: HeaderTopbarSocialLink[];
};

export type HeaderCmsState = {
  logoUrl: string;
  logoAlt: string;
  menuItems: HeaderMenuItem[];
  topbar: HeaderTopbarConfig;
};

export const defaultHeaderTopbarLanguages: HeaderTopbarLanguage[] = [
  { code: "th", label: "ไทย", enabled: true },
  { code: "en", label: "English", enabled: true },
];

export const defaultHeaderTopbarSocialLinks: HeaderTopbarSocialLink[] = [
  {
    id: "social-facebook",
    platform: "facebook",
    label: "Facebook",
    url: "https://facebook.com",
    iconClass: TOPBAR_SOCIAL_PLATFORM_PRESETS.facebook.iconClass,
    imageUrl: "",
    sortOrder: 0,
    enabled: true,
  },
  {
    id: "social-line",
    platform: "line",
    label: "LINE",
    url: "https://line.me",
    iconClass: TOPBAR_SOCIAL_PLATFORM_PRESETS.line.iconClass,
    imageUrl: "",
    sortOrder: 1,
    enabled: true,
  },
  {
    id: "social-youtube",
    platform: "youtube",
    label: "YouTube",
    url: "https://youtube.com",
    iconClass: TOPBAR_SOCIAL_PLATFORM_PRESETS.youtube.iconClass,
    imageUrl: "",
    sortOrder: 2,
    enabled: true,
  },
];

export const defaultHeaderTopbar: HeaderTopbarConfig = {
  enabled: true,
  phone: "02-123-4567",
  defaultLanguage: "th",
  languages: defaultHeaderTopbarLanguages,
  socialLinks: defaultHeaderTopbarSocialLinks,
};

export const defaultShopMegaMenu: HeaderMegaMenuConfig = {
  enabled: true,
  columns: [
    {
      id: "mega-col-shop-pages",
      title: "Shop Pages",
      sortOrder: 0,
      enabled: true,
      links: [
        { id: "mega-link-1", label: "Grid Layout", href: "/shop", sortOrder: 0, enabled: true },
        { id: "mega-link-2", label: "Shop Categories", href: "/shop", sortOrder: 1, enabled: true },
        { id: "mega-link-3", label: "List Layout", href: "/shop", sortOrder: 2, enabled: true },
        { id: "mega-link-4", label: "Full width Layout", href: "/shop", sortOrder: 3, enabled: true },
      ],
    },
    {
      id: "mega-col-features",
      title: "Features",
      sortOrder: 1,
      enabled: true,
      links: [
        { id: "mega-link-5", label: "Filter Dropdown", href: "/shop", sortOrder: 0, enabled: true },
        { id: "mega-link-6", label: "Filters Offcanvas", href: "/shop", sortOrder: 1, enabled: true },
        { id: "mega-link-7", label: "Filters Sidebar", href: "/shop", sortOrder: 2, enabled: true },
        { id: "mega-link-8", label: "Load More button", href: "/shop", sortOrder: 3, enabled: true },
      ],
    },
    {
      id: "mega-col-hover",
      title: "Hover Style",
      sortOrder: 2,
      enabled: true,
      links: [
        { id: "mega-link-9", label: "Hover Style 1", href: "/shop", sortOrder: 0, enabled: true },
        { id: "mega-link-10", label: "Hover Style 2", href: "/shop", sortOrder: 1, enabled: true },
        { id: "mega-link-11", label: "Hover Style 3", href: "/shop", sortOrder: 2, enabled: true },
        { id: "mega-link-12", label: "Hover Style 4", href: "/shop", sortOrder: 3, enabled: true },
      ],
    },
  ],
  promos: [
    {
      id: "mega-promo-1",
      image: "/assets/img/header/menu/menu-1.jpg",
      label: "Phones",
      href: "/shop",
      sortOrder: 0,
      enabled: true,
    },
    {
      id: "mega-promo-2",
      image: "/assets/img/header/menu/menu-2.jpg",
      label: "Headphones",
      href: "/shop",
      sortOrder: 1,
      enabled: true,
    },
  ],
};

export const defaultHeaderCms: HeaderCmsState = {
  logoUrl: "/assets/img/logo/logo.svg",
  logoAlt: "AESTHETE",
  menuItems: [
    { id: "menu-home", label: "หน้าแรก", href: "/", sortOrder: 0, enabled: true, megaMenu: null },
    {
      id: "menu-shop",
      label: "ร้านค้า",
      href: "/shop",
      sortOrder: 1,
      enabled: true,
      megaMenu: defaultShopMegaMenu,
    },
    { id: "menu-coupons", label: "คูปอง", href: "/coupons", sortOrder: 2, enabled: true, megaMenu: null },
  ],
  topbar: defaultHeaderTopbar,
};

function normalizeMegaMenuLinks(links: HeaderMegaMenuLink[] | undefined): HeaderMegaMenuLink[] {
  if (!Array.isArray(links)) return [];

  return links.map((link, index) => ({
    id: link.id || `mega-link-${index}`,
    label: link.label || "",
    href: link.href || "/",
    sortOrder: typeof link.sortOrder === "number" ? link.sortOrder : index,
    enabled: link.enabled ?? true,
  }));
}

function normalizeMegaMenuColumns(columns: HeaderMegaMenuColumn[] | undefined): HeaderMegaMenuColumn[] {
  if (!Array.isArray(columns)) return [];

  return columns.map((column, index) => ({
    id: column.id || `mega-col-${index}`,
    title: column.title || "",
    sortOrder: typeof column.sortOrder === "number" ? column.sortOrder : index,
    enabled: column.enabled ?? true,
    links: normalizeMegaMenuLinks(column.links),
  }));
}

function normalizeMegaMenuPromos(promos: HeaderMegaMenuPromo[] | undefined): HeaderMegaMenuPromo[] {
  if (!Array.isArray(promos)) return [];

  return promos.map((promo, index) => ({
    id: promo.id || `mega-promo-${index}`,
    image: promo.image || "/assets/img/header/menu/menu-1.jpg",
    label: promo.label || "",
    href: promo.href || "/shop",
    sortOrder: typeof promo.sortOrder === "number" ? promo.sortOrder : index,
    enabled: promo.enabled ?? true,
  }));
}

export function normalizeMegaMenu(
  megaMenu: HeaderMegaMenuConfig | null | undefined,
  fallback: HeaderMegaMenuConfig | null = null,
): HeaderMegaMenuConfig | null {
  if (!megaMenu) return fallback;

  return {
    enabled: megaMenu.enabled ?? false,
    columns: normalizeMegaMenuColumns(megaMenu.columns),
    promos: normalizeMegaMenuPromos(megaMenu.promos),
  };
}

function normalizeMenuItem(item: HeaderMenuItem, index: number): HeaderMenuItem {
  const fallbackMega = item.id === "menu-shop" ? defaultShopMegaMenu : null;

  return {
    id: item.id || `menu-${index}`,
    label: item.label || "",
    href: item.href || "/",
    sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : index,
    enabled: item.enabled ?? true,
    megaMenu: normalizeMegaMenu(item.megaMenu, fallbackMega),
  };
}

function normalizeSocialLinks(
  topbar: HeaderTopbarConfig | (Partial<HeaderTopbarConfig> & { facebookUrl?: string; facebookFollowers?: string }) | undefined,
): HeaderTopbarSocialLink[] {
  if (Array.isArray(topbar?.socialLinks)) {
    return topbar.socialLinks.map((link, index) => ({
      id: link.id || `social-${index}`,
      platform: link.platform || "custom",
      label: link.label || TOPBAR_SOCIAL_PLATFORM_PRESETS[link.platform || "custom"]?.label || "Social",
      url: link.url || "#",
      iconClass:
        link.iconClass ||
        TOPBAR_SOCIAL_PLATFORM_PRESETS[link.platform || "custom"]?.iconClass ||
        TOPBAR_SOCIAL_PLATFORM_PRESETS.custom.iconClass,
      imageUrl: link.imageUrl || "",
      sortOrder: typeof link.sortOrder === "number" ? link.sortOrder : index,
      enabled: link.enabled ?? true,
    }));
  }

  const legacyFacebookUrl = (topbar as { facebookUrl?: string } | undefined)?.facebookUrl;
  if (legacyFacebookUrl) {
    return [
      {
        id: "social-facebook",
        platform: "facebook",
        label: "Facebook",
        url: legacyFacebookUrl,
        iconClass: TOPBAR_SOCIAL_PLATFORM_PRESETS.facebook.iconClass,
        imageUrl: "",
        sortOrder: 0,
        enabled: true,
      },
    ];
  }

  return defaultHeaderTopbarSocialLinks;
}

function normalizeTopbar(topbar: HeaderTopbarConfig | undefined): HeaderTopbarConfig {
  const languages = Array.isArray(topbar?.languages) && topbar.languages.length
    ? topbar.languages.map((language) => ({
        code: language.code || "th",
        label: language.label || language.code || "ไทย",
        enabled: language.enabled ?? true,
      }))
    : defaultHeaderTopbarLanguages;

  const defaultLanguage = topbar?.defaultLanguage && languages.some((lang) => lang.code === topbar.defaultLanguage)
    ? topbar.defaultLanguage
    : languages.find((lang) => lang.enabled)?.code || "th";

  return {
    enabled: topbar?.enabled ?? defaultHeaderTopbar.enabled,
    phone: topbar?.phone || defaultHeaderTopbar.phone,
    defaultLanguage,
    languages,
    socialLinks: normalizeSocialLinks(topbar),
  };
}

export function normalizeHeaderCms(data: HeaderCmsState | undefined): HeaderCmsState {
  if (!data) return defaultHeaderCms;

  const menuItems = data.menuItems?.length
    ? data.menuItems.map((item, index) => normalizeMenuItem(item, index))
    : defaultHeaderCms.menuItems;

  return {
    logoUrl: data.logoUrl || defaultHeaderCms.logoUrl,
    logoAlt: data.logoAlt || defaultHeaderCms.logoAlt,
    menuItems,
    topbar: normalizeTopbar(data.topbar),
  };
}

export function getVisibleMenuItems(state: HeaderCmsState): HeaderMenuItem[] {
  return [...state.menuItems]
    .filter((item) => item.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getMenuMegaMenu(item: HeaderMenuItem): HeaderMegaMenuConfig | null {
  if (!item.megaMenu?.enabled) return null;

  const columns = [...item.megaMenu.columns]
    .filter((column) => column.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((column) => ({
      ...column,
      links: [...column.links]
        .filter((link) => link.enabled)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .filter((column) => column.links.length > 0);

  const promos = [...item.megaMenu.promos]
    .filter((promo) => promo.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (columns.length === 0 && promos.length === 0) return null;

  return { enabled: true, columns, promos };
}

export function getVisibleTopbarLanguages(topbar: HeaderTopbarConfig): HeaderTopbarLanguage[] {
  return topbar.languages.filter((language) => language.enabled);
}

export function getVisibleTopbarSocialLinks(topbar: HeaderTopbarConfig): HeaderTopbarSocialLink[] {
  return [...topbar.socialLinks]
    .filter((link) => link.enabled && link.url.trim())
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getTopbarSocialIconClass(link: HeaderTopbarSocialLink): string {
  if (link.iconClass.trim()) return link.iconClass.trim();
  return TOPBAR_SOCIAL_PLATFORM_PRESETS[link.platform]?.iconClass ?? TOPBAR_SOCIAL_PLATFORM_PRESETS.custom.iconClass;
}
