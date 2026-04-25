"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "ใช้ได้แค่ a-z 0-9 และ - เท่านั้น"),
  description: z.string().max(500).optional().default(""),
  tagline: z.string().max(120).optional().default(""),
  logoUrl: z.string().optional().default(""),
  bannerUrl: z.string().optional().default(""),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#2563eb"),
  customDomain: z.string().max(253).optional().default(""),
});

type FormValues = z.infer<typeof schema>;

interface StoreSettingsFormProps {
  defaultValues: FormValues;
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/uploads", { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Upload failed");
  }
  const data = await res.json();
  return data.url as string;
}

function ImageUploader({
  label,
  value,
  onChange,
  aspect,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspect: "square" | "wide";
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const previewClass =
    aspect === "square"
      ? "h-24 w-24 rounded-lg object-cover"
      : "h-24 w-full rounded-lg object-cover";

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {value && (
        <div className={aspect === "wide" ? "w-full" : "w-24"}>
          <Image
            src={value}
            alt={label}
            width={aspect === "square" ? 96 : 800}
            height={96}
            className={previewClass}
            unoptimized
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "กำลังอัพโหลด…" : value ? "เปลี่ยนรูป" : "อัพโหลดรูป"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
          >
            ลบ
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function StoreSettingsForm({ defaultValues }: StoreSettingsFormProps) {
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

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
        setToast({ type: "ok", msg: "บันทึกสำเร็จแล้ว" });
      }
    } catch {
      setToast({ type: "err", msg: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {toast && (
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            toast.type === "ok"
              ? "bg-green-50 text-green-800 border border-green-200"
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
          <ImageUploader
            label="Logo ร้าน (แนะนำ 200×200)"
            value={logoUrl}
            onChange={(url) => setValue("logoUrl", url)}
            aspect="square"
          />
          <ImageUploader
            label="Banner ร้าน (แนะนำ 1200×300)"
            value={bannerUrl}
            onChange={(url) => setValue("bannerUrl", url)}
            aspect="wide"
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

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "กำลังบันทึก…" : "บันทึกการตั้งค่า"}
        </Button>
      </div>
    </form>
  );
}
