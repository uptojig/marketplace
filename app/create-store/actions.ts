"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSpacesConfigured, uploadBuffer } from "@/lib/storage/spaces";
import {
  getPalette,
  slugify,
  type WizardState,
} from "@/lib/store/wizard-data";

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
      paletteId: state.identity.paletteId,
      contactPhone: nonEmpty(state.identity.contact.phone),
      contactEmail: nonEmpty(state.identity.contact.email),
      lineId: nonEmpty(state.identity.contact.lineId),
      facebookUrl: nonEmpty(state.identity.contact.facebook),
      instagramUrl: nonEmpty(state.identity.contact.instagram),
      addressLine1: nonEmpty(state.identity.contact.address),
    },
  });

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
