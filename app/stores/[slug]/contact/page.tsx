import { notFound } from "next/navigation";
import Link from "next/link";
import { Map } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatStoreAddressLines } from "@/lib/format/storeAddress";
import {
  StoreSocialIcons,
  StoreContactRows,
} from "@/components/shop/StoreSocialIcons";
import { isV12Schema } from "@/lib/multi-page-migration";
import { MultiPageRenderer } from "@/components/storefront/MultiPageRenderer";
import { ContactForm } from "./contact-form";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { isTrustStore } from "@/lib/landing/trust";
import { isBusinessModelStore } from "@/lib/landing/business-model";
import { isLifestyleStore } from "@/lib/landing/lifestyle";
import { isElectronicsTechStore } from "@/lib/landing/electronics-tech";
import { isSpecialtyStore } from "@/lib/landing/specialty";
import { FashionBeautyContactPage } from "@/components/storefront/themes/fashion-beauty/FashionBeautyContactPage";
import { TrustContactPage } from "@/components/storefront/themes/trust/TrustContactPage";
import { BusinessModelContactPage } from "@/components/storefront/themes/business-model/BusinessModelContactPage";
import { LifestyleContactPage } from "@/components/storefront/themes/lifestyle/LifestyleContactPage";
import { ElectronicsTechContactPage } from "@/components/storefront/themes/electronics-tech/ElectronicsTechContactPage";
import { SpecialtyContactPage } from "@/components/storefront/themes/specialty/SpecialtyContactPage";

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
      templateId: true,
      landingThemeVariant: true,
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

  // Each design family now has a fully bespoke contact page.
  const familyKey = { templateId: store.templateId, landingThemeVariant: store.landingThemeVariant };
  const sharedContactProps = {
    slug: params.slug,
    storeName: store.name,
    tagline: store.tagline,
    store,
    addressLines,
  };
  if (isFashionBeautyStore(familyKey)) {
    return <FashionBeautyContactPage {...sharedContactProps} />;
  }
  if (isTrustStore(familyKey)) {
    return <TrustContactPage {...sharedContactProps} />;
  }
  if (isBusinessModelStore(familyKey)) {
    return <BusinessModelContactPage {...sharedContactProps} />;
  }
  if (isLifestyleStore(familyKey)) {
    return <LifestyleContactPage {...sharedContactProps} />;
  }
  if (isElectronicsTechStore(familyKey)) {
    return <ElectronicsTechContactPage {...sharedContactProps} />;
  }
  if (isSpecialtyStore(familyKey)) {
    return <SpecialtyContactPage {...sharedContactProps} />;
  }

  return (
    <div className="container mx-auto max-w-[1200px] px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ติดต่อร้านค้า</h1>
        {store.tagline && (
          <p className="mt-1 text-sm text-muted-foreground">{store.tagline}</p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr,360px]">
        {/* Left: contact form — guest-friendly, no signin required.
            Submissions POST to /api/stores/[slug]/contact which emails
            the store's contactEmail via Resend. */}
        <ContactForm storeSlug={params.slug} storeName={store.name} />

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
