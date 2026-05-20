import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function StoreNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-300" />
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        ไม่พบหน้าเว็บที่คุณค้นหา
      </h1>
      <p className="mb-8 text-base leading-7 text-gray-600 sm:text-lg">
        ขออภัย สินค้าหรือหน้าร้านค้านี้อาจถูกลบไปแล้ว หรือลิงก์อาจไม่ถูกต้อง
      </p>
      <div className="flex items-center justify-center gap-x-6">
        <Link
          href="/"
          className="rounded-md bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          กลับสู่หน้าหลัก
        </Link>
      </div>
    </div>
  );
}
