import { Footer } from "@/components/shop/Footer";
import { CartProvider } from "@/components/shop/cart/CartProvider";
import { CompareProvider } from "@/components/shop/compare/CompareProvider";
import { WishlistProvider } from "@/components/shop/wishlist/WishlistProvider";
import { Header } from "@/components/shop/Header";
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
            <main>{children}</main>
            <Footer />
          </WishlistProvider>
        </CompareProvider>
      </CartProvider>
    </>
  );
}
