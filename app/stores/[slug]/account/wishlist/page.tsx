/**
 * /stores/[slug]/account/wishlist
 *
 * Buyer-facing list of every product they've saved. Wishlist is per-
 * USER (not per-store), so this page lists ALL their saved items
 * regardless of which storefront they're viewing — handy when a buyer
 * shopping at sheetlab-th has previously saved an item at another
 * store too.
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listWishlist } from "@/lib/wishlist";
import { formatTHB } from "@/lib/utils";
import { Heart, ChevronLeft, TrendingDown } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return { title: `รายการโปรด — ${params.slug}` };
}

export default async function WishlistPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(
      `/signin?callbackUrl=${encodeURIComponent(
        `/stores/${params.slug}/account/wishlist`,
      )}`,
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });
  if (!user) {
    redirect(`/signin?callbackUrl=/stores/${params.slug}/account/wishlist`);
  }

  const items = await listWishlist(user.id);

  return (
    <main className="bg-[var(--shop-bg,#fafafa)] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link
          href={`/stores/${params.slug}/account`}
          className="inline-flex items-center gap-1 text-sm mb-6"
          style={{ color: "var(--shop-ink-muted, #71717a)" }}
        >
          <ChevronLeft className="h-4 w-4" />
          กลับสู่บัญชี
        </Link>

        <header className="mb-10">
          <p
            className="text-xs uppercase tracking-[0.18em] font-semibold mb-2"
            style={{ color: "var(--shop-primary, #0a0a0a)" }}
          >
            Wishlist
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: "var(--shop-ink, #0a0a0a)" }}
          >
            รายการโปรด
          </h1>
          <p
            className="text-sm max-w-2xl"
            style={{ color: "var(--shop-ink-muted, #71717a)" }}
          >
            สินค้าที่คุณกดบันทึกไว้ — ระบบจะแจ้งทางอีเมลเมื่อสินค้าลดราคา
          </p>
        </header>

        {items.length === 0 ? (
          <div
            className="rounded-2xl border-2 border-dashed p-10 text-center"
            style={{ borderColor: "var(--shop-border,#e5e5e5)" }}
          >
            <Heart
              className="h-10 w-10 mx-auto mb-3"
              style={{ color: "var(--shop-ink-muted,#71717a)" }}
            />
            <p
              className="font-semibold mb-1"
              style={{ color: "var(--shop-ink,#0a0a0a)" }}
            >
              ยังไม่มีรายการโปรด
            </p>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--shop-ink-muted,#71717a)" }}
            >
              กดรูปหัวใจที่หน้าสินค้าเพื่อบันทึกไว้ดูทีหลัง
            </p>
            <Link
              href={`/stores/${params.slug}`}
              className="inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold text-white"
              style={{
                background:
                  "var(--shop-primary-gradient, var(--shop-primary,#0a0a0a))",
              }}
            >
              เลือกซื้อสินค้า
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((it) => (
              <li
                key={it.id}
                className="rounded-2xl border bg-white p-4 flex gap-4"
                style={{ borderColor: "var(--shop-border,#e5e5e5)" }}
              >
                <Link
                  href={`/stores/${it.product.store.slug}/products/${it.productId}`}
                  className="shrink-0 h-24 w-24 rounded-lg overflow-hidden bg-zinc-100"
                >
                  {it.product.imageUrl ? (
                    <Image
                      src={it.product.imageUrl}
                      alt={it.product.title}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : null}
                </Link>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11px] uppercase tracking-wide mb-0.5"
                    style={{ color: "var(--shop-ink-muted,#71717a)" }}
                  >
                    {it.product.store.name}
                  </p>
                  <Link
                    href={`/stores/${it.product.store.slug}/products/${it.productId}`}
                    className="text-sm font-semibold line-clamp-2 hover:underline"
                    style={{ color: "var(--shop-ink,#0a0a0a)" }}
                  >
                    {it.product.title}
                  </Link>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span
                      className="text-base font-bold"
                      style={{ color: "var(--shop-primary,#0a0a0a)" }}
                    >
                      {formatTHB(it.priceTHBNow)}
                    </span>
                    {it.compareAtPriceTHB
                    && it.compareAtPriceTHB > it.priceTHBNow ? (
                      <span
                        className="text-xs line-through"
                        style={{ color: "var(--shop-ink-muted,#71717a)" }}
                      >
                        {formatTHB(it.compareAtPriceTHB)}
                      </span>
                    ) : null}
                    {it.onSale ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5"
                      >
                        <TrendingDown className="h-3 w-3" />
                        ลดราคา
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
