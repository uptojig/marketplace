"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

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
          href="/"
          className="rounded-md bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200"
        >
          กลับสู่หน้าหลัก
        </Link>
      </div>
    </div>
  );
}
