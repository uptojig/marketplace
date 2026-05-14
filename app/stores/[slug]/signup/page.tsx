// /stores/[slug]/signup — per-store buyer registration (Shopify-like).
//
// Mirrors /stores/[slug]/signin: renders inside the store layout so
// the chrome + theme-fashion-beauty cascade carries through. After
// signup the email magic link routes back to the store account.
//
// TODO(cleanup): remove app/(marketplace)/signup/page.tsx once all
// callers point at /stores/[slug]/signup. Keep marketplace-level
// path for seller onboarding (/dashboard) for now.

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { isTrustStore } from "@/lib/landing/trust";
import { isSpecialtyStore } from "@/lib/landing/specialty";
import { StoreSignUpClient } from "./signup-client";

export const dynamic = "force-dynamic";

export default async function StoreSignUpPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { callbackUrl?: string };
}) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect(searchParams.callbackUrl ?? `/stores/${params.slug}/account`);
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

  const isSpecialty = !isFB && !isTrust && (store
    ? isSpecialtyStore({
        templateId: store.templateId,
        landingThemeVariant: store.landingThemeVariant,
      })
    : false);

  return (
    <StoreSignUpClient
      storeSlug={params.slug}
      storeName={store?.name ?? params.slug}
      isFashionBeauty={isFB}
      isTrust={isTrust}
      isSpecialty={isSpecialty}
      defaultCallback={`/stores/${params.slug}/account`}
    />
  );
}
