import { Suspense } from "react";
import { CheckoutPayPage } from "@/components/shop/payment/CheckoutPayPage";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
};

export default async function CheckoutPayRoute({ params }: PageProps) {
  const { orderNumber } = await params;

  return (
    <Suspense fallback={<section className="py-20 text-center">กำลังโหลด...</section>}>
      <CheckoutPayPage orderNumber={orderNumber} />
    </Suspense>
  );
}
