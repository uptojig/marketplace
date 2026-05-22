"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle } from "lucide-react";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // We're inside /stores/[slug]/* — derive the slug from the URL so
  // "back to home" lands on THIS store, not the platform root
  // (basketplace.co). Error boundaries don't receive route params.
  const pathname = usePathname() ?? "/";
  const match = pathname.match(/^\/stores\/([^/]+)/);
  const storeSlug = match?.[1];
  const homeHref = storeSlug ? `/stores/${storeSlug}` : "/";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        เกิดข้อผิดพลาดบางอย่าง
      </h1>
      <p className="mb-8 text-base leading-7 text-gray-600 sm:text-lg">
        ขออภัย ระบบไม่สามารถดำเนินการตามคำขอของคุณได้ในขณะนี้
      </p>
      <div className="flex items-center justify-center gap-x-4">
        <button
          onClick={reset}
          className="rounded-md bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          ลองใหม่อีกครั้ง
        </button>
        <Link
          href={homeHref}
          className="rounded-md bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200"
        >
          กลับสู่หน้าร้าน
        </Link>
      </div>
    </div>
  );
}
