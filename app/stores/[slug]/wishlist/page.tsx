/**
 * /stores/<slug>/wishlist — saved products list (localStorage-backed).
 *
 * Server-rendered shell with a client child that reads from localStorage.
 * Matches the rest of the storefront via the shared layout, so theme
 * cascade + nav + footer all carry through automatically.
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { WishlistClient } from "./client";

export const dynamic = "force-dynamic";

export default async function WishlistPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: { id: true, slug: true, name: true },
  });
  if (!store) notFound();

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: "หน้าแรก", href: `/stores/${store.slug}` },
              { label: "รายการโปรด" },
            ]}
          />
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
          style={{ color: "var(--shop-ink)" }}
        >
          รายการโปรด
        </h1>
        <p className="text-sm mb-10" style={{ color: "var(--shop-ink-muted)" }}>
          สินค้าที่คุณบันทึกไว้จาก {store.name} — บันทึกในเครื่องของคุณเอง
        </p>

        <WishlistClient storeSlug={store.slug} />
      </main>
    </div>
  );
}
