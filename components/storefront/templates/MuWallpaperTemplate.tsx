"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, Eye, Plus, Star, Download } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { useCartConfirmation } from "@/lib/store/cartConfirm";
import type {
  MiniMopsProduct as Product,
  MiniMopsStore as Store,
} from "./MiniMopsTemplate";
import { WallpaperTile, motifFor, glowForCategory } from "../mu-wallpaper-motifs";

/**
 * Landing-page body for mu-wallpaper-v1 — the "มูดวง / Lucky Wallpaper"
 * Mystical Premium look (dark cosmic navy/purple + gold). Header/footer
 * come from the shared ShopHeader/ShopFooter pair in
 * `app/stores/[slug]/layout.tsx` (skinned dark via `theme-mu-wallpaper`
 * in globals.css). Commerce actions route through the normal cart, so
 * prices are shown in ฿ (the bespoke store-credit flow lives in the
 * System-2 `mu-wallpaper-th` family theme, not in this React template).
 *
 * The procedural sacred-motif art lives in the shared
 * `components/storefront/mu-wallpaper-motifs` module so System-1 and the
 * System-2 family theme render identical yantra/naga/mandala line-art.
 */

interface NavCategory {
  label: string;
  category: string;
}

interface Props {
  store: Store;
  products: Product[];
  featuredProduct?: Product | null;
  navCategories?: NavCategory[];
  gridHeading?: string;
  gridSubheading?: string;
  /** Hex accent — defaults to the brand gold. */
  accent?: string;
}

/* ── Brand palette (Mystical Premium) ─────────────────────────────── */
const C = {
  bg: "#0b0918",
  surface: "#181333",
  surface2: "#211a44",
  fg: "#f4f1ea",
  muted: "#a6a0c8",
  faint: "#6f6a93",
  border: "rgba(255,255,255,.09)",
  border2: "rgba(255,255,255,.14)",
  gold: "#e9cd84",
  gold2: "#f7e6ad",
  goldDeep: "#b9913f",
};

/* ── Lucky-day data (day of week → lucky color + recommended cat) ──── */
const DAYS = [
  { th: "อาทิตย์", color: "#e0483d", cn: "แดง", cat: "การงาน", note: "เสริมอำนาจบารมีและความก้าวหน้า" },
  { th: "จันทร์", color: "#f4e7c3", cn: "ครีม-เหลือง", cat: "ความรัก", note: "เสริมเมตตามหานิยมและความรัก" },
  { th: "อังคาร", color: "#ff86b0", cn: "ชมพู", cat: "ความรัก", note: "เสริมเสน่ห์และความสัมพันธ์" },
  { th: "พุธ", color: "#54c98a", cn: "เขียว", cat: "การเงิน", note: "เสริมการค้าขายและการเงิน" },
  { th: "พฤหัส", color: "#ff9d4d", cn: "ส้ม", cat: "การงาน", note: "เสริมการงานและการเรียน" },
  { th: "ศุกร์", color: "#5aa9ff", cn: "ฟ้า", cat: "แคล้วคลาด", note: "เสริมความแคล้วคลาดปลอดภัย" },
  { th: "เสาร์", color: "#9b6cff", cn: "ม่วง", cat: "แคล้วคลาด", note: "เสริมการป้องกันและความมั่นคง" },
];

const STEPS = [
  { n: "๑", h: "เลือกลายที่ใช่", p: "เลือกวอลล์เปเปอร์เสริมดวงตามด้านที่อยากเสริม — แตะเพื่อดูตัวอย่างก่อนได้ทุกลาย" },
  { n: "๒", h: "เพิ่มลงตะกร้า", p: "กดเพิ่มลายที่ถูกใจลงตะกร้า รวมหลายลายในออเดอร์เดียวได้" },
  { n: "๓", h: "รับไฟล์เต็ม", p: "ชำระเงินแล้วรับไฟล์ความละเอียดสูงแบบไม่มีลายน้ำ ดาวน์โหลดซ้ำได้" },
];

const REVIEWS = [
  { av: "ก", who: "คุณกานต์", role: "แม่ค้าออนไลน์ · กรุงเทพฯ", text: "ตั้งวอลล์ท้าวเวสสุวรรณได้อาทิตย์เดียว ยอดขายร้านดีขึ้นจริง ลายสวยมากด้วย ไม่เคยเจอที่ไหนทำสวยขนาดนี้" },
  { av: "น", who: "คุณนิดา", role: "พนักงานออฟฟิศ · เชียงใหม่", text: "พรีวิวก่อนซื้อทำให้ไม่ผิดหวังเลยค่ะ ลายคมชัด ตั้งแล้วสวยเหมือนตัวอย่างเป๊ะ" },
  { av: "ภ", who: "คุณภูมิ", role: "ฟรีแลนซ์ · ขอนแก่น", text: "ดาวน์โหลดง่าย ได้ไฟล์ชัดเต็มจอ ซื้อเซ็ตมงคลครบ 5 ด้านคุ้มสุด" },
];

const FAQS = [
  { q: "วอลล์เปเปอร์เสริมดวงได้จริงไหม?", a: "ทุกลายออกแบบตามคติความเชื่อและตำรามงคล เพื่อความเป็นสิริมงคลตามความเชื่อส่วนบุคคล โปรดใช้วิจารณญาณในการรับชม" },
  { q: "พรีวิวแล้วบันทึกภาพได้ไหม?", a: "โหมดพรีวิวมีไว้ดูตัวอย่างเท่านั้น ภาพมีลายน้ำกำกับ เมื่อซื้อแล้วจึงจะได้ไฟล์เต็มความละเอียดสูงแบบไม่มีลายน้ำ" },
  { q: "ใช้ได้กับมือถือรุ่นไหนบ้าง?", a: "ไฟล์ความละเอียดสูง 1440×3120px รองรับทั้ง iPhone และ Android ทุกรุ่น ตั้งเป็นหน้าจอล็อกหรือหน้าจอหลักได้" },
];

const DISPLAY_FONT = "'Kanit', var(--font-ibm-thai), var(--shop-font-display), sans-serif";

export function MuWallpaperTemplate({
  store,
  products,
  featuredProduct,
  navCategories = [],
  gridHeading = "ลายแนะนำประจำเดือน",
  gridSubheading = "ลายขายดีจากทุกหมวด — พรีวิวได้ก่อน เลือกลายที่ใช่ตามดวงของคุณ",
  accent = C.gold,
}: Props) {
  const addToCart = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const featured = featuredProduct ?? products[0] ?? null;
  const gridProducts = products.slice(0, 12);

  const productHref = (p: Product) => `/stores/${store.slug}/products/${p.id}`;
  const categoryHref = (cat: string) =>
    `/stores/${store.slug}/category/${encodeURIComponent(cat)}`;

  const fmt = (n: number) => n.toLocaleString("th-TH");

  const handleAdd = (p: Product) => {
    addToCart({
      productId: p.id,
      title: p.title,
      imageUrl: p.imageUrl ?? undefined,
      priceTHB: p.priceTHB,
      storeSlug: store.slug,
      storeName: store.name,
    });
    showConfirm(p.title, store.slug);
  };

  const goldGradientText = useMemo(
    () => ({
      background: `linear-gradient(120deg, ${C.gold2}, ${C.gold} 45%, ${C.goldDeep})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    }),
    [],
  );

  return (
    <div
      style={{
        background: C.bg,
        color: C.fg,
        backgroundImage:
          "radial-gradient(70% 50% at 82% -5%, rgba(233,205,132,.10), transparent 60%), radial-gradient(80% 55% at 12% 8%, rgba(124,102,210,.18), transparent 62%), radial-gradient(90% 60% at 50% 120%, rgba(124,102,210,.10), transparent 60%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="grid lg:grid-cols-[1.05fr_.95fr] gap-8 lg:gap-12 items-center pt-10 lg:pt-16 pb-6">
          <div>
            <span
              className="text-xs font-semibold uppercase"
              style={{ letterSpacing: ".22em", color: accent }}
            >
              ปลุกเสกตามฤกษ์ · เลือกลายที่ใช่ตามดวงคุณ
            </span>
            <h1
              className="mt-3 mb-4 font-bold"
              style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(30px,7vw,52px)", lineHeight: 1.12 }}
            >
              เปลี่ยนหน้าจอมือถือ
              <br />
              ให้เป็น<span style={goldGradientText}>เครื่องรางนำโชค</span>
            </h1>
            <p className="text-base md:text-lg max-w-[42ch]" style={{ color: C.muted }}>
              {store.tagline ??
                "วอลล์เปเปอร์เสริมดวงดีไซน์พรีเมียม ปลุกเสกตามตำรา พรีวิวก่อนได้ทุกลาย ซื้อแล้วดาวน์โหลดไฟล์เต็มทันที"}
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href={`/stores/${store.slug}/products`}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
                style={{
                  background: `linear-gradient(120deg, ${C.gold2}, ${C.gold} 55%, ${C.goldDeep})`,
                  color: "#241906",
                  boxShadow: "0 12px 30px -10px rgba(233,205,132,.5)",
                }}
              >
                เลือกวอลล์เปเปอร์
              </Link>
              {featured && (
                <Link
                  href={productHref(featured)}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
                  style={{ border: `1px solid ${C.border2}`, background: "rgba(255,255,255,.03)", color: C.fg }}
                >
                  ดูลายแนะนำ <ChevronRight size={16} />
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-5 mt-6 text-[13px]" style={{ color: C.muted }}>
              <span>
                <span style={{ color: accent }}>★</span> <b style={{ color: C.fg }}>4.9</b> จาก 8,200+ รีวิว
              </span>
              <span>
                <b style={{ color: C.fg }}>120,000+</b> ดาวน์โหลด
              </span>
              <span>
                <b style={{ color: C.fg }}>ปลุกเสก</b> ทุกชิ้น
              </span>
            </div>
          </div>
          <div className="relative h-[300px] lg:h-[400px] flex items-center justify-center">
            <div
              className="absolute rounded-full"
              style={{
                width: 290,
                height: 290,
                background: "radial-gradient(circle,rgba(233,205,132,.22),transparent 62%)",
                filter: "blur(8px)",
              }}
            />
            <div className="relative" style={{ transform: "rotate(-9deg) translateX(-46px)" }}>
              <WallpaperTile motif="naga" glow="#f0c86a" bless="ทรัพย์ไหลมา" className="w-[140px] lg:w-[170px]" />
            </div>
            <div className="relative z-10" style={{ transform: "rotate(7deg) translateX(46px) translateY(16px)" }}>
              <WallpaperTile motif="mandala" glow="#ffa45c" bless="สำเร็จ" className="w-[140px] lg:w-[170px]" />
            </div>
          </div>
        </section>

        {/* ── Lucky-day tool ───────────────────────────────────── */}
        <section
          className="rounded-3xl p-5 md:p-7 my-4"
          style={{ background: `linear-gradient(160deg, ${C.surface}, ${C.bg})`, border: `1px solid ${C.border}` }}
        >
          <span className="text-xs font-semibold uppercase" style={{ letterSpacing: ".22em", color: accent }}>
            <Sparkles size={12} className="inline -mt-0.5 mr-1" />
            เครื่องมือเสริมดวง
          </span>
          <h2 className="mt-1 font-semibold" style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(19px,5vw,24px)" }}>
            เช็กสีมงคล &amp; ดวงประจำวันเกิด
          </h2>
          <p className="text-sm mt-1 mb-4" style={{ color: C.muted }}>
            แตะวันเกิดของคุณ แล้วเราจะแนะนำสีมงคลและหมวดวอลล์เปเปอร์ที่ส่งเสริมดวงคุณที่สุด
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DAYS.map((d, i) => {
              const on = activeDay === i;
              return (
                <button
                  key={d.th}
                  type="button"
                  onClick={() => setActiveDay(i)}
                  className="flex-none min-w-[62px] rounded-2xl px-1.5 py-2.5 text-center transition-colors"
                  style={{
                    border: `1px solid ${on ? accent : C.border}`,
                    background: on ? "rgba(233,205,132,.12)" : "rgba(255,255,255,.03)",
                    boxShadow: on ? `0 0 0 1px ${accent} inset` : "none",
                  }}
                >
                  <span className="block text-sm font-semibold">{d.th}</span>
                  <span
                    className="block mx-auto mt-1.5 rounded-full"
                    style={{ width: 12, height: 12, background: d.color, border: "1px solid rgba(255,255,255,.25)" }}
                  />
                </button>
              );
            })}
          </div>
          {activeDay !== null && (
            <div
              className="mt-4 flex flex-wrap items-center gap-3.5 rounded-2xl px-4 py-3.5"
              style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}` }}
            >
              <span
                className="flex-none rounded-xl"
                style={{
                  width: 46,
                  height: 46,
                  background: DAYS[activeDay].color,
                  border: "1px solid rgba(255,255,255,.3)",
                  boxShadow: `0 0 16px -2px ${DAYS[activeDay].color}`,
                }}
              />
              <div className="flex-1 min-w-[160px]">
                <b style={{ fontFamily: DISPLAY_FONT }}>
                  เกิดวัน{DAYS[activeDay].th} · สีมงคล {DAYS[activeDay].cn}
                </b>
                <small className="block text-[13px]" style={{ color: C.muted }}>
                  แนะนำหมวด “{DAYS[activeDay].cat}” — {DAYS[activeDay].note}
                </small>
              </div>
              <Link
                href={categoryHref(DAYS[activeDay].cat)}
                className="rounded-full px-4 py-2.5 text-sm font-semibold"
                style={{ border: `1px solid ${C.border2}`, background: "rgba(255,255,255,.03)", color: C.fg }}
              >
                ดูวอลล์เปเปอร์แนะนำ
              </Link>
            </div>
          )}
        </section>

        {/* ── Category quick-links (from real product categories) ── */}
        {navCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-3">
            {navCategories.slice(0, 8).map((c) => (
              <Link
                key={c.category}
                href={categoryHref(c.category)}
                className="flex-none rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap"
                style={{ border: `1px solid ${C.border}`, background: "rgba(255,255,255,.03)", color: C.fg }}
              >
                {c.label}
              </Link>
            ))}
          </div>
        )}

        {/* ── Featured grid ────────────────────────────────────── */}
        <div className="flex items-end justify-between gap-3.5 mt-8 mb-4 flex-wrap">
          <div>
            <h2 className="font-semibold" style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(22px,6vw,30px)" }}>
              {gridHeading}
            </h2>
            <p className="text-sm mt-1" style={{ color: C.muted }}>
              {gridSubheading}
            </p>
          </div>
          <Link
            href={`/stores/${store.slug}/products`}
            className="text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
            style={{ color: C.gold2 }}
          >
            ดูทั้งหมด <ChevronRight size={16} />
          </Link>
        </div>

        {gridProducts.length === 0 ? (
          <p className="text-center py-16" style={{ color: C.muted }}>
            ยังไม่มีลายในร้านนี้
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 lg:gap-[18px]">
            {gridProducts.map((p, i) => {
              const glow = glowForCategory(p.category, i);
              return (
                <article
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-2xl transition-transform hover:-translate-y-1"
                  style={{ background: C.surface, border: `1px solid ${C.border}` }}
                >
                  <Link href={productHref(p)} className="relative block p-2.5 pb-0">
                    {p.imageUrl ? (
                      <div className="relative overflow-hidden rounded-[13px]" style={{ aspectRatio: "9 / 16" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.imageUrl} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    ) : (
                      <WallpaperTile motif={motifFor(i)} glow={glow} bless="มงคล" className="w-full rounded-[13px]" />
                    )}
                    <span
                      className="absolute top-4 left-4 z-[3] rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
                      style={{ background: "rgba(11,9,24,.7)", border: "1px solid rgba(233,205,132,.4)", color: C.gold2, backdropFilter: "blur(4px)" }}
                    >
                      ปลุกเสกแล้ว
                    </span>
                    <span
                      className="absolute left-1/2 bottom-4 z-[3] -translate-x-1/2 translate-y-1.5 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-all"
                      style={{ background: "rgba(10,10,24,.74)", border: `1px solid ${C.border2}`, backdropFilter: "blur(4px)", pointerEvents: "none", whiteSpace: "nowrap" }}
                    >
                      <Eye size={14} /> แตะเพื่อดูตัวอย่าง
                    </span>
                  </Link>
                  <div className="flex flex-col flex-1 gap-1.5 p-3 pt-2.5">
                    <div className="flex items-center justify-between gap-2">
                      {p.category && (
                        <span
                          className="text-[11px] font-semibold rounded-full px-2.5 py-0.5"
                          style={{ background: `color-mix(in oklab, ${glow} 18%, transparent)`, color: glow, border: `1px solid color-mix(in oklab, ${glow} 35%, transparent)` }}
                        >
                          {p.category}
                        </span>
                      )}
                      {p.reviews > 0 && (
                        <span className="text-[12.5px] whitespace-nowrap" style={{ color: C.muted }}>
                          <Star size={11} className="inline -mt-0.5 fill-current" style={{ color: accent }} /> {p.rating.toFixed(1)} · {fmt(p.reviews)}
                        </span>
                      )}
                    </div>
                    <Link href={productHref(p)} className="font-semibold text-[15px] group-hover:underline">
                      {p.title}
                    </Link>
                    <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                      <span className="inline-flex items-baseline gap-1 font-semibold text-[17px]" style={{ fontFamily: DISPLAY_FONT, color: C.gold2 }}>
                        ฿{fmt(p.priceTHB)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdd(p)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold transition-colors"
                        style={{ background: "rgba(233,205,132,.12)", border: "1px solid rgba(233,205,132,.4)", color: C.gold2 }}
                        aria-label={`เพิ่ม ${p.title} ลงตะกร้า`}
                      >
                        <Plus size={14} /> ใส่ตะกร้า
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ── How it works ─────────────────────────────────────── */}
        <h2 className="mt-12 mb-4 font-semibold" style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(22px,6vw,30px)" }}>
          ใช้งานง่าย แค่ 3 ขั้นตอน
        </h2>
        <div className="grid sm:grid-cols-3 gap-3.5">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div
                className="grid place-items-center font-bold mb-3"
                style={{ width: 38, height: 38, borderRadius: 12, fontFamily: DISPLAY_FONT, background: "rgba(233,205,132,.14)", border: "1px solid rgba(233,205,132,.35)", color: C.gold2 }}
              >
                {s.n}
              </div>
              <h4 className="font-semibold text-[17px] mb-1" style={{ fontFamily: DISPLAY_FONT }}>
                {s.h}
              </h4>
              <p className="text-[13.5px]" style={{ color: C.muted }}>
                {s.p}
              </p>
            </div>
          ))}
        </div>

        {/* ── Reviews ──────────────────────────────────────────── */}
        <h2 className="mt-12 mb-4 font-semibold" style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(22px,6vw,30px)" }}>
          เสียงจากสายมูตัวจริง
        </h2>
        <div className="grid sm:grid-cols-3 gap-3.5">
          {REVIEWS.map((r) => (
            <div key={r.who} className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div style={{ color: accent, letterSpacing: 2 }}>★★★★★</div>
              <p className="text-[14.5px] my-2.5">{r.text}</p>
              <div className="flex items-center gap-3">
                <span
                  className="grid place-items-center rounded-full flex-none font-semibold"
                  style={{ width: 38, height: 38, fontFamily: DISPLAY_FONT, background: `linear-gradient(135deg, ${C.surface2}, ${C.bg})`, border: `1px solid ${C.border2}`, color: C.gold2 }}
                >
                  {r.av}
                </span>
                <span>
                  <b className="text-sm">{r.who}</b>
                  <small className="block text-xs" style={{ color: C.faint }}>
                    {r.role}
                  </small>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <h2 className="mt-12 mb-2 font-semibold" style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(22px,6vw,30px)" }}>
          คำถามที่พบบ่อย
        </h2>
        <div className="pb-12" style={{ borderTop: `1px solid ${C.border}` }}>
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} style={{ borderBottom: `1px solid ${C.border}` }}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full flex items-center justify-between gap-3.5 py-4 text-left font-medium text-base"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {f.q}
                  <Plus
                    size={18}
                    className="flex-none transition-transform"
                    style={{ color: accent, transform: open ? "rotate(45deg)" : "none" }}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-4 text-sm" style={{ color: C.muted }}>
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <p className="mt-4 text-xs" style={{ color: C.faint }}>
            <Download size={12} className="inline -mt-0.5 mr-1" />
            วอลล์เปเปอร์เพื่อความเป็นสิริมงคลตามความเชื่อส่วนบุคคล โปรดใช้วิจารณญาณในการรับชม ไม่สามารถรับประกันผลลัพธ์ได้
          </p>
        </div>
      </div>
    </div>
  );
}
