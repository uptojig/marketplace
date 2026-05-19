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
 *   - API endpoints (/api/wizard, /s1/dga-* (multi), /s1/id-card,
 *     /s4/ussd, /s6/bankbook) called via FormData
 *
 * S1 v2 (this revision):
 *   Step 1 is now incremental multi-image. The user uploads as many DGA
 *   screenshots as needed (short phones can't fit all 9 labels in one shot).
 *   Each upload POSTs to /s1/dga-add-image which OCRs the image and UPSERTs
 *   the label/value pairs server-side. A checklist of required fields lights
 *   up as values accumulate; finalize fires /s1/dga-finalize once all 9
 *   required fields are captured. The user can also DELETE individual
 *   images via /s1/dga-image/{evidenceId} — their contributions drop out of
 *   the checklist.
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
  Lock,
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
  | "S1_DGA_REVIEW"
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

type StepKey =
  | "S1_ID_CARD_REF"
  | "S2_EMAIL_PENDING"
  | "S3_OTP_VERIFIED"
  | "S1_DGA_CAPTURE"
  | "S2_ID_SELFIE"
  | "S3_PHONE_RESPONSE"
  | "S4_BANKBOOK_UPLOAD";

// S1 v2 checklist — mirrors /lib/kyc/dga-fields.ts (kept local so the
// frontend doesn't pull server-only imports). Server is source of truth;
// these shapes match the JSON the /s1/dga-* endpoints return.
type DgaFieldState = "missing" | "captured" | "captured_warn";

interface DgaChecklistEntry {
  key: string;
  label: string;
  required: boolean;
  state: DgaFieldState;
  value: string | null;
  warning: string | null;
  evidenceId: string | null;
  // S1_DGA_REVIEW additions. `locked` = field cannot be edited (citizenId
  // + dob — strict cross-match anchors). `originalValue` = the first OCR
  // value, populated once the vendor edits the field so the UI can show
  // "OCR อ่านได้: <X>" as a faint hint beside the corrected current value.
  locked: boolean;
  originalValue: string | null;
  editedByUser: boolean;
}

interface DgaUploadedImage {
  id: string;
  fieldsContributed: string[];
  bytes: number;
  mime: string;
  // Set when the user uploaded in this browser session (blob: URL we
  // own and must revoke). Once the server returns the redacted evidence URL,
  // we drop this local raw preview and render the persisted image instead.
  previewUrl: string | null;
  url: string | null;
  filename: string | null;
}

function revokeBlobPreview(url: string | null | undefined) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

// Full 7-step view shared with kyc-wizard-v3.tsx — the stepper renders
// the entire flow so a vendor handed off from v3 (state has advanced
// past S3_OTP_VERIFIED into S1_DGA_CAPTURE) sees a continuous progress
// bar instead of a new 1/4-style stepper resetting from zero. Labels
// mirror the LandingScreen list in app/(marketplace)/apply/page.tsx.
const STEPS: Array<{ state: StepKey; label: string }> = [
  { state: "S1_ID_CARD_REF", label: "บัตร" },
  { state: "S2_EMAIL_PENDING", label: "อีเมล" },
  { state: "S3_OTP_VERIFIED", label: "OTP" },
  { state: "S1_DGA_CAPTURE", label: "D.GA" },
  { state: "S2_ID_SELFIE", label: "เซลฟี่" },
  { state: "S3_PHONE_RESPONSE", label: "เบอร์" },
  { state: "S4_BANKBOOK_UPLOAD", label: "บัญชี" },
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

// ── SSE streaming ──────────────────────────────────────────────────
// Wizard verification routes emit progress events as work proceeds.
// Wall time is unchanged from JSON mode, but the user sees stage-by-
// stage feedback instead of a 10-second blank spinner.

export interface SSEStage {
  name: string;
  label?: string;
  ms: number;
  total_ms: number;
}

// fetch() reads body as a ReadableStream of Uint8Array. We parse the
// W3C SSE format ourselves rather than using EventSource because EventSource
// doesn't support POST + FormData (it always GETs). The parser is small:
// split on "\n\n" (event delimiter), then on "\n" (field per event).
async function postSSE<T>(
  url: string,
  init: RequestInit,
  opts: { onStage?: (stage: SSEStage) => void },
): Promise<FetchResult<T>> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Accept: "text/event-stream",
    },
  });
  // Server rejected before stream started (4xx) → fall back to JSON parse
  // of the error body so callers see a real message.
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("text/event-stream")) {
    const payload = (await res.json()) as T & { ok?: boolean; error?: string };
    return { ok: res.ok && payload.ok !== false, status: res.status, payload };
  }
  if (!res.body) {
    return { ok: false, status: res.status, payload: { error: "no SSE body" } as T & { error?: string } };
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult: (T & { ok?: boolean; error?: string }) | null = null;
  let errorPayload: { message?: string } | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // SSE events are separated by blank line ("\n\n")
    const splitIdx = (): number => buffer.indexOf("\n\n");
    while (splitIdx() >= 0) {
      const event = buffer.slice(0, splitIdx());
      buffer = buffer.slice(splitIdx() + 2);
      const lines = event.split("\n");
      let eventType = "message";
      let dataLine = "";
      for (const line of lines) {
        if (line.startsWith("event:")) eventType = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLine = line.slice(5).trim();
      }
      if (!dataLine) continue;
      let parsed: unknown;
      try { parsed = JSON.parse(dataLine); } catch { continue; }
      if (eventType === "stage") {
        opts.onStage?.(parsed as SSEStage);
      } else if (eventType === "result") {
        finalResult = parsed as T & { ok?: boolean; error?: string };
      } else if (eventType === "error") {
        errorPayload = parsed as { message?: string };
      }
    }
  }
  if (finalResult) {
    return { ok: finalResult.ok !== false, status: res.status, payload: finalResult };
  }
  return {
    ok: false,
    status: res.status,
    payload: { error: errorPayload?.message ?? "stream ended without result" } as T & { error?: string },
  };
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

  // S1 v2 — server-tracked checklist + uploaded image list. Images are
  // accumulated incrementally; finalize gates on the checklist being
  // complete for all 9 required fields.
  const [dgaImages, setDgaImages] = useState<DgaUploadedImage[]>([]);
  const [dgaChecklist, setDgaChecklist] = useState<DgaChecklistEntry[]>([]);
  const [dgaReady, setDgaReady] = useState(false);
  // Separate from `busy` (which gates the finalize button) — set while
  // a per-image upload is in flight so we can show progress without
  // disabling delete/reupload on already-uploaded thumbnails.
  const [dgaUploading, setDgaUploading] = useState(false);

  // Hard-block modal: DGA registered address vs contact address have
  // different house numbers. Vendor must fix in DGA itself and re-upload.
  const [dgaAddressMismatch, setDgaAddressMismatch] = useState<{
    registered: string | null;
    contact: string | null;
    registeredHouseNumber: string | null;
    contactHouseNumber: string | null;
  } | null>(null);

  // S2-S4 file slots (unchanged)
  // Step 5 (S2_ID_SELFIE) reuses the Step 1 (S1_ID_CARD_REF) ID-card
  // upload; the vendor only picks a selfie here. No idFront state.
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfieCrop, setSelfieCrop] = useState<File | null>(null);
  const [phoneShot, setPhoneShot] = useState<File | null>(null);
  const [bankbook, setBankbook] = useState<File | null>(null);

  // Streaming progress — populated while a wizard step is in flight.
  // Each stage is pushed when the server emits its SSE "stage" event;
  // cleared back to [] when the step starts the next time.
  const [progressStages, setProgressStages] = useState<SSEStage[]>([]);
  const handleStage = (stage: SSEStage) => {
    setProgressStages((prev) => [...prev, stage]);
  };
  const beginProgress = () => setProgressStages([]);

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
      if (res.ok && res.payload?.state) {
        setState(res.payload.state);
        // Resume case — rebuild S1 checklist from server if we land in S1.
        if (res.payload.state === "S1_DGA_CAPTURE") {
          await hydrateDgaChecklist(sid);
        }
      }
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

  // S1 v2 — hydrate the checklist + image list from the server.
  // Called on resume (when initialSessionId is supplied) and after the
  // session first lands on S1. Server is source of truth.
  async function hydrateDgaChecklist(sid: string) {
    try {
      const res = await fetch(`/api/wizard/${sid}/s1/dga-checklist`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        ok?: boolean;
        checklist?: DgaChecklistEntry[];
        images?: Array<{
          id: string;
          mime: string;
          bytes: number;
          url?: string | null;
          fieldsContributed: string[];
        }>;
        ready_to_finalize?: boolean;
      };
      if (!data.ok) return;
      setDgaChecklist(data.checklist ?? []);
      setDgaImages((prev) => {
        const previousById = new Map(prev.map((img) => [img.id, img]));
        const serverImages = data.images ?? [];
        const serverIds = new Set(serverImages.map((img) => img.id));

        prev.forEach((img) => {
          if (!serverIds.has(img.id)) revokeBlobPreview(img.previewUrl);
        });

        return serverImages.map((img) => {
          const previous = previousById.get(img.id);
          const serverUrl = img.url ?? null;
          if (serverUrl) revokeBlobPreview(previous?.previewUrl);

          return {
            id: img.id,
            fieldsContributed: img.fieldsContributed,
            bytes: img.bytes,
            mime: img.mime,
            previewUrl: serverUrl ? null : previous?.previewUrl ?? null,
            url: serverUrl,
            filename: previous?.filename ?? null,
          };
        });
      });
      setDgaReady(data.ready_to_finalize ?? false);
    } catch {
      /* best-effort hydration */
    }
  }

  // S1 v2 — POST one screenshot to /s1/dga-add-image. Updates the
  // checklist + image list from the server response so the UI stays in
  // lock-step with persisted state.
  async function addDgaImage(file: File) {
    if (!sessionId) return;
    setError(null);
    setDgaUploading(true);
    beginProgress();
    const previewUrl = URL.createObjectURL(file);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await postSSE<{
        ok: boolean;
        error?: string;
        evidenceId?: string;
        imageUrl?: string | null;
        imageNumber?: number;
        redacted?: boolean;
        fieldsCaptured?: number;
        checklist?: DgaChecklistEntry[];
        imageCount?: number;
        readyToFinalize?: boolean;
      }>(
        `/api/wizard/${sessionId}/s1/dga-add-image`,
        { method: "POST", body: form },
        { onStage: handleStage },
      );
      if (!res.ok || !res.payload.evidenceId) {
        revokeBlobPreview(previewUrl);
        throw new Error(res.payload.error ?? `อัปโหลดภาพ DGA ไม่สำเร็จ (${res.status})`);
      }
      setDgaChecklist(res.payload.checklist ?? []);
      setDgaReady(res.payload.readyToFinalize ?? false);
      const serverUrl = res.payload.imageUrl ?? null;
      if (serverUrl) revokeBlobPreview(previewUrl);
      setDgaImages((prev) => [
        ...prev,
        {
          id: res.payload.evidenceId!,
          fieldsContributed: [], // server didn't include this; will refresh on next checklist call
          bytes: file.size,
          mime: file.type || "image/jpeg",
          previewUrl: serverUrl ? null : previewUrl,
          url: serverUrl,
          filename: file.name,
        },
      ]);
      // Best-effort re-hydrate to pick up fieldsContributed per image
      void hydrateDgaChecklist(sessionId);
    } catch (e) {
      revokeBlobPreview(previewUrl);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDgaUploading(false);
    }
  }

  async function removeDgaImage(evidenceId: string) {
    if (!sessionId) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/wizard/${sessionId}/s1/dga-image/${evidenceId}`, {
        method: "DELETE",
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        error?: string;
        checklist?: DgaChecklistEntry[];
        ready_to_finalize?: boolean;
      };
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error ?? `ลบภาพไม่สำเร็จ (${res.status})`);
      }
      // Revoke the local blob URL for this image before removing it
      setDgaImages((prev) => {
        const target = prev.find((img) => img.id === evidenceId);
        revokeBlobPreview(target?.previewUrl);
        return prev.filter((img) => img.id !== evidenceId);
      });
      setDgaChecklist(payload.checklist ?? []);
      setDgaReady(payload.ready_to_finalize ?? false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function finalizeDga() {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    beginProgress();
    try {
      const res = await postSSE<{
        ok: boolean;
        state: WizardState;
        error?: string;
        missing?: string[];
        checklist?: DgaChecklistEntry[];
      }>(
        `/api/wizard/${sessionId}/s1/dga-finalize`,
        { method: "POST" },
        { onStage: handleStage },
      );
      if (!res.ok) {
        if (res.payload.missing && res.payload.checklist) {
          setDgaChecklist(res.payload.checklist);
          throw new Error(
            `ยังขาด ${res.payload.missing.length} ฟิลด์ — โปรดอัปภาพเพิ่ม`,
          );
        }
        throw new Error(res.payload.error ?? `ส่ง DGA ไม่สำเร็จ (${res.status})`);
      }
      // Stays inside S1 (CAPTURE → REVIEW). Don't clear images/checklist —
      // REVIEW needs the checklist, and if the vendor hits "ย้อนกลับ" we
      // want the thumbnails + their blob URLs still alive.
      if (res.payload.checklist) setDgaChecklist(res.payload.checklist);
      setState(res.payload.state);
      setInfo("รวบรวมข้อมูลครบแล้ว — โปรดตรวจสอบความถูกต้องก่อนยืนยัน");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  // S1_DGA_REVIEW — patch a single editable field. Server validates that
  // the field key isn't locked (citizenId/dob) and re-runs the structural
  // sanity check, returning the updated checklist for the client to merge.
  async function editDgaField(fieldKey: string, value: string) {
    if (!sessionId) return;
    setError(null);
    try {
      const res = await fetch(`/api/wizard/${sessionId}/s1/dga-review/${fieldKey}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        error?: string;
        checklist?: DgaChecklistEntry[];
      };
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error ?? `แก้ไขฟิลด์ไม่สำเร็จ (${res.status})`);
      }
      if (payload.checklist) setDgaChecklist(payload.checklist);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  // S1_DGA_REVIEW → S2_ID_SELFIE. Vendor confirms reviewed values; server
  // writes the canonical `dga` provider row and transitions the session.
  async function confirmDgaReview() {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    setDgaAddressMismatch(null);
    beginProgress();
    try {
      const res = await postSSE<{
        ok: boolean;
        state: WizardState;
        error?: string;
        missing?: string[];
        checklist?: DgaChecklistEntry[];
        addressMismatch?: {
          registered: string | null;
          contact: string | null;
          registeredHouseNumber: string | null;
          contactHouseNumber: string | null;
        };
      }>(
        `/api/wizard/${sessionId}/s1/dga-review-confirm`,
        { method: "POST" },
        { onStage: handleStage },
      );
      if (!res.ok) {
        if (res.payload.addressMismatch) {
          if (res.payload.checklist) setDgaChecklist(res.payload.checklist);
          setDgaAddressMismatch(res.payload.addressMismatch);
          return;
        }
        if (res.payload.missing && res.payload.checklist) {
          setDgaChecklist(res.payload.checklist);
          throw new Error(
            `ฟิลด์บางตัวว่างเปล่าหลังจากแก้ไข — โปรดกรอกให้ครบ`,
          );
        }
        throw new Error(res.payload.error ?? `ยืนยัน DGA ไม่สำเร็จ (${res.status})`);
      }
      // Leaving S1 — safe to revoke blob URLs + clear thumbnails.
      setDgaImages((prev) => {
        prev.forEach((img) => revokeBlobPreview(img.previewUrl));
        return [];
      });
      setDgaChecklist([]);
      setDgaReady(false);
      setState(res.payload.state);
      setInfo("ยืนยันข้อมูล DGA สำเร็จ — ไปขั้นตอนถัดไป");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  // S1_DGA_REVIEW → S1_DGA_CAPTURE. Vendor wants to re-upload an image.
  // Preserves the checklist + thumbnails so any edits made in REVIEW survive
  // (only re-OCR'd fields from a new image will overwrite them).
  async function backToCapture() {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/wizard/${sessionId}/s1/dga-review-back`, {
        method: "POST",
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        error?: string;
        state?: WizardState;
        checklist?: DgaChecklistEntry[];
      };
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error ?? `ย้อนกลับไม่สำเร็จ (${res.status})`);
      }
      if (payload.checklist) setDgaChecklist(payload.checklist);
      if (payload.state) setState(payload.state);
      setInfo(null);
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
    if (!sessionId || !selfie) {
      setError("กรุณาอัปโหลดเซลฟี่ถือบัตร");
      return;
    }
    setBusy(true);
    setError(null);
    beginProgress();
    try {
      const form = new FormData();
      form.append("selfie", selfie);
      if (selfieCrop) form.append("selfie_held_id_crop", selfieCrop);
      const res = await postSSE<
        SnapshotPayload & {
          decision?: "AUTO_APPROVED" | "RETRY_SELFIE" | "REJECTED";
          advisory?: string | null;
          failed_checks?: string[];
        }
      >(
        `/api/wizard/${sessionId}/s1/id-card`,
        { method: "POST", body: form },
        { onStage: handleStage },
      );
      if (!res.ok)
        throw new Error(res.payload.error ?? `ตรวจเซลฟี่ไม่สำเร็จ (${res.status})`);

      // Three outcomes here:
      // 1. Server stays in S2_ID_SELFIE → genuine RETRY_SELFIE without
      //    document evidence to back the seller up. Surface failed checks.
      // 2. Server advances despite face fail (advisory != null) →
      //    document identity matched DGA, so we softened to S3. Tell the
      //    user honestly: "ส่งให้ทีมงานตรวจในตอนท้าย".
      // 3. Clean pass → "ตรวจเซลฟี่สำเร็จ".
      const decision = res.payload.decision;
      const advisory = res.payload.advisory;
      const failed = res.payload.failed_checks ?? [];

      if (res.payload.state === "S2_ID_SELFIE") {
        const reasons: string[] = [];
        if (failed.some((c) => c.startsWith("face_mismatch"))) {
          reasons.push("ใบหน้าในเซลฟี่ไม่ตรงกับรูปในบัตร");
        }
        if (failed.includes("retake_selfie_required") || failed.includes("liveness_spoof_advisory")) {
          reasons.push("ระบบตรวจ liveness ไม่ผ่าน (โปรดถ่ายในที่แสงสว่างชัด ไม่ใส่แว่น/หมวก)");
        }
        if (failed.includes("held_id_unreadable")) {
          reasons.push("ระบบอ่านบัตรในมือไม่ออก (โปรดถือบัตรให้ชัด ใต้คาง)");
        }
        const message =
          reasons.length > 0
            ? reasons.join(" · ")
            : "เซลฟี่ไม่ผ่านการตรวจสอบ กรุณาถ่ายใหม่";
        setError(`ไม่ผ่านการตรวจสอบ — ${message}`);
        setState(res.payload.state);
        setSelfie(null);
        setSelfieCrop(null);
        return;
      }

      setState(res.payload.state);
      if (advisory && decision !== "AUTO_APPROVED") {
        setInfo(
          "บันทึกเซลฟี่แล้ว — ระบบจะส่งให้ทีมงานตรวจในตอนท้าย เนื่องจากระบบเทียบใบหน้าอัตโนมัติไม่ผ่าน",
        );
      } else {
        setInfo("ตรวจเซลฟี่สำเร็จ");
      }
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
    beginProgress();
    try {
      const form = new FormData();
      form.append(field, file);
      const res = await postSSE<SnapshotPayload>(
        `/api/wizard/${sessionId}/${endpoint}`,
        { method: "POST", body: form },
        { onStage: handleStage },
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
    // S1_DGA_REVIEW is still part of the "Step 1: D.GA" visual step in the
    // stepper — the review screen is just a second phase within Step 1.
    if (state === "S1_DGA_REVIEW") {
      return STEPS.findIndex((s) => s.state === "S1_DGA_CAPTURE");
    }
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
        {busy && progressStages.length > 0 && (
          <ProgressCard stages={progressStages} />
        )}

        {state === "S1_DGA_CAPTURE" && (
          <StepDga
            images={dgaImages}
            checklist={dgaChecklist}
            ready={dgaReady}
            uploading={dgaUploading}
            busy={busy}
            onAdd={addDgaImage}
            onRemove={removeDgaImage}
            onSubmit={finalizeDga}
          />
        )}

        {state === "S1_DGA_REVIEW" && (
          <StepDgaReview
            checklist={dgaChecklist}
            busy={busy}
            onEdit={editDgaField}
            onConfirm={confirmDgaReview}
            onBack={backToCapture}
          />
        )}

        {state === "S2_ID_SELFIE" && (
          <StepIdSelfie
            selfie={selfie}
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

      {dgaAddressMismatch && (
        <DgaAddressMismatchModal
          mismatch={dgaAddressMismatch}
          busy={busy}
          onClose={() => setDgaAddressMismatch(null)}
          onReupload={async () => {
            setDgaAddressMismatch(null);
            await backToCapture();
          }}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Streaming progress card — populated as the SSE backend emits stage
// events. Each completed stage gets a ✓ + label + elapsed ms; the
// most-recent stage shows a spinner to signal "still working".
// ────────────────────────────────────────────────────────────────────

function ProgressCard({ stages }: { stages: SSEStage[] }) {
  if (stages.length === 0) return null;
  const last = stages[stages.length - 1];
  return (
    <div className="mb-4 max-w-[680px] mx-auto rounded-xl border border-mp-border bg-mp-cream-alt/40 px-4 py-3">
      <p className="text-[13px] font-semibold text-mp-ink-muted mb-2">
        กำลังประมวลผล… ({(last.total_ms / 1000).toFixed(1)} วินาที)
      </p>
      <ul className="space-y-1.5">
        {stages.map((s, idx) => {
          const isLast = idx === stages.length - 1;
          return (
            <li key={`${s.name}-${idx}`} className="flex items-center gap-2 text-[14px]">
              {isLast ? (
                <Loader2 className="w-4 h-4 text-mp-coral animate-spin shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-mp-forest shrink-0" />
              )}
              <span className="flex-1 text-mp-ink">{s.label ?? s.name}</span>
              <span className="text-xs text-mp-ink-muted tabular-nums">
                {(s.ms / 1000).toFixed(1)}s
              </span>
            </li>
          );
        })}
      </ul>
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

// ── Step 1: DGA Capture (v2 — incremental multi-image) ──────────────
//
// User uploads as many screenshots as needed. Short-screen phones can
// split the 9 required labels across 2-3 screenshots. After each upload
// the server-side checklist updates (lit up via the dga-add-image API
// response) and the user sees which labels are still missing. The
// finalize button is gated on all 9 required labels being captured.

function StepDga({
  images,
  checklist,
  ready,
  uploading,
  busy,
  onAdd,
  onRemove,
  onSubmit,
}: {
  images: DgaUploadedImage[];
  checklist: DgaChecklistEntry[];
  ready: boolean;
  uploading: boolean;
  busy: boolean;
  onAdd: (file: File) => void;
  onRemove: (evidenceId: string) => void;
  onSubmit: () => void;
}) {
  const requiredEntries = checklist.filter((e) => e.required);
  const capturedCount = requiredEntries.filter((e) => e.state !== "missing").length;
  const totalRequired = requiredEntries.length || 9;
  const optionalCaptured = checklist.filter(
    (e) => !e.required && e.state !== "missing",
  );

  const inputId = "dga-add-image-input";
  const handlePick = (ev: ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0] ?? null;
    // Reset the input value so picking the same file again still fires.
    ev.target.value = "";
    if (file) onAdd(file);
  };

  return (
    <div>
      <StepHeader
        step={4}
        total={7}
        title="อัปโหลดรูปจากแอป D.GA"
        body="เปิดแอป D.GA หรือ ThaID → ไปที่หน้าโปรไฟล์ → ถ่ายภาพหน้าจอ (อัปได้หลายภาพถ้าจอเตี้ย)"
      />

      <div className="max-w-[640px] mx-auto rounded-xl bg-mp-cream-alt/60 border border-mp-border p-5 mb-6">
        <p className="text-[14px] font-semibold text-mp-ink mb-2">ข้อมูลที่ต้องเห็นในภาพ (รวมจากกี่ภาพก็ได้):</p>
        <p className="text-[13px] text-mp-ink-muted leading-relaxed">
          ชื่อ-นามสกุล, เลขบัตรประชาชน, วันเกิด, ที่อยู่ตามบัตร, ที่อยู่ที่ติดต่อได้, เบอร์โทร, เบอร์มือถือ, อีเมล
        </p>
        <p className="mt-2 text-[12px] text-mp-ink-muted/80 italic">
          ระบบจะปกปิด Username อัตโนมัติทุกภาพที่มี
        </p>
      </div>

      {/* Uploader */}
      <div className="max-w-[680px] mx-auto mb-6">
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handlePick}
          disabled={uploading}
        />
        <label
          htmlFor={inputId}
          className={
            "block cursor-pointer rounded-xl border-2 border-dashed transition min-h-[140px] flex items-center justify-center text-center p-6 " +
            (uploading
              ? "border-mp-border bg-mp-cream-alt/40 cursor-wait"
              : "border-mp-coral/40 bg-mp-cream-alt/40 hover:bg-mp-cream-alt/60 hover:border-mp-coral")
          }
        >
          <div>
            {uploading ? (
              <Loader2 className="w-8 h-8 text-mp-coral mb-2 animate-spin mx-auto" />
            ) : (
              <Upload className="w-8 h-8 text-mp-forest mb-2 mx-auto" strokeWidth={1.5} />
            )}
            <p className="text-[15px] font-semibold text-mp-ink mb-1">
              {uploading ? "กำลังอัปโหลด…" : images.length === 0 ? "เริ่มอัปโหลดภาพแรก" : "+ เพิ่มภาพอีก"}
            </p>
            <p className="text-[12px] text-mp-ink-muted">JPG, PNG · สูงสุด 5MB/ภาพ</p>
          </div>
        </label>
      </div>

      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div className="max-w-[680px] mx-auto mb-6">
          <p className="text-[13px] font-semibold text-mp-ink mb-2">
            ภาพที่อัปแล้ว ({images.length})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((img) => {
              const imageSrc = img.previewUrl ?? img.url;

              return (
                <div
                  key={img.id}
                  className="rounded-xl border border-mp-border bg-white overflow-hidden flex flex-col"
                >
                  <div className="aspect-[3/4] bg-mp-cream-alt flex items-center justify-center">
                    {imageSrc ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imageSrc}
                        alt={img.filename ?? "DGA screenshot"}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <UserCircle2 className="w-12 h-12 text-mp-ink-muted/40" />
                    )}
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-mp-forest font-semibold">
                        {img.fieldsContributed.length > 0
                          ? `✓ ${img.fieldsContributed.length} ฟิลด์`
                          : "ไม่พบข้อมูลใหม่"}
                      </p>
                      <p className="text-[11px] text-mp-ink-muted truncate">
                        {img.filename ?? "DGA screenshot"} · {(img.bytes / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(img.id)}
                      disabled={busy || uploading}
                      aria-label="ลบภาพนี้"
                      className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md text-mp-ink-muted hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-mp-ink-muted transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sticky checklist */}
      <div className="max-w-[680px] mx-auto mb-6">
        <div className="rounded-xl border border-mp-border bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-semibold text-mp-ink">
              ตรวจสอบข้อมูลที่ดึงได้
            </p>
            <span
              className={
                "text-[12px] font-bold tabular-nums px-2 py-0.5 rounded-md " +
                (ready
                  ? "bg-mp-forest/12 text-mp-forest"
                  : "bg-mp-cream-alt text-mp-ink-muted")
              }
            >
              {capturedCount} / {totalRequired}
            </span>
          </div>
          <ul className="space-y-2">
            {(checklist.length > 0
              ? checklist.filter((e) => e.required)
              : DEFAULT_CHECKLIST_PLACEHOLDERS
            ).map((entry) => (
              <ChecklistRow key={entry.key} entry={entry} />
            ))}
          </ul>
          {optionalCaptured.length > 0 && (
            <>
              <p className="mt-4 mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-mp-ink-muted">
                ข้อมูลเพิ่มเติม (ไม่บังคับ)
              </p>
              <ul className="space-y-2">
                {optionalCaptured.map((entry) => (
                  <ChecklistRow key={entry.key} entry={entry} />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <StickyFooter
        onSubmit={onSubmit}
        busy={busy}
        disabled={!ready || uploading}
        submitLabel={
          ready ? "ตรวจสอบข้อมูล →" : `ยังขาด ${totalRequired - capturedCount} ฟิลด์`
        }
      />
    </div>
  );
}

// Placeholder list shown before the user uploads anything (server's checklist
// is empty — we want the UI to render the field names anyway so the user
// knows what to expect).
const PLACEHOLDER_BASE = {
  required: true,
  state: "missing" as DgaFieldState,
  value: null,
  warning: null,
  evidenceId: null,
  locked: false,
  originalValue: null,
  editedByUser: false,
};
const DEFAULT_CHECKLIST_PLACEHOLDERS: DgaChecklistEntry[] = [
  { ...PLACEHOLDER_BASE, key: "firstName", label: "ชื่อจริง" },
  { ...PLACEHOLDER_BASE, key: "lastName", label: "นามสกุล" },
  { ...PLACEHOLDER_BASE, key: "dob", label: "วันเดือนปีเกิด", locked: true },
  { ...PLACEHOLDER_BASE, key: "citizenId", label: "เลขบัตรประชาชน", locked: true },
  { ...PLACEHOLDER_BASE, key: "registeredAddress", label: "ที่อยู่ตามบัตรประจำตัวประชาชน" },
  { ...PLACEHOLDER_BASE, key: "contactAddress", label: "ที่อยู่ที่ติดต่อได้" },
  { ...PLACEHOLDER_BASE, key: "phone", label: "เบอร์โทรศัพท์" },
  { ...PLACEHOLDER_BASE, key: "mobilePhone", label: "เบอร์โทรศัพท์มือถือ" },
  { ...PLACEHOLDER_BASE, key: "email", label: "อีเมล" },
];

function ChecklistRow({ entry }: { entry: DgaChecklistEntry }) {
  const stateClass =
    entry.state === "captured"
      ? "text-mp-forest"
      : entry.state === "captured_warn"
        ? "text-amber-600"
        : "text-mp-ink-muted/70";
  const icon =
    entry.state === "captured" ? (
      <CheckCircle2 className="w-4 h-4 shrink-0" />
    ) : entry.state === "captured_warn" ? (
      <span className="w-4 h-4 shrink-0 text-amber-600 text-center leading-4">⚠</span>
    ) : (
      <span className="w-4 h-4 shrink-0 inline-block rounded-sm border border-mp-ink-muted/30" />
    );
  return (
    <li className="flex items-start gap-2.5 text-[14px]">
      <span className={`pt-0.5 ${stateClass}`}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] ${stateClass}`}>{entry.label}</p>
        {entry.value && (
          <p className="text-[13px] text-mp-ink truncate" title={entry.value}>
            {entry.value}
          </p>
        )}
        {entry.warning && (
          <p className="text-[11px] text-amber-700 mt-0.5">⚠ {entry.warning}</p>
        )}
        {entry.state === "missing" && (
          <p className="text-[11px] text-mp-ink-muted/70 italic">ยังไม่พบในภาพที่อัป</p>
        )}
      </div>
    </li>
  );
}

// ── Step 1 (review phase): edit OCR-extracted fields ───────────────
//
// After all 9 required fields are captured, the wizard moves CAPTURE →
// REVIEW so the vendor can correct OCR mistakes before continuing to S2.
// Fields marked `locked` (citizenId + dob — strict cross-match anchors)
// are rendered disabled; the vendor must re-upload a clearer screenshot
// to fix them. Other fields are editable inline; each PATCH fires on
// blur and the server re-runs the structural sanity check.

function StepDgaReview({
  checklist,
  busy,
  onEdit,
  onConfirm,
  onBack,
}: {
  checklist: DgaChecklistEntry[];
  busy: boolean;
  onEdit: (key: string, value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const requiredEntries = checklist.filter((e) => e.required);
  const optionalCaptured = checklist.filter((e) => !e.required && e.state !== "missing");
  const hasEmpty = requiredEntries.some((e) => !e.value || e.value.trim() === "");

  return (
    <div>
      <StepHeader
        step={4}
        total={7}
        title="ตรวจสอบและแก้ไขข้อมูล"
        body="ระบบอ่านข้อมูลจากภาพ D.GA ได้ตามด้านล่าง — โปรดตรวจสอบความถูกต้อง และแก้ไขฟิลด์ที่อ่านผิดได้ ฟิลด์ที่มีไอคอน 🔒 (เลขบัตร + วันเกิด) ห้ามแก้เพราะใช้ยืนยันตัวตนกับบัตรประชาชน"
      />

      <div className="max-w-[680px] mx-auto space-y-4 mb-6">
        {requiredEntries.map((entry) => (
          <FieldEditor key={entry.key} entry={entry} onEdit={onEdit} busy={busy} />
        ))}
        {optionalCaptured.length > 0 && (
          <>
            <p className="mt-6 mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-mp-ink-muted">
              ข้อมูลเพิ่มเติม (ไม่บังคับ)
            </p>
            {optionalCaptured.map((entry) => (
              <FieldEditor key={entry.key} entry={entry} onEdit={onEdit} busy={busy} />
            ))}
          </>
        )}
      </div>

      <div className="max-w-[680px] mx-auto mt-10 flex items-center justify-between pt-6 border-t border-mp-border">
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="inline-flex items-center gap-1.5 text-[14px] text-mp-ink-muted hover:text-mp-ink disabled:opacity-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ย้อนกลับเพื่อเพิ่มภาพ
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy || hasEmpty}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-mp-coral text-white font-semibold shadow-sm hover:bg-mp-coral-dark hover:-translate-y-px disabled:opacity-50 disabled:hover:transform-none transition-all h-11 px-6 text-[15px]"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          ยืนยันและไปขั้นตอนถัดไป
          {!busy && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function FieldEditor({
  entry,
  onEdit,
  busy,
}: {
  entry: DgaChecklistEntry;
  onEdit: (key: string, value: string) => void;
  busy: boolean;
}) {
  const [local, setLocal] = useState(entry.value ?? "");
  const lastServer = useRef(entry.value ?? "");

  // Sync if the server-canonical value changes from outside (e.g. after
  // a sibling PATCH succeeds and the parent passes a fresh checklist).
  useEffect(() => {
    const serverNow = entry.value ?? "";
    if (serverNow !== lastServer.current) {
      lastServer.current = serverNow;
      setLocal(serverNow);
    }
  }, [entry.value]);

  const isMultiline =
    entry.key === "registeredAddress" || entry.key === "contactAddress";

  const handleBlur = () => {
    const trimmed = local.trim();
    if (!trimmed) return; // empty values are rejected server-side
    if (trimmed === (entry.value ?? "")) return; // no-op
    lastServer.current = trimmed;
    onEdit(entry.key, trimmed);
  };

  const showOriginal =
    entry.editedByUser &&
    entry.originalValue &&
    entry.originalValue !== entry.value;

  const inputClass =
    "w-full rounded-lg border bg-white px-3 py-2 text-[14px] text-mp-ink " +
    (entry.locked
      ? "border-mp-border bg-mp-cream-alt/50 text-mp-ink-muted cursor-not-allowed"
      : "border-mp-border focus:border-mp-coral focus:outline-none focus:ring-2 focus:ring-mp-coral/20");

  return (
    <div className="rounded-xl border border-mp-border bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[13px] font-semibold text-mp-ink">{entry.label}</span>
        {entry.locked && (
          <span
            className="inline-flex items-center gap-1 text-[11px] text-mp-ink-muted bg-mp-cream-alt px-1.5 py-0.5 rounded"
            title="ห้ามแก้ — หากผิดพลาด กรุณาอัปโหลดภาพใหม่"
          >
            <Lock className="w-3 h-3" /> ห้ามแก้
          </span>
        )}
        {entry.editedByUser && (
          <span className="inline-flex items-center text-[11px] text-mp-coral bg-mp-coral/10 px-1.5 py-0.5 rounded">
            แก้ไขแล้ว
          </span>
        )}
      </div>
      {isMultiline ? (
        <textarea
          value={local}
          onChange={(e) => setLocal(e.currentTarget.value)}
          onBlur={handleBlur}
          disabled={entry.locked || busy}
          rows={2}
          className={`${inputClass} resize-y min-h-[60px]`}
        />
      ) : (
        <input
          type="text"
          value={local}
          onChange={(e) => setLocal(e.currentTarget.value)}
          onBlur={handleBlur}
          disabled={entry.locked || busy}
          className={inputClass}
        />
      )}
      {showOriginal && (
        <p className="mt-1 text-[11px] text-mp-ink-muted/80">
          OCR อ่านได้: <span className="font-mono">{entry.originalValue}</span>
        </p>
      )}
      {entry.warning && (
        <p className="mt-1 text-[11px] text-amber-700">⚠ {entry.warning}</p>
      )}
    </div>
  );
}

// ── Step 2: ID + Selfie ────────────────────────────────────────────

function StepIdSelfie({
  selfie,
  onPickSelfie,
  busy,
  onSubmit,
}: {
  selfie: File | null;
  onPickSelfie: (e: ChangeEvent<HTMLInputElement>) => void;
  busy: boolean;
  onSubmit: () => void;
}) {
  // The front-of-card image is reused from Step 1 (S1_ID_CARD_REF) — no
  // re-upload here. The vendor only captures their selfie holding the
  // ID; the server pulls the Step 1 image for face match.
  const selfieInputId = "selfie-file-input";
  return (
    <div>
      <StepHeader
        step={5}
        total={7}
        title="เซลฟี่ถือบัตรประชาชน"
        body="ระบบจะเทียบใบหน้าในเซลฟี่กับรูปในบัตรที่อัปโหลดในขั้นตอนที่ 1 — บัตรเดิมยังถูกใช้อยู่ ไม่ต้องอัปใหม่"
      />

      <div className="max-w-[640px] mx-auto rounded-xl bg-mp-forest/5 border border-mp-forest/20 px-4 py-3 mb-5 flex items-start gap-3">
        <IdCard className="w-4 h-4 text-mp-forest shrink-0 mt-0.5" />
        <p className="text-[13px] text-mp-forest leading-relaxed">
          <strong>บัตรประชาชนจากขั้นตอนที่ 1</strong> — ระบบจะใช้รูปบัตรที่คุณส่งมาแล้วเทียบกับใบหน้าในเซลฟี่
        </p>
      </div>

      <div className="max-w-[640px] mx-auto rounded-xl bg-mp-cream-alt/60 border border-mp-border p-5 mb-6">
        <p className="text-[13px] text-mp-ink leading-relaxed">
          <span className="font-semibold">เคล็ดลับเซลฟี่:</span> ถือบัตรไว้ใต้คาง · เห็นข้อมูลในบัตรครบ ·
          ถ่ายในที่แสงสว่าง · ไม่ใส่หน้ากากหรือแว่นกันแดด
        </p>
      </div>

      <div className="max-w-[680px] mx-auto">
        <p className="text-[13px] font-semibold text-mp-ink mb-2">รูปเซลฟี่ถือบัตร</p>
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
            "block cursor-pointer rounded-xl border-2 border-dashed transition min-h-[260px] " +
            (selfie
              ? "border-mp-forest bg-mp-forest/5"
              : "border-mp-coral/40 bg-mp-cream-alt/40 hover:bg-mp-cream-alt/60 hover:border-mp-coral")
          }
        >
          {selfie ? (
            <div className="flex items-center gap-4 p-5">
              <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-mp-cream-alt border border-mp-border">
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
            <div className="flex flex-col items-center justify-center text-center p-6 min-h-[260px]">
              <UserCircle2 className="w-12 h-12 text-mp-forest mb-3" strokeWidth={1.5} />
              <p className="text-[15px] font-semibold text-mp-ink mb-1">อัปโหลดเซลฟี่</p>
              <p className="text-[12px] text-mp-ink-muted">ถือบัตรไว้ข้างหน้าใบหน้า</p>
            </div>
          )}
        </label>
      </div>

      <div className="max-w-[680px] mx-auto mt-4 flex items-start gap-2 text-[12px] text-mp-ink-muted">
        <Camera className="w-4 h-4 mt-0.5 shrink-0 text-mp-forest" />
        <p>
          ระบบจะตัดเฉพาะส่วนบัตรในเซลฟี่ออกมาตรวจสอบความปลอดภัย
          ใบหน้าของคุณจะถูกเก็บแบบเข้ารหัส
        </p>
      </div>

      <StickyFooter onSubmit={onSubmit} busy={busy} disabled={!selfie} />
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
        step={6}
        total={7}
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
              รอข้อความตอบกลับที่ระบุว่าเบอร์ &ldquo;ตรงกับ&rdquo; บัตรประชาชน
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-mp-coral text-white text-[11px] font-bold flex items-center justify-center">
                3
              </span>
              ถ่าย screenshot หน้าจอที่เห็นข้อความนี้
            </li>
          </ol>
          <p className="mt-3 pt-3 border-t border-mp-border text-[11px] text-mp-ink-muted/80">
            ระบบจะตรวจ: เลขบัตรประชาชน + 4 หลักท้ายเบอร์ + คำว่า &ldquo;ตรงกับ&rdquo;
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
            <li>คำว่า &ldquo;ตรงกับ&rdquo;</li>
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
        step={7}
        total={7}
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

// ────────────────────────────────────────────────────────────────────
// Hard-block modal: DGA registered vs contact address have different
// house numbers. Likely user error during DGA registration — vendor
// must fix in the DGA app itself (we are downstream consumers, we
// can't write back to DGA) and re-screenshot.
// ────────────────────────────────────────────────────────────────────

function DgaAddressMismatchModal({
  mismatch,
  busy,
  onClose,
  onReupload,
}: {
  mismatch: {
    registered: string | null;
    contact: string | null;
    registeredHouseNumber: string | null;
    contactHouseNumber: string | null;
  };
  busy: boolean;
  onClose: () => void;
  onReupload: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dga-address-mismatch-title"
    >
      <div className="w-full max-w-[520px] rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="border-b border-mp-border bg-red-50 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                id="dga-address-mismatch-title"
                className="text-[17px] font-bold text-mp-ink mb-1"
                style={{ fontFamily: "var(--mp-font-display)" }}
              >
                ที่อยู่ไม่ตรงกับบัตรประชาชน
              </h3>
              <p className="text-[13px] text-mp-ink-muted leading-relaxed">
                บ้านเลขที่ในช่อง <strong>ที่อยู่ตามบัตรประจำตัวประชาชน</strong>{" "}
                ไม่ตรงกับ <strong>ที่อยู่ที่ติดต่อได้</strong> ตามที่ DGA แสดง
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-3">
          <div className="rounded-xl border border-mp-border bg-mp-cream-alt/50 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-mp-ink-muted mb-1">
              ที่อยู่ตามบัตรประจำตัวประชาชน
            </p>
            <p className="text-[13px] text-mp-ink leading-relaxed">
              {mismatch.registered ?? "—"}
            </p>
            {mismatch.registeredHouseNumber && (
              <p className="mt-1 text-[12px] text-mp-coral font-semibold">
                บ้านเลขที่: {mismatch.registeredHouseNumber}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-mp-border bg-mp-cream-alt/50 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-mp-ink-muted mb-1">
              ที่อยู่ที่ติดต่อได้
            </p>
            <p className="text-[13px] text-mp-ink leading-relaxed">
              {mismatch.contact ?? "—"}
            </p>
            {mismatch.contactHouseNumber && (
              <p className="mt-1 text-[12px] text-mp-coral font-semibold">
                บ้านเลขที่: {mismatch.contactHouseNumber}
              </p>
            )}
          </div>

          <div className="rounded-xl bg-mp-warning/10 border border-mp-warning/30 px-4 py-3">
            <p className="text-[13px] text-mp-ink leading-relaxed">
              <strong>วิธีแก้:</strong> เปิดแอป DGA Digital ID →
              ไปที่ &ldquo;ข้อมูลส่วนตัว&rdquo; →
              แก้ไขที่อยู่ที่ติดต่อได้ให้ตรงกับที่อยู่ตามบัตรประจำตัวประชาชน →
              ถ่ายภาพหน้าจอใหม่ แล้วอัปโหลดในขั้นตอนนี้อีกครั้ง
            </p>
          </div>
        </div>

        <div className="border-t border-mp-border bg-mp-cream-alt/30 px-6 py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center px-4 text-[14px] text-mp-ink-muted hover:text-mp-ink disabled:opacity-50 transition-colors"
          >
            ปิด
          </button>
          <button
            type="button"
            onClick={onReupload}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-mp-coral px-5 text-[14px] font-semibold text-white shadow-sm hover:bg-mp-coral-dark disabled:opacity-50 transition-all"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            อัปโหลดภาพ DGA ใหม่
            {!busy && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
