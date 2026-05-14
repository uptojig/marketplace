// Vendor-side authorization guard for /dashboard/store/* surfaces.
//
// Loads the signed-in session, resolves the store either by slug or by
// the current user's owned store, then verifies the session user owns
// that store. All failure modes (unauth / cross-tenant probe / missing
// store) collapse to either redirect("/signin?...") or notFound() so we
// never leak existence to a stranger.

import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Store } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type RequireStoreOwnerOptions = {
  // Where to bounce the user when they're not signed in. Defaults to
  // a stable vendor dashboard entrypoint so the post-login landing
  // makes sense for our target audience (store owners).
  callbackUrl?: string;
};

/**
 * Resolve the signed-in user's store and assert ownership.
 *
 * This codebase models vendors as one-store-per-user via the
 * `User.store` relation (singular). Most vendor dashboard pages don't
 * have a slug in the URL — they implicitly target the current user's
 * store. Use this overload for those pages.
 */
export async function requireStoreOwner(
  options?: RequireStoreOwnerOptions,
): Promise<Store>;

/**
 * Slug-based variant — used when a vendor surface DOES carry a slug
 * in its URL (future: per-store sub-tools). The slug must match the
 * store owned by the signed-in user; otherwise notFound() to avoid
 * leaking which slugs exist behind the auth gate.
 */
export async function requireStoreOwner(
  slug: string,
  options?: RequireStoreOwnerOptions,
): Promise<Store>;

export async function requireStoreOwner(
  slugOrOptions?: string | RequireStoreOwnerOptions,
  maybeOptions?: RequireStoreOwnerOptions,
): Promise<Store> {
  const slug =
    typeof slugOrOptions === "string" ? slugOrOptions : undefined;
  const options =
    typeof slugOrOptions === "object" ? slugOrOptions : maybeOptions;
  const callbackUrl =
    options?.callbackUrl ?? "/dashboard/store/orders";

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const store = slug
    ? await prisma.store.findUnique({ where: { slug } })
    : await prisma.store.findUnique({ where: { ownerId: userId } });

  // 404 covers two cases at once: the store really doesn't exist OR
  // someone is probing for a slug that belongs to another vendor.
  // Conflating them is intentional — a 403 would tell the prober the
  // resource is real.
  if (!store) notFound();
  if (store.ownerId !== userId) notFound();

  return store;
}
