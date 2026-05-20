import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LandingContentForm } from "@/components/landing-editor/landing-content-form";
import { readRepeatable } from "@/lib/store/landing-content";
import {
  featuredTileSchema,
  ctaBlockSchema,
  faqItemSchema,
  testimonialSchema,
  type ColorOverrides,
} from "@/lib/store/landing-content";

export const dynamic = "force-dynamic";

export default async function AdminLandingContentPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/api/auth/signin");
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") redirect("/");

  const store = await prisma.store.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      slug: true,
      name: true,
      landingContent: true,
    },
  });
  if (!store) notFound();

  const c = store.landingContent;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Link
        href={`/admin/stores/${store.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        ย้อนกลับ
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">
          Landing content — {store.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          แก้ไขเนื้อหา / รูปภาพ / สีของหน้าร้าน {store.slug} (admin override)
        </p>
      </div>

      <LandingContentForm
        endpoint={`/api/admin/stores/${store.id}/landing-content`}
        storeUrl={`/stores/${store.slug}`}
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
        }}
      />
    </div>
  );
}
