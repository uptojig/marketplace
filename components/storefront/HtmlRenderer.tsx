/**
 * HtmlRenderer — renders AI-generated HTML/Tailwind pages.
 *
 * Each store gets a unique design because the agent generates
 * raw HTML + Tailwind classes directly (not JSON schema blocks).
 *
 * Security: HTML is admin/AI-generated, not user-submitted.
 */

interface HtmlPage {
  slug: string;
  isHomepage?: boolean;
  html: string;
}

interface HtmlShopSchema {
  type: "html";
  designFamily?: string;
  headerHtml: string;
  footerHtml: string;
  pages: HtmlPage[];
}

interface Props {
  schema: HtmlShopSchema;
  pageSlug?: string;
  storeSlug: string;
}

/**
 * Rewrite relative links in HTML to be store-scoped.
 * /products → /stores/{slug}/products
 * /home → /stores/{slug}
 */
function rewriteLinks(html: string, storeSlug: string): string {
  return html.replace(
    /href="\/([^"]*?)"/g,
    (match, path) => {
      if (path === "home" || path === "") {
        return `href="/stores/${storeSlug}"`;
      }
      // Don't rewrite if already scoped to /stores/
      if (path.startsWith("stores/")) return match;
      // Don't rewrite external-looking paths
      if (path.startsWith("http")) return match;
      return `href="/stores/${storeSlug}/${path}"`;
    },
  );
}

export function HtmlRenderer({ schema, pageSlug = "", storeSlug }: Props) {
  // Find the matching page
  const slug = pageSlug === "" || pageSlug === "home" ? "" : pageSlug;
  const page = slug === ""
    ? schema.pages.find((p) => p.isHomepage) ?? schema.pages[0]
    : schema.pages.find((p) => p.slug === slug);

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col">
        <div
          dangerouslySetInnerHTML={{ __html: rewriteLinks(schema.headerHtml, storeSlug) }}
        />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-lg">
            <h1 className="text-6xl font-bold text-stone-900 mb-4">404</h1>
            <p className="text-xl text-stone-500 mb-8">ไม่พบหน้านี้</p>
            <a
              href={`/stores/${storeSlug}`}
              className="inline-block px-6 py-3 bg-stone-900 text-white rounded hover:bg-stone-800 transition"
            >
              กลับหน้าแรก
            </a>
          </div>
        </main>
        <div
          dangerouslySetInnerHTML={{ __html: rewriteLinks(schema.footerHtml, storeSlug) }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div
        dangerouslySetInnerHTML={{ __html: rewriteLinks(schema.headerHtml, storeSlug) }}
      />
      <main
        className="flex-1"
        dangerouslySetInnerHTML={{ __html: rewriteLinks(page.html, storeSlug) }}
      />
      <div
        dangerouslySetInnerHTML={{ __html: rewriteLinks(schema.footerHtml, storeSlug) }}
      />
    </div>
  );
}

/** Type guard: is this an HTML shop schema? */
export function isHtmlSchema(data: unknown): data is HtmlShopSchema {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return d.type === "html" && typeof d.headerHtml === "string" && Array.isArray(d.pages);
}
