"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadField } from "@/components/admin/image-upload-field";

const schema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "ใช้ได้แค่ a-z 0-9 และ - เท่านั้น"),
  description: z.string().max(500).optional().default(""),
  tagline: z.string().max(120).optional().default(""),
  logoUrl: z
    .string()
    .url("ต้องเป็น URL ที่ขึ้นต้นด้วย https://")
    .or(z.literal(""))
    .optional()
    .default(""),
  bannerUrl: z
    .string()
    .url("ต้องเป็น URL ที่ขึ้นต้นด้วย https://")
    .or(z.literal(""))
    .optional()
    .default(""),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#2563eb"),
  customDomain: z.string().max(253).optional().default(""),
  contactEmail: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .or(z.literal(""))
    .optional()
    .default(""),
  contactPhone: z.string().max(30).optional().default(""),
  facebookUrl: z
    .string()
    .url("ต้องเป็น URL ที่ขึ้นต้นด้วย https://")
    .or(z.literal(""))
    .optional()
    .default(""),
  lineId: z.string().max(50).optional().default(""),
  platformEmailForwardTo: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .or(z.literal(""))
    .optional()
    .default(""),
});

type FormValues = z.infer<typeof schema>;

interface StoreSettingsFormProps {
  defaultValues: FormValues;
  platformEmail: {
    address: string | null;
    verified: boolean;
  };
  ownerLoginEmail: string | null;
}

/**
 * Owner-side wrapper around <ImageUploadField /> that adds a label
 * + react-hook-form error slot. Aspect maps to the upload field's
 * preview dimensions (square → 96×96 with object-cover; wide →
 * 720×180 with object-cover so banners stay full-bleed). The
 * upload-from-disk path is handled by ImageUploadField itself.
 */
function ImageUrlInput({
  label,
  value,
  onChange,
  aspect,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspect: "square" | "wide";
  placeholder: string;
  error?: string;
}) {
  const isSquare = aspect === "square";
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <ImageUploadField
        value={value}
        onChange={onChange}
        kind={isSquare ? "logo" : "banner"}
        placeholder={placeholder}
        previewWidth={isSquare ? 96 : 720}
        previewHeight={isSquare ? 96 : 180}
        cover={!isSquare}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function StoreSettingsForm({
  defaultValues,
  platformEmail: initialPlatformEmail,
  ownerLoginEmail,
}: StoreSettingsFormProps) {
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "warn" | "err"; msg: string } | null>(null);
  const [pe, setPe] = useState(initialPlatformEmail);
  const [provisioning, setProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const logoUrl = watch("logoUrl") ?? "";
  const bannerUrl = watch("bannerUrl") ?? "";
  const primaryColor = watch("primaryColor") ?? "#2563eb";

  async function onSubmit(values: FormValues) {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/store/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg =
          typeof err.error === "object"
            ? Object.values(err.error).flat().join(", ")
            : (err.error ?? "บันทึกไม่สำเร็จ");
        setToast({ type: "err", msg });
      } else {
        const updated = await res.json().catch(() => null);
        const warnings: string[] = Array.isArray(updated?.warnings) ? updated.warnings : [];
        if (updated?.platformEmail) {
          setPe({
            address: updated.platformEmail,
            verified: !!updated.platformEmailVerified,
          });
        }
        setToast({
          type: warnings.length ? "warn" : "ok",
          msg: warnings.length
            ? `บันทึกแล้ว — ข้อควรระวัง: ${warnings.join("; ")}`
            : "บันทึกสำเร็จแล้ว",
        });
      }
    } catch {
      setToast({ type: "err", msg: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
    } finally {
      setSaving(false);
    }
  }

  async function provisionEmail() {
    setProvisioning(true);
    setProvisionError(null);
    try {
      const res = await fetch("/api/store/platform-email/provision", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setProvisionError(json.error ?? "ออกอีเมลไม่สำเร็จ");
        return;
      }
      setPe({ address: json.aliasEmail, verified: !!json.verified });
    } catch {
      setProvisionError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setProvisioning(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {toast && (
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            toast.type === "ok"
              ? "bg-green-50 text-green-800 border border-green-200"
              : toast.type === "warn"
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Store info */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลร้าน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">ชื่อร้าน</label>
            <Input {...register("name")} placeholder="ชื่อร้านของคุณ" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Slug (URL)</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/stores/</span>
              <Input {...register("slug")} placeholder="my-store" className="flex-1" />
            </div>
            {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Tagline</label>
            <Input {...register("tagline")} placeholder="สั้นๆ แค่ประโยคเดียว" />
            {errors.tagline && <p className="text-xs text-red-500">{errors.tagline.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">คำอธิบายร้าน</label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="บอกลูกค้าว่าร้านของคุณขายอะไร…"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logo & Banner */}
      <Card>
        <CardHeader>
          <CardTitle>รูปภาพ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUrlInput
            label="Logo ร้าน (แนะนำ 200×200)"
            value={logoUrl}
            onChange={(url) => setValue("logoUrl", url, { shouldValidate: true })}
            aspect="square"
            placeholder="https://example.com/logo.png"
            error={errors.logoUrl?.message}
          />
          <ImageUrlInput
            label="Banner ร้าน (แนะนำ 1200×300)"
            value={bannerUrl}
            onChange={(url) => setValue("bannerUrl", url, { shouldValidate: true })}
            aspect="wide"
            placeholder="https://example.com/banner.jpg"
            error={errors.bannerUrl?.message}
          />
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>สีและแบรนด์</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">สีหลักของร้าน</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setValue("primaryColor", e.target.value)}
                className="h-9 w-16 cursor-pointer rounded-md border border-input p-1"
              />
              <Input
                {...register("primaryColor")}
                placeholder="#2563eb"
                className="w-32 font-mono"
              />
              <div
                className="h-9 w-9 rounded-md border"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
            {errors.primaryColor && (
              <p className="text-xs text-red-500">{errors.primaryColor.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom domain */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Domain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">โดเมนของคุณ</label>
            <Input
              {...register("customDomain")}
              placeholder="shop.yourdomain.com"
              className="font-mono"
            />
            {errors.customDomain && (
              <p className="text-xs text-red-500">{errors.customDomain.message}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            ชี้ CNAME ของโดเมนมาที่ {process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, "") ?? "marketplace.local"} แล้วใส่โดเมนที่นี่
          </p>
        </CardContent>
      </Card>

      {/* Platform email + Identity verification (no OTP — auto-verified by login email) */}
      <Card>
        <CardHeader>
          <CardTitle>อีเมลของระบบ (ยืนยันตัวตน)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            ระบบออกอีเมลฟรีให้บนโดเมนกลาง — ใช้เป็นจุดอ้างอิงสำหรับยืนยันตัวตน
            ออกอัตโนมัติเมื่อตั้ง Custom Domain หรือกดสร้างเอง ยืนยันตัวตน <strong>อัตโนมัติ</strong>
            เมื่อ forward target ตรงกับอีเมลที่ใช้ login{ownerLoginEmail ? ` (${ownerLoginEmail})` : ""}
          </p>

          <div className="space-y-1">
            <label className="text-sm font-medium">อีเมลของระบบ</label>
            <div className="flex items-center gap-2">
              <Input
                value={pe.address ?? "— ยังไม่มี —"}
                readOnly
                className="font-mono text-sm bg-gray-50"
              />
              {pe.address && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard?.writeText(pe.address ?? "")}
                >
                  Copy
                </Button>
              )}
            </div>
          </div>

          {!pe.address && (
            <Button type="button" onClick={provisionEmail} disabled={provisioning}>
              {provisioning ? "กำลังสร้าง…" : "สร้างอีเมลให้ฉัน"}
            </Button>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">ส่งต่อไปที่ (Forward target)</label>
            <Input
              {...register("platformEmailForwardTo")}
              placeholder={ownerLoginEmail ?? "owner@gmail.com"}
              type="email"
            />
            {errors.platformEmailForwardTo && (
              <p className="text-xs text-red-500">{errors.platformEmailForwardTo.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              ปลายทางที่ระบบจะ forward อีเมลไป — ใส่ตรงกับอีเมล login เพื่อให้ยืนยันตัวตนอัตโนมัติ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">สถานะ:</span>
            {pe.verified ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                ยืนยันแล้ว ✓
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                ยังไม่ยืนยัน
              </span>
            )}
          </div>

          {provisionError && <p className="text-xs text-red-600">{provisionError}</p>}
        </CardContent>
      </Card>

      {/* Contact channels */}
      <Card>
        <CardHeader>
          <CardTitle>ช่องทางติดต่อ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            แสดงในส่วนท้ายของหน้าร้าน — เว้นว่างไว้ถ้าไม่มี
          </p>
          <div className="space-y-1">
            <label className="text-sm font-medium">อีเมล</label>
            <Input
              {...register("contactEmail")}
              placeholder="contact@yourshop.com"
              type="email"
            />
            {errors.contactEmail && (
              <p className="text-xs text-red-500">{errors.contactEmail.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">เบอร์โทร</label>
            <Input
              {...register("contactPhone")}
              placeholder="081-234-5678"
              type="tel"
            />
            {errors.contactPhone && (
              <p className="text-xs text-red-500">{errors.contactPhone.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Facebook Page URL</label>
            <Input
              {...register("facebookUrl")}
              placeholder="https://facebook.com/yourpage"
              className="font-mono text-xs"
            />
            {errors.facebookUrl && (
              <p className="text-xs text-red-500">{errors.facebookUrl.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">LINE ID</label>
            <Input
              {...register("lineId")}
              placeholder="@yourshop หรือ yourlineid"
            />
            {errors.lineId && (
              <p className="text-xs text-red-500">{errors.lineId.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "กำลังบันทึก…" : "บันทึกการตั้งค่า"}
        </Button>
      </div>
    </form>
  );
}
