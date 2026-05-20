import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  provisionPlatformEmail,
  updatePlatformEmailForward,
} from "@/lib/email/provision";
import {
  templateFieldsSchema,
  deriveLandingThemeVariant,
  LANDING_CLEAR_PATCH,
} from "@/lib/store/template-fields";

const imageUrlSchema = z
  .union([z.string().url(), z.literal("")])
  .optional();

const schema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "Slug must be lowercase letters, numbers, and dashes"),
  description: z.string().max(500).optional().default(""),
  tagline: z.string().max(120).optional().default(""),
  logoUrl: imageUrlSchema,
  bannerUrl: imageUrlSchema,
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color")
    .optional(),
  customDomain: z.string().max(253).optional().or(z.literal("")).optional(),
  contactEmail: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .or(z.literal(""))
    .optional(),
  contactPhone: z.string().max(30).optional().or(z.literal("")).optional(),
  facebookUrl: z
    .string()
    .url("ต้องเป็น URL ที่ขึ้นต้นด้วย https://")
    .or(z.literal(""))
    .optional(),
  lineId: z.string().max(50).optional().or(z.literal("")).optional(),
  platformEmailForwardTo: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .or(z.literal(""))
    .optional(),
  // Wizard-parity template fields — vendor can change template/palette/
  // niche/brandVoice/landingThemeVariant from the dashboard settings page.
  // Validation list is shared with admin via lib/store/template-fields.ts.
  templateId: templateFieldsSchema.shape.templateId,
  paletteId: templateFieldsSchema.shape.paletteId,
  niche: templateFieldsSchema.shape.niche,
  brandVoice: templateFieldsSchema.shape.brandVoice,
  landingThemeVariant: z
    .string()
    .max(40)
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      const t = v.trim();
      return t === "" ? null : t;
    }),
});

async function getStore(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { store: true },
  });
  return { user, store: user?.store ?? null };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { store } = await getStore(session.user.email);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json(store);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user, store } = await getStore(session.user.email);
  if (!user || !store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const {
    name,
    slug,
    description,
    tagline,
    logoUrl,
    bannerUrl,
    primaryColor,
    customDomain,
    contactEmail,
    contactPhone,
    facebookUrl,
    lineId,
    platformEmailForwardTo,
    templateId,
    paletteId,
    niche,
    brandVoice,
    landingThemeVariant,
  } = parsed.data;

  // Check slug uniqueness (allow own slug)
  if (slug !== store.slug) {
    const slugInUse = await prisma.store.findUnique({ where: { slug } });
    if (slugInUse) {
      return NextResponse.json({ error: { slug: ["Slug already taken"] } }, { status: 409 });
    }
  }

  // Check custom domain uniqueness (allow own domain)
  if (customDomain && customDomain !== store.customDomain) {
    const domainInUse = await prisma.store.findFirst({ where: { customDomain } });
    if (domainInUse) {
      return NextResponse.json({ error: { customDomain: ["Domain already in use"] } }, { status: 409 });
    }
  }

  // Auto-derive landingThemeVariant from templates[templateId].group
  // when vendor sent templateId but NOT landingThemeVariant — keeps the
  // family detectors in sync. Explicit landingThemeVariant in the same
  // PATCH always wins (operator override).
  const derivedVariant = deriveLandingThemeVariant({
    templateId,
    landingThemeVariant,
  });

  // Build the data object incrementally so we only touch columns the
  // vendor actually sent. Wizard-parity columns are conditionally
  // included so re-saving the settings page without picking a new
  // template doesn't reset templateId/paletteId/niche/brandVoice to
  // undefined → null.
  const data: Prisma.StoreUpdateInput = {
    name,
    slug,
    description: description ?? "",
    tagline: tagline ?? "",
    logoUrl: logoUrl || null,
    bannerUrl: bannerUrl || null,
    primaryColor: primaryColor ?? store.primaryColor,
    customDomain: customDomain || null,
    contactEmail: contactEmail || null,
    contactPhone: contactPhone || null,
    facebookUrl: facebookUrl || null,
    lineId: lineId || null,
    ...(templateId !== undefined ? { templateId } : {}),
    ...(paletteId !== undefined ? { paletteId } : {}),
    ...(niche !== undefined ? { niche } : {}),
    ...(brandVoice !== undefined ? { brandVoice } : {}),
    ...(landingThemeVariant !== undefined
      ? { landingThemeVariant }
      : derivedVariant !== undefined
        ? { landingThemeVariant: derivedVariant }
        : {}),
  };

  // Mirror admin PATCH: clear AI-generated landingBlocks when vendor
  // explicitly picks a new theme variant (non-null) OR changes templateId
  // at all (skin-only OR full-app). Reason: landingBlocks is rendered by
  // the LAYOUT dispatcher in app/stores/[slug]/layout.tsx BEFORE the
  // family detector / StoreRenderer chain, so stale JSON shadows the new
  // template regardless of whether the new template has its own
  // chrome/pages adapter.
  const variantSet =
    landingThemeVariant !== undefined &&
    landingThemeVariant !== null &&
    landingThemeVariant.length > 0;
  const templateIdChanged =
    templateId !== undefined && templateId !== store.templateId;
  if (variantSet || templateIdChanged) {
    Object.assign(data, LANDING_CLEAR_PATCH);
  }

  const updated = await prisma.store.update({
    where: { id: store.id },
    data,
  });

  // Auto-provision platform email when customDomain transitions null/empty → set,
  // and propagate forwardTo changes to the alias provider. Both are best-effort —
  // failures don't roll back the settings save but surface as warnings.
  const warnings: string[] = [];

  const customDomainSetNow =
    !!customDomain && customDomain !== "" && !store.customDomain;
  if (customDomainSetNow && !updated.platformEmail) {
    try {
      await provisionPlatformEmail(updated.id);
    } catch (err) {
      warnings.push(
        err instanceof Error
          ? `อีเมลของระบบ: ${err.message}`
          : "ออกอีเมลของระบบไม่สำเร็จ"
      );
    }
  }

  const desiredForwardTo = platformEmailForwardTo?.trim();
  if (
    desiredForwardTo &&
    desiredForwardTo !== updated.platformEmailForwardTo
  ) {
    try {
      await updatePlatformEmailForward(updated.id, desiredForwardTo);
    } catch (err) {
      warnings.push(
        err instanceof Error
          ? `อัปเดตปลายทาง forward: ${err.message}`
          : "อัปเดต forward target ไม่สำเร็จ"
      );
    }
  }

  // Re-read so the response reflects post-provision/sync state.
  const fresh = await prisma.store.findUnique({ where: { id: updated.id } });
  return NextResponse.json({ ...(fresh ?? updated), warnings });
}
