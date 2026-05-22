"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type {
  ColorOverrides,
  CtaBlock,
  FaqItem,
  FeaturedTile,
  Testimonial,
} from "@/lib/store/landing-content";
import {
  uiConfigSchema,
  type UIConfig,
  type UIConfigBlock,
} from "@/lib/store/ui-config";
import {
  ALL_BLOCK_IDS,
  BLOCK_CATEGORIES,
} from "@/lib/registry/block-registry";
import { seedUiConfigForTemplate } from "@/lib/store/seed-ui-config";
import { getTemplateLandingDefaults } from "@/lib/templates/landing-defaults";

// Shared editor form for `StoreLandingContent`. Mounted by both the
// admin route (/admin/stores/[id]/landing-content) and the vendor route
// (/dashboard/store/landing-content) — the only difference between the
// two callsites is the `endpoint` prop pointing at the admin or vendor
// PUT route.

export interface LandingContentFormValues {
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaLabel: string;
  heroCtaUrl: string;
  heroImageUrl: string;
  heroVideoUrl: string;
  heroAlignment: "left" | "center" | "right";

  announcementMessage: string;
  announcementMessageMobile: string;
  announcementLinkUrl: string;
  announcementEnabled: boolean;

  aboutHeading: string;
  aboutBody: string;
  aboutImageUrl: string;
  aboutVideoUrl: string;

  featuredTiles: FeaturedTile[];
  ctaBlocks: CtaBlock[];
  faqItems: FaqItem[];
  testimonials: Testimonial[];

  colorOverrides: ColorOverrides;

  /** Server-driven UI config — null = use legacy family-detector chain.
   *  Edited via the "Block Composer" tab; round-trips through the
   *  extended landingContentSchema on save. */
  uiConfig: UIConfig | null;
}

export const EMPTY_VALUES: LandingContentFormValues = {
  heroHeadline: "",
  heroSubheadline: "",
  heroCtaLabel: "",
  heroCtaUrl: "",
  heroImageUrl: "",
  heroVideoUrl: "",
  heroAlignment: "center",

  announcementMessage: "",
  announcementMessageMobile: "",
  announcementLinkUrl: "",
  announcementEnabled: true,

  aboutHeading: "",
  aboutBody: "",
  aboutImageUrl: "",
  aboutVideoUrl: "",

  featuredTiles: [],
  ctaBlocks: [],
  faqItems: [],
  testimonials: [],

  colorOverrides: {},

  uiConfig: null,
};

interface Props {
  defaultValues?: Partial<LandingContentFormValues>;
  /** API endpoint that accepts PUT with the form payload. */
  endpoint: string;
  /** Optional storefront URL — opens in a new tab via "ดูหน้าร้าน". */
  storeUrl?: string;
  /** Store's wizard templateId — used as the seed for the Block Composer
   *  empty state ("Initialize with template defaults"). */
  templateId?: string | null;
  /** Store's wizard paletteId — used as the seed for the Block Composer. */
  paletteId?: string | null;
}

export function LandingContentForm({
  defaultValues,
  endpoint,
  storeUrl,
  templateId,
  paletteId,
}: Props) {
  const router = useRouter();
  const [v, setV] = useState<LandingContentFormValues>({
    ...EMPTY_VALUES,
    ...defaultValues,
    // Always-on defaults so nested objects/arrays exist
    colorOverrides: defaultValues?.colorOverrides ?? {},
    featuredTiles: defaultValues?.featuredTiles ?? [],
    ctaBlocks: defaultValues?.ctaBlocks ?? [],
    faqItems: defaultValues?.faqItems ?? [],
    testimonials: defaultValues?.testimonials ?? [],
    uiConfig: defaultValues?.uiConfig ?? null,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  /** Per-field uiConfig validation errors keyed by dotted path
   *  (e.g. `theme.palette` or `pages.home.2.id`). Surfaced inline
   *  next to the offending control before the network call. */
  const [uiConfigErrors, setUiConfigErrors] = useState<Record<string, string>>(
    {},
  );
  /** True only after the operator has actively touched the Composer
   *  (Initialize button, any field edit, or ปิด Composer). Default false
   *  so when v.uiConfig defaults to null because the stored JSON failed
   *  schema validation, a save that only edits Hero / Announcement does
   *  NOT overwrite the original incompatible row with Prisma.JsonNull.
   *  serializePayload omits the `uiConfig` key in that untouched-default
   *  case → the API's `if (v === undefined) continue` leaves the column
   *  unchanged. */
  const [uiConfigDirty, setUiConfigDirty] = useState(false);

  /** Theme-specific live defaults — shown as placeholders so the
   *  operator sees the exact text currently rendered on the storefront
   *  for each field, even before they save an override. */
  const themeDefaults = useMemo(
    () => getTemplateLandingDefaults(templateId),
    [templateId],
  );

  function update<K extends keyof LandingContentFormValues>(
    key: K,
    next: LandingContentFormValues[K],
  ) {
    setV((s) => ({ ...s, [key]: next }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Validate the uiConfig client-side first so we can surface inline
    // errors on the exact field — the API would otherwise return a
    // flat error map that's harder to attribute to the offending control.
    if (v.uiConfig) {
      const check = uiConfigSchema.safeParse(v.uiConfig);
      if (!check.success) {
        const errs: Record<string, string> = {};
        for (const issue of check.error.issues) {
          errs[issue.path.join(".")] = issue.message;
        }
        setUiConfigErrors(errs);
        setMsg({
          ok: false,
          text: "Block Composer มีข้อผิดพลาด — แก้ที่แท็บ 'เทมเพลตอัจฉริยะ'",
        });
        return;
      }
      setUiConfigErrors({});
    } else {
      setUiConfigErrors({});
    }
    setSaving(true);
    setMsg(null);
    try {
      const payload = serializePayload(v, uiConfigDirty);
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const text =
          typeof err.error === "object"
            ? Object.entries(err.error)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                .join("\n")
            : (err.error ?? "บันทึกไม่สำเร็จ");
        setMsg({ ok: false, text });
      } else {
        setMsg({ ok: true, text: "บันทึกแล้ว" });
        router.refresh();
      }
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="announcement">Announcement</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="featured">Featured tiles</TabsTrigger>
          <TabsTrigger value="cta">CTA blocks</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="ui-config">เทมเพลตอัจฉริยะ</TabsTrigger>
        </TabsList>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <TabsContent value="hero" className="space-y-4 pt-4">
          <FieldText
            label="หัวเรื่อง (Headline)"
            value={v.heroHeadline}
            onChange={(s) => update("heroHeadline", s)}
            placeholder={
              themeDefaults.heroHeadline?.replace(/\n/g, " · ") ??
              "เช่น ครัวคุณภาพ ส่งฟรีทั่วประเทศ"
            }
          />
          <FieldText
            label="คำอธิบาย (Subheadline)"
            value={v.heroSubheadline}
            onChange={(s) => update("heroSubheadline", s)}
            placeholder={themeDefaults.heroSubheadline ?? "บรรทัดรองที่อธิบายร้านสั้น ๆ"}
            multiline
          />
          <div className="grid grid-cols-2 gap-4">
            <FieldText
              label="ปุ่ม CTA — ข้อความ"
              value={v.heroCtaLabel}
              onChange={(s) => update("heroCtaLabel", s)}
              placeholder={themeDefaults.heroCtaLabel ?? "เช่น เลือกซื้อเลย"}
            />
            <FieldText
              label="ปุ่ม CTA — ลิงก์"
              value={v.heroCtaUrl}
              onChange={(s) => update("heroCtaUrl", s)}
              placeholder={themeDefaults.heroCtaUrl ?? "/category/featured หรือ https://..."}
            />
          </div>
          <FieldImage
            label="รูป Hero"
            kind="hero"
            value={v.heroImageUrl}
            onChange={(s) => update("heroImageUrl", s)}
            previewWidth={720}
            previewHeight={300}
            cover
          />
          <FieldText
            label="วิดีโอ Hero (URL)"
            value={v.heroVideoUrl}
            onChange={(s) => update("heroVideoUrl", s)}
            placeholder="https://... (mp4 / hls / youtube embed)"
          />
          <div>
            <Label>การจัดวาง</Label>
            <div className="mt-2 flex gap-2">
              {(["left", "center", "right"] as const).map((align) => (
                <Button
                  key={align}
                  type="button"
                  variant={v.heroAlignment === align ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("heroAlignment", align)}
                >
                  {align === "left" ? "ซ้าย" : align === "center" ? "กลาง" : "ขวา"}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Announcement ─────────────────────────────────────── */}
        <TabsContent value="announcement" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="announcement-enabled">เปิดใช้แถบประกาศ</Label>
            <Switch
              id="announcement-enabled"
              checked={v.announcementEnabled}
              onCheckedChange={(b) => update("announcementEnabled", b)}
            />
          </div>
          <FieldText
            label="ข้อความ (Desktop)"
            value={v.announcementMessage}
            onChange={(s) => update("announcementMessage", s)}
            placeholder={themeDefaults.announcementMessage ?? "ส่งฟรีเมื่อสั่งครบ 990 บาท"}
          />
          <FieldText
            label="ข้อความสั้น (Mobile)"
            value={v.announcementMessageMobile}
            onChange={(s) => update("announcementMessageMobile", s)}
            placeholder={
              themeDefaults.announcementMessageMobile ??
              themeDefaults.announcementMessage ??
              "ส่งฟรี 990+"
            }
          />
          <FieldText
            label="ลิงก์"
            value={v.announcementLinkUrl}
            onChange={(s) => update("announcementLinkUrl", s)}
            placeholder="/promo/free-shipping"
          />
        </TabsContent>

        {/* ── About ────────────────────────────────────────────── */}
        <TabsContent value="about" className="space-y-4 pt-4">
          <FieldText
            label="หัวข้อ"
            value={v.aboutHeading}
            onChange={(s) => update("aboutHeading", s)}
            placeholder="เกี่ยวกับเรา"
          />
          <FieldText
            label="เนื้อหา"
            value={v.aboutBody}
            onChange={(s) => update("aboutBody", s)}
            placeholder="เล่าเรื่องร้านของคุณ..."
            multiline
            rows={6}
          />
          <FieldImage
            label="รูปประกอบ"
            kind="about"
            value={v.aboutImageUrl}
            onChange={(s) => update("aboutImageUrl", s)}
            previewWidth={480}
            previewHeight={320}
            cover
          />
          <FieldText
            label="วิดีโอ (URL)"
            value={v.aboutVideoUrl}
            onChange={(s) => update("aboutVideoUrl", s)}
            placeholder="https://..."
          />
        </TabsContent>

        {/* ── Featured tiles ───────────────────────────────────── */}
        <TabsContent value="featured" className="space-y-4 pt-4">
          <RepeatableList
            label="Featured tiles"
            description="การ์ดคอลเลกชัน / category ที่แสดงบนหน้าแรก (สูงสุด 12)"
            items={v.featuredTiles}
            onChange={(items) => update("featuredTiles", items)}
            max={12}
            empty={{ imageUrl: "", label: "", href: "", eyebrow: "" }}
            renderItem={(item, set) => (
              <div className="space-y-3">
                <FieldImage
                  label="รูป"
                  kind="featured-tile"
                  value={item.imageUrl}
                  onChange={(s) => set({ ...item, imageUrl: s })}
                  previewWidth={240}
                  previewHeight={160}
                  cover
                />
                <FieldText
                  label="Eyebrow (เล็ก ๆ บน label)"
                  value={item.eyebrow ?? ""}
                  onChange={(s) => set({ ...item, eyebrow: s })}
                  placeholder="คอลเลกชันใหม่"
                />
                <FieldText
                  label="ข้อความ"
                  value={item.label}
                  onChange={(s) => set({ ...item, label: s })}
                  placeholder="กระเป๋าผู้หญิง"
                />
                <FieldText
                  label="ลิงก์ (href)"
                  value={item.href ?? ""}
                  onChange={(s) => set({ ...item, href: s })}
                  placeholder="/category/bags"
                />
              </div>
            )}
          />
        </TabsContent>

        {/* ── CTA blocks ───────────────────────────────────────── */}
        <TabsContent value="cta" className="space-y-4 pt-4">
          <RepeatableList
            label="CTA blocks"
            description="กล่อง CTA ระหว่างหน้า เช่น 'สมัครรับข่าวสาร' (สูงสุด 6)"
            items={v.ctaBlocks}
            onChange={(items) => update("ctaBlocks", items)}
            max={6}
            empty={{ heading: "", body: "", ctaLabel: "", ctaUrl: "", imageUrl: "" }}
            renderItem={(item, set) => (
              <div className="space-y-3">
                <FieldText
                  label="หัวข้อ"
                  value={item.heading}
                  onChange={(s) => set({ ...item, heading: s })}
                />
                <FieldText
                  label="เนื้อหา"
                  value={item.body ?? ""}
                  onChange={(s) => set({ ...item, body: s })}
                  multiline
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FieldText
                    label="ปุ่ม — ข้อความ"
                    value={item.ctaLabel ?? ""}
                    onChange={(s) => set({ ...item, ctaLabel: s })}
                  />
                  <FieldText
                    label="ปุ่ม — ลิงก์"
                    value={item.ctaUrl ?? ""}
                    onChange={(s) => set({ ...item, ctaUrl: s })}
                  />
                </div>
                <FieldImage
                  label="รูปประกอบ (ไม่บังคับ)"
                  kind="cta-block"
                  value={item.imageUrl ?? ""}
                  onChange={(s) => set({ ...item, imageUrl: s })}
                  previewWidth={300}
                  previewHeight={200}
                  cover
                />
              </div>
            )}
          />
        </TabsContent>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <TabsContent value="faq" className="space-y-4 pt-4">
          <RepeatableList
            label="FAQ"
            description="คำถามที่พบบ่อย (สูงสุด 30)"
            items={v.faqItems}
            onChange={(items) => update("faqItems", items)}
            max={30}
            empty={{ q: "", a: "" }}
            renderItem={(item, set) => (
              <div className="space-y-3">
                <FieldText
                  label="คำถาม"
                  value={item.q}
                  onChange={(s) => set({ ...item, q: s })}
                />
                <FieldText
                  label="คำตอบ"
                  value={item.a}
                  onChange={(s) => set({ ...item, a: s })}
                  multiline
                  rows={3}
                />
              </div>
            )}
          />
        </TabsContent>

        {/* ── Testimonials ─────────────────────────────────────── */}
        <TabsContent value="testimonials" className="space-y-4 pt-4">
          <RepeatableList
            label="Testimonials"
            description="คำชื่นชมจากลูกค้า (สูงสุด 20)"
            items={v.testimonials}
            onChange={(items) => update("testimonials", items)}
            max={20}
            empty={{ name: "", role: "", photoUrl: "", quote: "", rating: undefined }}
            renderItem={(item, set) => (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FieldText
                    label="ชื่อ"
                    value={item.name}
                    onChange={(s) => set({ ...item, name: s })}
                  />
                  <FieldText
                    label="ตำแหน่ง / ที่มา"
                    value={item.role ?? ""}
                    onChange={(s) => set({ ...item, role: s })}
                  />
                </div>
                <FieldImage
                  label="รูปลูกค้า"
                  kind="testimonial"
                  value={item.photoUrl ?? ""}
                  onChange={(s) => set({ ...item, photoUrl: s })}
                  previewWidth={80}
                  previewHeight={80}
                />
                <FieldText
                  label="คำพูด"
                  value={item.quote}
                  onChange={(s) => set({ ...item, quote: s })}
                  multiline
                  rows={3}
                />
                <div>
                  <Label>คะแนน (0-5)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    step={0.5}
                    value={item.rating ?? ""}
                    onChange={(e) =>
                      set({
                        ...item,
                        rating:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    className="mt-1 w-24"
                  />
                </div>
              </div>
            )}
          />
        </TabsContent>

        {/* ── Colors ───────────────────────────────────────────── */}
        <TabsContent value="colors" className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Override shadcn semantic tokens — เว้นว่างเพื่อใช้สีจาก palette
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["primary", "Primary"],
                ["primaryForeground", "Primary text"],
                ["secondary", "Secondary"],
                ["secondaryForeground", "Secondary text"],
                ["accent", "Accent"],
                ["accentForeground", "Accent text"],
                ["background", "Background"],
                ["foreground", "Text"],
                ["muted", "Muted"],
                ["mutedForeground", "Muted text"],
                ["border", "Border"],
                ["ring", "Focus ring"],
                ["destructive", "Destructive"],
                ["destructiveForeground", "Destructive text"],
              ] as const
            ).map(([key, label]) => (
              <ColorField
                key={key}
                label={label}
                value={v.colorOverrides[key] ?? ""}
                onChange={(s) =>
                  update("colorOverrides", {
                    ...v.colorOverrides,
                    [key]: s || undefined,
                  })
                }
              />
            ))}
          </div>
        </TabsContent>

        {/* ── Block Composer (server-driven uiConfig) ──────────── */}
        <TabsContent value="ui-config" className="space-y-4 pt-4">
          <BlockComposer
            value={v.uiConfig}
            onChange={(next) => {
              // Any composer interaction (Initialize / field edit / ปิด)
              // counts as "dirty" — opts this save into writing uiConfig.
              setUiConfigDirty(true);
              update("uiConfig", next);
            }}
            errors={uiConfigErrors}
            templateId={templateId ?? null}
            paletteId={paletteId ?? null}
          />
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex items-center justify-between gap-4">
        <div className="text-sm">
          {msg && (
            <span className={msg.ok ? "text-emerald-600" : "text-rose-600"}>
              {msg.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {storeUrl && (
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              ดูหน้าร้าน
            </a>
          )}
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            บันทึก
          </Button>
        </div>
      </div>
    </form>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────

function FieldText({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  rows,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows ?? 3}
          className="mt-1"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1"
        />
      )}
    </div>
  );
}

function FieldImage({
  label,
  kind,
  value,
  onChange,
  previewWidth,
  previewHeight,
  cover,
}: {
  label: string;
  kind: string;
  value: string;
  onChange: (s: string) => void;
  previewWidth?: number;
  previewHeight?: number;
  cover?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1">
        <ImageUploadField
          value={value}
          onChange={onChange}
          kind={kind}
          previewWidth={previewWidth}
          previewHeight={previewHeight}
          cover={cover}
        />
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border border-input"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#RRGGBB"
          className="font-mono text-sm"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            className="shrink-0"
          >
            ล้าง
          </Button>
        )}
      </div>
    </div>
  );
}

function RepeatableList<T>({
  label,
  description,
  items,
  onChange,
  max,
  empty,
  renderItem,
}: {
  label: string;
  description?: string;
  items: T[];
  onChange: (next: T[]) => void;
  max: number;
  empty: T;
  renderItem: (item: T, set: (next: T) => void) => React.ReactNode;
}) {
  function add() {
    if (items.length >= max) return;
    onChange([...items, { ...empty }]);
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function setAt(index: number, next: T) {
    onChange(items.map((it, i) => (i === index ? next : it)));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <Label>{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          disabled={items.length >= max}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          เพิ่ม
        </Button>
      </div>
      {items.length === 0 && (
        <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
          ยังไม่มีรายการ — กด &quot;เพิ่ม&quot; เพื่อเริ่มต้น
        </p>
      )}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="space-y-3 rounded-md border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                #{i + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(i)}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            {renderItem(item, (next) => setAt(i, next))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Serializer — form state → API payload ────────────────────────────

function serializePayload(
  v: LandingContentFormValues,
  uiConfigDirty: boolean,
) {
  // Empty strings → null so the API can clear the column.
  const nz = (s: string) => (s.trim() === "" ? null : s.trim());
  return {
    heroHeadline: nz(v.heroHeadline),
    heroSubheadline: nz(v.heroSubheadline),
    heroCtaLabel: nz(v.heroCtaLabel),
    heroCtaUrl: nz(v.heroCtaUrl),
    heroImageUrl: nz(v.heroImageUrl),
    heroVideoUrl: nz(v.heroVideoUrl),
    heroAlignment: v.heroAlignment,

    announcementMessage: nz(v.announcementMessage),
    announcementMessageMobile: nz(v.announcementMessageMobile),
    announcementLinkUrl: nz(v.announcementLinkUrl),
    announcementEnabled: v.announcementEnabled,

    aboutHeading: nz(v.aboutHeading),
    aboutBody: nz(v.aboutBody),
    aboutImageUrl: nz(v.aboutImageUrl),
    aboutVideoUrl: nz(v.aboutVideoUrl),

    featuredTiles: v.featuredTiles.length ? v.featuredTiles : null,
    ctaBlocks: v.ctaBlocks.length ? v.ctaBlocks : null,
    faqItems: v.faqItems.length ? v.faqItems : null,
    testimonials: v.testimonials.length ? v.testimonials : null,

    colorOverrides:
      Object.keys(v.colorOverrides).filter(
        (k) => v.colorOverrides[k as keyof ColorOverrides],
      ).length > 0
        ? v.colorOverrides
        : null,

    // Pass through uiConfig ONLY when the operator has actively engaged
    // with the Composer. If `v.uiConfig` is null because the stored JSON
    // failed schema validation (e.g. after a future schema migration) and
    // the operator only edited hero/announcement, we must NOT overwrite
    // the original column with Prisma.JsonNull — omit the key so the
    // API's `if (v === undefined) continue` preserves DB state.
    ...(uiConfigDirty ? { uiConfig: v.uiConfig } : {}),
  };
}

// ─── BlockComposer — uiConfig editor (Change 2) ────────────────────────
//
// Two states:
//   • Empty (uiConfig === null) — renders an "Initialize with template
//     defaults" button that seeds the local form state via
//     `seedUiConfigForTemplate(templateId, paletteId)`. Nothing hits the
//     network until the operator hits the outer "บันทึก" button.
//   • Populated — renders the theme row, the sortable home-blocks list
//     (+add dialog), and the 5 single-block selects for the other routes.

/**
 * Universal fallback recipe when the store has no templateId (or its
 * templateId has no entry in `seedUiConfigForTemplate`'s recipe map).
 * Uses blocks we know exist in the registry; keeps Thai sans pair to
 * match the rest of the platform's defaults.
 */
function FALLBACK_UI_CONFIG(paletteId: string): UIConfig {
  return {
    theme: {
      palette: paletteId,
      fontPrimary: "Prompt",
      fontDisplay: "Prompt",
    },
    pages: {
      home: [
        { type: "navbar", id: "navbar-component-11" },
        { type: "hero", id: "bento-grid-09" },
        { type: "product-list", id: "product-list-01" },
        { type: "category", id: "product-category-01" },
        { type: "partners", id: "app-integration-10" },
      ],
      pdp: "product-overview-04",
      catalog: "product-list-01",
      cart: "shopping-cart-01",
    },
  };
}

/** Lookup table: block id → human label (falls back to id when unknown). */
const BLOCK_LABEL_INDEX: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  for (const cat of BLOCK_CATEGORIES) {
    for (const b of cat.blocks) out[b.id] = b.label;
  }
  return out;
})();

function blockLabel(id: string): string {
  return BLOCK_LABEL_INDEX[id] ?? id;
}

interface BlockComposerProps {
  value: UIConfig | null;
  onChange: (next: UIConfig | null) => void;
  errors: Record<string, string>;
  templateId: string | null;
  paletteId: string | null;
}

function BlockComposer({
  value,
  onChange,
  errors,
  templateId,
  paletteId,
}: BlockComposerProps) {
  if (!value) {
    // ── Empty state ────────────────────────────────────────────────────
    return (
      <div className="space-y-4 rounded-md border border-dashed bg-muted/30 p-6 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-muted-foreground" />
        <div>
          <p className="font-medium">ยังไม่ได้ตั้งค่า</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Block Composer ปิดอยู่ — หน้าร้านใช้ template renderer แบบเดิม
            <br />
            กดด้านล่างเพื่อเริ่มต้นด้วย default ของเทมเพลต แล้วปรับได้
          </p>
        </div>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => {
            // seedUiConfigForTemplate returns null when no recipe maps to
            // the store's templateId (unknown / legacy stores) — fall back
            // to a minimal universal default so the operator always gets
            // a working starting point instead of a dead button.
            const seeded =
              seedUiConfigForTemplate(templateId, paletteId ?? "midnight") ??
              FALLBACK_UI_CONFIG(paletteId ?? "midnight");
            onChange(seeded);
          }}
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          Initialize with template defaults
        </Button>
        <p className="text-xs text-muted-foreground">
          จะยังไม่บันทึก — กด &ldquo;บันทึก&rdquo; ด้านล่างเพื่อยืนยัน
        </p>
      </div>
    );
  }

  // ── Populated state ─────────────────────────────────────────────────
  function setTheme(patch: Partial<UIConfig["theme"]>) {
    onChange({ ...value!, theme: { ...value!.theme, ...patch } });
  }
  function setPages(patch: Partial<UIConfig["pages"]>) {
    onChange({ ...value!, pages: { ...value!.pages, ...patch } });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Block Composer เปิดอยู่</p>
          <p className="text-xs text-muted-foreground">
            หน้าร้านจะเรนเดอร์ตาม blocks ด้านล่าง (override template renderer)
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (
              confirm(
                "ปิด Block Composer แล้วกลับไปใช้ template renderer? (ค่าจะหายเมื่อบันทึก)",
              )
            ) {
              onChange(null);
            }
          }}
          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          ปิด Composer
        </Button>
      </div>

      {/* ── A. Theme row ──────────────────────────────────────────────── */}
      <fieldset className="space-y-3 rounded-md border bg-card p-4">
        <legend className="px-1 text-sm font-medium">Theme</legend>
        <div className="grid grid-cols-3 gap-3">
          <UiField
            label="Palette"
            value={value.theme.palette}
            onChange={(s) => setTheme({ palette: s })}
            placeholder="midnight / royal / rose / …"
            error={errors["theme.palette"]}
          />
          <UiField
            label="Font Primary"
            value={value.theme.fontPrimary}
            onChange={(s) => setTheme({ fontPrimary: s })}
            placeholder="Prompt"
            error={errors["theme.fontPrimary"]}
          />
          <UiField
            label="Font Display"
            value={value.theme.fontDisplay}
            onChange={(s) => setTheme({ fontDisplay: s })}
            placeholder="Prompt"
            error={errors["theme.fontDisplay"]}
          />
        </div>
      </fieldset>

      {/* ── B. Home page — sortable block list ────────────────────────── */}
      <fieldset className="space-y-3 rounded-md border bg-card p-4">
        <legend className="px-1 text-sm font-medium">หน้าแรก (Home)</legend>
        <p className="text-xs text-muted-foreground">
          ลำดับ blocks ที่แสดงบนหน้าแรก — ปรับลำดับด้วยปุ่มขึ้น/ลง
        </p>
        <HomeBlocksList
          blocks={value.pages.home}
          onChange={(home) => setPages({ home })}
          errors={errors}
        />
      </fieldset>

      {/* ── C. Other routes — single-block selects ───────────────────── */}
      <fieldset className="grid grid-cols-1 gap-3 rounded-md border bg-card p-4 md:grid-cols-2">
        <legend className="px-1 text-sm font-medium">
          หน้าอื่น (single block)
        </legend>
        <UiSelect
          label="PDP (หน้าสินค้า)"
          value={value.pages.pdp}
          onChange={(s) => setPages({ pdp: s })}
          options={BLOCK_CATEGORIES.find((c) => c.id === "pdp")?.blocks ?? []}
          required
          error={errors["pages.pdp"]}
        />
        <UiSelect
          label="Catalog (หมวด / รายการสินค้า)"
          value={value.pages.catalog}
          onChange={(s) => setPages({ catalog: s })}
          options={[
            ...(BLOCK_CATEGORIES.find((c) => c.id === "product-list")?.blocks ??
              []),
            ...(BLOCK_CATEGORIES.find((c) => c.id === "category")?.blocks ??
              []),
          ]}
          required
          error={errors["pages.catalog"]}
        />
        <UiSelect
          label="Cart (ตะกร้า)"
          value={value.pages.cart}
          onChange={(s) => setPages({ cart: s })}
          options={BLOCK_CATEGORIES.find((c) => c.id === "cart")?.blocks ?? []}
          required
          error={errors["pages.cart"]}
        />
        <UiSelect
          label="Checkout (ชำระเงิน — ไม่บังคับ)"
          value={value.pages.checkout ?? ""}
          onChange={(s) =>
            setPages({ checkout: s === "" ? undefined : s })
          }
          options={
            BLOCK_CATEGORIES.find((c) => c.id === "checkout")?.blocks ?? []
          }
          error={errors["pages.checkout"]}
        />
        <UiSelect
          label="About (ไม่บังคับ)"
          value={value.pages.about ?? ""}
          onChange={(s) =>
            setPages({ about: s === "" ? undefined : s })
          }
          // No "about" category — use the full registry so operators can
          // pick any block as a marketing page.
          options={ALL_BLOCK_IDS.map((id) => ({ id, label: blockLabel(id) }))}
          error={errors["pages.about"]}
        />
      </fieldset>
    </div>
  );
}

// ─── HomeBlocksList — sortable rows with add dialog ────────────────────

function HomeBlocksList({
  blocks,
  onChange,
  errors,
}: {
  blocks: UIConfigBlock[];
  onChange: (next: UIConfigBlock[]) => void;
  errors: Record<string, string>;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  function remove(i: number) {
    onChange(blocks.filter((_, idx) => idx !== i));
  }
  function add(type: string, id: string) {
    onChange([...blocks, { type, id }]);
    setPickerOpen(false);
  }

  // Schema enforces min(1).max(20) — surface count at the top so the
  // operator knows where they are vs. the cap before they try to save.
  const atCap = blocks.length >= 20;
  const atFloor = blocks.length <= 1;

  return (
    <div className="space-y-2">
      {blocks.length === 0 && (
        <p className="rounded-md border border-dashed py-4 text-center text-xs text-muted-foreground">
          ยังไม่มี block — กด &ldquo;+ เพิ่มบล็อก&rdquo; ด้านล่าง
        </p>
      )}
      <ul className="space-y-1.5">
        {blocks.map((b, i) => {
          const idErr = errors[`pages.home.${i}.id`];
          const typeErr = errors[`pages.home.${i}.type`];
          return (
            <li
              key={`${b.id}-${i}`}
              className="flex items-center gap-2 rounded-md border bg-background px-3 py-2"
            >
              <span className="w-6 shrink-0 text-center text-xs text-muted-foreground">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {blockLabel(b.id)}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  <span className="font-mono">{b.id}</span>
                  <span className="mx-1.5">·</span>
                  <span>{b.type}</span>
                </p>
                {(idErr || typeErr) && (
                  <p className="mt-0.5 text-[11px] text-rose-600">
                    {idErr ?? typeErr}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="เลื่อนขึ้น"
                  className="h-7 w-7 p-0"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => move(i, 1)}
                  disabled={i === blocks.length - 1}
                  aria-label="เลื่อนลง"
                  className="h-7 w-7 p-0"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(i)}
                  disabled={atFloor}
                  aria-label="ลบ"
                  className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  title={atFloor ? "ต้องมี block อย่างน้อย 1 อัน" : undefined}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between pt-1">
        <p className="text-[11px] text-muted-foreground">
          {blocks.length} / 20 blocks
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPickerOpen(true)}
          disabled={atCap}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          เพิ่มบล็อก
        </Button>
      </div>
      <BlockPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={add}
      />
      {errors["pages.home"] && (
        <p className="text-xs text-rose-600">{errors["pages.home"]}</p>
      )}
    </div>
  );
}

// ─── BlockPickerDialog — category-tabbed grid ──────────────────────────

function BlockPickerDialog({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (type: string, id: string) => void;
}) {
  const [activeCat, setActiveCat] = useState<string>(BLOCK_CATEGORIES[0].id);
  const cat = useMemo(
    () =>
      BLOCK_CATEGORIES.find((c) => c.id === activeCat) ?? BLOCK_CATEGORIES[0],
    [activeCat],
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>เลือกบล็อก</DialogTitle>
          <DialogDescription>
            เลือกหมวดทางซ้าย แล้วคลิก block ทางขวาเพื่อเพิ่มลงในหน้าแรก
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] grid-cols-[180px_1fr] gap-3 overflow-hidden">
          {/* Left rail — categories */}
          <nav className="overflow-y-auto border-r pr-2">
            <ul className="space-y-0.5">
              {BLOCK_CATEGORIES.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActiveCat(c.id)}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                      c.id === activeCat
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {c.label}
                    <span className="ml-1 text-[10px] text-muted-foreground/70">
                      ({c.blocks.length})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {/* Right panel — blocks */}
          <div className="overflow-y-auto">
            <ul className="space-y-1">
              {cat.blocks.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => onPick(cat.id, b.id)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <span className="block font-medium">{b.label}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                      {b.id}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── UiField — text input with inline error slot ───────────────────────

function UiField({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 ${error ? "border-rose-500 focus-visible:ring-rose-500/30" : ""}`}
      />
      {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}

// ─── UiSelect — native select (works without shadcn Select infra) ──────

function UiSelect({
  label,
  value,
  onChange,
  options,
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  options: { id: string; label: string }[];
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
          error
            ? "border-rose-500 focus-visible:ring-rose-500/30"
            : "border-input"
        }`}
      >
        {!required && <option value="">— ใช้ค่าเริ่มต้น —</option>}
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}
