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
import { tearDownDeploymentNow } from "@/lib/provisioner/orchestrator";
import {
  templateFieldsSchema,
  deriveLandingThemeVariant,
  LANDING_CLEAR_PATCH,
} from "@/lib/store/template-fields";

const slugRegex = /^[a-z0-9฀-๿](?:[a-z0-9฀-๿-]*[a-z0-9฀-๿])?$/;
const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

// Empty strings → null so admins can clear optional fields.
const trimNullable = z
  .string()
  .max(500)
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    const t = v.trim();
    return t === "" ? null : t;
  });

const updateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(slugRegex, "Slug ใช้ได้เฉพาะ a-z, 0-9, ภาษาไทย และ -")
    .optional(),
  description: trimNullable,
  logoUrl: trimNullable,
  bannerUrl: trimNullable,
  tagline: trimNullable,
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "ใส่สี HEX เช่น #2563eb")
    .optional()
    .or(z.literal("").transform(() => null))
    .nullable(),
  customDomain: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      const t = v.trim().toLowerCase();
      return t === "" ? null : t;
    })
    .refine((v) => v == null || domainRegex.test(v), "โดเมนไม่ถูกต้อง (เช่น shop.example.com)"),
  logoPosition: z.enum(["left", "center"]).optional(),
  menuPosition: z.enum(["left", "center", "right"]).optional(),
  // Storefront theme — drives which <ThemeProductHero> / homepage layout
  // renders on the buyer-facing pages. See lib/landing/<theme>.ts for the
  // detectors. Empty string = clear (fall through to the default theme).
  // Validation list is in lib/store/template-fields.ts; we keep the
  // empty-string-to-null transform here so admins can clear it.
  landingThemeVariant: z
    .string()
    .max(40)
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      const t = v.trim();
      return t === "" ? null : t;
    }),
  // Wizard-parity template fields — accepted at PATCH so admins can
  // change template/palette/niche/brandVoice after store creation. See
  // lib/store/template-fields.ts for the allowed-value validation.
  templateId: templateFieldsSchema.shape.templateId,
  paletteId: templateFieldsSchema.shape.paletteId,
  niche: templateFieldsSchema.shape.niche,
  brandVoice: templateFieldsSchema.shape.brandVoice,
  contactEmail: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      const t = v.trim();
      return t === "" ? null : t;
    })
    .refine((v) => v == null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "อีเมลไม่ถูกต้อง"),
  contactPhone: trimNullable,
  facebookUrl: trimNullable,
  messengerUrl: trimNullable,
  twitterUrl: trimNullable,
  instagramUrl: trimNullable,
  websiteUrl: trimNullable,
  lineId: trimNullable,
  companyName: trimNullable,
  taxId: trimNullable,
  addressLine1: trimNullable,
  addressLine2: trimNullable,
  subdistrict: trimNullable,
  district: trimNullable,
  province: trimNullable,
  postalCode: trimNullable,
  country: trimNullable,
  // Platform-issued email (forwarding target only — alias itself is system-managed)
  platformEmailForwardTo: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      const t = v.trim();
      return t === "" ? null : t;
    })
    .refine(
      (v) => v == null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "อีเมลไม่ถูกต้อง"
    ),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data: Prisma.StoreUpdateInput = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) (data as Record<string, unknown>)[k] = v;
  }

  // Auto-derive landingThemeVariant from templates[templateId].group when
  // the admin sent templateId but NOT landingThemeVariant — keeps the
  // family-detector chain in app/stores/[slug]/layout.tsx in sync with
  // the chosen template. Operator override (landingThemeVariant in the
  // same payload) always wins.
  const derivedVariant = deriveLandingThemeVariant({
    templateId: parsed.data.templateId,
    landingThemeVariant: parsed.data.landingThemeVariant,
  });
  if (derivedVariant !== undefined) {
    (data as Record<string, unknown>).landingThemeVariant = derivedVariant;
  }

  // Capture before-state for platform email side-effect detection and
  // for the templateId-change trigger on landingBlocks clear below.
  const before = await prisma.store.findUnique({
    where: { id: params.id },
    select: {
      customDomain: true,
      platformEmail: true,
      platformEmailForwardTo: true,
      templateId: true,
    },
  });
  if (!before) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Clear AI-generated landingBlocks (+ title/timestamp/status/error) when:
  //   (a) admin explicitly picks a theme variant (non-null), OR
  //   (b) templateId changed at all — skin-only OR full-app.
  // Reason: landingBlocks is rendered by the LAYOUT dispatcher in
  // app/stores/[slug]/layout.tsx BEFORE the family detector / StoreRenderer
  // chain runs, so stale JSON shadows the new template regardless of
  // whether the new template has its own chrome/pages adapter. Clearing
  // variant (back to null / auto) leaves landingBlocks alone so re-running
  // the AI agent still works.
  const variantSet =
    parsed.data.landingThemeVariant !== undefined &&
    parsed.data.landingThemeVariant !== null &&
    parsed.data.landingThemeVariant.length > 0;
  const templateIdChanged =
    parsed.data.templateId !== undefined &&
    parsed.data.templateId !== before.templateId;
  if (variantSet || templateIdChanged) {
    Object.assign(data, LANDING_CLEAR_PATCH);
  }

  try {
    const store = await prisma.store.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        slug: true,
        name: true,
        customDomain: true,
        platformEmail: true,
        platformEmailForwardTo: true,
        platformEmailVerified: true,
      },
    });

    const warnings: string[] = [];

    const customDomainSetNow =
      !!store.customDomain && !before.customDomain && !store.platformEmail;
    if (customDomainSetNow) {
      try {
        await provisionPlatformEmail(store.id);
      } catch (err) {
        warnings.push(
          err instanceof Error
            ? `อีเมลของระบบ: ${err.message}`
            : "ออกอีเมลของระบบไม่สำเร็จ"
        );
      }
    }

    if (
      parsed.data.platformEmailForwardTo !== undefined &&
      parsed.data.platformEmailForwardTo !== before.platformEmailForwardTo &&
      parsed.data.platformEmailForwardTo
    ) {
      try {
        await updatePlatformEmailForward(
          store.id,
          parsed.data.platformEmailForwardTo
        );
      } catch (err) {
        warnings.push(
          err instanceof Error
            ? `อัปเดตปลายทาง forward: ${err.message}`
            : "อัปเดต forward target ไม่สำเร็จ"
        );
      }
    }

    return NextResponse.json({ ...store, warnings });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }
      if (e.code === "P2002") {
        const target = (e.meta?.target as string[] | undefined)?.join(",") ?? "";
        const field = target.includes("slug")
          ? "slug"
          : target.includes("customDomain")
            ? "customDomain"
            : "field";
        return NextResponse.json(
          { error: { [field]: [`${field === "slug" ? "Slug" : "Domain"} นี้มีคนใช้แล้ว`] } },
          { status: 409 },
        );
      }
    }
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    // Tear down DO droplet + CF DNS records BEFORE deleting the Store row
    // (which cascades into ShopDeployment, otherwise we'd lose the droplet
    // id and the records would orphan on DO). Errors here are non-fatal —
    // if the droplet's already gone, the inner destroy* calls swallow it.
    await tearDownDeploymentNow(params.id).catch((err) => {
      console.error("[admin.delete-store] teardown failed", params.id, err);
    });

    await prisma.store.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    throw e;
  }
}
