import { Footer } from "@/components/shop/Footer";
import { CartProvider } from "@/components/shop/cart/CartProvider";
import { CompareProvider } from "@/components/shop/compare/CompareProvider";
import { WishlistProvider } from "@/components/shop/wishlist/WishlistProvider";
import { Header } from "@/components/shop/Header";
import { MobileBottomNav } from "@/components/shop/MobileBottomNav";
import { PwaInstallPrompt } from "@/components/shop/PwaInstallPrompt";
import { ShopStyles } from "@/components/shop/ShopStyles";
import { fetchHeaderCms } from "@/lib/api/headerCms";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerCms = await fetchHeaderCms();

  return (
    <>
      <CartProvider>
        <CompareProvider>
          <WishlistProvider>
            <ShopStyles />
            <Header initialCms={headerCms} />
            <div className="pb-[72px] xl:pb-0">
              <main className="overflow-x-clip">{children}</main>
              <Footer />
            </div>
            <PwaInstallPrompt />
            <MobileBottomNav />
          </WishlistProvider>
        </CompareProvider>
      </CartProvider>
    </>
  );
}

