"use client";

import { useState } from "react";
import { MessageCircle, Phone, X } from "lucide-react";

export function ShopFloatingButtons({ primaryColor }: { primaryColor: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[55] flex flex-col items-end gap-3">
      {open && (
        <>
          <a
            href="tel:0000000000"
            aria-label="Phone"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600"
          >
            <Phone className="h-5 w-5" />
          </a>
          <a
            href="https://line.me"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LINE"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700"
          >
            <span className="text-xs font-bold">LINE</span>
          </a>
        </>
      )}
      <button
        type="button"
        aria-label="Contact"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105"
        style={{ backgroundColor: primaryColor }}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
