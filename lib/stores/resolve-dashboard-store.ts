// Resolves which store the current vendor-dashboard request targets.
//
// The vendor dashboard at /dashboard/store/* historically only let a
// signed-in user manage THEIR ONE owned store (Store.ownerId @unique).
// This helper extends that to two new audiences:
//
//   1. ADMINS — uptojig@gmail.com etc. They have role=ADMIN and need
//      to be able to switch between every approved store on the
//      platform without having to log in as each owner.
//   2. Multi-store owners (forward-looking) — today the schema enforces
//      one store per user, but the helper still returns `availableStores`
//      as an array so the picker UX is identical when we relax that
//      constraint. Today owners always see exactly one entry.
//
// Resolution rules (in order):
//   • If `requestedSlug` is present AND the user is admin OR owns it →
//     load that store.
//   • Else if the user owns at least one store → load their first owned
//     store (default).
//   • Else → redirect("/"). Signed-in user with no store + not admin
//     has nothing to do here.
//
// Cross-tenant probes (a non-admin requesting another owner's slug)
// silently fall back to the user's own store rather than 404'ing —
// the UX intent is "URL is stale / shared link, drop them on their
// own dashboard" rather than reveal whether the slug exists.
//
// Authorization for downstream data reads is a SEPARATE concern — page
// code uses the returned `store.id` to scope all queries, so a non-
// admin can't see anything outside their own store even if they could
// somehow craft an "admin"-shaped result.

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Role, Store } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ResolvedDashboardStore = {
  // The store the page should render data for. Always non-null on
  // success — the helper redirects when no store could be resolved.
  store: Store;
  // Stores the picker should offer:
  //   • admin → ALL approved stores (and the user's own store if it
  //     happens to not be approved yet, so they don't get locked out)
  //   • owner → the stores they own (today: 0 or 1; tomorrow: many)
  // Sorted by name for predictable UI ordering.
  availableStores: Pick<Store, "id" | "slug" | "name" | "logoUrl">[];
  // The signed-in user's role. Pages use this for admin-only UI bits
  // (e.g. "editing as admin" badge); not load-bearing for auth.
  isAdmin: boolean;
  // The signed-in user id — exported so callers don't need to re-fetch
  // the session just to compare ownerId.
  userId: string;
};

export type ResolveDashboardStoreOptions = {
  // The `?storeSlug=xxx` value from the page's searchParams. Pages
  // should pass this through unconditionally; the helper handles
  // missing/invalid/unauthorized cases internally.
  requestedSlug?: string;
  // Where to bounce on no-store. Defaults to "/" because that's the
  // only safe landing for signed-in users without a store + not admin.
  noStoreRedirect?: string;
};

export async function resolveDashboardStore(
  options: ResolveDashboardStoreOptions = {},
): Promise<ResolvedDashboardStore> {
  const { requestedSlug, noStoreRedirect = "/" } = options;

  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as
    | { id?: string; email?: string | null; role?: Role }
    | undefined;
  const userId = sessionUser?.id;
  const userEmail = sessionUser?.email ?? undefined;

  if (!userId && !userEmail) {
    // Not signed in. The page-level guard should have caught this
    // before calling us; collapsing to noStoreRedirect keeps us safe.
    redirect(noStoreRedirect);
  }

  // Re-load the user from the DB so we have a canonical role + id even
  // if the JWT session is stale (e.g. we just promoted someone to
  // ADMIN via /admin/users and they haven't re-logged-in yet).
  const user = await prisma.user.findUnique({
    where: userId ? { id: userId } : { email: userEmail! },
    select: { id: true, role: true },
  });
  if (!user) redirect(noStoreRedirect);

  const isAdmin = user.role === "ADMIN";

  // Owned stores. With the current schema (Store.ownerId @unique) this
  // returns 0 or 1 row, but findMany keeps the call site forward-
  // compatible for when we relax the constraint.
  const ownedStores = await prisma.store.findMany({
    where: { ownerId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true, logoUrl: true },
  });

  // Picker contents. Admins see every approved store + their own
  // (which might be PENDING/REJECTED — keep it visible so they can
  // still self-edit). Owners just see their own.
  let availableStores: ResolvedDashboardStore["availableStores"];
  if (isAdmin) {
    const approved = await prisma.store.findMany({
      where: { approvalStatus: "APPROVED" },
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, logoUrl: true },
    });
    // Merge owned (in case the admin's own store isn't APPROVED yet)
    // — dedupe by slug because the owned row would otherwise repeat.
    const seen = new Set(approved.map((s) => s.slug));
    availableStores = [
      ...approved,
      ...ownedStores.filter((s) => !seen.has(s.slug)),
    ].sort((a, b) => a.name.localeCompare(b.name));
  } else {
    availableStores = ownedStores;
  }

  // Resolve which single store this request targets.
  let store: Store | null = null;

  if (requestedSlug) {
    const candidate = await prisma.store.findUnique({
      where: { slug: requestedSlug },
    });
    if (candidate) {
      const userOwnsIt = candidate.ownerId === user.id;
      if (isAdmin || userOwnsIt) {
        store = candidate;
      }
      // Non-admin requesting another owner's slug → silently fall
      // through to the owner's default store below. We never reveal
      // that the slug exists, but we also don't bounce them off the
      // dashboard entirely — a stale shared link should land them on
      // a useful page, not a 404.
    }
  }

  if (!store) {
    if (ownedStores.length > 0) {
      // Owner default — first owned store.
      store = await prisma.store.findUnique({
        where: { id: ownedStores[0].id },
      });
    } else if (isAdmin && availableStores.length > 0) {
      // Admin with no owned store of their own — use the first store
      // in the picker so the dashboard is at least usable.
      store = await prisma.store.findUnique({
        where: { id: availableStores[0].id },
      });
    }
  }

  if (!store) {
    // Signed-in user with no owned store and either not admin OR no
    // stores exist anywhere on the platform yet.
    redirect(noStoreRedirect);
  }

  return {
    store,
    availableStores,
    isAdmin,
    userId: user.id,
  };
}
