import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { effectiveTemplateId } from "@/lib/landing/legacy-slug-template";
import { templates as STORE_TEMPLATES } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";

// /stores/[slug]/checkout → redirect to first checkout step inside
// the same store namespace. Previously redirected to /checkout/address
// (marketplace root) which left the store theme.
//
// Templates can opt out of the redirect by shipping their own
// `pages.checkout` component — useful when the template wants its
// own multi-step layout instead of the standard address → confirm
// → success flow.
export default async function CheckoutIndex({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      tagline: true,
      bannerUrl: true,
      logoUrl: true,
      primaryColor: true,
      templateId: true,
    },
  });
  if (store) {
    const effectiveTpl = effectiveTemplateId(store);
    const template = effectiveTpl && effectiveTpl in STORE_TEMPLATES
      ? STORE_TEMPLATES[effectiveTpl as TemplateId]
      : null;
    const TemplateCheckoutPage = template?.pages?.checkout;
    if (TemplateCheckoutPage) {
      return (
        <TemplateCheckoutPage
          store={{
            id: store.id,
            slug: store.slug,
            name: store.name,
            description: store.description,
            tagline: store.tagline,
            logoUrl: store.logoUrl,
            bannerUrl: store.bannerUrl,
            primaryColor: store.primaryColor,
          }}
          items={[]}
        />
      );
    }
  }

  redirect(`/stores/${params.slug}/checkout/address`);
}
