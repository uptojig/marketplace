import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StoreEditForm } from "./edit-form";
import { LandingForm } from "./landing-form";
import { BlockEditor } from "./block-editor";
import { ApprovalPanel } from "./approval-panel";
import { Button } from "@/components/operator/operator-primitives";

export const dynamic = "force-dynamic";

export default async function AdminStoreEditPage({ params }: { params: { id: string } }) {
  const store = await prisma.store.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      logoUrl: true,
      bannerUrl: true,
      tagline: true,
      primaryColor: true,
      customDomain: true,
      logoPosition: true,
      menuPosition: true,
      // Template/style fields — drive storefront rendering and AI
      // design hints. Surfaced in the admin edit form's "Design" tab.
      templateId: true,
      paletteId: true,
      niche: true,
      brandVoice: true,
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
      platformEmail: true,
      platformEmailForwardTo: true,
      platformEmailVerified: true,
      createdAt: true,
      // Agent-generated landing-page status
      landingBlocks: true,
      landingTitle: true,
      landingThemeVariant: true,
      landingGeneratedAt: true,
      // Approval gate
      approvalStatus: true,
      approvalNote: true,
      approvedAt: true,
      owner: { select: { email: true, name: true } },
      _count: { select: { products: true } },
    },
  });
  if (!store) notFound();
  // Active-only product count for the Generate Landing gate. _count
  // above includes inactive (soft-removed) products, which we don't
  // want to count toward the threshold — those won't render on the
  // storefront anyway.
  const activeProductCount = await prisma.product.count({
    where: { storeId: store.id, active: true },
  });
  // Count blocks: v12 schema has pages[].blocks[], v11 is flat array
  const lb = store.landingBlocks as Record<string, unknown> | unknown[] | null;
  const landingBlockCount = Array.isArray(lb)
    ? lb.length
    : lb && typeof lb === "object" && (lb as Record<string, unknown>).type === "block_registry_v1"
      ? Array.isArray((lb as Record<string, unknown>).blocks)
        ? ((lb as Record<string, unknown>).blocks as unknown[]).length
        : 0
      : lb && typeof lb === "object" && Array.isArray((lb as Record<string, unknown>).pages)
        ? ((lb as Record<string, unknown>).pages as unknown[]).reduce(
            (sum: number, p: unknown) =>
              sum + (Array.isArray((p as Record<string, unknown>)?.blocks) ? ((p as Record<string, unknown>).blocks as unknown[]).length : 0),
            0,
          )
        : 0;
  const hasV12Schema = lb && typeof lb === "object" && !Array.isArray(lb) && Array.isArray((lb as Record<string, unknown>).pages);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Link
          href="/admin/stores"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> ร้านค้าทั้งหมด
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            {/* Logo wins when present — operator uploaded brand artwork
                belongs in the page header instead of the typed-out
                store name string. Falls back to <h1>{name}</h1> when
                no logoUrl is set. h-12 + w-auto keeps horizontal
                wordmark logos at a sensible toolbar size without
                cropping. */}
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-12 w-auto max-w-[280px] object-contain"
              />
            ) : (
              <h1 className="text-2xl font-bold">{store.name}</h1>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              เจ้าของ: {store.owner.name ?? store.owner.email} • {store._count.products} สินค้า •
              สร้างเมื่อ {store.createdAt.toLocaleDateString("th-TH")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/stores/${store.id}/products`}>
                เลือกสินค้า ({store._count.products})
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/stores/${store.id}/landing-content`}>Landing content</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/stores/${store.slug}`} target="_blank">
                ดูร้าน <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <ApprovalPanel
        storeId={store.id}
        storeName={store.slug}
        initialStatus={store.approvalStatus}
        initialNote={store.approvalNote}
        approvedAt={store.approvedAt?.toISOString() ?? null}
      />

      <LandingForm
        storeId={store.id}
        storeSlug={store.slug}
        hasLandingPage={landingBlockCount > 0}
        landingTitle={store.landingTitle}
        landingThemeVariant={store.landingThemeVariant}
        landingGeneratedAt={store.landingGeneratedAt?.toISOString() ?? null}
        blockCount={landingBlockCount}
        activeProductCount={activeProductCount}
      />

      {landingBlockCount > 0 && !(lb && typeof lb === "object" && (lb as Record<string, unknown>).type === "block_registry_v1") && (
        <BlockEditor
          storeId={store.id}
          storeSlug={store.slug}
          schema={
            hasV12Schema
              ? // BlockEditor's Props has its own `Page[]` shape; cast
                // through `unknown` since landingBlocks is Json from
                // Prisma. BlockEditor validates internally.
                (store.landingBlocks as unknown as Parameters<
                  typeof BlockEditor
                >[0]["schema"])
              : {
                  schemaVersion: "12",
                  pages: [
                    {
                      slug: "home",
                      isHomepage: true,
                      blocks: store.landingBlocks as unknown as Parameters<
                        typeof BlockEditor
                      >[0]["schema"]["pages"] extends Array<{ blocks: infer B }>
                        ? B
                        : never,
                    },
                  ],
                }
          }
        />
      )}

      <StoreEditForm store={store} />
    </div>
  );
}
