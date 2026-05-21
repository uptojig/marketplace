import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Request-deduplicated store lookup by slug.
 *
 * Both app/stores/[slug]/layout.tsx and app/stores/[slug]/page.tsx need the
 * full Store row for the same slug within a single render. React `cache()`
 * collapses identical calls in one request to a single DB query, removing the
 * duplicate `prisma.store.findUnique` round-trip on every storefront view.
 */
export const getStoreBySlug = cache((slug: string) =>
  prisma.store.findUnique({ where: { slug } }),
);
