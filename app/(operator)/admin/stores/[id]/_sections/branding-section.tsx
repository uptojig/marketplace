"use client";

/**
 * Branding tab — logo / banner / primary colour / header layout /
 * template style picker (templateId + paletteId + niche + brandVoice +
 * landingThemeVariant) and curated-theme accent override.
 *
 * The template style picker is its own controlled subtree
 * (TemplateStylePicker) — we sync its values into the RHF form via the
 * picker's onChange callback so dirty-tracking still works.
 */

import { useRouter } from "next/navigation";

import {
  OperatorFormSection,
  type OperatorFormSectionSubmitResult,
} from "@/components/operator/operator-form-section";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import {
  TemplateStylePicker,
  serializeTemplateStyle,
  templateIdChanged,
} from "@/components/store/template-style-picker";
import {
  storeBrandingSchema,
  type StoreBrandingValues,
} from "@/lib/admin/store-form-schema";

import { patchStore } from "./patch-store";

export type BrandingStore = {
  id: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string | null;
  logoPosition: string | null;
  menuPosition: string | null;
  templateId: string | null;
  paletteId: string | null;
  niche: string | null;
  brandVoice: string | null;
  landingThemeVariant: string | null;
};

function toDefaults(s: BrandingStore): StoreBrandingValues {
  return {
    logoUrl: s.logoUrl ?? "",
    bannerUrl: s.bannerUrl ?? "",
    primaryColor: s.primaryColor ?? "#2563eb",
    logoPosition: ((s.logoPosition ?? "left") === "center"
      ? "center"
      : "left") as StoreBrandingValues["logoPosition"],
    menuPosition: (["left", "center", "right"].includes(s.menuPosition ?? "")
      ? (s.menuPosition as StoreBrandingValues["menuPosition"])
      : "right") as StoreBrandingValues["menuPosition"],
    templateId: s.templateId ?? "",
    paletteId: s.paletteId ?? "",
    niche: s.niche ?? "",
    brandVoice: s.brandVoice ?? "casual",
    landingThemeVariant: s.landingThemeVariant ?? "",
  };
}

export function BrandingSection({ store }: { store: BrandingStore }) {
  const router = useRouter();
  const defaults = toDefaults(store);
  const initialTemplateId = store.templateId ?? "";

  async function handleSubmit(
    values: StoreBrandingValues,
  ): Promise<OperatorFormSectionSubmitResult> {
    if (templateIdChanged(initialTemplateId, values.templateId)) {
      const ok = confirm(
        "การเปลี่ยน Template จะลบ AI-generated landing blocks (ถ้ามี) เพื่อให้ template ใหม่ render แทน\n\nดำเนินการต่อ?",
      );
      if (!ok) {
        return { ok: false, message: "ยกเลิกการบันทึก" };
      }
    }

    // Use the picker's serialiser to fold landingThemeVariant correctly
    // (empty string → omit, not null → clear).
    const styleBody = serializeTemplateStyle({
      templateId: values.templateId,
      paletteId: values.paletteId,
      niche: values.niche,
      brandVoice: values.brandVoice,
      landingThemeVariant: values.landingThemeVariant,
    });

    // Build the PATCH body — only fields the branding section owns.
    const body: Record<string, unknown> = {
      logoUrl: values.logoUrl,
      bannerUrl: values.bannerUrl,
      primaryColor: values.primaryColor,
      logoPosition: values.logoPosition,
      menuPosition: values.menuPosition,
      ...styleBody,
    };

    const result = await patchStore(store.id, body);
    if (result.ok) router.refresh();
    return result;
  }

  return (
    <OperatorFormSection
      title="แบรนด์ดิ้ง & Template"
      description="โลโก้, แบนเนอร์, สี และ template ของหน้าร้าน"
      schema={storeBrandingSchema}
      defaultValues={defaults}
      onSubmit={handleSubmit}
    >
      {(form) => (
        <>
          <div className="rounded-md border bg-muted/30 p-4">
            <h3 className="mb-1 text-sm font-semibold">Template & Style</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              เลือก template ของหน้าร้าน + palette + niche + brand voice —
              ค่าเหล่านี้กำหนดวิธี render หน้าร้านและ AI design hints
            </p>
            <TemplateStylePicker
              embedded
              values={{
                templateId: form.watch("templateId"),
                paletteId: form.watch("paletteId"),
                niche: form.watch("niche"),
                brandVoice: form.watch("brandVoice"),
                landingThemeVariant: form.watch("landingThemeVariant"),
              }}
              onChange={(next) => {
                if (next.templateId !== undefined)
                  form.setValue("templateId", next.templateId, {
                    shouldDirty: true,
                  });
                if (next.paletteId !== undefined)
                  form.setValue("paletteId", next.paletteId, {
                    shouldDirty: true,
                  });
                if (next.niche !== undefined)
                  form.setValue("niche", next.niche, { shouldDirty: true });
                if (next.brandVoice !== undefined)
                  form.setValue("brandVoice", next.brandVoice, {
                    shouldDirty: true,
                  });
                if (next.landingThemeVariant !== undefined)
                  form.setValue(
                    "landingThemeVariant",
                    next.landingThemeVariant,
                    { shouldDirty: true },
                  );
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <ImageUploadField
                      value={field.value}
                      onChange={(v) =>
                        form.setValue("logoUrl", v, { shouldDirty: true })
                      }
                      kind="logo"
                      previewWidth={240}
                      previewHeight={80}
                    />
                  </FormControl>
                  <FormDescription>
                    วาง URL หรือกด อัพโหลด เพื่อเลือกไฟล์
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bannerUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner</FormLabel>
                  <FormControl>
                    <ImageUploadField
                      value={field.value}
                      onChange={(v) =>
                        form.setValue("bannerUrl", v, { shouldDirty: true })
                      }
                      kind="banner"
                      previewWidth={300}
                      previewHeight={100}
                      cover
                    />
                  </FormControl>
                  <FormDescription>
                    รูปแบนเนอร์บนหน้าร้าน (อัตราส่วน ~3:1)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="primaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-9 w-14 cursor-pointer rounded border"
                    />
                    <Input
                      {...field}
                      placeholder="#2563eb"
                      className="w-32 font-mono"
                    />
                  </div>
                </FormControl>
                <FormDescription>ใช้สำหรับปุ่ม / accent ในหน้าร้าน</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="logoPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ตำแหน่งโลโก้</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                    >
                      <option value="left">ซ้าย (default)</option>
                      <option value="center">กลาง</option>
                    </select>
                  </FormControl>
                  <FormDescription>
                    ซ้าย = ติดกับ search/menu, กลาง = อยู่ตรงกลางหัว
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="menuPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ตำแหน่งเมนู</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                    >
                      <option value="right">ขวา (default)</option>
                      <option value="center">กลาง</option>
                      <option value="left">ซ้าย</option>
                    </select>
                  </FormControl>
                  <FormDescription>
                    แนวการวาง nav links บน desktop
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )}
    </OperatorFormSection>
  );
}
