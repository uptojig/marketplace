import type { Metadata } from "next";
import { DM_Sans, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AddToCartModal } from "@/components/shop/AddToCartModal";

// "Google Sans" itself isn't on Google Fonts; DM Sans is the closest open alternative
// (designed by Colophon Foundry / Google ATF, similar geometric feel).
// Combined with Noto Sans Thai for Thai script support.
const googleSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-google-sans",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Multi-vendor dropshipping marketplace (AnyPay + China suppliers)",
  referrer: "no-referrer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${googleSans.variable} ${notoSansThai.variable}`}>
      <body className="font-sans">
        <Providers>
          {children}
          <AddToCartModal />
        </Providers>
      </body>
    </html>
  );
}
