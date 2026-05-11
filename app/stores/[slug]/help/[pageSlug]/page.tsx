import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getHelpPage, HELP_PAGES, HELP_CATEGORY_LABEL } from "@/lib/helpPages";
import { HelpContent } from "@/components/storefront/HelpContent";

export const dynamic = "force-static";

export function generateStaticParams() {
  return HELP_PAGES.map((p) => ({ pageSlug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; pageSlug: string };
}) {
  const page = getHelpPage(params.pageSlug);
  if (!page) return { title: "ไม่พบหน้าที่ค้นหา" };
  return { title: `${page.title} — ${params.slug}` };
}

export default async function StoreHelpPage({
  params,
}: {
  params: { slug: string; pageSlug: string };
}) {
  const page = getHelpPage(params.pageSlug);
  if (!page) notFound();

  // Verify the store actually exists (otherwise the layout above would 404 anyway)
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: { name: true },
  });
  if (!store) notFound();

  return (
    <div className="container max-w-3xl py-8">
      <nav className="mb-4 flex items-center gap-1 text-xs" style={{ color: 'var(--shop-ink-muted)' }}>
        <Link href={`/stores/${params.slug}`} className="hover:underline">
          {store.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{HELP_CATEGORY_LABEL[page.category]}</span>
        <ChevronRight className="h-3 w-3" />
        <span style={{ color: 'var(--shop-ink)' }}>{page.title}</span>
      </nav>
      <h1 className="text-2xl font-bold">{page.title}</h1>
      <article className="text-sm" style={{ color: 'var(--shop-ink)' }}>
        <HelpContent content={page.content} />
      </article>
    </div>
  );
}
