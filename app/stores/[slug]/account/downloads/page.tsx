/**
 * /stores/[slug]/account/downloads — buyer's digital library.
 *
 * Lists every active DigitalUnlock the signed-in user owns. For PROMPT
 * products the full prompt is rendered inline (with copy-to-clipboard).
 * For file-based products (EBOOK/EXCEL/VECTOR/ARCHIVE) we show a list
 * of DigitalAssets with placeholder "ดาวน์โหลด" buttons — the signed-URL
 * route lands in Phase 2.
 *
 * Auth: routed through next-auth. Guests redirect to /signin with the
 * downloads URL as the return target.
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listUserUnlocks } from '@/lib/digital/unlocks';
import { PromptViewer } from '@/components/storefront/digital/PromptViewer';
import { FileDown, KeyRound, ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return { title: `คลังสินค้าดิจิทัล — ${params.slug}` };
}

export default async function DownloadsPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(
      `/signin?callbackUrl=${encodeURIComponent(`/stores/${params.slug}/account/downloads`)}`,
    );
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });
  if (!user) {
    redirect(`/signin?callbackUrl=/stores/${params.slug}/account/downloads`);
  }

  const rawUnlocks = await listUserUnlocks(user.id);
  // Defensive filter: drop unlocks whose product row has been deleted
  // out from under us (e.g. seed cleanup, vendor hard-delete). The
  // include's `product` is typed as required but Prisma will return
  // null if the FK target is gone, which would crash the render below
  // when we read `unlock.product.digitalKind`.
  // Scope to the CURRENT store — the digital library is rendered inside
  // `/stores/[slug]/account`, so the buyer expects "what I own at THIS
  // shop", not a cross-tenant feed. The previous "show all" behaviour
  // leaked sheetlab-formula `.xlsx` files into muruko's library and read
  // as a multi-tenant data bleed to operators.
  const unlocks = rawUnlocks.filter(
    (u) => u.product != null && u.product.store?.slug === params.slug,
  );

  return (
    <main className="bg-[var(--shop-bg,#fafafa)] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link
          href={`/stores/${params.slug}/account`}
          className="inline-flex items-center gap-1 text-sm font-[family:var(--font-prompt)] mb-6"
          style={{ color: 'var(--shop-ink-muted,#71717a)' }}
        >
          <ChevronLeft className="h-4 w-4" />
          กลับสู่บัญชี
        </Link>

        <header className="mb-10">
          <p
            className="text-xs uppercase tracking-[0.18em] font-[family:var(--font-prompt)] font-semibold mb-2"
            style={{ color: 'var(--shop-primary,#0a0a0a)' }}
          >
            Digital Library
          </p>
          <h1
            className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: 'var(--shop-ink,#0a0a0a)' }}
          >
            คลังสินค้าดิจิทัลของคุณ
          </h1>
          <p
            className="text-sm font-[family:var(--font-prompt)] max-w-2xl"
            style={{ color: 'var(--shop-ink-muted,#71717a)' }}
          >
            สินค้าดิจิทัลทุกชิ้นที่คุณซื้อ — เปิดดู คัดลอก หรือดาวน์โหลดได้ทุกเมื่อ
          </p>
        </header>

        {unlocks.length === 0 ? (
          <div
            className="rounded-2xl border-2 border-dashed p-10 text-center font-[family:var(--font-prompt)]"
            style={{ borderColor: 'var(--shop-border,#e5e5e5)' }}
          >
            <p
              className="font-semibold mb-1"
              style={{ color: 'var(--shop-ink,#0a0a0a)' }}
            >
              ยังไม่มีสินค้าดิจิทัล
            </p>
            <p
              className="text-sm mb-4"
              style={{ color: 'var(--shop-ink-muted,#71717a)' }}
            >
              เลือกซื้อ prompt / ebook / vector / excel — ปลดล็อกได้ทันทีหลังชำระ
            </p>
            <Link
              href={`/stores/${params.slug}`}
              className="inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold text-white"
              style={{
                background:
                  'var(--shop-primary-gradient, var(--shop-primary,#0a0a0a))',
              }}
            >
              เลือกซื้อสินค้า
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {unlocks.map((unlock) => {
              const p = unlock.product;
              const title = p.titleTh ?? p.title;
              if (p.digitalKind === 'PROMPT') {
                return (
                  <section key={unlock.id} className="space-y-3">
                    <header className="flex items-center justify-between gap-3 flex-wrap">
                      <h2
                        className="font-[family:var(--font-kanit)] text-lg font-bold"
                        style={{ color: 'var(--shop-ink,#0a0a0a)' }}
                      >
                        {title}
                      </h2>
                      <span
                        className="text-[11px] font-[family:var(--font-prompt)] inline-flex items-center gap-1"
                        style={{ color: 'var(--shop-ink-muted,#71717a)' }}
                      >
                        <KeyRound size={11} />
                        {unlock.licenseKey.slice(0, 12)}…
                      </span>
                    </header>
                    <PromptViewer
                      storeSlug={p.store.slug}
                      storeName={p.store.name}
                      productId={p.id}
                      productTitle={title}
                      productImage={p.imageUrl}
                      priceTHB={0}
                      promptSample={p.promptSample}
                      promptFull={p.promptText}
                      unlocked
                      licenseKey={unlock.licenseKey}
                    />
                  </section>
                );
              }
              // File-based digital product (EBOOK/EXCEL/VECTOR/ARCHIVE/OTHER)
              const downloadable = p.digitalAssets.filter((a) => !a.isPreview);
              return (
                <section
                  key={unlock.id}
                  className="rounded-2xl border bg-white p-5"
                  style={{ borderColor: 'var(--shop-border,#e5e5e5)' }}
                >
                  <header className="flex items-center justify-between gap-3 flex-wrap mb-3">
                    <h2
                      className="font-[family:var(--font-kanit)] text-lg font-bold"
                      style={{ color: 'var(--shop-ink,#0a0a0a)' }}
                    >
                      {title}
                    </h2>
                    <span
                      className="text-[11px] font-[family:var(--font-prompt)] inline-flex items-center gap-1"
                      style={{ color: 'var(--shop-ink-muted,#71717a)' }}
                    >
                      <KeyRound size={11} />
                      {unlock.licenseKey.slice(0, 12)}…
                    </span>
                  </header>
                  {downloadable.length === 0 ? (
                    <p
                      className="text-sm font-[family:var(--font-prompt)]"
                      style={{ color: 'var(--shop-ink-muted,#71717a)' }}
                    >
                      ผู้ขายยังไม่ได้อัปโหลดไฟล์ — โปรดติดต่อร้าน
                    </p>
                  ) : (
                    <ul className="divide-y" style={{ borderColor: 'var(--shop-border,#e5e5e5)' }}>
                      {downloadable.map((asset) => (
                        <li
                          key={asset.id}
                          className="flex items-center justify-between gap-3 py-3 font-[family:var(--font-prompt)]"
                        >
                          <div className="min-w-0">
                            <p
                              className="text-sm font-semibold truncate"
                              style={{ color: 'var(--shop-ink,#0a0a0a)' }}
                            >
                              {asset.fileName}
                            </p>
                            <p
                              className="text-[11px]"
                              style={{ color: 'var(--shop-ink-muted,#71717a)' }}
                            >
                              .{asset.fileFormat} · {asset.fileSizeMB.toFixed(1)} MB
                            </p>
                          </div>
                          <a
                            href={`/api/digital/download/${unlock.id}/${asset.id}`}
                            // Same-tab navigation so the browser inherits the
                            // session cookie; the API 302's to a 10-min
                            // signed Spaces URL with Content-Disposition.
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                            style={{
                              background:
                                'var(--shop-primary-gradient, var(--shop-primary,#0a0a0a))',
                            }}
                          >
                            <FileDown size={14} />
                            ดาวน์โหลด
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
