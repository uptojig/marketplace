/**
 * React template registry — maps `landingBlocks.template` slug to a known
 * template id. Add new entries here when introducing more React-based
 * storefront templates.
 *
 * Schema shape (saved on Store.landingBlocks):
 *   {
 *     "type": "react_template_v1",
 *     "template": "mini-mops-v1",
 *     "featuredProductId": "<optional>",
 *     "navCategories": [{ "label": "...", "category": "..." }],
 *     "gridHeading": "...",
 *     "gridSubheading": "..."
 *   }
 */

export const REACT_TEMPLATES = {
  "mini-mops-v1": {
    label: "Mini Mops · Emerald Lifestyle",
    description:
      "Modern emerald e-commerce layout with hero, product grid, and footer. Tailored for home & kitchen lifestyle stores.",
  },
  "caselnw-v1": {
    label: "Case.lnw · Slate / Orange Tech",
    description:
      "Tech-forward e-commerce layout (Shadcn Studio inspired): announcement bar, sticky header, product hero with discount badge, category picker, trust strip, product grid, best-sellers row, dark footer. Tailored for phone-case / accessory stores.",
  },
} as const;

export type ReactTemplateId = keyof typeof REACT_TEMPLATES;

export interface ReactTemplateSchema {
  type: "react_template_v1";
  template: ReactTemplateId | string;
  featuredProductId?: string;
  navCategories?: { label: string; category: string }[];
  gridHeading?: string;
  gridSubheading?: string;
  /**
   * Theme accent (hex). Threaded into header/footer/CTAs so the same
   * template can render visually-distinct stores — e.g. caselnw-v1 with
   * accent="#f97316" (orange) and gapzillar-v1 with accent="#06b6d4"
   * (cyan). Each template defines its own default if omitted.
   */
  accentHex?: string;
}

export function isReactTemplateSchema(
  value: unknown,
): value is ReactTemplateSchema {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.type === "react_template_v1" && typeof v.template === "string";
}

export function isKnownReactTemplate(id: string): id is ReactTemplateId {
  return id in REACT_TEMPLATES;
}
