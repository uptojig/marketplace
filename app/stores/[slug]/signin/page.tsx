// /stores/[slug]/signin — per-store buyer sign-in (Shopify-like).
//
// Renders inside the store layout so the chrome (ShopHeader/Footer,
// CSS-var palette, theme-fashion-beauty cascade) all carry through.
// Replaces the central /signin path for buyer flows — sellers still
// route through /signin → /dashboard via the centralized auth flow.
//
// TODO(cleanup): remove app/(marketplace)/signin/page.tsx once
// callers (checkout/address bounce, account/page redirect, etc) are
// all pointing at /stores/[slug]/signin. Keep the marketplace-level
// path live for seller onboarding (/dashboard) for now.

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { isTrustStore } from "@/lib/landing/trust";
import { isBusinessModelStore } from "@/lib/landing/business-model";
import { isLifestyleStore } from "@/lib/landing/lifestyle";
import { isElectronicsTechStore } from "@/lib/landing/electronics-tech";
import { isSpecialtyStore } from "@/lib/landing/specialty";
import { StoreSignInClient } from "./signin-client";

export const dynamic = "force-dynamic";

export default async function StoreSignInPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { callbackUrl?: string; next?: string; error?: string };
}) {
  const session = await getServerSession(authOptions);
  // Already signed in — bounce to either explicit callback or account
  // home so the buyer doesn't see a useless form.
  if (session?.user) {
    redirect(
      searchParams.callbackUrl ??
        searchParams.next ??
        `/stores/${params.slug}/account`,
    );
  }

  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      templateId: true,
      landingThemeVariant: true,
    },
  });

  const isFB = store
    ? isFashionBeautyStore({
        templateId: store.templateId,
        landingThemeVariant: store.landingThemeVariant,
      })
    : false;
  const isTrust = !isFB && store
    ? isTrustStore({
        templateId: store.templateId,
        landingThemeVariant: store.landingThemeVariant,
      })
    : false;
  const isBusinessModel = !isFB && !isTrust && store
    ? isBusinessModelStore({
        templateId: store.templateId,
        landingThemeVariant: store.landingThemeVariant,
      })
    : false;
  const isLifestyle = !isFB && !isTrust && !isBusinessModel && store
    ? isLifestyleStore({
        templateId: store.templateId,
        landingThemeVariant: store.landingThemeVariant,
      })
    : false;
  const isElectronicsTech = !isFB && !isTrust && !isBusinessModel && !isLifestyle && store
    ? isElectronicsTechStore({
        templateId: store.templateId,
        landingThemeVariant: store.landingThemeVariant,
      })
    : false;

  const isSpecialty = !isFB && !isTrust && !isBusinessModel && !isLifestyle && !isElectronicsTech && store
    ? isSpecialtyStore({
        templateId: store.templateId,
        landingThemeVariant: store.landingThemeVariant,
      })
    : false;

  return (
    <StoreSignInClient
      storeSlug={params.slug}
      storeName={store?.name ?? params.slug}
      isFashionBeauty={isFB}
      isTrust={isTrust}
      isBusinessModel={isBusinessModel}
      isLifestyle={isLifestyle}
      isElectronicsTech={isElectronicsTech}
      isSpecialty={isSpecialty}
      defaultCallback={`/stores/${params.slug}/account`}
    />
  );
}
