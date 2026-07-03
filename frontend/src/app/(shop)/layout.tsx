import { Footer } from "@/components/shop/Footer";
import { CartProvider } from "@/components/shop/cart/CartProvider";
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
        <ShopStyles />
        <Header />
        <main>{children}</main>
        <Footer />
      </CartProvider>
    </>
  );
}
