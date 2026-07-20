/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { HeaderMegaMenuConfig } from "@/lib/cms/headerMegaMenu";

type HeaderMegaMenuPanelProps = {
  config: HeaderMegaMenuConfig;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
};

export function HeaderMegaMenuPanel({
  config,
  onNavigate,
  variant = "desktop",
}: HeaderMegaMenuPanelProps) {
  const titleClass = variant === "mobile" ? "shop-mega-menu-title" : "mega-menu-title";

  return (
    <>
      {config.columns.map((column) => (
        <li key={column.title}>
          <span className={titleClass}>{column.title}</span>
          <ul>
            {column.links.map((link) => (
              <li key={`${column.title}-${link.label}`}>
                <Link href={link.href} onClick={onNavigate}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
      {config.promos.map((promo) => (
        <li key={promo.label}>
          <Link href={promo.href} className="shop-mega-menu-img" onClick={onNavigate}>
            <img src={promo.image} alt={promo.label} />
            <span className="shop-mega-menu-btn">
              <span className="tp-btn">{promo.label}</span>
            </span>
          </Link>
        </li>
      ))}
    </>
  );
}
