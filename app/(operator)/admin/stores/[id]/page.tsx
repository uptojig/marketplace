import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { OperatorPageHeader } from "@/components/operator/operator-page-header";
import { StoreEditForm } from "./edit-form";
import { LandingForm } from "./landing-form";
import { BlockEditor } from "./block-editor";
import { ApprovalPanel } from "./approval-panel";

export const dynamic = "force-dynamic";

const APPROVAL_BADGE: Record<
  "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED",
  { label: string; className: string }
> = {
  PENDING: {
    label: "รอตรวจ",
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  APPROVED: {
    label: "อนุมัติแล้ว",
    className: "border-green-200 bg-green-50 text-green-900",
  },
  REJECTED: {
    label: "ปฏิเสธ",
    className: "border-red-200 bg-red-50 text-red-900",
  },
  SUSPENDED: {
    label: "ระงับชั่วคราว",
    className: "border-gray-200 bg-gray-50 text-gray-700",
  },
};

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
      // design hints. Surfaced in the admin edit form's "Branding" tab.
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

  const approvalBadge = APPROVAL_BADGE[store.approvalStatus];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <OperatorPageHeader
        backHref="/admin/stores"
        backLabel="ร้านค้าทั้งหมด"
        titleNode={
          store.logoUrl ? (
            <div className="space-y-1">
              {/* Logo wins when present — operator uploaded brand
                  artwork belongs in the page header instead of the
                  typed-out store name string. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-12 w-auto max-w-[280px] object-contain"
              />
              <p className="text-xs text-muted-foreground">{store.name}</p>
            </div>
          ) : (
            <h1 className="text-2xl font-bold tracking-tight">{store.name}</h1>
          )
        }
        subtitle={
          <>
            เจ้าของ: {store.owner.name ?? store.owner.email} •{" "}
            {store._count.products} สินค้า • สร้างเมื่อ{" "}
            {store.createdAt.toLocaleDateString("th-TH")}
          </>
        }
        meta={
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${approvalBadge.className}`}
            title="สถานะการอนุมัติร้านค้า"
          >
            สถานะ: {approvalBadge.label}
          </span>
        }
        actions={
          <>
            <Link
              href={`/admin/stores/${store.id}/products`}
              className="inline-flex items-center gap-1 rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              เลือกสินค้า ({store._count.products})
            </Link>
            <Link
              href={`/admin/stores/${store.id}/landing-content`}
              className="inline-flex items-center gap-1 rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Landing content
            </Link>
            <Link
              href={`/stores/${store.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              ดูร้าน <ExternalLink className="h-3 w-3" />
            </Link>
          </>
        }
      />

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
