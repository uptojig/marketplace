/**
 * /stores/[slug]/account/credit/receipts/[ref]
 *
 * Buyer-facing receipt for a single CreditTopup. Server-rendered as
 * a print-friendly HTML page — buyers can "Save as PDF" from any
 * browser. The reference number in the URL is the human-readable
 * TOP-YYYYMMDD-XXXXXX format stored on CreditTopup.referenceNumber.
 *
 * Auth: the signed-in user must own this topup. We don't expose this
 * by topupId (cuid) on purpose — the reference number is what's
 * shared with the issuer / bank during chargeback defense and we want
 * the URL to match.
 */
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { PrintReceiptButton } from "./print-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; ref: string };
}) {
  return { title: `ใบเสร็จเติมเครดิต ${params.ref}` };
}

export default async function CreditReceiptPage({
  params,
}: {
  params: { slug: string; ref: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(
      `/signin?callbackUrl=${encodeURIComponent(
        `/stores/${params.slug}/account/credit/receipts/${params.ref}`,
      )}`,
    );
  }

  const topup = await prisma.creditTopup.findUnique({
    where: { referenceNumber: params.ref },
    include: {
      store: {
        select: {
          slug: true,
          name: true,
          logoUrl: true,
          contactEmail: true,
          companyName: true,
          taxId: true,
          addressLine1: true,
          subdistrict: true,
          district: true,
          province: true,
          postalCode: true,
        },
      },
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  if (!topup) notFound();
  if (topup.user.email !== session.user.email) notFound();
  if (topup.store.slug !== params.slug) notFound();

  const formatDate = (d: Date | null) =>
    d
      ? new Date(d).toLocaleString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        })
      : "—";

  const storeAddress = [
    topup.store.addressLine1,
    topup.store.subdistrict,
    topup.store.district,
    topup.store.province,
    topup.store.postalCode,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="bg-zinc-100 min-h-screen py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <Link
            href={`/stores/${params.slug}/account/credit`}
            className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" />
            กลับสู่หน้าเครดิต
          </Link>
          <PrintReceiptButton />
        </div>

        <article
          className="bg-white rounded-md border border-zinc-200 px-8 py-10 sm:px-12 sm:py-12 shadow-sm print:shadow-none print:border-0 print:rounded-none print:px-0 print:py-0"
          id="receipt-root"
        >
          {/* ── Header ───────────────────────────────────────── */}
          <header className="flex items-start justify-between gap-6 pb-6 border-b border-zinc-200 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 font-semibold mb-1">
                ใบเสร็จรับเงิน / E-Receipt
              </p>
              <h1 className="text-2xl font-bold text-zinc-900">
                การเติมเครดิต
              </h1>
            </div>
            <div className="text-right">
              {topup.store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={topup.store.logoUrl}
                  alt={topup.store.name}
                  className="h-10 w-auto object-contain ml-auto"
                />
              ) : null}
              <p className="text-sm font-semibold text-zinc-900 mt-1">
                {topup.store.name}
              </p>
            </div>
          </header>

          {/* ── Reference + status ──────────────────────────── */}
          <section className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-xs text-zinc-500 mb-1">หมายเลขอ้างอิง</p>
              <p className="font-mono font-bold text-zinc-900">
                {topup.referenceNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 mb-1">สถานะ</p>
              <span
                className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold ${
                  topup.status === "PAID"
                    ? "bg-emerald-50 text-emerald-700"
                    : topup.status === "PENDING"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-zinc-100 text-zinc-700"
                }`}
              >
                {topup.status === "PAID"
                  ? "ชำระแล้ว"
                  : topup.status === "PENDING"
                    ? "รอชำระ"
                    : topup.status}
              </span>
            </div>
          </section>

          {/* ── Parties ─────────────────────────────────────── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500 font-semibold mb-2">
                ผู้ขาย
              </p>
              <p className="font-semibold text-zinc-900">
                {topup.store.companyName ?? topup.store.name}
              </p>
              {topup.store.taxId ? (
                <p className="text-xs text-zinc-600">
                  เลขประจำตัวผู้เสียภาษี: {topup.store.taxId}
                </p>
              ) : null}
              {storeAddress ? (
                <p className="text-xs text-zinc-600 mt-1">{storeAddress}</p>
              ) : null}
              {topup.store.contactEmail ? (
                <p className="text-xs text-zinc-600">
                  อีเมล: {topup.store.contactEmail}
                </p>
              ) : null}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500 font-semibold mb-2">
                ผู้ซื้อ
              </p>
              <p className="font-semibold text-zinc-900">
                {topup.user.name ?? "—"}
              </p>
              <p className="text-xs text-zinc-600">{topup.user.email}</p>
              {topup.user.phone ? (
                <p className="text-xs text-zinc-600">โทร {topup.user.phone}</p>
              ) : null}
            </div>
          </section>

          {/* ── Line items ──────────────────────────────────── */}
          <section className="mb-6">
            <table className="w-full text-sm border-t border-b border-zinc-200">
              <thead>
                <tr className="bg-zinc-50">
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-zinc-500 font-semibold">
                    รายการ
                  </th>
                  <th className="text-right py-3 px-2 text-xs uppercase tracking-wide text-zinc-500 font-semibold">
                    จำนวน
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-zinc-100">
                  <td className="py-4 px-2">
                    <p className="font-medium text-zinc-900">
                      เติมเครดิตเข้าบัญชี
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      ร้าน {topup.store.name} · 1 บาท = 1 บาทเครดิต
                    </p>
                  </td>
                  <td className="py-4 px-2 text-right font-mono font-semibold text-zinc-900">
                    {formatTHB(Number(topup.amountTHB))}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-200 bg-zinc-50">
                  <td className="py-3 px-2 font-bold text-zinc-900">
                    รวมทั้งสิ้น
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-zinc-900 text-lg">
                    {formatTHB(Number(topup.amountTHB))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* ── Audit trail ─────────────────────────────────── */}
          <section className="mb-6 text-xs space-y-1.5 text-zinc-600">
            <p className="text-xs uppercase tracking-wide text-zinc-500 font-semibold mb-2">
              บันทึกการทำรายการ
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-6">
              <p>
                <span className="text-zinc-500">วันที่สั่งซื้อ: </span>
                {formatDate(topup.createdAt)}
              </p>
              <p>
                <span className="text-zinc-500">วันที่ชำระสำเร็จ: </span>
                {formatDate(topup.paidAt)}
              </p>
              {topup.anypayTransactionId ? (
                <p className="sm:col-span-2 font-mono break-all">
                  <span className="text-zinc-500">AnyPay Transaction: </span>
                  {topup.anypayTransactionId}
                </p>
              ) : null}
              {topup.ipAddress ? (
                <p>
                  <span className="text-zinc-500">IP Address: </span>
                  <span className="font-mono">{topup.ipAddress}</span>
                </p>
              ) : null}
              {topup.tosVersion ? (
                <p>
                  <span className="text-zinc-500">เงื่อนไขการให้บริการ: </span>
                  <span className="font-mono">{topup.tosVersion}</span>{" "}
                  <Link
                    href="/terms/credit"
                    className="underline hover:text-zinc-900"
                  >
                    (อ่าน)
                  </Link>
                </p>
              ) : null}
              {topup.tosAcceptedAt ? (
                <p className="sm:col-span-2">
                  <span className="text-zinc-500">ยอมรับเงื่อนไขเมื่อ: </span>
                  {formatDate(topup.tosAcceptedAt)}
                </p>
              ) : null}
            </div>
          </section>

          <footer className="pt-6 border-t border-zinc-200 text-xs text-zinc-500 space-y-1">
            <p>
              เครดิตที่เติมเข้าระบบแล้วไม่สามารถแลกเปลี่ยนหรือขอคืนเป็นเงินสดได้
              ตาม{" "}
              <Link href="/terms/credit" className="underline">
                เงื่อนไขการเติมเครดิต
              </Link>
            </p>
            <p>เก็บใบเสร็จนี้ไว้เป็นหลักฐานการทำรายการ</p>
          </footer>
        </article>
      </div>
    </main>
  );
}

