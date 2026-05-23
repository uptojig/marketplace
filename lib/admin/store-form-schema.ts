/**
 * Phase A foundation: split the 663-line monolithic edit-form into four
 * cohesive sections, each backed by its own Zod schema. These types power
 * the four `OperatorFormSection<TSchema>` instances on the admin store
 * edit page in Phase B-F.
 *
 * Every field maps 1:1 onto a column on the Prisma `Store` model — keep
 * this file as the single source of truth and re-validate against
 * `prisma/schema.prisma` whenever a column is added or renamed.
 */
import { z } from "zod"

// ── Helpers ────────────────────────────────────────────────────────────────
// Stores that have never had a value persisted often round-trip as `""` from
// the database layer (Prisma `String?` coerced through form state). Accept
// both `""` and `null` as "absent" so the form doesn't reject a fresh store.
const optionalNullable = <T extends z.ZodTypeAny>(schema: T) =>
  schema.optional().nullable().or(z.literal(""))

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "ต้องเป็นรหัสสี HEX 6 หลัก เช่น #2563eb")

const url = z.string().url("ต้องเป็น URL ที่ถูกต้อง")
const email = z.string().email("รูปแบบอีเมลไม่ถูกต้อง")

// ── A. Basics ──────────────────────────────────────────────────────────────
// Identity: store name, slug, public description, legal company info.
export const storeBasicsSchema = z.object({
  name: z
    .string()
    .min(1, "จำเป็น")
    .max(120, "ยาวเกิน 120 ตัวอักษร"),
  slug: z
    .string()
    .min(2, "อย่างน้อย 2 ตัวอักษร")
    .max(50, "ยาวเกิน 50 ตัวอักษร")
    .regex(/^[a-z0-9-]+$/, "ใช้ได้เฉพาะ a-z 0-9 และ -"),
  description: z
    .string()
    .max(500, "ยาวเกิน 500 ตัวอักษร")
    .optional()
    .nullable(),
  tagline: z
    .string()
    .max(200, "ยาวเกิน 200 ตัวอักษร")
    .optional()
    .nullable(),
  companyName: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  customDomain: z.string().optional().nullable(),
})

// ── B. Branding ────────────────────────────────────────────────────────────
// Visual identity: logo, banner, primary color, layout knobs, theme choice.
export const storeBrandingSchema = z.object({
  logoUrl: optionalNullable(url),
  bannerUrl: optionalNullable(url),
  primaryColor: hexColor.optional().nullable(),
  logoPosition: z.enum(["left", "center"]).optional().nullable(),
  menuPosition: z.enum(["inline", "below", "sidebar"]).optional().nullable(),
  templateId: z.string().optional().nullable(),
  landingThemeVariant: z.string().optional().nullable(),
  themeAccentOverride: hexColor.optional().nullable(),
})

// ── C. Address ─────────────────────────────────────────────────────────────
// Physical address used in the storefront contact page + invoices.
export const storeAddressSchema = z.object({
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  subdistrict: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก")
    .optional()
    .nullable()
    .or(z.literal("")),
  country: z.string().default("TH").optional().nullable(),
})

// ── D. Contact ─────────────────────────────────────────────────────────────
// All public-facing channels (email, phone, social) + the platform alias.
export const storeContactSchema = z.object({
  contactEmail: optionalNullable(email),
  contactPhone: z.string().optional().nullable(),
  lineId: z.string().optional().nullable(),
  facebookUrl: optionalNullable(url),
  messengerUrl: optionalNullable(url),
  instagramUrl: optionalNullable(url),
  twitterUrl: optionalNullable(url),
  websiteUrl: optionalNullable(url),
  platformEmail: optionalNullable(email),
})

// ── Type re-exports ────────────────────────────────────────────────────────
// Phase B-F sections import these (not the schemas directly) for prop typing.
export type StoreBasicsValues = z.infer<typeof storeBasicsSchema>
export type StoreBrandingValues = z.infer<typeof storeBrandingSchema>
export type StoreAddressValues = z.infer<typeof storeAddressSchema>
export type StoreContactValues = z.infer<typeof storeContactSchema>

// Convenience: union of every section's values, useful when a single
// patch endpoint accepts any subset.
export type StoreFormValues = StoreBasicsValues &
  StoreBrandingValues &
  StoreAddressValues &
  StoreContactValues
