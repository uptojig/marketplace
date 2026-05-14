import Link from "next/link";
import { redirect, notFound } from "next/navigation";
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

export const dynamic = "force-dynamic";

/**
 * /order-success?orderId=… — legacy post-payment confirmation page.
 *
 * Phase-1B introduces /stores/[slug]/checkout/success as the canonical
 * per-store success path so buyers stay inside the storefront chrome
 * (header/footer + theme cascade) after paying. To keep older callers
 * (e.g. /mock-payment-gate redirect) working we now bounce single-
 * store orders to the per-store path. Multi-store orders fall back to
 * the centralized layout below.
 *
 * Security: requires session matching order.userId. Returns 404 for
 * non-owners (same shape whether order is missing or just isn't
 * theirs) so we don't leak existence of other users' order IDs.
 */
export default async function OrderSuccess({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId;
  if (!orderId) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">Missing orderId.</p>
      </main>
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/signin?next=/order-success?orderId=${encodeURIComponent(orderId)}`);
  }
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true },
  });
  if (!me) {
    redirect(`/signin?next=/order-success?orderId=${encodeURIComponent(orderId)}`);
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
    },
  });

  if (!order || order.userId !== me.id) notFound();

  // If every item is from the same store, surface its slug so the
  // primary CTAs can return the user to that storefront. Multi-store
  // orders fall back to the marketplace home.
  const storeSlugs = new Set(
    order.items.map((it) => it.product.store?.slug).filter(Boolean) as string[],
  );
  const singleStore = storeSlugs.size === 1 ? Array.from(storeSlugs)[0] : null;
  const storeName =
    singleStore && order.items[0]?.product.store?.name
      ? order.items[0].product.store.name
      : null;

  // Phase-1B: when the order lives entirely inside one store, bounce
  // to the per-store success page so the storefront chrome + theme
  // cascade survives. The legacy marketplace-level layout below is
  // only rendered for multi-store carts (rare today).
  if (singleStore) {
    redirect(
      `/stores/${singleStore}/checkout/success?orderId=${encodeURIComponent(orderId)}`,
    );
  }

  // Estimated delivery — naive 1-3 business days for now (TODO real
  // ETA from shipping carrier API).
  const today = new Date();
  const eta1 = new Date(today.getTime() + 1 * 86400000);
  const eta3 = new Date(today.getTime() + 3 * 86400000);
  const fmt = (d: Date) =>
    d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });

  // Short order code — last 8 chars of cuid, uppercase, easier to read
  const shortCode = order.id.slice(-8).toUpperCase();

  return (
    <div className="bg-stone-50 min-h-screen">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* ── Hero: success checkmark ──────────────────────────── */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-5">
            <CheckCircle2 className="w-12 h-12" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900">
            ขอบคุณสำหรับคำสั่งซื้อ
          </h1>
          <p className="mt-3 text-base text-stone-600">
            เราได้รับคำสั่งซื้อของคุณแล้ว
            {me.email && (
              <>
                {" "}
                และส่งใบยืนยันไปที่{" "}
                <span className="font-medium text-stone-900">{me.email}</span>
              </>
            )}
          </p>

          {/* Short order code — large, monospace, copy hint */}
          <div className="mt-7 inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 shadow-sm">
            <span className="text-xs uppercase tracking-widest text-stone-500">
              เลขที่คำสั่งซื้อ
            </span>
            <span className="font-mono text-base font-bold text-stone-900">
              {shortCode}
            </span>
            <Copy className="h-3.5 w-3.5 text-stone-400" />
          </div>
        </div>

        {/* ── Estimated delivery + tracking ────────────────────── */}
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <InfoCard
            icon={<Truck className="h-5 w-5" />}
            label="ถึงคุณภายใน"
            value={`${fmt(eta1)} – ${fmt(eta3)}`}
          />
          <InfoCard
            icon={<Package className="h-5 w-5" />}
            label="สถานะ"
            value={
              <span className="capitalize">
                {translateStatus(order.status)}
              </span>
            }
          />
        </div>

        {/* ── Order items ──────────────────────────────────────── */}
        <section className="mt-10 rounded-2xl border border-stone-200 bg-white">
          <div className="px-6 py-4 border-b border-stone-200">
            <h2 className="text-base font-semibold text-stone-900">
              สินค้าในคำสั่งซื้อ ({order.items.length} รายการ)
            </h2>
          </div>
          <ul className="divide-y divide-stone-200">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center gap-4 p-5">
                <div className="h-16 w-16 shrink-0 rounded-md bg-stone-100 overflow-hidden">
                  {it.product.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={it.product.imageUrl}
                      alt={it.product.titleTh ?? it.product.title}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 line-clamp-1">
                    {it.product.titleTh ?? it.product.title}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    จำนวน {it.qty} ชิ้น
                  </p>
                </div>
                <p className="text-sm font-semibold text-stone-900 whitespace-nowrap">
                  {formatTHB(Number(it.unitPriceTHB) * it.qty)}
                </p>
              </li>
            ))}
          </ul>
          <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-between bg-stone-50/50">
            <span className="text-base font-semibold text-stone-900">
              ยอดรวม
            </span>
            <span className="text-2xl font-extrabold text-stone-900">
              {formatTHB(Number(order.totalTHB))}
            </span>
          </div>
        </section>

        {/* ── Primary actions ──────────────────────────────────── */}
        {/* This block only renders for multi-store orders (rare); the
            single-store path redirects to /stores/[slug]/checkout/success.
            There's no central /orders/[id] route, so the primary CTA
            here just bounces back to the marketplace home. */}
        <div className="mt-10 grid sm:grid-cols-2 gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition-colors"
          >
            กลับสู่หน้าแรก
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={singleStore ? `/stores/${singleStore}` : "/"}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-900 hover:bg-stone-50 transition-colors"
          >
            {singleStore && storeName ? `กลับไป${storeName}` : "เลือกซื้อสินค้าต่อ"}
          </Link>
        </div>

        {/* ── LINE follow nudge (Thai-market specific) ─────────── */}
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 px-5 py-4 flex items-start gap-3">
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
            className="shrink-0 inline-flex items-center px-4 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-bold"
          >
            เพิ่ม LINE
          </a>
        </div>

        {/* ── Order detail strip (small print) ─────────────────── */}
        <div className="mt-12 text-center text-xs text-stone-400">
          <p>
            หมายเลขเต็ม: <span className="font-mono">{order.id}</span>
          </p>
          {order.payment && (
            <p className="mt-1">
              การชำระเงิน:{" "}
              <span className="capitalize">
                {translateStatus(order.payment.status)}
              </span>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Small info card for ETA + status
 * ────────────────────────────────────────────────────────────── */
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
    <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 text-stone-700 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-stone-500">{label}</p>
        <p className="text-sm font-semibold text-stone-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* Map Prisma enum-ish status strings to Thai labels. Falls back to
 * the raw value if we don't have a translation yet. */
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
    SUCCESS: "สำเร็จ",
    FAILED: "ล้มเหลว",
  };
  return map[status.toUpperCase()] ?? status;
}
