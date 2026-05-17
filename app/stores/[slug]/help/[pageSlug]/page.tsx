import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getHelpPage, HELP_PAGES, HELP_CATEGORY_LABEL } from "@/lib/helpPages";
import { effectiveTemplateId } from "@/lib/landing/legacy-slug-template";
import { templates as STORE_TEMPLATES } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";

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

// Render markdown-flavoured plain text into simple HTML.
// Supports: ## headings, **bold**, basic markdown tables, blank-line paragraphs, lists.
function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const blocks: React.ReactNode[] = [];
  let buffer: string[] = [];
  let mode: "p" | "ul" | "table" | null = null;
  let key = 0;

  function flush() {
    if (!buffer.length) return;
    if (mode === "p") {
      const html = buffer
        .join(" ")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      blocks.push(
        <p key={key++} className="my-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />,
      );
    } else if (mode === "ul") {
      blocks.push(
        <ul key={key++} className="my-3 list-disc space-y-1 pl-6">
          {buffer.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
          ))}
        </ul>,
      );
    } else if (mode === "table") {
      const rows = buffer.filter((r) => !/^\s*\|?[-:\s|]+\|?\s*$/.test(r));
      const parsed = rows.map((r) =>
        r.split("|").filter((c, i, arr) => i !== 0 && i !== arr.length - 1).map((c) => c.trim()),
      );
      blocks.push(
        <table key={key++} className="my-3 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {parsed[0]?.map((c, i) => (
                <th key={i} className="py-2 pr-4 text-left font-semibold">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsed.slice(1).map((row, i) => (
              <tr key={i} className="border-b border-gray-100">
                {row.map((c, j) => (
                  <td key={j} className="py-2 pr-4">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      );
    }
    buffer = [];
    mode = null;
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith("### ")) {
      flush();
      blocks.push(
        <h3 key={key++} className="mt-5 text-base font-semibold">{line.slice(4)}</h3>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      blocks.push(
        <h2 key={key++} className="mt-6 text-xl font-bold">{line.slice(3)}</h2>,
      );
      continue;
    }
    if (line.startsWith("- ")) {
      if (mode !== "ul") flush();
      mode = "ul";
      buffer.push(line.slice(2));
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      if (mode !== "ul") flush();
      mode = "ul";
      buffer.push(line.replace(/^\d+\.\s/, ""));
      continue;
    }
    if (line.startsWith("|")) {
      if (mode !== "table") flush();
      mode = "table";
      buffer.push(line);
      continue;
    }
    if (mode !== "p") flush();
    mode = "p";
    buffer.push(line);
  }
  flush();
  return blocks;
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
  if (!store) notFound();

  // ── Multi-page template dispatch ────────────────────────────
  // Bespoke help / size-guide / FAQ page from the template
  // registry beats the markdown-renderer body below. We pass the
  // store summary + the resolved `HelpPage` shape so the template
  // can render its own table-of-contents + size-guide tables.
  const effectiveTpl = effectiveTemplateId(store);
  const template = effectiveTpl && effectiveTpl in STORE_TEMPLATES
    ? STORE_TEMPLATES[effectiveTpl as TemplateId]
    : null;
  const TemplateHelpPage = template?.pages?.help;
  if (TemplateHelpPage) {
    return (
      <TemplateHelpPage
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
        schemaPage={page}
        pageSlug={params.pageSlug}
      />
    );
  }

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
      <article className="text-sm" style={{ color: 'var(--shop-ink)' }}>{renderContent(page.content)}</article>
    </div>
  );
}
