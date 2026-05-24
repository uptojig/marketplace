/**
 * /stores/[slug]/help — help-center index.
 *
 * Lists every entry in `lib/helpPages.ts` grouped by category. Existed
 * as a 404 before this file landed; the footer service-link "วิธีการ
 * สั่งซื้อ / การจัดส่ง / การคืนสินค้า / รับประกันของแท้" pointed at
 * `/stores/[slug]/help` which 404'd because only the per-page route
 * (`/help/[pageSlug]`) was defined.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  HELP_PAGES_BY_CATEGORY,
  HELP_CATEGORY_LABEL,
  type HelpCategory,
} from "@/lib/helpPages";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return { title: `ศูนย์ช่วยเหลือ — ${params.slug}` };
}

export default async function HelpIndexPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: { name: true, slug: true },
  });
  if (!store) notFound();

  const categoryOrder: HelpCategory[] = ["shop", "about", "policy"];

  return (
    <main className="bg-[var(--shop-bg,#fafafa)] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link
          href={`/stores/${store.slug}`}
          className="inline-flex items-center gap-1 text-sm font-[family:var(--font-prompt)] text-[color:var(--shop-ink-muted,#71717a)] hover:text-[color:var(--shop-primary,#0a0a0a)] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับสู่หน้าร้าน
        </Link>

        <header className="mb-10">
          <p
            className="text-xs uppercase tracking-[0.18em] font-[family:var(--font-prompt)] font-semibold mb-2"
            style={{ color: "var(--shop-primary, #0a0a0a)" }}
          >
            Help Center
          </p>
          <h1
            className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: "var(--shop-ink, #0a0a0a)" }}
          >
            ศูนย์ช่วยเหลือ
          </h1>
          <p
            className="text-base font-[family:var(--font-prompt)] max-w-2xl"
            style={{ color: "var(--shop-ink-muted, #71717a)" }}
          >
            รวมข้อมูลที่ต้องรู้เกี่ยวกับการสั่งซื้อ การจัดส่ง การคืนสินค้า
            และนโยบายของร้าน {store.name}
          </p>
        </header>

        <div className="space-y-8">
          {categoryOrder.map((cat) => {
            const pages = HELP_PAGES_BY_CATEGORY[cat] ?? [];
            if (pages.length === 0) return null;
            return (
              <section key={cat}>
                <h2
                  className="font-[family:var(--font-kanit)] text-lg font-bold mb-3 px-1"
                  style={{ color: "var(--shop-ink, #0a0a0a)" }}
                >
                  {HELP_CATEGORY_LABEL[cat]}
                </h2>
                <ul
                  className="rounded-xl overflow-hidden border bg-white"
                  style={{ borderColor: "var(--shop-border, #e5e5e5)" }}
                >
                  {pages.map((p, i) => (
                    <li
                      key={p.slug}
                      className={
                        i > 0
                          ? "border-t"
                          : ""
                      }
                      style={{ borderColor: "var(--shop-border, #e5e5e5)" }}
                    >
                      <Link
                        href={`/stores/${store.slug}/help/${p.slug}`}
                        className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-[color:var(--shop-bg-soft,#f4f4f5)] transition-colors"
                      >
                        <span
                          className="font-[family:var(--font-prompt)] font-medium text-sm sm:text-base"
                          style={{ color: "var(--shop-ink, #0a0a0a)" }}
                        >
                          {p.title}
                        </span>
                        <ChevronRight
                          className="h-4 w-4 shrink-0"
                          style={{ color: "var(--shop-ink-muted, #71717a)" }}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
