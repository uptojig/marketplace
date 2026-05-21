"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSpacesConfigured, uploadBuffer } from "@/lib/storage/spaces";
import { enrichCJProduct } from "@/lib/suppliers/cj/enrich";
import {
  getPalette,
  slugify,
  type WizardState,
} from "@/lib/store/wizard-data";
import { deriveLandingThemeVariant } from "@/lib/store/template-fields";
import { seedUiConfigForTemplate } from "@/lib/store/seed-ui-config";

/** Hard cap on Phase 3 picks. CJ throttles ~1 req/sec, so 20 selected
 *  → ~22s wizard submit. Anything bigger (e.g. the 50-pack) imports
 *  the first 20 inline + the rest are queued for follow-up via the
 *  /admin/stores enrichment chain. */
const MAX_SYNC_IMPORT = 20;
const CJ_RATE_LIMIT_MS = 1100;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type CreateStoreResult =
  | { ok: true; slug: string; storeId: string; ownedBySession: boolean }
  | { ok: false; error: string };

export async function createStoreFromWizard(
  state: WizardState,
): Promise<CreateStoreResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "ต้องเข้าสู่ระบบก่อนสร้างร้าน" };
  }
  const sessionUserId = session.user.id;

  // JWT may reference a User row that's been deleted (e.g. after data
  // migration or admin cleanup). Hitting prisma.store.create() with a
  // stale userId throws an opaque Store_ownerId_fkey FK violation — catch
  // it here and ask the user to re-auth instead.
  const sessionUser = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: { id: true, role: true, name: true },
  });
  if (!sessionUser) {
    return {
      ok: false,
      error: "เซสชันหมดอายุ กรุณาออกจากระบบและเข้าสู่ระบบใหม่",
    };
  }

  const name = state.identity.name.trim();
  if (!name) return { ok: false, error: "ต้องระบุชื่อร้าน" };

  // 1 user = 1 store at the schema level (Store.ownerId @unique). Vendors hit
  // this guard and get an explicit error. Admins running the wizard for an
  // extra store get a fresh emailless User attached as owner — Postgres
  // treats NULL emails as distinct, so the @unique on User.email holds and
  // each new store still gets its own ownerId.
  const existing = await prisma.store.findUnique({ where: { ownerId: sessionUserId } });
  let ownerId = sessionUserId;
  if (existing) {
    if (sessionUser.role !== "ADMIN") {
      return { ok: false, error: `คุณมีร้าน "${existing.name}" อยู่แล้ว` };
    }
    const proxyOwner = await prisma.user.create({
      data: {
        email: null,
        name: name,
        role: "VENDOR",
      },
      select: { id: true },
    });
    ownerId = proxyOwner.id;
  }

  const baseSlug = slugify(name);
  const slug = await findAvailableSlug(baseSlug);

  const [logoUrl, bannerUrl] = await Promise.all([
    uploadDataUrl(state.identity.logoDataUrl, "logos", "logo"),
    uploadDataUrl(state.identity.bannerDataUrl, "banners", "banner"),
  ]);

  const palette = getPalette(state.identity.paletteId);

  // Map the chosen template's group to landingThemeVariant so the store
  // is explicitly committed to a theme at create time. The is<Theme>Store
  // detectors already infer family from templateId, but writing the
  // variant out lets the admin theme picker show "what theme are we on"
  // and lets operators override later without changing templateId.
  // Wizard always derives (no operator-supplied landingThemeVariant in
  // its WizardState), so we pass templateId only and the helper returns
  // the canonical group (or undefined if templateId is empty / unknown).
  const templateGroup =
    deriveLandingThemeVariant({
      templateId: state.layout.templateId ?? undefined,
    }) ?? null;

  const store = await prisma.store.create({
    data: {
      ownerId,
      slug,
      name,
      description: state.identity.description.trim() || null,
      logoUrl,
      bannerUrl,
      primaryColor: palette.primary,
      niche: state.identity.niche,
      brandVoice: state.identity.brandVoice,
      templateId: state.layout.templateId,
      landingThemeVariant: templateGroup,
      paletteId: state.identity.paletteId,
      contactPhone: nonEmpty(state.identity.contact.phone),
      contactEmail: nonEmpty(state.identity.contact.email),
      lineId: nonEmpty(state.identity.contact.lineId),
      facebookUrl: nonEmpty(state.identity.contact.facebook),
      instagramUrl: nonEmpty(state.identity.contact.instagram),
      // TODO(schema): no Store.tiktokUrl column yet — tiktok contact dropped at create time.
      addressLine1: nonEmpty(state.identity.contact.address),
    },
  });

  // Seed the per-store data-driven UI recipe. Without this row the
  // BlockRenderer chain falls back to the legacy family-detector path
  // (which means the 47 shadcn-studio blocks composed by
  // `lib/registry/block-registry.tsx` never render for the store).
  //
  // Soft-fail by design: if the seed function returns a config that
  // somehow fails the StoreLandingContent upsert (e.g. unique-constraint
  // race against a parallel write), the wizard MUST still complete —
  // the operator can re-seed from /admin/stores/[id]/landing-content.
  // We log instead of throwing for the same reason.
  try {
    const uiConfig = seedUiConfigForTemplate(
      state.layout.templateId,
      state.identity.paletteId,
    );
    if (uiConfig) {
      await prisma.storeLandingContent.upsert({
        where: { storeId: store.id },
        create: {
          storeId: store.id,
          uiConfig: uiConfig as Prisma.InputJsonValue,
        },
        update: {
          uiConfig: uiConfig as Prisma.InputJsonValue,
        },
      });
    }
  } catch (err) {
    console.warn(
      `[wizard] uiConfig seed failed for store ${store.id} (template=${state.layout.templateId ?? "null"}):`,
      err instanceof Error ? err.message : err,
    );
  }

  // Phase 3 — import the products the merchant picked. Two-phase:
  // (1) create lightweight Product stubs synchronously from the
  //     selectedProducts payload (title / price / image already fetched
  //     by the wizard's API route), so the dashboard never opens empty.
  // (2) call enrichCJProduct() per row to fill in description, full
  //     gallery, variants, materials, etc. Rate-limited to ~1 req/sec
  //     because CJ throttles /product/query. Capped at 20 to keep
  //     wizard submit under ~30s — anything beyond becomes a stub
  //     that the operator enriches later via /admin/stores.
  const picks = state.products.selectedProducts.slice(0, MAX_SYNC_IMPORT);
  const stubBacklog = state.products.selectedProducts.slice(MAX_SYNC_IMPORT);

  const stubProductIds: Array<{ id: string; externalProductId: string }> = [];
  for (const p of picks) {
    if (!p.externalProductId) continue;
    try {
      const created = await prisma.product.create({
        data: {
          storeId: store.id,
          supplier: "CJ",
          externalProductId: p.externalProductId,
          title: p.title,
          priceTHB: p.priceTHB,
          imageUrl: p.imageUrl,
          active: true,
        },
        select: { id: true, externalProductId: true },
      });
      stubProductIds.push({
        id: created.id,
        externalProductId: created.externalProductId!,
      });
    } catch (err) {
      // Don't fail the whole wizard for one bad row — keep going.
      console.error(
        `[wizard] stub create failed for ${p.externalProductId}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  // Backlog: stubs only (no enrichment) so the operator can finish via
  // /admin/stores. Same rate-limit isn't needed since we're not hitting
  // CJ — just inserts.
  for (const p of stubBacklog) {
    if (!p.externalProductId) continue;
    try {
      await prisma.product.create({
        data: {
          storeId: store.id,
          supplier: "CJ",
          externalProductId: p.externalProductId,
          title: p.title,
          priceTHB: p.priceTHB,
          imageUrl: p.imageUrl,
          active: true,
        },
      });
    } catch {
      // ignore — same rationale as above
    }
  }

  // Enrich the synchronous batch. Soft-fail per product so a single
  // CJ outage doesn't kill the wizard submit.
  for (let i = 0; i < stubProductIds.length; i += 1) {
    const { id, externalProductId } = stubProductIds[i];
    try {
      await enrichCJProduct(id, externalProductId);
    } catch (err) {
      console.error(
        `[wizard] enrich failed for ${externalProductId}:`,
        err instanceof Error ? err.message : err,
      );
    }
    if (i < stubProductIds.length - 1) {
      await sleep(CJ_RATE_LIMIT_MS);
    }
  }

  return {
    ok: true,
    slug: store.slug,
    storeId: store.id,
    ownedBySession: ownerId === sessionUserId,
  };
}

export async function createStoreAndRedirect(state: WizardState) {
  const result = await createStoreFromWizard(state);
  if (!result.ok) {
    throw new Error(result.error);
  }
  // Owner === session user → vendor seller view at /dashboard.
  // Owner is a proxy emailless User (admin running the wizard for an
  // extra store) → admin store-detail view, since /dashboard is hard-
  // wired to render only the session user's own store.
  if (result.ownedBySession) {
    redirect(`/dashboard?store=${result.slug}`);
  } else {
    redirect(`/admin/stores/${result.storeId}`);
  }
}

// ─── helpers ────────────────────────────────────────────────────────────────

function nonEmpty(s: string): string | null {
  const v = s.trim();
  return v.length > 0 ? v : null;
}

async function findAvailableSlug(base: string): Promise<string> {
  let candidate = base;
  for (let i = 1; i < 50; i++) {
    const taken = await prisma.store.findUnique({ where: { slug: candidate } });
    if (!taken) return candidate;
    candidate = `${base}-${i + 1}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

async function uploadDataUrl(
  dataUrl: string | null,
  prefix: string,
  baseName: string,
): Promise<string | null> {
  if (!dataUrl) return null;
  if (!isSpacesConfigured()) return null;
  const match = /^data:([a-z0-9.+-]+\/[a-z0-9.+-]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) return null;
  const contentType = match[1];
  const buf = Buffer.from(match[2], "base64");
  const ext = contentType.split("/")[1]?.split(";")[0] ?? "bin";
  const filename = `${baseName}.${ext}`;
  try {
    const { publicUrl } = await uploadBuffer({
      prefix,
      filename,
      contentType,
      body: buf,
    });
    return publicUrl;
  } catch {
    return null;
  }
}
