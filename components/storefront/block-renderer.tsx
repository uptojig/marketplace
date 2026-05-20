import { Suspense } from "react";
import type { StoreLandingContent } from "@prisma/client";
import {
  getBlock,
  type BlockProps,
  type BlockStoreSummary,
} from "@/lib/registry/block-registry";
import type { UIConfigBlock } from "@/lib/store/ui-config";

/**
 * Server-driven block renderer.
 *
 * Reads a list of block ids (typically from
 * `StoreLandingContent.uiConfig.pages.home`) and renders each block via
 * the dynamic registry. Every block receives the same `BlockProps` shape
 * — the store summary + the operator-edited content row + the per-instance
 * data override from the recipe entry.
 *
 * Unknown ids are silently skipped (dev-only console warning) so a stale
 * uiConfig that points at a block that has since been removed doesn't
 * break the storefront — the page just renders fewer sections.
 */

interface MultiBlockProps {
  /** Ordered list of block recipe entries — typically uiConfig.pages.home. */
  blocks: UIConfigBlock[];
  /** Store summary every block receives — kept lean to avoid leaking PII. */
  store: BlockStoreSummary;
  /** Operator-edited content row — may be null when the operator hasn't
   *  saved anything yet. Blocks fall back to their built-in defaults. */
  content: StoreLandingContent | null;
}

export function BlockRenderer({ blocks, store, content }: MultiBlockProps) {
  return (
    <>
      {blocks.map((entry, index) => {
        const Component = getBlock(entry.id);
        if (!Component) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              `[BlockRenderer] unknown block id "${entry.id}" — skipping`,
            );
          }
          return null;
        }
        const props: BlockProps = {
          store,
          content,
          data: entry.data,
          block: { id: entry.id, type: entry.type },
        };
        return (
          <Suspense
            key={`${entry.id}-${index}`}
            fallback={<BlockSkeleton />}
          >
            <Component {...props} />
          </Suspense>
        );
      })}
    </>
  );
}

/**
 * Single-block renderer — used by per-route pages (PDP / cart / catalog)
 * where uiConfig points at one block id instead of an array.
 */
interface SingleBlockProps {
  /** A single block id from uiConfig.pages.pdp / .catalog / .cart / .checkout / .about. */
  id: string;
  /** Optional per-instance data overrides (rare for single-block pages). */
  data?: Record<string, unknown>;
  /** Block category label for debug (e.g. "pdp"). */
  type?: string;
  store: BlockStoreSummary;
  content: StoreLandingContent | null;
}

export function SingleBlockRenderer({
  id,
  data,
  type = "page",
  store,
  content,
}: SingleBlockProps) {
  const Component = getBlock(id);
  if (!Component) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[SingleBlockRenderer] unknown block id "${id}" — skipping`);
    }
    return null;
  }
  const props: BlockProps = {
    store,
    content,
    data,
    block: { id, type },
  };
  return (
    <Suspense fallback={<BlockSkeleton />}>
      <Component {...props} />
    </Suspense>
  );
}

/** Lightweight placeholder while a lazy block fetches its chunk. */
function BlockSkeleton() {
  return (
    <div className="h-32 w-full animate-pulse rounded-md bg-muted/40" />
  );
}

/**
 * Adapter — convert a Prisma `Store` row into the lean `BlockStoreSummary`
 * that every block receives. Keep this in sync with the registry's prop
 * shape so the cast at the boundary is the single point of change.
 */
export function storeToSummary(store: {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string | null;
  tagline: string | null;
  description: string | null;
}): BlockStoreSummary {
  return {
    id: store.id,
    slug: store.slug,
    name: store.name,
    logoUrl: store.logoUrl,
    bannerUrl: store.bannerUrl,
    primaryColor: store.primaryColor,
    tagline: store.tagline,
    description: store.description,
  };
}
