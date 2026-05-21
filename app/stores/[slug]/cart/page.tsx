import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StoreCartClient } from "./cart-client";
import { resolveStoreTemplate } from "@/lib/landing/template-dispatch";
import { BikiniCartAdapter } from "@/components/storefront/themes/bikini-beach/adapters";
import { EcoPackCartAdapter } from "@/components/storefront/themes/eco-pack/adapters";
import { MegaStoreCartAdapter } from "@/components/storefront/themes/mega-store/adapters";
import type { CartProps as ScaffoldCartProps } from "@/lib/templates/types";

export const dynamic = "force-dynamic";

export default async function StoreCartPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
  });
  if (!store) notFound();

  const tplId = resolveStoreTemplate(store);
  if (
    tplId === "bikini-beach" ||
    tplId === "eco-pack" ||
    tplId === "mega-store"
  ) {
    // The adapters read live cart state from zustand on the client, so
    // the server-side `items` array is intentionally empty here — same
    // pattern the existing dispatcher uses on the per-template flow.
    const scaffoldProps: ScaffoldCartProps = {
      store: {
        id: store.id,
        slug: store.slug,
        name: store.name,
        description: store.description,
        tagline: store.tagline,
        logoUrl: store.logoUrl,
        bannerUrl: store.bannerUrl,
        primaryColor: store.primaryColor,
      },
      items: [],
    };
    if (tplId === "bikini-beach") return <BikiniCartAdapter {...scaffoldProps} />;
    if (tplId === "eco-pack") return <EcoPackCartAdapter {...scaffoldProps} />;
    return <MegaStoreCartAdapter {...scaffoldProps} />;
  }

  return (
    <StoreCartClient
      store={{
        id: store.id,
        slug: store.slug,
        name: store.name,
        logoUrl: store.logoUrl,
        primaryColor: store.primaryColor,
      }}
    />
  );
}
