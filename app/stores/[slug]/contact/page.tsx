import { notFound } from "next/navigation";
import Link from "next/link";
import { Map, MessageCircleMore, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatStoreAddressLines } from "@/lib/format/storeAddress";
import {
  StoreSocialIcons,
  StoreContactRows,
} from "@/components/shop/StoreSocialIcons";
import { isV12Schema } from "@/lib/multi-page-migration";
import { MultiPageRenderer } from "@/components/storefront/MultiPageRenderer";

export const dynamic = "force-dynamic";

export default async function StoreContactPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      tagline: true,
      primaryColor: true,
      companyName: true,
      taxId: true,
      addressLine1: true,
      addressLine2: true,
      subdistrict: true,
      district: true,
      province: true,
      postalCode: true,
      country: true,
      contactEmail: true,
      contactPhone: true,
      facebookUrl: true,
      messengerUrl: true,
      twitterUrl: true,
      instagramUrl: true,
      websiteUrl: true,
      lineId: true,
      landingBlocks: true,
      bannerUrl: true,
      slug: true,
      // Needed by the filterInactiveProductsFromSchema query below.
      id: true,
    },
  });
  if (!store) notFound();

  // Only render if store has v12 multi-page schema with a "contact" page
  if (
    store.landingBlocks &&
    typeof store.landingBlocks === "object" &&
    isV12Schema(store.landingBlocks)
  ) {
    const hasContactPage = store.landingBlocks.pages.some(
      (p: { slug: string }) => p.slug === "contact"
    );
    if (hasContactPage) {
      const activeRows = await prisma.product.findMany({
        where: { storeId: store.id, active: true },
        select: { externalProductId: true },
      });
      const activeProductIds = new Set(
        activeRows
          .map((r) => r.externalProductId)
          .filter((s): s is string => !!s),
      );
      return (
        <MultiPageRenderer
          schema={store.landingBlocks}
          pageSlug="contact"
          storeSlug={store.slug}
          storeName={store.name}
          storeBannerUrl={store.bannerUrl}
          activeProductIds={activeProductIds}
        />
      );
    }
  }

  const addressLines = formatStoreAddressLines(store);
  const hasAnySocials =
    !!store.facebookUrl ||
    !!store.messengerUrl ||
    !!store.twitterUrl ||
    !!store.instagramUrl ||
    !!store.websiteUrl ||
    !!store.lineId;

  return (
    <div className="container mx-auto max-w-[1200px] px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ติดต่อร้านค้า</h1>
        {store.tagline && (
          <p className="mt-1 text-sm text-muted-foreground">{store.tagline}</p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr,360px]">
        {/* Left: message empty-state (signed-out) */}
        <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border p-8 text-center" style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
          >
            <MessageCircleMore className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative space-y-5">
            <p className="text-sm" style={{ color: 'var(--shop-ink-muted)' }}>
              เข้าสู่ระบบเพื่อส่งข้อความถึงร้านค้า
            </p>
            <Link
              href={`/signin?callbackUrl=/stores/${params.slug}/contact`}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: "var(--shop-primary)" }}
            >
              <Lock className="h-4 w-4" />
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>

        {/* Right: store info card */}
        <aside className="space-y-6 rounded-xl border p-6" style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}>
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
              <Map className="h-5 w-5 text-gray-400" />
              ข้อมูลร้าน
            </h2>
            {addressLines.length > 0 ? (
              <div className="space-y-1 text-sm" style={{ color: 'var(--shop-ink)' }}>
                {addressLines.map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">ยังไม่ได้กรอกที่อยู่</p>
            )}
            <div className="mt-3">
              <StoreContactRows store={store} />
            </div>
          </div>

          {hasAnySocials && (
            <div>
              <p className="mb-2 text-sm font-medium">ช่องทางติดต่ออื่น ๆ</p>
              <StoreSocialIcons store={store} />
            </div>
          )}
        </aside>
      </div>

      <div className="mt-6 text-center">
        <Link
          href={`/stores/${params.slug}`}
          className="text-sm hover:underline"
          style={{ color: 'var(--shop-primary)' }}
        >
          ← กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
