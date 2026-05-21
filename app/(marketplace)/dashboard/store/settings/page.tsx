import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StoreSettingsForm } from "@/components/dashboard/store-settings-form";
import { resolveDashboardStore } from "@/lib/stores/resolve-dashboard-store";

export const dynamic = "force-dynamic";

export default async function StoreSettingsPage({
  searchParams,
}: {
  searchParams?: { storeSlug?: string };
}) {
  const { store, userId } = await resolveDashboardStore({
    requestedSlug: searchParams?.storeSlug,
  });

  // The "owner login email" displayed on the settings form is the
  // STORE OWNER's email — for admin-edits this is the underlying
  // shop owner, NOT the admin. Pull it directly from the store row's
  // owner relation rather than the resolved-userId so the displayed
  // identity matches the actual owner.
  const owner = await prisma.user.findUnique({
    where: { id: store.ownerId },
    select: { email: true },
  });
  // Fall back to the signed-in user's email if for some reason the
  // owner row is missing — shouldn't happen given the FK, but keeps
  // the UI from breaking.
  const ownerLoginEmail =
    owner?.email ??
    (await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    }))?.email ??
    "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">ตั้งค่าร้าน</h1>
          <p className="text-sm text-muted-foreground">
            แก้ไข logo, banner, สี และข้อมูลร้านของคุณ
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

      <StoreSettingsForm
        defaultValues={{
          name: store.name,
          slug: store.slug,
          description: store.description ?? "",
          tagline: store.tagline ?? "",
          logoUrl: store.logoUrl ?? "",
          bannerUrl: store.bannerUrl ?? "",
          primaryColor: store.primaryColor ?? "#2563eb",
          customDomain: store.customDomain ?? "",
          contactEmail: store.contactEmail ?? "",
          contactPhone: store.contactPhone ?? "",
          facebookUrl: store.facebookUrl ?? "",
          lineId: store.lineId ?? "",
          platformEmailForwardTo: store.platformEmailForwardTo ?? "",
          // Template/style fields — drive storefront rendering. Empty
          // strings mean "no preference" and are passed through as
          // omit/null by the form's submit serializer.
          templateId: store.templateId ?? "",
          paletteId: store.paletteId ?? "",
          niche: store.niche ?? "",
          brandVoice:
            (store.brandVoice as "casual" | "formal" | "playful" | null) ??
            "casual",
          landingThemeVariant: store.landingThemeVariant ?? "",
          themeAccentOverride: store.themeAccentOverride ?? "",
          themeConfig: store.themeConfig ?? null,
        }}
        platformEmail={{
          address: store.platformEmail,
          verified: store.platformEmailVerified,
        }}
        ownerLoginEmail={ownerLoginEmail}
      />
    </div>
  );
}
