import Link from "next/link";

export const metadata = {
  title: "ออฟไลน์ — AESTHETE",
};

export default function OfflinePage() {
  return (
    <section className="container py-120">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="mb-3 text-3xl font-semibold text-slate-900">คุณออฟไลน์อยู่</h1>
        <p className="mb-8 text-slate-600">
          ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้ในขณะนี้ ลองเชื่อมต่ออีกครั้งแล้วรีเฟรชหน้า
        </p>
        <Link href="/" className="tp-btn">
          กลับหน้าแรก
        </Link>
      </div>
    </section>
  );
}
