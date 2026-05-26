import type { Metadata } from "next";
import { Suspense } from "react";
import {
  DM_Sans,
  Noto_Sans_Thai,
  Prompt,
  IBM_Plex_Sans_Thai,
  Inter,
  Inter_Tight,
  JetBrains_Mono,
  Cormorant_Garamond,
  Playfair_Display,
  Outfit,
  Fraunces,
  Caveat,
  Nunito,
  Kanit,
} from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AddToCartModal } from "@/components/shop/AddToCartModal";
import { Toaster } from "@/components/ui/toaster";
import CookieConsent from "@/components/marketplace/cookie-consent";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});


// "Google Sans" itself isn't on Google Fonts; DM Sans is the closest open alternative
// (designed by Colophon Foundry / Google ATF, similar geometric feel).
const googleSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-google-sans",
  display: "swap",
});

// Primary Thai face — Prompt by Cadson Demak. Geometric, modern, pairs
// cleanly with DM Sans and reads well at body and display sizes.
// Used as the default Thai font across storefront pages.
const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
});

// Secondary / display Thai face — IBM Plex Sans Thai. Slightly more
// editorial feel for hero headings; available as a CSS variable so
// individual blocks can opt in via `font-family: var(--font-ibm-thai)`.
const ibmPlexThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-thai",
  display: "swap",
});

// Kept as a safe fallback for any block that still references --font-noto-thai
// (older landing schemas, agent-generated HTML). Prompt is preferred for new code.
const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-thai",
  display: "swap",
});

// Editorial display serif for the fashion-beauty design family.
// Loaded as a CSS variable so only stores in this family pick it up
// (via .theme-fashion-beauty in globals.css); the rest of the app
// keeps its sans defaults at zero cost.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fashion-display",
  display: "swap",
});

// Heritage / department-store display serif for the trust design
// family (templates: classic, official-brand, premium-luxury).
// Loaded as a CSS variable so only stores in this family pick it
// up (via .theme-trust in globals.css); the rest of the app keeps
// its sans defaults at zero cost. Playfair Display pairs cleanly
// with Noto Serif Thai for Thai glyph fallback.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-trust-display",
  display: "swap",
});

// Geometric humanist sans for the lifestyle design family
// (templates: home-living, sport-active, kids-toys). Outfit is a
// modern catalog face — friendly + grown-up, pairs cleanly with
// Prompt for Thai glyphs. Loaded as a CSS variable so only stores
// in this family pick it up (via .theme-lifestyle in globals.css);
// the rest of the app keeps its DM Sans default at zero cost.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lifestyle-display",
  display: "swap",
});

// Dashboard / wholesale-utility mono face for the business-model
// design family (templates: wholesale-b2b, flash-deal, subscription).
// Loaded as a CSS variable so only stores in this family pick it up
// (via .theme-business-model [data-bm-mono="true"] in globals.css);
// the rest of the app keeps its sans defaults at zero cost. JetBrains
// Mono has tabular numerals which read cleanly in tier-pricing tables,
// countdown timers, and SKU/MOQ chips.
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bm-mono",
  display: "swap",
});

// Spec-sheet display sans for the electronics-tech design family
// (templates: catalog-dense, tech-compare, single-product). Inter
// Tight is Inter's tighter-tracking sibling — reads as authoritative
// at heading sizes without veering into condensed-techy territory.
// Loaded as a CSS variable so only stores in this family pick it up
// (via .theme-electronics-tech in globals.css); the rest of the app
// keeps its sans defaults at zero cost.
const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-tech-display",
  display: "swap",
});

// Mono companion for the electronics-tech family — surfaced on SKU
// strings, spec-table values, prices, and model-number eyebrows.
// JetBrains Mono is a developer-feel mono that pairs cleanly with
// Inter Tight; loaded as a CSS variable so opting in is a simple
// `font-family: var(--font-tech-mono)` (or className "font-mono"
// inside the .theme-electronics-tech cascade).
const jetBrainsMonoTech = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-tech-mono",
  display: "swap",
});

// Slab-serif display for the specialty design family (handmade /
// vintage templates). Fraunces has soft slab serifs and a crafted
// feel — distinct from fashion-beauty's Cormorant. Loaded as a CSS
// var so only stores in this family pick it up via .theme-specialty
// in globals.css; rest of the app pays zero cost.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-specialty-display",
  display: "swap",
});

// Handwritten accent font for the specialty family — used for SHORT
// decorative tags only ("handmade with love", "Lot of 1"). Caveat is
// friendly and warm; Permanent Marker via CSS fallback for callers
// that want the rougher stamp look.
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-specialty-hand",
  display: "swap",
});

// Body font for the BIKINI 551 swimwear template (bikini-beach).
// Designer reference (`/tmp/bikini-v2/bikini-551/README.md`) specifies
// Nunito 400/600/700/800/900 — rounded sans, summery + friendly. Loaded
// as a CSS variable so only `.theme-bikini-beach` opts in via the
// `font-family: var(--font-bikini-body, …)` declaration in
// `app/globals.css`; the rest of the app pays zero cost.
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-bikini-body",
  display: "swap",
});

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-kanit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Multi-vendor dropshipping marketplace (AnyPay + China suppliers)",
  referrer: "no-referrer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="th"
      data-theme="marketplace-fantasy"
      className={cn(googleSans.variable, prompt.variable, ibmPlexThai.variable, notoSansThai.variable, cormorant.variable, playfair.variable, outfit.variable, jetBrainsMono.variable, interTight.variable, jetBrainsMonoTech.variable, fraunces.variable, caveat.variable, nunito.variable, kanit.variable, "font-sans", inter.variable)}
    >
      <body className="font-sans">
        <Providers>
          {children}
          <AddToCartModal />
          <Toaster />
        </Providers>
        <Suspense fallback={null}>
          <CookieConsent />
        </Suspense>
      </body>
    </html>
  );
}
