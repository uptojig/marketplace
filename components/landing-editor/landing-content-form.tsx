"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type {
  ColorOverrides,
  CtaBlock,
  FaqItem,
  FeaturedTile,
  Testimonial,
} from "@/lib/store/landing-content";

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
};

interface Props {
  defaultValues?: Partial<LandingContentFormValues>;
  /** API endpoint that accepts PUT with the form payload. */
  endpoint: string;
  /** Optional storefront URL — opens in a new tab via "ดูหน้าร้าน". */
  storeUrl?: string;
}

export function LandingContentForm({ defaultValues, endpoint, storeUrl }: Props) {
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
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function update<K extends keyof LandingContentFormValues>(
    key: K,
    next: LandingContentFormValues[K],
  ) {
    setV((s) => ({ ...s, [key]: next }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const payload = serializePayload(v);
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
        </TabsList>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <TabsContent value="hero" className="space-y-4 pt-4">
          <FieldText
            label="หัวเรื่อง (Headline)"
            value={v.heroHeadline}
            onChange={(s) => update("heroHeadline", s)}
            placeholder="เช่น ครัวคุณภาพ ส่งฟรีทั่วประเทศ"
          />
          <FieldText
            label="คำอธิบาย (Subheadline)"
            value={v.heroSubheadline}
            onChange={(s) => update("heroSubheadline", s)}
            placeholder="บรรทัดรองที่อธิบายร้านสั้น ๆ"
            multiline
          />
          <div className="grid grid-cols-2 gap-4">
            <FieldText
              label="ปุ่ม CTA — ข้อความ"
              value={v.heroCtaLabel}
              onChange={(s) => update("heroCtaLabel", s)}
              placeholder="เช่น เลือกซื้อเลย"
            />
            <FieldText
              label="ปุ่ม CTA — ลิงก์"
              value={v.heroCtaUrl}
              onChange={(s) => update("heroCtaUrl", s)}
              placeholder="/category/featured หรือ https://..."
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
            placeholder="ส่งฟรีเมื่อสั่งครบ 990 บาท"
          />
          <FieldText
            label="ข้อความสั้น (Mobile)"
            value={v.announcementMessageMobile}
            onChange={(s) => update("announcementMessageMobile", s)}
            placeholder="ส่งฟรี 990+"
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
          ยังไม่มีรายการ — กด "เพิ่ม" เพื่อเริ่มต้น
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

function serializePayload(v: LandingContentFormValues) {
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
  };
}
