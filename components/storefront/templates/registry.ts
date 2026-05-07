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
} as const;

export type ReactTemplateId = keyof typeof REACT_TEMPLATES;

export interface ReactTemplateSchema {
  type: "react_template_v1";
  template: ReactTemplateId | string;
  featuredProductId?: string;
  navCategories?: { label: string; category: string }[];
  gridHeading?: string;
  gridSubheading?: string;
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
