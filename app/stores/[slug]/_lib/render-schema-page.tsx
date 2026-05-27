/**
 * Shared renderer for schema-driven content pages
 * (faq / shipping / returns / privacy / terms / etc).
 *
 * Reads the v12 multi-page schema, finds the page with the requested
 * slug, and hands it to MultiPageRenderer. Falls back to a default
 * body (rich React fallback OR plain hint text) when the agent hasn't
 * emitted that page yet.
 *
 * The fallback purposely doesn't 404 — these pages are linked from
 * the footer of EVERY store, so a 404 there breaks UX and fails
 * payment-gateway merchant approval.
 */
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isV12Schema } from "@/lib/multi-page-migration";
import { MultiPageRenderer } from "@/components/storefront/MultiPageRenderer";
import { effectiveTemplateId } from "@/lib/landing/legacy-slug-template";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { isTrustStore } from "@/lib/landing/trust";
import { isBusinessModelStore } from "@/lib/landing/business-model";
import { isLifestyleStore } from "@/lib/landing/lifestyle";
import { isElectronicsTechStore } from "@/lib/landing/electronics-tech";
import { isSpecialtyStore } from "@/lib/landing/specialty";
import { isNeonStore } from "@/lib/landing/neon";
import { isMysticMuStore } from "@/lib/landing/mystic-mu";
import { isVectorBazaarStore } from "@/lib/landing/vector-bazaar";
import { isPhotoVaultStore } from "@/lib/landing/photo-vault";
import { PolicyShell as NeonFestivalPolicyShell } from "@/components/storefront/themes/neon-festival/PolicyShell";
import { PolicyShell as MysticMuPolicyShell } from "@/components/storefront/themes/mystic-mu-th/PolicyShell";
import { PolicyShell as VectorBazaarPolicyShell } from "@/components/storefront/themes/vector-bazaar-th/PolicyShell";
import { PolicyShell as PhotoVaultPolicyShell } from "@/components/storefront/themes/photo-vault-th/PolicyShell";
import {
  FashionBeautyPolicyShell,
  fashionBeautyPolicyHeading,
} from "@/components/storefront/themes/fashion-beauty/FashionBeautyPolicyShell";
import {
  TrustPolicyShell,
  trustPolicyHeading,
} from "@/components/storefront/themes/trust/TrustPolicyShell";
import {
  BusinessModelPolicyShell,
  businessModelPolicyHeading,
} from "@/components/storefront/themes/business-model/BusinessModelPolicyShell";
import {
  LifestylePolicyShell,
  lifestylePolicyHeading,
} from "@/components/storefront/themes/lifestyle/LifestylePolicyShell";
import {
  ElectronicsTechPolicyShell,
  electronicsTechPolicyHeading,
} from "@/components/storefront/themes/electronics-tech/ElectronicsTechPolicyShell";
import {
  SpecialtyPolicyShell,
  specialtyPolicyHeading,
} from "@/components/storefront/themes/specialty/SpecialtyPolicyShell";
import {
  PigmentStudioPolicyShell,
  pigmentStudioPolicyHeading,
} from "@/components/storefront/themes/pigment-studio/chrome/PolicyShell";

interface SchemaPageProps {
  storeSlug: string;
  pageSlug: string;
  fallbackTitle: string;
  fallbackHint?: string;
  /** Optional rich fallback rendered when the store's schema doesn't
   *  emit this page. Use this for legally / commercially important
   *  pages (returns / shipping / privacy / terms) so the buyer always
   *  sees real content, not a "ยังไม่มีเนื้อหา" stub. */
  fallbackBody?: ReactNode;
}

/**
 * Wrap inner content in the matching family's bespoke policy shell.
 * Returns the inner unchanged when the store doesn't match any
 * family (graceful fall-through).
 */
function wrapInFamilyShell(
  inner: ReactNode,
  store: { templateId: string | null; landingThemeVariant: string | null; slug: string },
  pageSlug: string,
  fallbackTitle: string,
): ReactNode {
  const familyKey = {
    templateId: effectiveTemplateId(store),
    landingThemeVariant: store.landingThemeVariant,
  };
  if (isFashionBeautyStore(familyKey)) {
    const h = fashionBeautyPolicyHeading(pageSlug, fallbackTitle);
    return (
      <FashionBeautyPolicyShell slug={store.slug} title={h.title} eyebrow={h.eyebrow}>
        {inner}
      </FashionBeautyPolicyShell>
    );
  }
  if (isTrustStore(familyKey)) {
    const h = trustPolicyHeading(pageSlug, fallbackTitle);
    return (
      <TrustPolicyShell slug={store.slug} title={h.title} eyebrow={h.eyebrow}>
        {inner}
      </TrustPolicyShell>
    );
  }
  if (isBusinessModelStore(familyKey)) {
    const h = businessModelPolicyHeading(pageSlug, fallbackTitle);
    return (
      <BusinessModelPolicyShell slug={store.slug} title={h.title} eyebrow={h.eyebrow}>
        {inner}
      </BusinessModelPolicyShell>
    );
  }
  if (isLifestyleStore(familyKey)) {
    const h = lifestylePolicyHeading(pageSlug, fallbackTitle);
    return (
      <LifestylePolicyShell slug={store.slug} title={h.title} eyebrow={h.eyebrow}>
        {inner}
      </LifestylePolicyShell>
    );
  }
  if (isElectronicsTechStore(familyKey)) {
    const h = electronicsTechPolicyHeading(pageSlug, fallbackTitle);
    return (
      <ElectronicsTechPolicyShell slug={store.slug} title={h.title} eyebrow={h.eyebrow}>
        {inner}
      </ElectronicsTechPolicyShell>
    );
  }
  if (familyKey.templateId === 'pigment-studio') {
    const h = pigmentStudioPolicyHeading(pageSlug, fallbackTitle);
    return (
      <PigmentStudioPolicyShell slug={store.slug} title={h.title} eyebrow={h.eyebrow}>
        {inner}
      </PigmentStudioPolicyShell>
    );
  }
  if (isSpecialtyStore(familyKey)) {
    const h = specialtyPolicyHeading(pageSlug, fallbackTitle);
    return (
      <SpecialtyPolicyShell slug={store.slug} title={h.title} eyebrow={h.eyebrow}>
        {inner}
      </SpecialtyPolicyShell>
    );
  }
  if (isNeonStore(familyKey)) {
    return (
      <NeonFestivalPolicyShell title={fallbackTitle}>
        {inner}
      </NeonFestivalPolicyShell>
    );
  }
  if (isMysticMuStore(familyKey)) {
    return (
      <MysticMuPolicyShell title={fallbackTitle}>
        {inner}
      </MysticMuPolicyShell>
    );
  }
  if (isVectorBazaarStore(familyKey)) {
    return (
      <VectorBazaarPolicyShell title={fallbackTitle}>
        {inner}
      </VectorBazaarPolicyShell>
    );
  }
  if (isPhotoVaultStore(familyKey)) {
    return (
      <PhotoVaultPolicyShell title={fallbackTitle}>
        {inner}
      </PhotoVaultPolicyShell>
    );
  }
  return inner;
}

export async function renderSchemaPage({
  storeSlug,
  pageSlug,
  fallbackTitle,
  fallbackHint,
  fallbackBody,
}: SchemaPageProps) {
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
  });
  if (!store) notFound();

  if (
    store.landingBlocks &&
    typeof store.landingBlocks === "object" &&
    isV12Schema(store.landingBlocks)
  ) {
    const hasPage = store.landingBlocks.pages.some(
      (p: { slug: string }) => p.slug === pageSlug,
    );
    if (hasPage) {
      // Same active-product filter as the homepage so deleted
      // product cards don't render on faq / shipping / returns
      // / privacy / terms (those pages mostly don't carry
      // OfferGrids, but cheap insurance).
      const activeRows = await prisma.product.findMany({
        where: { storeId: store.id, active: true },
        select: { externalProductId: true },
      });
      const activeProductIds = new Set(
        activeRows
          .map((r) => r.externalProductId)
          .filter((s): s is string => !!s),
      );
      const inner = (
        <MultiPageRenderer
          schema={store.landingBlocks}
          pageSlug={pageSlug}
          storeSlug={store.slug}
          storeName={store.name}
          // Apply the operator-uploaded banner so faq/shipping/etc.
          // hero panels swap their placeholder image too.
          storeBannerUrl={store.bannerUrl}
          activeProductIds={activeProductIds}
        />
      );
      return wrapInFamilyShell(inner, store, pageSlug, fallbackTitle);
    }
  }

  const fallback = fallbackBody ?? (
    <p className="text-base leading-relaxed" style={{ color: "var(--shop-ink-muted)" }}>
      {fallbackHint ??
        "ยังไม่มีเนื้อหาในหน้านี้ — สร้าง landing page ใหม่ใน admin เพื่อเพิ่มเนื้อหาอัตโนมัติ"}
    </p>
  );

  const wrapped = wrapInFamilyShell(fallback, store, pageSlug, fallbackTitle);
  if (wrapped !== fallback) {
    return wrapped;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--shop-ink)" }}>
        {fallbackTitle}
      </h1>
      {fallback}
    </div>
  );
}
