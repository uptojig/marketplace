/**
 * /admin/credit-topups/[ref] — full dispute-evidence pack for a single
 * top-up. Operator opens this when a chargeback / payment-issuer
 * inquiry lands, clicks "พิมพ์ / บันทึก PDF" and emails the result.
 *
 * Bundles in one page:
 *   - Transaction info (ref, amount, paidAt, AnyPay tx id)
 *   - Customer identity (id, email, phone, IP, UA at intent time)
 *   - System log of the PAID webhook (sourced from WebhookLog)
 *   - ToS version + acceptance timestamp + IP at acceptance
 *   - Credit usage log — every SPEND/REFUND that touched the balance
 *     since the top-up settled, so the operator can prove the buyer
 *     actually consumed the credit they're disputing
 */
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { PrintEvidenceButton } from "./print-button";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session : null;
}

export default async function AdminTopupEvidencePage({
  params,
}: {
  params: { ref: string };
}) {
  const session = await requireAdmin();
  if (!session)
    redirect(`/signin?callbackUrl=/admin/credit-topups/${params.ref}`);

  const topup = await prisma.creditTopup.findUnique({
    where: { referenceNumber: params.ref },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          createdAt: true,
        },
      },
      store: {
        select: {
          id: true,
          slug: true,
          name: true,
          contactEmail: true,
        },
      },
    },
  });
  if (!topup) notFound();

  // Pull WebhookLog rows that mention this topup id — these are the
  // raw audit-log entries proving when AnyPay PAID-ed the transaction.
  const webhookLogs = topup.anypayTransactionId
    ? await prisma.webhookLog.findMany({
        where: {
          source: "ANYPAY",
          OR: [
            { bodyJson: { path: ["transaction_id"], equals: topup.anypayTransactionId } },
            {
              bodyJson: {
                path: ["order_id"],
                equals: `topup:${topup.id}`,
              },
            },
          ],
        },
        orderBy: { receivedAt: "asc" },
      })
    : [];

  // Buyer's per-store credit balance + ledger since this top-up. Shows
  // how the credit moved after settlement — burned on orders, refunded,
  // etc. The "signature on receipt" of the chargeback evidence pack.
  const balance = await prisma.creditBalance.findUnique({
    where: {
      userId_storeId: { userId: topup.userId, storeId: topup.storeId },
    },
  });
  const ledger = balance
    ? await prisma.creditLedger.findMany({
        where: {
          balanceId: balance.id,
          createdAt: { gte: topup.createdAt },
        },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const fmt = (d: Date | null | undefined) =>
    d
      ? new Date(d).toLocaleString("th-TH", {
          dateStyle: "medium",
          timeStyle: "long",
          timeZoneName: "short",
        })
      : "—";

  return (
    <main className="bg-zinc-100 min-h-screen py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <Link
            href="/admin/credit-topups"
            className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" />
            กลับสู่รายการทั้งหมด
          </Link>
          <PrintEvidenceButton />
        </div>

        <article
          id="evidence-root"
          className="bg-white rounded-md border border-zinc-200 px-8 py-10 sm:px-12 sm:py-12 print:shadow-none print:border-0 print:px-0 print:py-0"
        >
          <header className="pb-6 mb-8 border-b border-zinc-200">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 font-semibold mb-1">
              Dispute Evidence Pack
            </p>
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">
              Credit top-up · {topup.referenceNumber ?? topup.id}
            </h1>
            <p className="text-xs text-zinc-500">
              เอกสารฉบับนี้สร้างขึ้นโดยอัตโนมัติจากระบบ basketplace.co สำหรับการ
              ป้องกัน chargeback / dispute เท่านั้น
            </p>
          </header>

          <Section title="1. Transaction Info">
            <KV label="Reference Number" mono>
              {topup.referenceNumber ?? "(legacy: " + topup.id + ")"}
            </KV>
            <KV label="Amount" bold>
              {formatTHB(Number(topup.amountTHB))}
            </KV>
            <KV label="Status">{topup.status}</KV>
            <KV label="AnyPay Transaction ID" mono>
              {topup.anypayTransactionId ?? "—"}
            </KV>
            <KV label="Created At">{fmt(topup.createdAt)}</KV>
            <KV label="Paid At">{fmt(topup.paidAt)}</KV>
          </Section>

          <Section title="2. Customer Identity">
            <KV label="User ID" mono>
              {topup.user.id}
            </KV>
            <KV label="Name">{topup.user.name ?? "—"}</KV>
            <KV label="Email">{topup.user.email ?? "—"}</KV>
            <KV label="Phone">{topup.user.phone ?? "—"}</KV>
            <KV label="Account Created">{fmt(topup.user.createdAt)}</KV>
            <KV label="IP Address (at intent)" mono>
              {topup.ipAddress ?? "—"}
            </KV>
            <KV label="User-Agent (at intent)" mono>
              {topup.userAgent ?? "—"}
            </KV>
          </Section>

          <Section title="3. Terms of Service Acceptance">
            <KV label="ToS Version" mono>
              {topup.tosVersion ?? "—"}
            </KV>
            <KV label="Accepted At">{fmt(topup.tosAcceptedAt)}</KV>
            <KV label="Doc URL" mono>
              {`${process.env.NEXT_PUBLIC_APP_URL ?? "https://basketplace.co"}/terms/credit`}
            </KV>
            <p className="text-xs text-zinc-500 mt-2">
              ผู้ใช้กดยอมรับเงื่อนไขก่อนกด "เติมเครดิต" ระบบบันทึก IP
              + User-Agent + ToS version ในตารางเดียวกับการทำรายการ
            </p>
          </Section>

          <Section title="4. System / Webhook Log">
            {webhookLogs.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">
                ไม่พบ webhook log สำหรับการทำรายการนี้
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {webhookLogs.map((log) => (
                  <li
                    key={log.id}
                    className="border border-zinc-200 rounded p-3 font-mono break-all"
                  >
                    <p>
                      <span className="text-zinc-500">{fmt(log.receivedAt)}</span>{" "}
                      · {log.endpoint} · signatureValid=
                      {String(log.signatureValid)} · processed=
                      {String(log.processed)}
                    </p>
                    {log.processingError ? (
                      <p className="text-zinc-500 mt-1">
                        note: {log.processingError}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="5. Credit Usage Log (post-settlement)">
            {ledger.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">
                ไม่มีรายการตัด/บวกเครดิตหลังการเติมครั้งนี้
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="text-left py-2 px-1 font-semibold">เวลา</th>
                    <th className="text-left py-2 px-1 font-semibold">ประเภท</th>
                    <th className="text-right py-2 px-1 font-semibold">
                      ยอด
                    </th>
                    <th className="text-right py-2 px-1 font-semibold">
                      Balance after
                    </th>
                    <th className="text-left py-2 px-1 font-semibold">
                      Order / Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((e) => (
                    <tr key={e.id} className="border-b border-zinc-100 last:border-b-0">
                      <td className="py-2 px-1 text-zinc-500">
                        {fmt(e.createdAt)}
                      </td>
                      <td className="py-2 px-1 font-mono">{e.type}</td>
                      <td className="py-2 px-1 text-right font-mono">
                        {formatTHB(Number(e.amountTHB))}
                      </td>
                      <td className="py-2 px-1 text-right font-mono">
                        {formatTHB(Number(e.balanceAfter))}
                      </td>
                      <td className="py-2 px-1 text-zinc-500">
                        {e.orderId ? `Order ${e.orderId.slice(0, 12)}…` : ""}
                        {e.note ? ` · ${e.note}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="text-xs text-zinc-500 mt-3">
              ยอดเครดิตคงเหลือปัจจุบัน:{" "}
              <strong>
                {balance ? formatTHB(Number(balance.balanceTHB)) : "—"}
              </strong>
            </p>
          </Section>

          <footer className="mt-12 pt-6 border-t border-zinc-200 text-[10px] text-zinc-400">
            <p>
              เอกสารนี้สร้างเมื่อ {fmt(new Date())} · ระบบ basketplace.co ·
              admin: {session.user.email}
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 print:break-inside-avoid">
      <h2 className="text-xs uppercase tracking-[0.18em] text-zinc-500 font-bold mb-3 pb-1 border-b border-zinc-200">
        {title}
      </h2>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function KV({
  label,
  children,
  mono,
  bold,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 text-sm py-1">
      <div className="text-zinc-500 text-xs">{label}</div>
      <div
        className={`col-span-2 text-zinc-900 break-all ${mono ? "font-mono text-xs" : ""} ${bold ? "font-bold" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
