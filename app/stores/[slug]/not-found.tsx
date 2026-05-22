"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";

export default function StoreNotFound() {
  // We're inside the /stores/[slug]/* route — pull the slug off the
  // pathname so the "back to home" button lands on THIS store's
  // homepage (which is what the buyer sees as `aowbao.com/`, not
  // the platform basketplace.co root). Next.js doesn't pass
  // `params` to not-found, so usePathname is the cleanest way.
  const pathname = usePathname() ?? "/";
  const match = pathname.match(/^\/stores\/([^/]+)/);
  const storeSlug = match?.[1];
  const homeHref = storeSlug ? `/stores/${storeSlug}` : "/";

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
          href={homeHref}
          className="rounded-md bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          กลับสู่หน้าร้าน
        </Link>
      </div>
    </div>
  );
}
