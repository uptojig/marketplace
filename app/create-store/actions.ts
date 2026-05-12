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
  | { ok: true; slug: string }
  | { ok: false; error: string };

export async function createStoreFromWizard(
  state: WizardState,
): Promise<CreateStoreResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "ต้องเข้าสู่ระบบก่อนสร้างร้าน" };
  }
  const userId = session.user.id;

  const name = state.identity.name.trim();
  if (!name) return { ok: false, error: "ต้องระบุชื่อร้าน" };

  const existing = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (existing) {
    return { ok: false, error: `คุณมีร้าน "${existing.name}" อยู่แล้ว` };
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
      ownerId: userId,
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

  return { ok: true, slug: store.slug };
}

export async function createStoreAndRedirect(state: WizardState) {
  const result = await createStoreFromWizard(state);
  if (!result.ok) {
    throw new Error(result.error);
  }
  redirect(`/seller/dashboard?store=${result.slug}`);
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
