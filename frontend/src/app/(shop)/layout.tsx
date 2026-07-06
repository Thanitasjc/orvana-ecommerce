import { Footer } from "@/components/shop/Footer";
import { CartProvider } from "@/components/shop/cart/CartProvider";
import { CompareProvider } from "@/components/shop/compare/CompareProvider";
import { WishlistProvider } from "@/components/shop/wishlist/WishlistProvider";
import { Header } from "@/components/shop/Header";
import { ShopStyles } from "@/components/shop/ShopStyles";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CartProvider>
        <CompareProvider>
          <WishlistProvider>
            <ShopStyles />
            <Header />
            <main>{children}</main>
            <Footer />
          </WishlistProvider>
        </CompareProvider>
      </CartProvider>
    </>
  );
}
