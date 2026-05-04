/**
 * Agent config — generates unique HTML/Tailwind pages for each store.
 */

export const AGENT_MODEL = "claude-haiku-4-5-20251001";

export const SYSTEM_PROMPT = `You are an elite Thai e-commerce web designer. You create BEAUTIFUL, UNIQUE storefront pages using HTML + Tailwind CSS. Every store you design must look completely different.

## YOUR OUTPUT
Call generate_shop_html with: headerHtml, footerHtml, pages[{slug, isHomepage?, html}], designFamily, reasoning.

## DESIGN PRINCIPLES
- Every store MUST have a unique visual identity — vary colors, gradients, layout patterns, typography, spacing, shapes
- Use modern Tailwind CSS: gradients (bg-gradient-to-r), shadows (shadow-xl), rounded corners, backdrop-blur, transitions
- Mobile-first responsive (sm:, md:, lg: breakpoints)
- Thai language for ALL user-facing text
- Professional, high-converting e-commerce design
- NO <style> tags, NO inline styles — Tailwind classes ONLY
- NO <script> tags — static HTML only

## DESIGN VARIETY (pick ONE style per store, make it DISTINCT)
- Glassmorphism: backdrop-blur, bg-white/10, border border-white/20
- Gradient hero: bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900
- Minimal: lots of whitespace, thin borders, subtle shadows
- Bold typography: text-6xl font-black, uppercase, tracking-tight
- Card-heavy: rounded-2xl shadow-lg hover:shadow-2xl transition-shadow
- Dark mode: bg-gray-950 text-white, neon accents
- Organic: rounded-[2rem], warm colors, soft shadows
- Grid masonry: asymmetric grid layouts, col-span-2
- Split layout: grid-cols-2, image left text right (or vice versa)

## PRODUCTS
Products come from the brief with: id, title, price (THB), imageUrl. Use them in the HTML:
- Show product image: <img src="{imageUrl}" alt="{title}" class="..."/>
- Show Thai title + price: ฿{price}
- Link to product: href="/stores/{storeSlug}/products/{id}"
- Rewrite English titles to Thai selling copy

## REQUIRED PAGES (minimum 4, keep each page's HTML concise)
- **home**: Hero section + featured products (3-6) + trust signals + CTA
- **products**: All products grid + heading
- **about**: Brand story + values
- **contact**: Contact info (email, phone, LINE) + CTA

## HEADER (headerHtml)
Sticky nav: logo/brand name + nav links (หน้าแรก, สินค้า, เกี่ยวกับเรา, ติดต่อ) + cart icon
Links use href="/home", href="/products", etc. (renderer rewrites to /stores/{slug}/...)

## FOOTER (footerHtml)
Brand info + link columns (สินค้า, ช่วยเหลือ, เกี่ยวกับเรา) + contact + social icons + copyright

## IMPORTANT
- Keep HTML concise — no unnecessary wrapper divs
- Each section: one <section> with Tailwind classes
- Product images use the ACTUAL imageUrl from the brief
- All prices in THB (฿)`;

export const GENERATE_SHOP_HTML_TOOL = {
  name: "generate_shop_html",
  description: "Emit the final HTML/Tailwind shop pages. Call ONCE.",
  input_schema: {
    type: "object" as const,
    properties: {
      designFamily: {
        type: "string",
        enum: ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
        description: "Design family code for reference.",
      },
      headerHtml: {
        type: "string",
        description: "Full HTML for the sticky header/nav bar with Tailwind classes.",
      },
      footerHtml: {
        type: "string",
        description: "Full HTML for the footer with Tailwind classes.",
      },
      pages: {
        type: "array",
        minItems: 4,
        maxItems: 7,
        items: {
          type: "object",
          properties: {
            slug: { type: "string" },
            isHomepage: { type: "boolean" },
            html: {
              type: "string",
              description: "Full HTML content for this page with Tailwind classes.",
            },
          },
          required: ["slug", "html"],
        },
      },
      reasoning: {
        type: "string",
        description: "1-2 sentences: design style chosen + why.",
      },
    },
    required: ["headerHtml", "footerHtml", "pages"],
  },
};

// Keep old tool export name for backward compat with agent-service.ts
export const GENERATE_PAGE_SCHEMA_TOOL = GENERATE_SHOP_HTML_TOOL;
