// /stores/[slug]/checkout/success?orderId=… — per-store post-payment
// confirmation. Lives inside the store layout so the chrome + theme
// (incl. theme-fashion-beauty for boutique stores) carries through.
//
// Mirrors the central /(marketplace)/order-success page but scopes
// the visit to the store context — buyers stay inside the boutique
// experience after paying instead of bouncing to the marketplace.
//
// TODO(cleanup): once all checkout flows route here via
// /api/checkout's success_url, fold the central page in
// app/(marketplace)/order-success/page.tsx into a redirect to this
// per-store path.

import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2,
  Package,
  Truck,
  MessageCircle,
  Copy,
  ArrowRight,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { isTrustStore } from "@/lib/landing/trust";
import { isBusinessModelStore } from "@/lib/landing/business-model";
import { isLifestyleStore } from "@/lib/landing/lifestyle";
import { isElectronicsTechStore } from "@/lib/landing/electronics-tech";

export const dynamic = "force-dynamic";

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

export default async function StoreOrderSuccess({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId;
  if (!orderId) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p
          className="text-sm"
          style={{ color: "var(--shop-ink-muted)" }}
        >
          ไม่พบหมายเลขคำสั่งซื้อ
        </p>
      </main>
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(
      `/stores/${params.slug}/signin?callbackUrl=${encodeURIComponent(
        `/stores/${params.slug}/checkout/success?orderId=${orderId}`,
      )}`,
    );
  }
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true },
  });
  if (!me) {
    redirect(
      `/stores/${params.slug}/signin?callbackUrl=${encodeURIComponent(
        `/stores/${params.slug}/checkout/success?orderId=${orderId}`,
      )}`,
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { include: { store: { select: { slug: true, name: true } } } },
        },
      },
      payment: true,
      store: {
        select: {
          slug: true,
          name: true,
          templateId: true,
          landingThemeVariant: true,
        },
      },
    },
  });

  if (!order || order.userId !== me.id) notFound();

  // Scope check — the order must belong to this store. Prevents
  // cross-tenant URL probing (e.g. /stores/A/checkout/success?orderId=
  // belongs to store B leaks order content).
  if (order.store?.slug && order.store.slug !== params.slug) notFound();

  const isFB = order.store
    ? isFashionBeautyStore({
        templateId: order.store.templateId,
        landingThemeVariant: order.store.landingThemeVariant,
      })
    : false;
  const isTrust = !isFB && order.store
    ? isTrustStore({
        templateId: order.store.templateId,
        landingThemeVariant: order.store.landingThemeVariant,
      })
    : false;
  const isBM = !isFB && !isTrust && order.store
    ? isBusinessModelStore({
        templateId: order.store.templateId,
        landingThemeVariant: order.store.landingThemeVariant,
      })
    : false;
  const isLifestyle = !isFB && !isTrust && !isBM && order.store
    ? isLifestyleStore({
        templateId: order.store.templateId,
        landingThemeVariant: order.store.landingThemeVariant,
      })
    : false;
  const isElectronicsTech = !isFB && !isTrust && !isBM && !isLifestyle && order.store
    ? isElectronicsTechStore({
        templateId: order.store.templateId,
        landingThemeVariant: order.store.landingThemeVariant,
      })
    : false;

  const today = new Date();
  const eta1 = new Date(today.getTime() + 1 * 86400000);
  const eta3 = new Date(today.getTime() + 3 * 86400000);
  const fmt = (d: Date) =>
    d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });

  const shortCode = order.id.slice(-8).toUpperCase();
  const storeName = order.store?.name ?? params.slug;

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Hero — success state. Six flavors: default soft-rose, FB
            editorial italic, trust stamped heritage, business-model
            green-check + bold sans + mono order number, lifestyle
            warm sage check ring with terracotta tick + squiggle,
            electronics-tech mono spec-sheet "ORDER #XXXX CONFIRMED". */}
        <div className="text-center">
          {/* Lifestyle adds a squiggle divider above the hero — soft
              catalog flourish. Pure decoration; sage SVG via globals.css */}
          {isLifestyle && (
            <div
              aria-hidden
              data-lifestyle-squiggle="true"
              className="mx-auto mb-6 w-32"
            />
          )}
          <div
            className={
              isTrust
                ? "inline-flex items-center justify-center w-20 h-20 rounded-sm border mb-5"
                : isBM
                  ? "inline-flex items-center justify-center w-20 h-20 rounded-md border mb-5"
                  : isLifestyle
                    ? "relative inline-flex items-center justify-center w-24 h-24 rounded-full mb-5"
                    : isElectronicsTech
                      ? "inline-flex items-center justify-center w-20 h-20 rounded-md border mb-5"
                      : "inline-flex items-center justify-center w-20 h-20 rounded-full mb-5"
            }
            style={{
              background: isTrust
                ? "var(--shop-muted)"
                : isBM
                  ? "color-mix(in srgb, var(--shop-savings, #10b981) 14%, transparent)"
                  : isLifestyle
                    ? "color-mix(in srgb, var(--shop-accent) 22%, transparent)"
                    : isElectronicsTech
                      ? "color-mix(in srgb, var(--shop-highlight, #34d399) 14%, transparent)"
                      : "color-mix(in srgb, var(--shop-primary) 14%, transparent)",
              color: isTrust
                ? "var(--shop-ink)"
                : isBM
                  ? "var(--shop-savings, #10b981)"
                  : isLifestyle
                    ? "var(--shop-primary)"
                    : isElectronicsTech
                      ? "#047857"
                      : "var(--shop-primary)",
              ...(isTrust ? { borderColor: "var(--shop-accent)" } : {}),
              ...(isBM ? { borderColor: "var(--shop-savings, #10b981)" } : {}),
              ...(isLifestyle
                ? { boxShadow: `0 0 0 4px color-mix(in srgb, var(--shop-accent) 35%, transparent)` }
                : {}),
              ...(isElectronicsTech
                ? {
                    borderColor:
                      "color-mix(in srgb, var(--shop-highlight, #34d399) 36%, transparent)",
                  }
                : {}),
            }}
          >
            <CheckCircle2 className="w-12 h-12" strokeWidth={2} />
          </div>
          {isFB && (
            <p
              className="text-xs uppercase tracking-[0.22em]"
              style={{ color: "var(--shop-ink-muted)" }}
            >
              Order placed
            </p>
          )}
          {isTrust && (
            <p
              className="text-xs uppercase"
              style={{
                color: "var(--shop-accent)",
                letterSpacing: "0.28em",
                fontWeight: 600,
              }}
            >
              Order Confirmed
            </p>
          )}
          {isBM && (
            <p
              className="text-xs font-semibold uppercase"
              style={{
                color: "var(--shop-savings, #10b981)",
                letterSpacing: "0.12em",
              }}
            >
              Status · Placed
            </p>
          )}
          {isLifestyle && (
            <p
              className="text-xs uppercase"
              style={{
                color: "var(--shop-accent)",
                letterSpacing: "0.18em",
                fontWeight: 600,
              }}
            >
              All set
            </p>
          )}
          {isElectronicsTech && (
            <p
              data-tech-mono="true"
              className="text-[11px] uppercase"
              style={{
                color: "var(--shop-ink-muted)",
                fontFamily: TECH_MONO_FONT,
                letterSpacing: "0.16em",
                fontWeight: 600,
              }}
            >
              Order #{shortCode} Confirmed
            </p>
          )}
          <h1
            className={
              isFB
                ? "mt-2 text-4xl sm:text-5xl"
                : isTrust
                  ? "mt-3 text-4xl sm:text-5xl"
                  : isBM
                    ? "mt-3 text-2xl sm:text-3xl font-bold tracking-tight"
                    : isLifestyle
                      ? "mt-3 text-4xl sm:text-5xl"
                      : isElectronicsTech
                        ? "mt-3 text-3xl sm:text-4xl"
                        : "text-3xl md:text-4xl font-bold tracking-tight"
            }
            style={{
              color: "var(--shop-ink)",
              ...(isFB
                ? { fontFamily: FB_DISPLAY_FONT, fontWeight: 500, letterSpacing: '-0.005em' }
                : isTrust
                  ? { fontFamily: TRUST_DISPLAY_FONT, fontWeight: 600, letterSpacing: '-0.01em' }
                  : isBM
                    ? { fontWeight: 700, letterSpacing: '-0.015em' }
                    : isLifestyle
                      ? { fontFamily: LIFESTYLE_DISPLAY_FONT, fontWeight: 700, letterSpacing: '-0.01em' }
                      : isElectronicsTech
                        ? { fontFamily: TECH_DISPLAY_FONT, fontWeight: 700, letterSpacing: '-0.015em' }
                        : {}),
            }}
          >
            {isFB
              ? "Thank you"
              : isTrust
                ? "Thank you for your order"
                : isBM
                  ? (
                    <>
                      Order #
                      <span
                        data-bm-mono="true"
                        style={{
                          fontFamily: BM_MONO_FONT,
                          fontVariantNumeric: 'tabular-nums',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {shortCode}
                      </span>{' '}
                      placed
                    </>
                  )
                  : isLifestyle
                    ? "We've got your order!"
                    : isElectronicsTech
                      ? "Thanks — your order is in"
                      : "ขอบคุณสำหรับคำสั่งซื้อ"}
          </h1>
          {isTrust && (
            <div
              aria-hidden
              className="mx-auto mt-5 h-px w-24"
              style={{ background: "var(--shop-accent)" }}
            />
          )}
          <p
            className={
              isFB
                ? "mt-4 text-base italic"
                : isTrust
                  ? "mt-5 text-base"
                  : isLifestyle
                    ? "mt-4 text-base"
                    : isElectronicsTech
                      ? "mt-4 text-base"
                      : "mt-3 text-base"
            }
            style={{ color: "var(--shop-ink-muted)" }}
          >
            เราได้รับคำสั่งซื้อของคุณแล้ว
            {me.email && (
              <>
                {" "}
                และส่งใบยืนยันไปที่{" "}
                <span style={{ color: "var(--shop-ink)" }}>{me.email}</span>
              </>
            )}
          </p>

          <div
            className={
              isTrust
                ? "mt-7 inline-flex items-center gap-2 rounded-sm border bg-white px-5 py-2.5 shadow-sm"
                : isBM
                  ? "mt-7 inline-flex items-center gap-2 rounded-md border bg-white px-5 py-2.5 shadow-sm"
                  : isLifestyle
                    ? "mt-7 inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 shadow-sm"
                    : isElectronicsTech
                      ? "mt-7 inline-flex items-center gap-2 rounded-md border bg-white px-5 py-2.5 shadow-sm"
                      : "mt-7 inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 shadow-sm"
            }
            style={{
              borderColor: isTrust
                ? "var(--shop-accent)"
                : isBM
                  ? "var(--shop-border)"
                  : isLifestyle
                    ? "var(--shop-accent)"
                    : isElectronicsTech
                      ? "var(--shop-border)"
                      : "var(--shop-border)",
            }}
          >
            <span
              data-tech-mono={isElectronicsTech ? "true" : undefined}
              className="text-xs uppercase"
              style={{
                color: "var(--shop-ink-muted)",
                letterSpacing: isTrust
                  ? "0.28em"
                  : isBM
                    ? "0.12em"
                    : isElectronicsTech
                      ? "0.16em"
                      : "0.18em",
                fontWeight: isTrust || isBM || isLifestyle || isElectronicsTech ? 600 : undefined,
                fontFamily: isElectronicsTech ? TECH_MONO_FONT : undefined,
              }}
            >
              {isTrust
                ? "Order No."
                : isBM
                  ? "Order ID"
                  : isLifestyle
                    ? "Order"
                    : isElectronicsTech
                      ? "Order ID"
                      : "เลขที่คำสั่งซื้อ"}
            </span>
            <span
              data-bm-mono={isBM ? "true" : undefined}
              data-tech-mono={isElectronicsTech ? "true" : undefined}
              className="font-mono text-base font-bold"
              style={{
                color: isElectronicsTech ? "var(--shop-primary)" : "var(--shop-ink)",
                ...(isBM
                  ? {
                      fontFamily: BM_MONO_FONT,
                      fontVariantNumeric: "tabular-nums",
                    }
                  : isElectronicsTech
                    ? { fontFamily: TECH_MONO_FONT, letterSpacing: "-0.01em" }
                    : {}),
              }}
            >
              {shortCode}
            </span>
            <Copy className="h-3.5 w-3.5" style={{ color: "var(--shop-ink-muted)" }} />
          </div>
        </div>

        {/* ETA + status */}
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <InfoCard
            icon={<Truck className="h-5 w-5" />}
            label="ถึงคุณภายใน"
            value={`${fmt(eta1)} – ${fmt(eta3)}`}
          />
          <InfoCard
            icon={<Package className="h-5 w-5" />}
            label="สถานะ"
            value={<span className="capitalize">{translateStatus(order.status)}</span>}
          />
        </div>

        {/* Items */}
        <Card
          className={
            isLifestyle
              ? "mt-10 rounded-3xl border shadow-sm"
              : "mt-10 rounded-2xl border shadow-sm"
          }
          style={{
            borderColor: "var(--shop-border)",
            background: isLifestyle ? "var(--shop-muted)" : "var(--shop-card)",
          }}
        >
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: "var(--shop-border)" }}
          >
            <h2
              className={
                isFB
                  ? "text-xl"
                  : isTrust
                    ? "text-xl"
                    : isLifestyle
                      ? "text-xl"
                      : isElectronicsTech
                        ? "text-lg"
                        : "text-base font-semibold"
              }
              style={{
                color: "var(--shop-ink)",
                ...(isFB
                  ? { fontFamily: FB_DISPLAY_FONT, fontWeight: 500 }
                  : isTrust
                    ? { fontFamily: TRUST_DISPLAY_FONT, fontWeight: 600 }
                    : isLifestyle
                      ? { fontFamily: LIFESTYLE_DISPLAY_FONT, fontWeight: 700 }
                      : isElectronicsTech
                        ? {
                            fontFamily: TECH_DISPLAY_FONT,
                            fontWeight: 700,
                            letterSpacing: "-0.015em",
                          }
                        : {}),
              }}
            >
              {isElectronicsTech
                ? `Items (${order.items.length})`
                : `สินค้าในคำสั่งซื้อ (${order.items.length} รายการ)`}
            </h2>
          </div>
          <ul className="divide-y" style={{ borderColor: "var(--shop-border)" }}>
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center gap-4 p-5">
                <div
                  className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden"
                  style={{ background: "var(--shop-muted)" }}
                >
                  {it.product.imageUrl && (
                    <Image
                      src={it.product.imageUrl}
                      alt={it.product.titleTh ?? it.product.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm line-clamp-1"
                    style={{ color: "var(--shop-ink)" }}
                  >
                    {it.product.titleTh ?? it.product.title}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--shop-ink-muted)" }}
                  >
                    จำนวน {it.qty} ชิ้น
                  </p>
                </div>
                <p
                  className="text-sm font-semibold whitespace-nowrap"
                  style={{ color: "var(--shop-ink)" }}
                >
                  {formatTHB(Number(it.unitPriceTHB) * it.qty)}
                </p>
              </li>
            ))}
          </ul>
          <div
            className="px-6 py-4 border-t flex items-center justify-between"
            style={{
              borderColor: "var(--shop-border)",
              background: "var(--shop-muted)",
            }}
          >
            <span
              className="text-base font-semibold"
              style={{ color: "var(--shop-ink)" }}
            >
              ยอดรวม
            </span>
            <span
              className="text-2xl font-extrabold"
              style={{ color: "var(--shop-primary)" }}
            >
              {formatTHB(Number(order.totalTHB))}
            </span>
          </div>
        </Card>

        {/* Primary actions */}
        <div className="mt-10 grid sm:grid-cols-2 gap-3">
          <Button
            asChild
            className={
              isFB
                ? "h-auto rounded-full py-3 text-sm font-semibold text-white"
                : isTrust
                  ? "h-auto rounded-sm py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
                  : isBM
                    ? "h-auto rounded-md py-3 text-sm font-bold uppercase tracking-[0.08em] text-white"
                    : isLifestyle
                      ? "h-auto rounded-full py-3 text-sm font-semibold text-white"
                      : isElectronicsTech
                        ? "h-auto rounded-md py-3 text-sm font-bold text-white"
                        : "h-auto py-3 text-sm font-semibold text-white"
            }
            style={{ background: "var(--shop-primary)" }}
          >
            <Link
              href={`/stores/${params.slug}/account/orders/${order.id}`}
              className="inline-flex items-center justify-center gap-2"
            >
              {isTrust
                ? "Track order"
                : isBM
                  ? "Track order"
                  : isLifestyle
                    ? "Track order"
                    : isElectronicsTech
                      ? "Track shipment"
                      : "ติดตามสถานะคำสั่งซื้อ"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className={
              isFB
                ? "h-auto rounded-full border-[var(--shop-ink)] py-3 text-sm font-semibold"
                : isTrust
                  ? "h-auto rounded-sm border-[var(--shop-ink)] py-3 text-sm font-semibold uppercase tracking-[0.18em]"
                  : isBM
                    ? "h-auto rounded-md border-[var(--shop-ink)] py-3 text-sm font-bold uppercase tracking-[0.08em]"
                    : isLifestyle
                      ? "h-auto rounded-full border-[var(--shop-ink)] py-3 text-sm font-semibold"
                      : isElectronicsTech
                        ? "h-auto rounded-md border-[var(--shop-primary)] py-3 text-sm font-semibold text-[var(--shop-primary)]"
                        : "h-auto py-3 text-sm font-semibold"
            }
          >
            <Link href={isBM ? `/stores/${params.slug}/category` : `/stores/${params.slug}`}>
              {isFB
                ? "Continue browsing"
                : isTrust
                  ? "Back to store"
                  : isBM
                    ? "Reorder"
                    : isLifestyle
                      ? "Keep shopping"
                      : isElectronicsTech
                        ? "Continue shopping"
                        : `กลับไป${storeName}`}
            </Link>
          </Button>
        </div>

        {/* LINE follow nudge — Thai market staple */}
        <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 flex items-start gap-3">
          <MessageCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-green-900">
              เพิ่มเพื่อนใน LINE เพื่อรับการแจ้งเตือนสถานะพัสดุ
            </p>
            <p className="mt-1 text-green-700 text-xs">
              เราจะแจ้งเตือนทันทีเมื่อสินค้าออกจากร้าน + ส่งหมายเลขพัสดุให้คุณ
            </p>
          </div>
          <a
            href="https://line.me"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center px-4 py-1.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold"
          >
            เพิ่ม LINE
          </a>
        </div>

        <div
          className="mt-12 text-center text-xs"
          style={{ color: "var(--shop-ink-muted)" }}
        >
          <p>
            หมายเลขเต็ม: <span className="font-mono">{order.id}</span>
          </p>
          {order.payment && (
            <p className="mt-1">
              การชำระเงิน:{" "}
              <span className="capitalize">{translateStatus(order.payment.status)}</span>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card
      className="rounded-2xl border px-5 py-4 flex items-center gap-3 shadow-sm"
      style={{
        borderColor: "var(--shop-border)",
        background: "var(--shop-card)",
      }}
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
        style={{
          background: "var(--shop-muted)",
          color: "var(--shop-primary)",
        }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className="text-xs uppercase tracking-[0.18em]"
          style={{ color: "var(--shop-ink-muted)" }}
        >
          {label}
        </p>
        <p
          className="text-sm font-semibold mt-0.5"
          style={{ color: "var(--shop-ink)" }}
        >
          {value}
        </p>
      </div>
    </Card>
  );
}

function translateStatus(status: string | null | undefined): string {
  if (!status) return "—";
  const map: Record<string, string> = {
    PENDING: "รอชำระเงิน",
    PAID: "ชำระแล้ว",
    PROCESSING: "กำลังเตรียมสินค้า",
    SHIPPED: "กำลังจัดส่ง",
    DELIVERED: "ส่งสำเร็จ",
    CANCELLED: "ยกเลิก",
    REFUNDED: "คืนเงินแล้ว",
    AWAITING_PAYMENT: "รอชำระเงิน",
    AWAITING_SUPPLIER: "รอผู้ขาย",
    PENDING_PAYMENT: "รอชำระเงิน",
    SUPPLIER_PLACED: "ส่งให้ผู้ขายแล้ว",
    SUCCESS: "สำเร็จ",
    FAILED: "ล้มเหลว",
  };
  return map[status.toUpperCase()] ?? status;
}
