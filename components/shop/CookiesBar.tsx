"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "mp_cookies_accepted";

export function CookiesBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-md rounded-xl bg-white p-4 shadow-2xl md:left-6 md:right-auto md:w-[420px]">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🍪</span>
        <div className="flex-1 text-sm text-gray-700">
          เว็บไซต์นี้ใช้ Cookies เพื่อช่วยให้คุณ
          <br />
          ได้รับประสบการณ์ที่ดีที่สุดในการสั่งซื้อ
          <br />
          <a href="#" className="underline">
            เรียนรู้เพิ่มเติม
          </a>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "1");
            setVisible(false);
          }}
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          ยอมรับ
        </button>
      </div>
    </div>
  );
}
