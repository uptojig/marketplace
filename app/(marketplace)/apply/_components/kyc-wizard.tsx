"use client";

/**
 * KYC Wizard — consumer-facing 4-step verification flow.
 *
 * Visual language matches the Editorial Merchant Stitch designs
 * (screens 03/04/06/05/07): sticky brand stepper, dashed cream upload
 * zones, instructions cards on cream-alt, mock-phone preview on Step 3,
 * sticky back/next footer. Replaces the original dev-console wizard
 * (kyc-wizard.tsx pre-2026-05-17) which used English step labels +
 * raw JSON timeline; that variant lives in git history.
 *
 * Logic preserved from the original:
 *   - WizardState enum + STEPS array
 *   - API endpoints (/api/wizard, /s3/dga-capture, /s1/id-card,
 *     /s4/ussd, /s6/bankbook) called via FormData
 *   - createHeldIdCropFromSelfie() canvas crop on selfie before submit
 *   - GET /api/wizard/{sid} snapshot polling after each step
 *
 * Anonymous resume:
 *   /apply passes `initialSessionId` from the ?sid= query param so an
 *   unauthenticated tester can refresh the page and stay on the same
 *   wizard session. Without the prop the wizard creates a fresh session
 *   on mount (handles direct landings where the start CTA POSTed and
 *   redirected here).
 */

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  IdCard,
  Loader2,
  RefreshCcw,
  Smartphone,
  Trash2,
  Upload,
  UserCircle2,
  Wallet,
  XCircle,
} from "lucide-react";

type WizardState =
  | "INIT"
  | "S1_DGA_CAPTURE"
  | "S2_ID_SELFIE"
  | "S3_PHONE_RESPONSE"
  | "S4_BANKBOOK_UPLOAD"
  | "AUTO_APPROVED"
  | "REJECTED"
  | "MANUAL_REVIEW";

interface SnapshotPayload {
  ok: boolean;
  id: string;
  state: WizardState;
  finalDecision?: WizardState | null;
}

type StepKey = "S1_DGA_CAPTURE" | "S2_ID_SELFIE" | "S3_PHONE_RESPONSE" | "S4_BANKBOOK_UPLOAD";

const STEPS: Array<{ state: StepKey; label: string }> = [
  { state: "S1_DGA_CAPTURE", label: "D.GA" },
  { state: "S2_ID_SELFIE", label: "บัตร + เซลฟี่" },
  { state: "S3_PHONE_RESPONSE", label: "SMS" },
  { state: "S4_BANKBOOK_UPLOAD", label: "สมุดบัญชี" },
];

const TERMINAL_STATES = new Set<WizardState>(["AUTO_APPROVED", "REJECTED", "MANUAL_REVIEW"]);

// ── Canvas crop helper (Thai national ID aspect 85.6 × 53.98 mm) ──
const THAI_ID_ASPECT = 85.6 / 53.98;
const HELD_ID_CROP_WIDTH_RATIO = 0.68;
const HELD_ID_CROP_CENTER_Y_RATIO = 0.735;
const HELD_ID_CROP_OUTPUT_WIDTH = 1200;
const HELD_ID_CROP_JPEG_QUALITY = 0.94;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("อ่านรูป selfie เพื่อ crop บัตรไม่ได้"));
    };
    img.src = url;
  });
}

async function createHeldIdCropFromSelfie(file: File): Promise<File> {
  const image = await loadImageFromFile(file);
  const sw = image.naturalWidth;
  const sh = image.naturalHeight;
  const cropW = Math.min(sw, Math.round(sw * HELD_ID_CROP_WIDTH_RATIO));
  const cropH = Math.min(sh, Math.round(cropW / THAI_ID_ASPECT));
  const cropX = Math.max(0, Math.min(sw - cropW, Math.round((sw - cropW) / 2)));
  const centerY = Math.round(sh * HELD_ID_CROP_CENTER_Y_RATIO);
  const cropY = Math.max(0, Math.min(sh - cropH, centerY - Math.round(cropH / 2)));
  const outW = Math.max(HELD_ID_CROP_OUTPUT_WIDTH, cropW);
  const outH = Math.round(outW / THAI_ID_ASPECT);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", HELD_ID_CROP_JPEG_QUALITY);
  });
  if (!blob) throw new Error("สร้าง crop บัตรจาก selfie ไม่สำเร็จ");
  return new File([blob], `selfie-crop-${Date.now()}.jpg`, { type: "image/jpeg" });
}

interface FetchResult<T> {
  ok: boolean;
  status: number;
  payload: T & { ok?: boolean; error?: string };
}

async function postJson<T>(url: string, init?: RequestInit): Promise<FetchResult<T>> {
  const res = await fetch(url, init);
  const payload = (await res.json()) as T & { ok?: boolean; error?: string };
  return { ok: res.ok && payload.ok !== false, status: res.status, payload };
}

// ────────────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────────────

interface KycWizardProps {
  initialSessionId?: string;
}

export default function KycWizard({ initialSessionId }: KycWizardProps = {}) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null);
  const [state, setState] = useState<WizardState>("INIT");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const terminalRefreshRequested = useRef(false);

  // Files held in state per step
  const [dga1, setDga1] = useState<File | null>(null);
  const [dga2, setDga2] = useState<File | null>(null);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfieCrop, setSelfieCrop] = useState<File | null>(null);
  const [phoneShot, setPhoneShot] = useState<File | null>(null);
  const [bankbook, setBankbook] = useState<File | null>(null);

  // Auto-load snapshot if we were handed a sid (anonymous resume)
  useEffect(() => {
    if (initialSessionId) refresh(initialSessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSessionId]);

  useEffect(() => {
    if (!TERMINAL_STATES.has(state)) {
      terminalRefreshRequested.current = false;
      return;
    }
    if (!sessionId || terminalRefreshRequested.current) return;
    terminalRefreshRequested.current = true;
    router.replace(`/apply?sid=${encodeURIComponent(sessionId)}`);
    router.refresh();
  }, [router, sessionId, state]);

  async function refresh(sid: string) {
    try {
      const res = await postJson<SnapshotPayload>(`/api/wizard/${sid}`);
      if (res.ok && res.payload?.state) setState(res.payload.state);
    } catch {
      /* ignore — snapshot refresh is best-effort */
    }
  }

  async function startSession() {
    setBusy(true);
    setError(null);
    try {
      const res = await postJson<{ session_id: string; state: WizardState }>(
        "/api/wizard",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ metadata: { entry: "kyc-wizard-v2" } }),
        },
      );
      if (!res.ok) throw new Error(res.payload.error ?? `เริ่ม session ไม่ได้ (${res.status})`);
      setSessionId(res.payload.session_id);
      setState(res.payload.state);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function submitDga() {
    if (!sessionId || !dga1) {
      setError("กรุณาอัปโหลดรูปที่ 1 ก่อน");
      return;
    }
    if (!dga2) {
      setError("กรุณาอัปโหลดรูปที่ 2 เพื่อให้ระบบปิดข้อมูล Username ก่อนเก็บหลักฐาน");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("image1", dga1);
      form.append("image2", dga2);
      const res = await postJson<SnapshotPayload>(
        `/api/wizard/${sessionId}/s3/dga-capture`,
        { method: "POST", body: form },
      );
      if (!res.ok)
        throw new Error(res.payload.error ?? `ส่ง DGA ไม่สำเร็จ (${res.status})`);
      setState(res.payload.state);
      setInfo("ตรวจ DGA สำเร็จ — ไปขั้นตอนถัดไป");
      setDga1(null);
      setDga2(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleSelfieChange(ev: ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0] ?? null;
    setSelfie(file);
    setSelfieCrop(null);
    setError(null);
    if (!file) return;
    try {
      const crop = await createHeldIdCropFromSelfie(file);
      setSelfieCrop(crop);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function submitIdSelfie() {
    if (!sessionId || !idFront || !selfie) {
      setError("กรุณาอัปโหลดทั้งบัตรประชาชนและเซลฟี่");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("id_front", idFront);
      form.append("selfie", selfie);
      if (selfieCrop) form.append("selfie_held_id_crop", selfieCrop);
      const res = await postJson<SnapshotPayload>(
        `/api/wizard/${sessionId}/s1/id-card`,
        { method: "POST", body: form },
      );
      if (!res.ok)
        throw new Error(res.payload.error ?? `ตรวจบัตร+เซลฟี่ไม่สำเร็จ (${res.status})`);
      setState(res.payload.state);
      setInfo("ตรวจบัตร + เซลฟี่สำเร็จ");
      setIdFront(null);
      setSelfie(null);
      setSelfieCrop(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function submitImage(
    endpoint: string,
    file: File | null,
    field: string,
    label: string,
  ) {
    if (!sessionId || !file) {
      setError(`กรุณาอัปโหลด${label}ก่อน`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append(field, file);
      const res = await postJson<SnapshotPayload>(
        `/api/wizard/${sessionId}/${endpoint}`,
        { method: "POST", body: form },
      );
      if (!res.ok) throw new Error(res.payload.error ?? `อัปโหลดไม่สำเร็จ (${res.status})`);
      setState(res.payload.state);
      setInfo(`ส่ง${label}สำเร็จ`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const submitPhone = () =>
    submitImage("s4/ussd", phoneShot, "image", "screenshot การยืนยันเบอร์");
  const submitBankbook = () =>
    submitImage("s6/bankbook", bankbook, "image", "สมุดบัญชี");

  const currentIdx = useMemo(() => {
    if (TERMINAL_STATES.has(state)) return STEPS.length - 1;
    const i = STEPS.findIndex((s) => s.state === state);
    return i < 0 ? -1 : i;
  }, [state]);

  // ── Render branches ─────────────────────────────────────────────

  if (state === "INIT" && !sessionId) {
    return <IntroScreen onStart={startSession} busy={busy} error={error} />;
  }

  if (TERMINAL_STATES.has(state)) {
    // Terminal screens are owned by /apply/page.tsx (ApprovedScreen,
    // RejectedScreen, ReviewScreen). Wizard just refreshes; the parent
    // server component will swap them in on next request.
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 text-mp-forest mx-auto mb-3" />
          <p className="text-[15px] text-mp-ink-muted">
            กำลังบันทึกผล... รีเฟรชหน้าเพื่อดูสรุป
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Stepper currentIdx={currentIdx} />

      {/* ── Step content ─────────────────────────────────────────── */}
      <div className="px-4 md:px-8 py-8 md:py-10">
        {info && (
          <div className="mb-4 max-w-[680px] mx-auto rounded-xl border border-mp-forest/30 bg-mp-forest/8 px-4 py-2.5 text-[14px] text-mp-forest">
            ✓ {info}
          </div>
        )}
        {error && (
          <div className="mb-4 max-w-[680px] mx-auto rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 text-[14px] text-red-800">
            <p className="font-semibold mb-1">เกิดข้อผิดพลาด</p>
            <p>{error}</p>
          </div>
        )}

        {state === "S1_DGA_CAPTURE" && (
          <StepDga
            dga1={dga1}
            dga2={dga2}
            onPickDga1={setDga1}
            onPickDga2={setDga2}
            busy={busy}
            onSubmit={submitDga}
          />
        )}

        {state === "S2_ID_SELFIE" && (
          <StepIdSelfie
            idFront={idFront}
            selfie={selfie}
            onPickId={setIdFront}
            onPickSelfie={handleSelfieChange}
            busy={busy}
            onSubmit={submitIdSelfie}
          />
        )}

        {state === "S3_PHONE_RESPONSE" && (
          <StepPhone
            file={phoneShot}
            onPick={setPhoneShot}
            busy={busy}
            onSubmit={submitPhone}
            errorOnRetry={error}
          />
        )}

        {state === "S4_BANKBOOK_UPLOAD" && (
          <StepBankbook
            file={bankbook}
            onPick={setBankbook}
            busy={busy}
            onSubmit={submitBankbook}
          />
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Sticky stepper bar (Stitch screens 03-07)
// ────────────────────────────────────────────────────────────────────

function Stepper({ currentIdx }: { currentIdx: number }) {
  return (
    <div className="sticky top-16 z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-4 bg-white border-b border-mp-border">
      <div className="flex items-center gap-2 max-w-[680px] mx-auto">
        {STEPS.map((step, i) => {
          const isActive = i === currentIdx;
          const isDone = i < currentIdx;
          const isPending = i > currentIdx;
          return (
            <div key={step.state} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={
                    "w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition " +
                    (isActive
                      ? "bg-mp-coral text-white shadow-sm ring-4 ring-mp-coral/20"
                      : isDone
                        ? "bg-mp-forest text-white"
                        : "bg-mp-cream-alt text-mp-ink-muted")
                  }
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <span
                  className={
                    "hidden sm:block text-[11px] font-medium uppercase tracking-[0.08em] " +
                    (isActive
                      ? "text-mp-ink"
                      : isDone
                        ? "text-mp-forest"
                        : "text-mp-ink-muted")
                  }
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={
                    "flex-1 h-0.5 rounded-full transition " +
                    (isDone ? "bg-mp-forest" : "bg-mp-border")
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Intro (rarely shown — /apply landing usually creates the session)
// ────────────────────────────────────────────────────────────────────

function IntroScreen({
  onStart,
  busy,
  error,
}: {
  onStart: () => void;
  busy: boolean;
  error: string | null;
}) {
  return (
    <div className="px-6 py-12 text-center max-w-[480px] mx-auto">
      <h2
        className="text-2xl font-bold text-mp-ink mb-3"
        style={{ fontFamily: "var(--mp-font-display)" }}
      >
        เริ่ม KYC Wizard
      </h2>
      <p className="text-[15px] text-mp-ink-muted mb-6">
        คลิกเพื่อสร้าง session ใหม่ — เตรียม 4 เอกสารให้พร้อมก่อน
      </p>
      {error && (
        <div className="mb-4 rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 text-[14px] text-red-800 text-left">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={onStart}
        disabled={busy}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-mp-coral px-8 text-[15px] font-semibold text-white shadow-sm hover:bg-mp-coral-dark disabled:opacity-50 transition-all"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        เริ่มเลย
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Per-step screens (match Stitch designs 03, 04, 06/05, 07)
// ────────────────────────────────────────────────────────────────────

function StepHeader({
  step,
  total,
  title,
  body,
}: {
  step: number;
  total: number;
  title: string;
  body: string;
}) {
  return (
    <div className="text-center max-w-[640px] mx-auto mb-8">
      <span className="inline-block text-[12px] font-medium uppercase tracking-[0.12em] text-mp-coral mb-2">
        ขั้นตอน {step} จาก {total}
      </span>
      <h2
        className="text-2xl md:text-3xl font-bold text-mp-ink mb-3"
        style={{ fontFamily: "var(--mp-font-display)" }}
      >
        {title}
      </h2>
      <p className="text-[15px] leading-relaxed text-mp-ink-muted">{body}</p>
    </div>
  );
}

function UploadZone({
  file,
  onPick,
  label,
  sub,
  required = false,
  icon: Icon = Upload,
  height = "min-h-[200px]",
  previewLayout = "compact",
  previewFit = "cover",
}: {
  file: File | null;
  onPick: (f: File | null) => void;
  label: string;
  sub: string;
  required?: boolean;
  icon?: typeof Upload;
  height?: string;
  previewLayout?: "compact" | "full";
  previewFit?: "cover" | "contain";
}) {
  const id = `upload-${label.replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 6)}`;
  const previewFitClass = previewFit === "contain" ? "object-contain" : "object-cover";
  return (
    <div>
      <input
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
      <label
        htmlFor={id}
        className={
          "block cursor-pointer rounded-xl border-2 border-dashed transition " +
          (file
            ? "border-mp-forest bg-mp-forest/5"
            : required
              ? "border-mp-coral/40 bg-mp-cream-alt/40 hover:bg-mp-cream-alt/60 hover:border-mp-coral"
              : "border-mp-border bg-mp-cream-alt/30 hover:bg-mp-cream-alt/50 hover:border-mp-ink-muted")
        }
      >
        {file ? (
          previewLayout === "full" ? (
            <div className={`flex flex-col p-4 ${height}`}>
              <div className="flex-1 min-h-[200px] rounded-lg overflow-hidden bg-mp-cream-alt border border-mp-border p-3">
                <div className="w-full h-full rounded-md overflow-hidden bg-white/70">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className={`w-full h-full ${previewFitClass}`}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-mp-forest mb-0.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="text-[13px] font-semibold">อัปโหลดแล้ว</span>
                  </div>
                  <p className="text-[14px] text-mp-ink truncate">{file.name}</p>
                  <p className="text-[12px] text-mp-ink-muted">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onPick(null);
                  }}
                  aria-label="ลบและอัปโหลดใหม่"
                  className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md text-mp-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className={`flex items-center gap-4 p-5 ${height}`}>
              <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-mp-cream-alt border border-mp-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className={`w-full h-full ${previewFitClass}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-mp-forest mb-0.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="text-[13px] font-semibold">อัปโหลดแล้ว</span>
                </div>
                <p className="text-[14px] text-mp-ink truncate">{file.name}</p>
                <p className="text-[12px] text-mp-ink-muted">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onPick(null);
                }}
                aria-label="ลบและอัปโหลดใหม่"
                className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md text-mp-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )
        ) : (
          <div className={`flex flex-col items-center justify-center text-center p-6 ${height}`}>
            <Icon className="w-10 h-10 text-mp-forest mb-3" strokeWidth={1.5} />
            <p className="text-[15px] font-semibold text-mp-ink mb-1">{label}</p>
            <p className="text-[12px] text-mp-ink-muted">{sub}</p>
          </div>
        )}
      </label>
    </div>
  );
}

function StickyFooter({
  onSubmit,
  busy,
  disabled,
  submitLabel = "ดำเนินการต่อ",
  submitLarge = false,
}: {
  onSubmit: () => void;
  busy: boolean;
  disabled: boolean;
  submitLabel?: string;
  submitLarge?: boolean;
}) {
  return (
    <div className="max-w-[680px] mx-auto mt-10 flex items-center justify-between pt-6 border-t border-mp-border">
      <Link
        href="/apply"
        className="inline-flex items-center gap-1.5 text-[14px] text-mp-ink-muted hover:text-mp-ink transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        ย้อนกลับ
      </Link>
      <button
        type="button"
        onClick={onSubmit}
        disabled={busy || disabled}
        className={
          "inline-flex items-center justify-center gap-2 rounded-xl bg-mp-coral text-white font-semibold shadow-sm hover:bg-mp-coral-dark hover:-translate-y-px disabled:opacity-50 disabled:hover:transform-none transition-all " +
          (submitLarge
            ? "h-14 px-10 text-base"
            : "h-11 px-6 text-[15px]")
        }
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {submitLabel}
        {!busy && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ── Step 1: DGA Capture ────────────────────────────────────────────

function StepDga({
  dga1,
  dga2,
  onPickDga1,
  onPickDga2,
  busy,
  onSubmit,
}: {
  dga1: File | null;
  dga2: File | null;
  onPickDga1: (f: File | null) => void;
  onPickDga2: (f: File | null) => void;
  busy: boolean;
  onSubmit: () => void;
}) {
  return (
    <div>
      <StepHeader
        step={1}
        total={4}
        title="อัปโหลดรูปจากแอป D.GA"
        body="เปิดแอป D.GA หรือ ThaID → ไปที่หน้าโปรไฟล์ที่แสดงข้อมูลส่วนตัว → ถ่ายภาพหน้าจอ"
      />

      <div className="max-w-[640px] mx-auto rounded-xl bg-mp-cream-alt/60 border border-mp-border p-5 mb-6">
        <p className="text-[14px] font-semibold text-mp-ink mb-2">ข้อมูลที่ต้องเห็นในภาพ:</p>
        <p className="text-[13px] text-mp-ink-muted leading-relaxed">
          ชื่อ-นามสกุล, เลขบัตรประชาชน, วันเกิด, ที่อยู่, เบอร์มือถือ, อีเมล
        </p>
        <p className="mt-2 text-[12px] text-mp-ink-muted/80 italic">
          รูปที่ 2 จำเป็นสำหรับปิดข้อมูล Username ก่อนเก็บหลักฐาน
        </p>
      </div>

      <div className="max-w-[920px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-[13px] font-semibold text-mp-ink mb-2">รูปที่ 1 (จำเป็น)</p>
          <UploadZone
            file={dga1}
            onPick={onPickDga1}
            label="ลากภาพมาวางที่นี่ หรือ เลือกไฟล์"
            sub="JPG, PNG · สูงสุด 5MB"
            required
            height="min-h-[280px] md:min-h-[320px]"
            previewLayout="full"
            previewFit="contain"
          />
        </div>

        <div>
          <p className="text-[13px] font-semibold text-mp-ink mb-2">รูปที่ 2 (จำเป็น)</p>
          <UploadZone
            file={dga2}
            onPick={onPickDga2}
            label="ลากภาพมาวางที่นี่ หรือ เลือกไฟล์"
            sub="ใช้ตรวจและ blur Username ก่อนบันทึก"
            required
            height="min-h-[280px] md:min-h-[320px]"
            previewLayout="full"
            previewFit="contain"
          />
        </div>
      </div>

      <StickyFooter onSubmit={onSubmit} busy={busy} disabled={!dga1 || !dga2} />
    </div>
  );
}

// ── Step 2: ID + Selfie ────────────────────────────────────────────

function StepIdSelfie({
  idFront,
  selfie,
  onPickId,
  onPickSelfie,
  busy,
  onSubmit,
}: {
  idFront: File | null;
  selfie: File | null;
  onPickId: (f: File | null) => void;
  onPickSelfie: (e: ChangeEvent<HTMLInputElement>) => void;
  busy: boolean;
  onSubmit: () => void;
}) {
  // Selfie uses its own labeled file input (not UploadZone) so we can hook
  // the auto-crop handler. Wrap in similar dashed styling.
  const selfieInputId = "selfie-file-input";
  return (
    <div>
      <StepHeader
        step={2}
        total={4}
        title="อัปโหลดรูปบัตรประชาชน + เซลฟี่"
        body="ระบบจะเทียบใบหน้าในเซลฟี่กับรูปในบัตรประชาชน และตรวจสอบข้อมูลตรงกับขั้นตอนที่ 1"
      />

      <div className="max-w-[640px] mx-auto rounded-xl bg-mp-cream-alt/60 border border-mp-border p-5 mb-6">
        <p className="text-[13px] text-mp-ink leading-relaxed">
          <span className="font-semibold">เคล็ดลับ:</span> ถ่ายในที่แสงสว่าง · เห็นข้อมูลครบทั้งใบ ·
          ไม่มีเงาบนบัตร · ไม่ใส่หน้ากากหรือแว่นกันแดด
        </p>
      </div>

      <div className="max-w-[680px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <p className="text-[13px] font-semibold text-mp-ink mb-2">
            1. บัตรประชาชน (ด้านหน้า)
          </p>
          <UploadZone
            file={idFront}
            onPick={onPickId}
            label="อัปโหลดรูปบัตร"
            sub="JPG, PNG · สูงสุด 5MB"
            required
            icon={IdCard}
            height="min-h-[200px]"
          />
        </div>

        <div>
          <p className="text-[13px] font-semibold text-mp-ink mb-2">
            2. เซลฟี่ถือบัตร
          </p>
          <input
            id={selfieInputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onPickSelfie}
          />
          <label
            htmlFor={selfieInputId}
            className={
              "block cursor-pointer rounded-xl border-2 border-dashed transition min-h-[200px] " +
              (selfie
                ? "border-mp-forest bg-mp-forest/5"
                : "border-mp-coral/40 bg-mp-cream-alt/40 hover:bg-mp-cream-alt/60 hover:border-mp-coral")
            }
          >
            {selfie ? (
              <div className="flex items-center gap-4 p-5">
                <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-mp-cream-alt border border-mp-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(selfie)}
                    alt={selfie.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-mp-forest mb-0.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="text-[13px] font-semibold">อัปโหลดแล้ว</span>
                  </div>
                  <p className="text-[14px] text-mp-ink truncate">{selfie.name}</p>
                  <p className="text-[12px] text-mp-ink-muted">
                    {(selfie.size / 1024).toFixed(0)} KB · ตัดกรอบบัตรอัตโนมัติแล้ว
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 min-h-[200px]">
                <UserCircle2 className="w-10 h-10 text-mp-forest mb-3" strokeWidth={1.5} />
                <p className="text-[15px] font-semibold text-mp-ink mb-1">อัปโหลดเซลฟี่</p>
                <p className="text-[12px] text-mp-ink-muted">ถือบัตรไว้ข้างหน้าใบหน้า</p>
              </div>
            )}
          </label>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto mt-4 flex items-start gap-2 text-[12px] text-mp-ink-muted">
        <Camera className="w-4 h-4 mt-0.5 shrink-0 text-mp-forest" />
        <p>
          ระบบจะตัดเฉพาะส่วนบัตรในเซลฟี่ออกมาตรวจสอบความปลอดภัย
          ใบหน้าของคุณจะถูกเก็บแบบเข้ารหัส
        </p>
      </div>

      <StickyFooter onSubmit={onSubmit} busy={busy} disabled={!idFront || !selfie} />
    </div>
  );
}

// ── Step 3: Phone Response Screenshot ──────────────────────────────

function StepPhone({
  file,
  onPick,
  busy,
  onSubmit,
  errorOnRetry,
}: {
  file: File | null;
  onPick: (f: File | null) => void;
  busy: boolean;
  onSubmit: () => void;
  errorOnRetry: string | null;
}) {
  return (
    <div>
      <StepHeader
        step={3}
        total={4}
        title="อัปโหลด screenshot การยืนยันเบอร์"
        body="ส่ง screenshot หน้าจอที่แสดง response จากระบบ DGA ที่ยืนยันว่าเบอร์มือถือของคุณตรงกับบัตรประชาชน"
      />

      <div className="max-w-[680px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* How-to instructions */}
        <div className="rounded-xl bg-mp-cream-alt/60 border border-mp-border p-5">
          <p className="text-[14px] font-semibold text-mp-ink mb-3">วิธีรับ response นี้:</p>
          <ol className="space-y-2.5 text-[13px] text-mp-ink-muted">
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-mp-coral text-white text-[11px] font-bold flex items-center justify-center">
                1
              </span>
              กดยืนยันเบอร์มือถือในแอป D.GA หรือ ThaID
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-mp-coral text-white text-[11px] font-bold flex items-center justify-center">
                2
              </span>
              รอข้อความตอบกลับที่ระบุว่าเบอร์ "ตรงกับ" บัตรประชาชน
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-mp-coral text-white text-[11px] font-bold flex items-center justify-center">
                3
              </span>
              ถ่าย screenshot หน้าจอที่เห็นข้อความนี้
            </li>
          </ol>
          <p className="mt-3 pt-3 border-t border-mp-border text-[11px] text-mp-ink-muted/80">
            ระบบจะตรวจ: เลขบัตรประชาชน + 4 หลักท้ายเบอร์ + คำว่า "ตรงกับ"
          </p>
        </div>

        {/* Mock phone preview */}
        <div className="rounded-xl bg-white border border-mp-border p-4">
          <p className="text-[12px] uppercase tracking-[0.12em] text-mp-ink-muted mb-3 text-center">
            ตัวอย่าง screenshot ที่ถูกต้อง
          </p>
          <div className="mx-auto max-w-[200px] aspect-[9/16] rounded-2xl bg-mp-ink/95 p-3 shadow-md">
            <div className="bg-white rounded-lg p-3 h-full flex flex-col">
              <p className="text-[10px] font-bold text-mp-ink mb-2">DGA Service</p>
              <div className="bg-mp-cream-alt/60 rounded-md p-2 text-[10px] leading-relaxed text-mp-ink">
                เบอร์มือถือ <span className="font-mono">081-XXX-1234</span>{" "}
                <span className="font-bold text-mp-forest">ตรงกับ</span>{" "}
                เลขบัตรประชาชน <span className="font-mono">1-2345-XXXXX-XX-X</span>
              </div>
              <p className="mt-auto text-[9px] text-mp-ink-muted text-right">10:45 น.</p>
            </div>
          </div>
        </div>
      </div>

      {errorOnRetry && (
        <div className="max-w-[680px] mx-auto mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-[13px] font-semibold text-red-900 mb-2">
            screenshot นี้ไม่พบข้อมูลที่ต้องการ:
          </p>
          <ul className="text-[12px] text-red-800 space-y-1 ml-4 list-disc">
            <li>เลขบัตรประชาชน 13 หลัก</li>
            <li>เบอร์มือถือที่ลงทะเบียน (4 หลักท้าย)</li>
            <li>คำว่า "ตรงกับ"</li>
          </ul>
        </div>
      )}

      <div className="max-w-[680px] mx-auto">
        <UploadZone
          file={file}
          onPick={onPick}
          label="อัปโหลด screenshot"
          sub="JPG, PNG · สูงสุด 5MB"
          required
          icon={Smartphone}
          height="min-h-[220px]"
        />
      </div>

      <StickyFooter onSubmit={onSubmit} busy={busy} disabled={!file} />
    </div>
  );
}

// ── Step 4: Bankbook (FINAL) ───────────────────────────────────────

function StepBankbook({
  file,
  onPick,
  busy,
  onSubmit,
}: {
  file: File | null;
  onPick: (f: File | null) => void;
  busy: boolean;
  onSubmit: () => void;
}) {
  return (
    <div>
      <StepHeader
        step={4}
        total={4}
        title="อัปโหลดสมุดบัญชีธนาคาร"
        body="ระบบจะตรวจสอบว่าชื่อในสมุดบัญชีตรงกับชื่อในบัตรประชาชน — ใช้รับเงินจากการขายในร้านของคุณ"
      />

      <div className="max-w-[680px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="rounded-xl bg-mp-cream-alt/60 border border-mp-border p-5">
          <p className="text-[14px] font-semibold text-mp-ink mb-3">สิ่งที่ต้องเห็นในภาพ:</p>
          <ul className="space-y-2.5 text-[13px] text-mp-ink">
            {[
              "ชื่อ-นามสกุลของผู้ถือบัญชี (ต้องตรงกับบัตรประชาชน)",
              "เลขที่บัญชี",
              "ชื่อธนาคาร",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-mp-forest" />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-3 pt-3 border-t border-mp-border text-[12px] text-mp-ink-muted">
            ใช้หน้าแรกของสมุดบัญชี — ไม่ต้องมีหน้ารายการเดินบัญชี
          </p>
        </div>

        <UploadZone
          file={file}
          onPick={onPick}
          label="ลากภาพสมุดบัญชีมาวางที่นี่ หรือ เลือกไฟล์"
          sub="JPG, PNG · สูงสุด 5MB"
          required
          icon={Wallet}
          height="min-h-[220px]"
        />
      </div>

      <div className="max-w-[680px] mx-auto text-center text-[12px] text-mp-ink-muted mb-2">
        เมื่อกดส่ง ระบบจะตรวจสอบและแจ้งผลทันที — ใช้เวลาประมาณ 30 วินาที
      </div>

      <StickyFooter
        onSubmit={onSubmit}
        busy={busy}
        disabled={!file}
        submitLabel="ส่งและจบขั้นตอน"
        submitLarge
      />

      {busy && (
        <div className="fixed inset-0 z-[100] bg-mp-ink/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-xl">
            <Loader2 className="w-12 h-12 text-mp-coral mx-auto mb-4 animate-spin" />
            <h3
              className="text-xl font-bold text-mp-ink mb-2"
              style={{ fontFamily: "var(--mp-font-display)" }}
            >
              กำลังตรวจสอบเอกสาร...
            </h3>
            <p className="text-[14px] text-mp-ink-muted mb-1">
              อย่าปิดหน้าต่างนี้ — ระบบกำลังเทียบข้อมูลกับฐาน DGA
            </p>
            <p className="text-[12px] text-mp-ink-muted/80">ใช้เวลา 15-45 วินาที</p>
          </div>
        </div>
      )}
    </div>
  );
}
