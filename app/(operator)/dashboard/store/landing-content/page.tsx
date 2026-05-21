import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolveDashboardStore } from "@/lib/stores/resolve-dashboard-store";
import { LandingContentForm } from "@/components/landing-editor/landing-content-form";
import {
  featuredTileSchema,
  ctaBlockSchema,
  faqItemSchema,
  testimonialSchema,
  readRepeatable,
  type ColorOverrides,
} from "@/lib/store/landing-content";
import { parseUIConfig } from "@/lib/store/ui-config";

export const dynamic = "force-dynamic";

export default async function VendorLandingContentPage({
  searchParams,
}: {
  searchParams?: { storeSlug?: string };
}) {
  const { store } = await resolveDashboardStore({
    requestedSlug: searchParams?.storeSlug,
  });

  const c = await prisma.storeLandingContent.findUnique({
    where: { storeId: store.id },
  });
  // parseUIConfig returns null when uiConfig is null/undefined OR fails
  // validation — the editor renders an empty-state in both cases so the
  // operator can re-seed instead of editing a broken object.
  const uiConfig = parseUIConfig(c?.uiConfig);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Landing content</h1>
          <p className="text-sm text-muted-foreground">
            เนื้อหา / รูปภาพ / สีบนหน้าร้านของคุณ
          </p>
        </div>
        <a
          href={`/stores/${store.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          ดูหน้าร้าน
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <LandingContentForm
        endpoint="/api/store/landing-content"
        storeUrl={`/stores/${store.slug}`}
        templateId={store.templateId}
        paletteId={store.paletteId}
        defaultValues={{
          heroHeadline: c?.heroHeadline ?? "",
          heroSubheadline: c?.heroSubheadline ?? "",
          heroCtaLabel: c?.heroCtaLabel ?? "",
          heroCtaUrl: c?.heroCtaUrl ?? "",
          heroImageUrl: c?.heroImageUrl ?? "",
          heroVideoUrl: c?.heroVideoUrl ?? "",
          heroAlignment:
            (c?.heroAlignment as "left" | "center" | "right" | null) ??
            "center",
          announcementMessage: c?.announcementMessage ?? "",
          announcementMessageMobile: c?.announcementMessageMobile ?? "",
          announcementLinkUrl: c?.announcementLinkUrl ?? "",
          announcementEnabled: c?.announcementEnabled ?? true,
          aboutHeading: c?.aboutHeading ?? "",
          aboutBody: c?.aboutBody ?? "",
          aboutImageUrl: c?.aboutImageUrl ?? "",
          aboutVideoUrl: c?.aboutVideoUrl ?? "",
          featuredTiles: readRepeatable(c?.featuredTiles, featuredTileSchema),
          ctaBlocks: readRepeatable(c?.ctaBlocks, ctaBlockSchema),
          faqItems: readRepeatable(c?.faqItems, faqItemSchema),
          testimonials: readRepeatable(c?.testimonials, testimonialSchema),
          colorOverrides: (c?.colorOverrides as ColorOverrides | null) ?? {},
          uiConfig,
        }}
      />
    </div>
  );
}
