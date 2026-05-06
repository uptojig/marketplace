import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StoreEditForm } from "./edit-form";
import { LandingForm } from "./landing-form";
import { BlockEditor } from "./block-editor";
import { ApprovalPanel } from "./approval-panel";

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
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> ร้านค้าทั้งหมด
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{store.name}</h1>
            <p className="text-sm text-muted-foreground">
              เจ้าของ: {store.owner.name ?? store.owner.email} • {store._count.products} สินค้า •
              สร้างเมื่อ {store.createdAt.toLocaleDateString("th-TH")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/admin/stores/${store.id}/products`}
              className="inline-flex items-center gap-1 rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              เลือกสินค้า ({store._count.products})
            </Link>
            <Link
              href={`/stores/${store.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              ดูร้าน <ExternalLink className="h-3 w-3" />
            </Link>
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
