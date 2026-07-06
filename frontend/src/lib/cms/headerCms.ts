export type HeaderMenuItem = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  enabled: boolean;
};

export type HeaderCmsState = {
  logoUrl: string;
  logoAlt: string;
  menuItems: HeaderMenuItem[];
};

export const defaultHeaderCms: HeaderCmsState = {
  logoUrl: "/assets/img/logo/logo.svg",
  logoAlt: "AESTHETE",
  menuItems: [
    { id: "menu-home", label: "หน้าแรก", href: "/", sortOrder: 0, enabled: true },
    { id: "menu-shop", label: "ร้านค้า", href: "/shop", sortOrder: 1, enabled: true },
    { id: "menu-coupons", label: "คูปอง", href: "/coupons", sortOrder: 2, enabled: true },
  ],
};

export function getVisibleMenuItems(state: HeaderCmsState): HeaderMenuItem[] {
  return [...state.menuItems]
    .filter((item) => item.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
