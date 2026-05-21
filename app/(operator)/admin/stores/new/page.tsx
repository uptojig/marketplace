"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Wand2, Loader2, Check } from "lucide-react";
import {
  TemplateStylePicker,
  serializeTemplateStyle,
  type TemplateStyleValues,
} from "@/components/store/template-style-picker";
import {
  OperatorCallout,
  Button,
  Input,
  Textarea,
  Checkbox,
} from "@/components/operator/operator-primitives";

function slugify(value: string): string {
  // keep Thai chars (฀-๿) along with a-z0-9-
  return value
    .toLowerCase()
    .replace(/[^a-z0-9฀-๿-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

type Step = "info" | "brief" | "generating";

export default function NewStorePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("info");

  // Step 1 — store info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const slug = slugify(name);

  // Step 2 — AI brief
  const [brief, setBrief] = useState("");
  const [engine, setEngine] = useState<"local" | "managed">("managed");

  // Step 2 — Template & style hints (all optional — empty means "let the
  // AI / family detector decide"). These ride along on the create POST
  // so the store row is seeded with the operator's intent BEFORE the
  // landing-builder runs, which fixes the bug where templates/themes
  // failed to propagate from create → publish.
  const [style, setStyle] = useState<TemplateStyleValues>({
    templateId: "",
    paletteId: "",
    niche: "",
    brandVoice: "casual",
    landingThemeVariant: "",
  });
  const [showStyle, setShowStyle] = useState(false);

  // Progress
  const [createdStoreId, setCreatedStoreId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || slug.length < 2) {
      setError("ชื่อร้านต้องมีตัวอักษรอย่างน้อย 2 ตัว");
      return;
    }
    setError(null);
    setStep("brief");
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (brief.trim().length < 5) {
      setError("ใส่ brief อย่างน้อย 5 ตัวอักษร");
      return;
    }
    setError(null);
    setStep("generating");
    setStatusText("กำลังสร้างร้าน...");

    // 1. Create the store — seed with the operator-chosen template/style
    // so it propagates into both the storefront renderer AND the AI
    // landing-builder. Empty `landingThemeVariant` is omitted (auto from
    // templateId) via serializeTemplateStyle().
    const stylePayload = serializeTemplateStyle(style);
    const createRes = await fetch("/api/admin/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        description,
        ...stylePayload,
      }),
    });
    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      const msg =
        typeof err.error === "object"
          ? Object.values(err.error).flat().join(", ")
          : (err.error ?? "บันทึกไม่สำเร็จ");
      setError(String(msg));
      setStep("info");
      return;
    }
    const created = await createRes.json();
    setCreatedStoreId(created.id);
    setStatusText("เป็ดกำลังออกแบบ... ใช้เวลา 30 วินาที – 3 นาที");

    // 2. Kick off landing generation (NDJSON stream)
    const url =
      `/api/admin/stores/${created.id}/generate-landing` +
      (engine === "managed" ? "?engine=managed" : "");
    const genRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief: brief.trim() }),
    });
    if (!genRes.ok) {
      // Store was created — let the user open it manually
      router.push(`/admin/stores/${created.id}`);
      return;
    }

    // Drain the stream to keep connection alive
    if (genRes.body) {
      const reader = genRes.body.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n").filter(Boolean)) {
            try {
              const evt = JSON.parse(line);
              if (evt.type === "done") setStatusText("เสร็จ ✓ กำลังเปลี่ยนหน้า...");
              else if (evt.type === "error") setStatusText(`ผิดพลาด: ${evt.message}`);
            } catch {
              /* ignore non-JSON */
            }
          }
        }
      } catch {
        /* connection ended */
      }
    }

    router.push(`/admin/stores/${created.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/admin/stores"
        className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="h-3 w-3" />
        กลับไปรายการร้าน
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight text-foreground">สร้างร้านค้าใหม่</h1>

      {/* Step indicator */}
      <ol className="mb-6 mt-4 flex items-center gap-2 text-xs">
        <StepBadge active={step === "info"} done={step !== "info"} num={1}>
          ข้อมูลร้าน
        </StepBadge>
        <span className="h-px w-6 bg-border" />
        <StepBadge active={step === "brief"} done={step === "generating"} num={2}>
          บรีฟให้ AI ออกแบบ
        </StepBadge>
      </ol>

      {error && (
        <OperatorCallout tone="danger" className="mb-4">
          {error}
        </OperatorCallout>
      )}

      {/* Step 1: Store info */}
      {step === "info" && (
        <form onSubmit={handleNext} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              ชื่อร้าน <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ร้านขนมไทย หรือ My Awesome Shop"
              required
              autoFocus
            />
            <p className="mt-1 text-xs text-muted-foreground">
              URL ของร้าน:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                /stores/{slug || "<slug>"}
              </code>
              <span className="ml-2 text-muted-foreground">— สร้างจากชื่ออัตโนมัติ</span>
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              คำอธิบายร้าน <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="ขายอะไร เน้นกลุ่มลูกค้าไหน..."
              maxLength={500}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/stores">ยกเลิก</Link>
            </Button>
            <Button type="submit" disabled={!slug}>
              ถัดไป
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* Step 2: AI brief */}
      {step === "brief" && (
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm">
            <p className="font-medium">{name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <code>/stores/{slug}</code>
              {description ? ` — ${description}` : ""}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              บรีฟให้ AI ออกแบบหน้าเว็บ <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={5}
              autoFocus
              placeholder='เช่น: "ขายเคสมือถือพรีเมียม iPhone 15 Pro เน้นคุณภาพสูง ดีไซน์ minimal" หรือ "ขายขนมไทยสูตรโบราณ เน้นลูกค้าวัยทำงาน"'
              maxLength={4000}
            />
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-muted-foreground">
                🎨 Design family — เป็ดเลือกอัตโนมัติจาก brief
              </span>
              <label className="flex items-center gap-1.5 text-foreground">
                <Checkbox
                  checked={engine === "managed"}
                  onCheckedChange={(c) => setEngine(c === true ? "managed" : "local")}
                />
                <span title="Anthropic Managed Agent (v3 landing-builder) — single-shot, prompt updated centrally">
                  🤖 ใช้ Managed Agent
                </span>
              </label>
            </div>
          </div>

          {/* Optional template / style override — collapsed by default. */}
          <div className="rounded-md border border-border bg-card">
            <button
              type="button"
              onClick={() => setShowStyle((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-medium hover:bg-muted"
            >
              <span>
                Template &amp; Style{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (optional — บังคับ template ก่อน AI ทำงาน)
                </span>
              </span>
              <span className="text-xs text-muted-foreground">{showStyle ? "▲" : "▼"}</span>
            </button>
            {showStyle && (
              <div className="border-t border-border px-4 py-3">
                <TemplateStylePicker
                  embedded
                  values={style}
                  onChange={(next) => setStyle((s) => ({ ...s, ...next }))}
                />
              </div>
            )}
          </div>

          <div className="flex justify-between gap-2">
            <Button type="button" variant="outline" onClick={() => setStep("info")}>
              <ArrowLeft className="h-4 w-4" />
              ย้อนกลับ
            </Button>
            <Button type="submit" disabled={brief.trim().length < 5}>
              <Wand2 className="h-4 w-4" />
              สร้างร้านพร้อมออกแบบ
            </Button>
          </div>
        </form>
      )}

      {/* Generating state */}
      {step === "generating" && (
        <OperatorCallout tone="warning" className="px-6 py-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-4 text-sm font-medium">{statusText ?? "กำลังประมวลผล..."}</p>
          {createdStoreId && (
            <p className="mt-2 text-xs">ร้านถูกสร้างแล้ว — กำลังออกแบบหน้าเว็บ...</p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            สามารถเปิดหน้าอื่นได้เลย — ระบบจะออกแบบเสร็จในเบื้องหลัง
          </p>
        </OperatorCallout>
      )}
    </div>
  );
}

function StepBadge({
  num,
  active,
  done,
  children,
}: {
  num: number;
  active: boolean;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${
        active
          ? "bg-primary text-primary-foreground"
          : done
            ? "bg-emerald-100 text-emerald-700"
            : "bg-muted text-muted-foreground"
      }`}
    >
      {done ? <Check className="h-3 w-3" /> : <span className="font-mono text-[10px]">{num}</span>}
      {children}
    </span>
  );
}
