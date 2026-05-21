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

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  Copy,
  IdCard,
  Loader2,
  Lock,
  Mail,
  RefreshCcw,

  Smartphone,
  Trash2,
  Upload,
  UserCircle2,
  Wallet,
  XCircle,
  AlertTriangle,
  X,
  Maximize2,
} from "lucide-react";


type WizardState =
  | "INIT"
  | "S1_ID_CARD_REF"
  | "S1_ID_CARD_REVIEW"
  | "S2_EMAIL_PENDING"
  | "S3_OTP_VERIFIED"
  | "S1_DGA_CAPTURE"
  | "S1_DGA_REVIEW"
  | "S2_ID_SELFIE"
  | "S3_PHONE_RESPONSE"
  | "S4_BANKBOOK_UPLOAD"
  | "S5_SUMMARY"
  | "AUTO_APPROVED"
  | "REJECTED"
  | "MANUAL_REVIEW";

interface IdentityPayload {
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  citizenId: string | null;
  citizenIdFormatted: string | null;
  checksumValid: boolean;
  dob: string | null;
  dobThai: string | null;
  expiry: string | null;
  expiryThai: string | null;
  expired: boolean;
}

interface SnapshotPayload {
  ok: boolean;
  id: string;
  state: WizardState;
  finalDecision?: WizardState | null;
  identity?: IdentityPayload | null;
}

interface LeasePayload {
  email?: string | null;
  expires_at?: string | null;
}

interface LocalCache {
  sid: string;
  email?: string | null;
  expiresAt?: string | null;
}

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

const LOCAL_STORAGE_KEY = "kyc.session";

function readCache(): LocalCache | null {
  if (typeof window === "undefined") return null;
  try {
    const val = localStorage.getItem(LOCAL_STORAGE_KEY);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

function writeCache(cache: LocalCache) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));
  } catch {}
}

function clearCache() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {}
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
  const [viewingIdx, setViewingIdx] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const terminalRefreshRequested = useRef(false);

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>("");
  const [createdVendorCreds, setCreatedVendorCreds] = useState<{ phone: string; tempPass: string; refCode?: string } | null>(null);

  useEffect(() => {
    const handleOpenLightbox = (e: Event) => {
      const customEvent = e as CustomEvent<{ url: string; title?: string }>;
      if (customEvent.detail?.url) {
        setLightboxUrl(customEvent.detail.url);
        setLightboxTitle(customEvent.detail.title ?? "ดูรูปภาพ");
      }
    };
    window.addEventListener("open-kyc-lightbox", handleOpenLightbox);
    return () => {
      window.removeEventListener("open-kyc-lightbox", handleOpenLightbox);
    };
  }, []);

  // S1 v2 — server-tracked checklist + uploaded image list. Images are
  // accumulated incrementally; finalize gates on the checklist being
  // complete for all 9 required fields.
  const [dgaImages, setDgaImages] = useState<DgaUploadedImage[]>([]);

  // Cleanup DGA images blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      dgaImages.forEach((img) => {
        if (img.previewUrl && img.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [dgaImages]);
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

  // V3 Steps 1-3 State Variables
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [identity, setIdentity] = useState<IdentityPayload | null>(null);
  const [leasedEmail, setLeasedEmail] = useState<string | null>(null);
  const [leaseExpiresAt, setLeaseExpiresAt] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [otp, setOtp] = useState<string | null>(null);
  const [emailTab, setEmailTab] = useState<"system" | "own">("system");

  // Sync idFrontPreview
  useEffect(() => {
    if (!idFront) {
      setIdFrontPreview((prev) => (prev?.startsWith("blob:") ? null : prev));
      return;
    }
    const url = URL.createObjectURL(idFront);
    setIdFrontPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [idFront]);

  // S2-S4 file slots (unchanged)
  const [selfie, setSelfie] = useState<File | string | null>(null);
  const [selfieCrop, setSelfieCrop] = useState<File | null>(null);
  const [phoneShot, setPhoneShot] = useState<File | string | null>(null);
  const [bankbook, setBankbook] = useState<File | string | null>(null);

  // Streaming progress — populated while a wizard step is in flight.
  const [progressStages, setProgressStages] = useState<SSEStage[]>([]);
  const handleStage = (stage: SSEStage) => {
    setProgressStages((prev) => [...prev, stage]);
  };
  const beginProgress = () => setProgressStages([]);

  // Hydration cache and refresh logic on mount
  useEffect(() => {
    const cached = readCache();
    if (initialSessionId) {
      setSessionId(initialSessionId);
      if (cached?.sid === initialSessionId) {
        setLeasedEmail(cached.email ?? null);
        setLeaseExpiresAt(cached.expiresAt ?? null);
      }
      void refresh(initialSessionId);
      return;
    }
    if (cached?.sid) {
      setSessionId(cached.sid);
      setLeasedEmail(cached.email ?? null);
      setLeaseExpiresAt(cached.expiresAt ?? null);
      void refresh(cached.sid);
    }
  }, [initialSessionId]);

  // Write cache on update
  useEffect(() => {
    if (!sessionId) return;
    writeCache({
      sid: sessionId,
      email: leasedEmail,
      expiresAt: leaseExpiresAt,
    });
  }, [sessionId, leasedEmail, leaseExpiresAt]);

  // Countdown timer for email lease
  useEffect(() => {
    if (!leaseExpiresAt) {
      setSecondsLeft(0);
      return;
    }
    const timer = window.setInterval(() => {
      const diff = Math.floor((new Date(leaseExpiresAt).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        window.clearInterval(timer);
        setSecondsLeft(0);
        setLeasedEmail(null);
        setLeaseExpiresAt(null);
        setOtp(null);
        clearCache();
        setInfo("หมดเวลา 25 นาทีแล้ว กรุณาขออีเมลใหม่");
        return;
      }
      setSecondsLeft(diff);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [leaseExpiresAt]);

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

  // Countdown format
  const countdownLabel = useMemo(() => {
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [secondsLeft]);

  async function refresh(sid: string) {
    try {
      const res = await postJson<SnapshotPayload>(`/api/wizard/${sid}`);
      if (res.ok && res.payload?.state) {
        setState(res.payload.state);
        if (res.payload.identity) {
          setIdentity(res.payload.identity);
        }
        
        const meta = (res.payload as any).metadata;
        if (meta?.emailTab === "own" || meta?.emailTab === "system") {
          setEmailTab(meta.emailTab);
        }
        
        // Populate preview URLs from already uploaded evidence
        const evidenceList = (res.payload as any).evidence || [];
        const idCardEvidence = evidenceList.find((e: any) => e.step === "S1_ID_CARD_REF");
        if (idCardEvidence?.url) {
          setIdFrontPreview(idCardEvidence.url);
        }
        const selfieEvidence = evidenceList.find((e: any) => e.step === "S2_SELFIE");
        if (selfieEvidence?.url) {
          setSelfie(selfieEvidence.url);
        }
        const phoneEvidence = evidenceList.find((e: any) => e.step === "S3_PHONE_RESPONSE");
        if (phoneEvidence?.url) {
          setPhoneShot(phoneEvidence.url);
        }
        const bankbookEvidence = evidenceList.find((e: any) => e.step === "S4_BANKBOOK");
        if (bankbookEvidence?.url) {
          setBankbook(bankbookEvidence.url);
        }

        // Always hydrate DGA checklist if session exists, so back-navigation
        // to Step 4 works correctly even after advancing to later steps.
        await hydrateDgaChecklist(sid);
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
          body: JSON.stringify({ metadata: { entry: "kyc-v3" } }),
        },
      );
      if (!res.ok) throw new Error(res.payload.error ?? `เริ่ม session ไม่ได้ (${res.status})`);
      setSessionId(res.payload.session_id);
      setState(res.payload.state);
      setInfo("เริ่มคำขอ KYC แล้ว");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  // V3 Step Action Handlers
  async function submitIdCard() {
    if (!sessionId || !idFront) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("id_front", idFront);
      const res = await postJson<{ state: WizardState; identity?: IdentityPayload }>(
        `/api/wizard/${sessionId}/s1/id-card-ref`,
        { method: "POST", body: form },
      );
      if (!res.ok) throw new Error(res.payload.error ?? "อัปโหลดบัตรไม่สำเร็จ");
      setState(res.payload.state);
      if (res.payload.identity) setIdentity(res.payload.identity);
      setInfo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function confirmIdCard() {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await postJson<{ state: WizardState }>(
        `/api/wizard/${sessionId}/s1/id-card-ref/confirm`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error(res.payload.error ?? "ยืนยันบัตรไม่สำเร็จ");
      setState(res.payload.state);
      setInfo("ยืนยันข้อมูลบัตรเรียบร้อย");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function retakeIdCard() {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await postJson<{ state: WizardState }>(
        `/api/wizard/${sessionId}/s1/id-card-ref/retake`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error(res.payload.error ?? "ไม่สามารถถ่ายใหม่ได้");
      setState(res.payload.state);
      setIdFront(null);
      setIdFrontPreview(null);
      setIdentity(null);
      setInfo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function requestEmail() {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await postJson<LeasePayload>(`/api/wizard/${sessionId}/s2/email-request`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(res.payload.error ?? "ขออีเมลไม่สำเร็จ");
      const nextEmail = res.payload.email ?? null;
      const nextExpiry = res.payload.expires_at ?? null;
      setLeasedEmail(nextEmail);
      setLeaseExpiresAt(nextExpiry);
      setInfo("จ่ายอีเมลให้แล้ว นำอีเมลนี้ไปขอ OTP ใน DGA");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function fetchOtp() {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await postJson<{ otp: string; state: WizardState }>(`/api/wizard/${sessionId}/s3/fetch-otp`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(res.payload.error ?? "ดึง OTP ไม่สำเร็จ");
      setOtp(res.payload.otp);
      setState(res.payload.state);
      setInfo("ดึง OTP ล่าสุดสำเร็จ");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function confirmOtpStep() {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await postJson<{ state: WizardState }>(`/api/wizard/${sessionId}/s3/confirm`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(res.payload.error ?? "ยืนยัน OTP ไม่สำเร็จ");
      setState(res.payload.state);
      setInfo("ยืนยัน OTP แล้ว กำลังไปขั้นอัปโหลดรูป DGA");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function skipEmailStep() {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await postJson<{ state: WizardState }>(
        `/api/wizard/${sessionId}/s2/skip-email`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(res.payload.error ?? "ข้ามอีเมลไม่สำเร็จ");
      setState(res.payload.state);
      setInfo("ข้ามการเช่าอีเมลสำเร็จ กำลังไปขั้นอัปโหลดรูป DGA");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
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
    setBusy(true);
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
      setBusy(false);
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
      // Keep DGA images/checklist for back-navigation review.
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
    if (!sessionId || !(selfie instanceof File)) {
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
    submitImage("s4/ussd", phoneShot instanceof File ? phoneShot : null, "image", "screenshot การยืนยันเบอร์");
  const submitBankbook = () =>
    submitImage("s6/bankbook", bankbook instanceof File ? bankbook : null, "image", "สมุดบัญชี");

  const steps: Array<{ states: WizardState[]; label: string }> = useMemo(() => {
    if (emailTab === "system") {
      return [
        { states: ["S1_ID_CARD_REF", "S1_ID_CARD_REVIEW"], label: "บัตร" },
        { states: ["S2_EMAIL_PENDING"], label: "อีเมล" },
        { states: ["S3_OTP_VERIFIED"], label: "OTP" },
        { states: ["S1_DGA_CAPTURE", "S1_DGA_REVIEW"], label: "D.GA" },
        { states: ["S2_ID_SELFIE"], label: "เซลฟี่" },
        { states: ["S3_PHONE_RESPONSE"], label: "เบอร์" },
        { states: ["S4_BANKBOOK_UPLOAD"], label: "บัญชี" },
        { states: ["S5_SUMMARY"], label: "ตรวจสอบ" },
      ];
    } else {
      return [
        { states: ["S1_ID_CARD_REF", "S1_ID_CARD_REVIEW"], label: "บัตร" },
        { states: ["S2_EMAIL_PENDING", "S3_OTP_VERIFIED"], label: "ยืนยัน DGA" },
        { states: ["S1_DGA_CAPTURE", "S1_DGA_REVIEW"], label: "D.GA" },
        { states: ["S2_ID_SELFIE"], label: "เซลฟี่" },
        { states: ["S3_PHONE_RESPONSE"], label: "เบอร์" },
        { states: ["S4_BANKBOOK_UPLOAD"], label: "บัญชี" },
        { states: ["S5_SUMMARY"], label: "ตรวจสอบ" },
      ];
    }
  }, [emailTab]);

  const currentIdx = useMemo(() => {
    if (TERMINAL_STATES.has(state)) return steps.length - 1;
    const i = steps.findIndex((s) => s.states.includes(state));
    return i < 0 ? 0 : i;
  }, [state, steps]);

  // Sync viewingIdx with currentIdx when currentIdx goes forward
  useEffect(() => {
    setViewingIdx(currentIdx);
  }, [currentIdx]);

  const viewingState = useMemo(() => {
    const step = steps[viewingIdx];
    if (!step) return state;
    if (step.states.includes(state)) {
      return state;
    }
    return step.states[step.states.length - 1];
  }, [viewingIdx, steps, state]);

  // ── Render branches ─────────────────────────────────────────────

  if (createdVendorCreds) {
    return (
      <div className="mx-auto max-w-[480px] px-5 py-12 md:py-16 text-center bg-white rounded-2xl border border-mp-border shadow-sm">
        <div className="mx-auto w-16 h-16 rounded-full bg-mp-forest/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-mp-forest" strokeWidth={2} />
        </div>
        <span className="inline-block text-[13px] font-medium uppercase tracking-[0.16em] text-mp-forest">
          การสมัครสมาชิกสำเร็จ
        </span>
        <h2 className="mt-4 text-2xl font-bold text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>
          บัญชีของคุณถูกสร้างเรียบร้อยแล้ว! 🎉
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-mp-ink-muted">
          รหัสผ่านชั่วคราวของคุณคือเลขท้าย 6 ตัวของบัตรประชาชน เพื่อความสะดวกในการเข้าสู่ระบบครั้งแรก (ระบบจะให้ท่านเปลี่ยนรหัสผ่านหลังเข้าสู่ระบบ)
        </p>

        <div className="mt-6 rounded-xl border border-mp-border bg-mp-cream-alt/40 p-5 text-left space-y-3">
          <div>
            <label className="text-[12px] font-semibold text-mp-ink-muted uppercase">เบอร์โทรศัพท์ (ชื่อผู้ใช้)</label>
            <p className="text-[16px] font-mono font-bold text-mp-ink select-all mt-0.5">{createdVendorCreds.phone}</p>
          </div>
          <div className="border-t border-mp-border pt-3">
            <label className="text-[12px] font-semibold text-mp-ink-muted uppercase">รหัสผ่านชั่วคราว (เลขท้าย 6 ตัวของบัตรประชาชน)</label>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-[18px] font-mono font-bold text-mp-coral select-all tracking-wider">{createdVendorCreds.tempPass}</p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(createdVendorCreds.tempPass);
                  alert("คัดลอกรหัสผ่านชั่วคราวแล้ว!");
                }}
                className="text-[12px] font-semibold text-mp-forest hover:text-mp-coral transition-colors"
              >
                คัดลอก
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            let redirectUrl = `/signin?phone=${encodeURIComponent(createdVendorCreds.phone)}`;
            if (createdVendorCreds.refCode) {
              redirectUrl += `&ref=${encodeURIComponent(createdVendorCreds.refCode)}`;
            }
            router.push(redirectUrl);
          }}
          className="mt-8 flex w-full h-12 items-center justify-center rounded-xl bg-mp-coral text-[15px] font-semibold text-white hover:bg-mp-coral-dark shadow-sm transition-all"
        >
          คัดลอกรหัสผ่านแล้ว ไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    );
  }

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
      <Stepper
        steps={steps}
        currentIdx={currentIdx}
        viewingIdx={viewingIdx}
        onStepClick={setViewingIdx}
      />

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

        {viewingState === "S1_ID_CARD_REF" && (
          <StepIdCardRef
            file={idFront}
            onPick={setIdFront}
            busy={busy}
            onSubmit={
              idFront instanceof File
                ? submitIdCard
                : () => setViewingIdx((i) => Math.min(currentIdx, i + 1))
            }
          />
        )}

        {viewingState === "S1_ID_CARD_REVIEW" && (
          <StepIdCardReview
            previewUrl={idFrontPreview}
            identity={identity}
            busy={busy}
            onConfirm={
              currentIdx > steps.findIndex((s) => s.states.includes("S1_ID_CARD_REVIEW"))
                ? () => setViewingIdx((i) => Math.min(currentIdx, i + 1))
                : confirmIdCard
            }
            onRetake={retakeIdCard}
          />
        )}

        {viewingState === "S2_EMAIL_PENDING" && (
          <StepEmailLease
            leasedEmail={leasedEmail}
            countdownLabel={countdownLabel}
            secondsLeft={secondsLeft}
            busy={busy}
            onRequestEmail={requestEmail}
            onAdvance={
              currentIdx > steps.findIndex((s) => s.states.includes("S2_EMAIL_PENDING"))
                ? () => setViewingIdx((i) => Math.min(currentIdx, i + 1))
                : fetchOtp
            }
            emailTab={emailTab}
            onTabChange={setEmailTab}
            onSkipEmail={skipEmailStep}
            onBack={() => setViewingIdx((i) => Math.max(0, i - 1))}
            isAlreadyLeased={leasedEmail !== null}
          />
        )}

        {viewingState === "S3_OTP_VERIFIED" && (
          <StepOtp
            otp={otp}
            email={leasedEmail}
            countdownLabel={countdownLabel}
            busy={busy}
            onRefetch={fetchOtp}
            onConfirm={
              currentIdx > steps.findIndex((s) => s.states.includes("S3_OTP_VERIFIED"))
                ? () => setViewingIdx((i) => Math.min(currentIdx, i + 1))
                : confirmOtpStep
            }
            onBack={() => setViewingIdx((i) => Math.max(0, i - 1))}
          />
        )}

        {viewingState === "S1_DGA_CAPTURE" && (
          <StepDga
            images={dgaImages}
            checklist={dgaChecklist}
            ready={dgaReady}
            uploading={dgaUploading}
            busy={busy}
            onAdd={addDgaImage}
            onRemove={removeDgaImage}
            onSubmit={
              currentIdx > steps.findIndex((s) => s.states.includes("S1_DGA_CAPTURE"))
                ? () => setViewingIdx((i) => Math.min(currentIdx, i + 1))
                : finalizeDga
            }
            onBack={() => setViewingIdx((i) => Math.max(0, i - 1))}
          />
        )}

        {viewingState === "S1_DGA_REVIEW" && (
          <StepDgaReview
            checklist={dgaChecklist}
            busy={busy}
            onEdit={editDgaField}
            onConfirm={
              currentIdx > steps.findIndex((s) => s.states.includes("S1_DGA_REVIEW"))
                ? () => setViewingIdx((i) => Math.min(currentIdx, i + 1))
                : confirmDgaReview
            }
            onBack={backToCapture}
          />
        )}

        {viewingState === "S2_ID_SELFIE" && (
          <StepIdSelfie
            selfie={selfie}
            onPickSelfie={handleSelfieChange}
            busy={busy}
            onSubmit={
              selfie instanceof File
                ? submitIdSelfie
                : () => setViewingIdx((i) => Math.min(currentIdx, i + 1))
            }
            onBack={() => setViewingIdx((i) => Math.max(0, i - 1))}
            onClear={() => {
              setSelfie(null);
              setSelfieCrop(null);
            }}
          />
        )}

        {viewingState === "S3_PHONE_RESPONSE" && (
          <StepPhone
            file={phoneShot}
            onPick={setPhoneShot}
            busy={busy}
            onSubmit={
              phoneShot instanceof File
                ? submitPhone
                : () => setViewingIdx((i) => Math.min(currentIdx, i + 1))
            }
            errorOnRetry={error}
            onBack={() => setViewingIdx((i) => Math.max(0, i - 1))}
          />
        )}

        {viewingState === "S4_BANKBOOK_UPLOAD" && (
          <StepBankbook
            file={bankbook}
            onPick={setBankbook}
            busy={busy}
            onSubmit={
              bankbook instanceof File
                ? submitBankbook
                : () => setViewingIdx((i) => Math.min(currentIdx, i + 1))
            }
            onBack={() => setViewingIdx((i) => Math.max(0, i - 1))}
          />
        )}

        {viewingState === "S5_SUMMARY" && (
          <StepSummaryReview
            sessionId={sessionId!}
            busy={busy}
            setBusy={setBusy}
            setError={setError}
            setInfo={setInfo}
            setState={setState}
            onBack={() => setViewingIdx((i) => Math.max(0, i - 1))}
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

      {busy && (
        <ProgressModal
          title={
            state === "S1_ID_CARD_REF"
              ? "กำลังประมวลผลรูปภาพบัตรประชาชน"
              : state === "S1_ID_CARD_REVIEW"
                ? "กำลังบันทึกข้อมูลหลักบัตรประชาชน"
                : state === "S2_EMAIL_PENDING"
                  ? "กำลังเช่าอีเมลชั่วคราว"
                  : state === "S3_OTP_VERIFIED"
                    ? "กำลังดึงและตรวจ OTP"
                    : state === "S1_DGA_CAPTURE"
                      ? dgaUploading
                        ? "กำลังประมวลผลรูปภาพจากแอป D.GA"
                        : "กำลังบันทึกเอกสารข้อมูลหลัก"
                      : "กำลังประมวลผลข้อมูล"
          }
          subtitle="กรุณารอซักครู่ ระบบกำลังดำเนินการและตรวจสอบข้อมูลของคุณ ห้ามปิดหน้าต่างนี้"
          stages={progressStages}
        />
      )}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setLightboxUrl(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="ปิด"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div 
            className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxTitle && (
              <p className="text-white/90 text-[14px] font-medium mb-3 px-3 py-1 bg-black/45 rounded-full">
                {lightboxTitle}
              </p>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={lightboxUrl} 
              alt={lightboxTitle} 
              className="max-w-full max-h-[80vh] rounded-lg object-contain shadow-2xl border border-white/10" 
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Streaming progress card — populated as the SSE backend emits stage
// events. Each completed stage gets a ✓ + label + elapsed ms; the
// most-recent stage shows a spinner to signal "still working".
// ────────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────
// Sticky stepper bar (Stitch screens 03-07)
// ────────────────────────────────────────────────────────────────────

function Stepper({
  steps,
  currentIdx,
  viewingIdx,
  onStepClick,
}: {
  steps: Array<{ label: string; states: WizardState[] }>;
  currentIdx: number;
  viewingIdx: number;
  onStepClick: (idx: number) => void;
}) {
  return (
    <div className="sticky top-16 z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-4 bg-white border-b border-mp-border">
      <div className="flex items-center gap-2 max-w-[680px] mx-auto">
        {steps.map((step, i) => {
          const isActive = i === viewingIdx;
          const isDone = i < currentIdx;
          const isClickable = i <= currentIdx;
          return (
            <div key={step.states.join("-")} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onStepClick(i)}
                className="flex w-8 sm:w-14 md:w-16 flex-col items-center gap-1.5 shrink-0 outline-none group text-center disabled:cursor-not-allowed"
              >
                <div
                  className={
                    "w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition " +
                    (isActive
                      ? "bg-mp-coral text-white shadow-sm ring-4 ring-mp-coral/20"
                      : isDone
                        ? "bg-mp-forest text-white group-hover:bg-mp-forest/80"
                        : "bg-mp-cream-alt text-mp-ink-muted")
                  }
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <span
                  className={
                    "hidden sm:block w-full text-center text-[11px] font-medium uppercase tracking-[0.08em] leading-tight transition " +
                    (isActive
                      ? "text-mp-ink"
                      : isDone
                        ? "text-mp-forest group-hover:text-mp-forest/80"
                        : "text-mp-ink-muted")
                  }
                >
                  {step.label}
                </span>
              </button>
              {i < steps.length - 1 && (
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
  previewFit = "contain",
  aspectRatio = "aspect-[1.58]",
}: {
  file: File | string | null;
  onPick: (f: File | null) => void;
  label: string;
  sub: string;
  required?: boolean;
  icon?: typeof Upload;
  height?: string;
  previewLayout?: "compact" | "full" | "card";
  previewFit?: "cover" | "contain";
  aspectRatio?: string;
}) {
  const id = `upload-${label.replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 6)}`;
  const previewFitClass = previewFit === "contain" ? "object-contain" : "object-cover";

  const isStringUrl = typeof file === "string";

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    if (typeof file === "string") {
      setPreviewUrl(file);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const fileName = file ? (isStringUrl ? "evidence.jpg" : (file as File).name) : "";
  const fileSizeLabel = file ? (isStringUrl ? "อัปโหลดแล้ว" : `${((file as File).size / 1024).toFixed(0)} KB`) : "";

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
          previewLayout === "card" ? (
            <div className={`flex flex-col items-center justify-center p-6 w-full ${height}`}>
              <div 
                className={`relative group rounded-xl overflow-hidden bg-mp-cream-alt border border-mp-border shadow-sm transition hover:shadow-md cursor-zoom-in ${aspectRatio} w-full max-w-[280px]`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (previewUrl) {
                    window.dispatchEvent(new CustomEvent("open-kyc-lightbox", { 
                      detail: { url: previewUrl, title: label } 
                    }));
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl!}
                  alt={fileName}
                  className={`absolute inset-0 w-full h-full ${previewFitClass}`}
                />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[12px] font-semibold text-white bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5" />
                    คลิกเพื่อขยายดูภาพ
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between w-full max-w-[280px] gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-mp-forest mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[12px] font-semibold">อัปโหลดสำเร็จ</span>
                  </div>
                  <p className="text-[13px] text-mp-ink truncate">{fileName}</p>
                  <p className="text-[11px] text-mp-ink-muted">{fileSizeLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPick(null);
                  }}
                  aria-label="ลบและอัปโหลดใหม่"
                  className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md text-mp-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : previewLayout === "full" ? (
            <div className={`flex flex-col p-4 ${height}`}>
              <div className="flex-1 min-h-[200px] rounded-lg overflow-hidden bg-mp-cream-alt border border-mp-border p-3">
                <div 
                  className="relative w-full h-full rounded-md overflow-hidden bg-white/70 cursor-zoom-in group"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (previewUrl) {
                      window.dispatchEvent(new CustomEvent("open-kyc-lightbox", { 
                        detail: { url: previewUrl, title: label } 
                      }));
                    }
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl!}
                    alt={fileName}
                    className={`absolute inset-0 w-full h-full ${previewFitClass}`}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[11px] font-semibold text-white bg-black/60 px-2 py-1 rounded-full flex items-center gap-0.5">
                      <Maximize2 className="w-3 h-3" />
                      ขยาย
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-mp-forest mb-0.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="text-[13px] font-semibold">อัปโหลดแล้ว</span>
                  </div>
                  <p className="text-[14px] text-mp-ink truncate">{fileName}</p>
                  <p className="text-[12px] text-mp-ink-muted">
                    {fileSizeLabel}
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
              <div 
                className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-mp-cream-alt border border-mp-border cursor-zoom-in group"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (previewUrl) {
                    window.dispatchEvent(new CustomEvent("open-kyc-lightbox", { 
                      detail: { url: previewUrl, title: label } 
                    }));
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl!}
                  alt={fileName}
                  className={`absolute inset-0 w-full h-full ${previewFitClass}`}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-4 h-4 text-white drop-shadow-md" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-mp-forest mb-0.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="text-[13px] font-semibold">อัปโหลดแล้ว</span>
                </div>
                <p className="text-[14px] text-mp-ink truncate">{fileName}</p>
                <p className="text-[12px] text-mp-ink-muted">
                  {fileSizeLabel}
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
  onBack,
}: {
  onSubmit: () => void;
  busy: boolean;
  disabled: boolean;
  submitLabel?: string;
  submitLarge?: boolean;
  onBack?: () => void;
}) {
  return (
    <div className="max-w-[680px] mx-auto mt-10 flex items-center justify-between pt-6 border-t border-mp-border">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="inline-flex items-center gap-1.5 text-[14px] text-mp-ink-muted hover:text-mp-ink transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          ย้อนกลับ
        </button>
      ) : (
        <Link
          href="/apply"
          className="inline-flex items-center gap-1.5 text-[14px] text-mp-ink-muted hover:text-mp-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ย้อนกลับ
        </Link>
      )}
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
  onBack,
}: {
  images: DgaUploadedImage[];
  checklist: DgaChecklistEntry[];
  ready: boolean;
  uploading: boolean;
  busy: boolean;
  onAdd: (file: File) => void;
  onRemove: (evidenceId: string) => void;
  onSubmit: () => void;
  onBack?: () => void;
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
                  <div 
                    className="relative aspect-[3/4] w-full bg-mp-cream-alt overflow-hidden group cursor-zoom-in"
                    onClick={() => {
                      if (imageSrc) {
                        window.dispatchEvent(new CustomEvent("open-kyc-lightbox", { 
                          detail: { url: imageSrc, title: img.filename ?? "DGA screenshot" } 
                        }));
                      }
                    }}
                  >
                    {imageSrc ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imageSrc}
                        alt={img.filename ?? "DGA screenshot"}
                        className="absolute inset-0 w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <UserCircle2 className="w-12 h-12 text-mp-ink-muted/40" />
                      </div>
                    )}
                    {imageSrc && (
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[12px] font-semibold text-white bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5" />
                          คลิกเพื่อขยายดูภาพ
                        </span>
                      </div>
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
        onBack={onBack}
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
  onBack,
  onClear,
}: {
  selfie: File | string | null;
  onPickSelfie: (e: ChangeEvent<HTMLInputElement>) => void;
  busy: boolean;
  onSubmit: () => void;
  onBack?: () => void;
  onClear?: () => void;
}) {
  const isStringUrl = typeof selfie === "string";

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selfie) {
      setPreviewUrl(null);
      return;
    }
    if (typeof selfie === "string") {
      setPreviewUrl(selfie);
      return;
    }
    const url = URL.createObjectURL(selfie);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selfie]);

  const fileName = selfie ? (isStringUrl ? "selfie.jpg" : (selfie as File).name) : "";
  const fileSizeLabel = selfie ? (isStringUrl ? "อัปโหลดแล้ว" : `${((selfie as File).size / 1024).toFixed(0)} KB · ตัดกรอบบัตรอัตโนมัติแล้ว`) : "";

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
            <div className="flex flex-col items-center justify-center p-6 w-full min-h-[260px]">
              <div 
                className="relative group rounded-xl overflow-hidden bg-mp-cream-alt border border-mp-border shadow-sm transition hover:shadow-md cursor-zoom-in aspect-[3/4] w-full max-w-[200px]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (previewUrl) {
                    window.dispatchEvent(new CustomEvent("open-kyc-lightbox", { 
                      detail: { url: previewUrl, title: "รูปเซลฟี่ถือบัตร" } 
                    }));
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl!}
                  alt={fileName}
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[12px] font-semibold text-white bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5" />
                    คลิกเพื่อขยายดูภาพ
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between w-full max-w-[200px] gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-mp-forest mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[12px] font-semibold">อัปโหลดสำเร็จ</span>
                  </div>
                  <p className="text-[13px] text-mp-ink truncate">{fileName}</p>
                  <p className="text-[11px] text-mp-ink-muted">{fileSizeLabel}</p>
                </div>
                {onClear && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onClear();
                    }}
                    aria-label="ลบและอัปโหลดใหม่"
                    className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md text-mp-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
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

      <StickyFooter onSubmit={onSubmit} busy={busy} disabled={!selfie} onBack={onBack} />
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
  onBack,
}: {
  file: File | string | null;
  onPick: (f: File | null) => void;
  busy: boolean;
  onSubmit: () => void;
  errorOnRetry: string | null;
  onBack?: () => void;
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
          previewLayout="card"
          aspectRatio="aspect-[3/4]"
        />
      </div>

      <StickyFooter onSubmit={onSubmit} busy={busy} disabled={!file} onBack={onBack} />
    </div>
  );
}

// ── Step 4: Bankbook (FINAL) ───────────────────────────────────────

function StepBankbook({
  file,
  onPick,
  busy,
  onSubmit,
  onBack,
}: {
  file: File | string | null;
  onPick: (f: File | null) => void;
  busy: boolean;
  onSubmit: () => void;
  onBack?: () => void;
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
          previewLayout="card"
          aspectRatio="aspect-[1.58]"
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
        onBack={onBack}
      />

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

interface EvidenceItem {
  id: string;
  step: string;
  bytes: number;
  mime: string;
  url: string;
}

function StepSummaryReview({
  sessionId,
  busy,
  setBusy,
  setError,
  setInfo,
  setState,
  onBack,
}: {
  sessionId: string;
  busy: boolean;
  setBusy: (b: boolean) => void;
  setError: (err: string | null) => void;
  setInfo: (inf: string | null) => void;
  setState: (st: WizardState) => void;
  onBack?: () => void;
}) {
  const router = useRouter();
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvidence() {
      try {
        const res = await fetch(`/api/wizard/${sessionId}/result`);
        if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลเอกสารได้");
        const data = await res.json();
        if (data.ok && data.evidence) {
          setEvidence(data.evidence);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    loadEvidence();
  }, [sessionId, setError]);

  async function handleFinalize() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/wizard/${sessionId}/s5/finalize`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "ไม่สามารถส่งข้อมูลยืนยันตัวตนได้");
      }
      setState(data.state);
      setInfo("ส่งข้อมูลยืนยันตัวตนเสร็จสมบูรณ์");

      if (data.phone && data.tempPassword) {
        clearCache();
        setCreatedVendorCreds({
          phone: data.phone,
          tempPass: data.tempPassword,
          refCode: data.refCode,
        });
      } else if (data.phone) {
        clearCache();
        let redirectUrl = `/signin?phone=${encodeURIComponent(data.phone)}`;
        if (data.refCode) {
          redirectUrl += `&ref=${encodeURIComponent(data.refCode)}`;
        }
        router.push(redirectUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-mp-coral animate-spin mb-3" />
        <p className="text-[14px] text-mp-ink-muted">กำลังโหลดเอกสารที่คุณอัปโหลด...</p>
      </div>
    );
  }

  const idCardRef = evidence.find((e) => e.step === "S1_ID_CARD_REF");
  const dgaImages = evidence.filter((e) => e.step === "S1_DGA_CAPTURE");
  const selfie = evidence.find((e) => e.step === "S2_ID_SELFIE");
  const phone = evidence.find((e) => e.step === "S3_PHONE_RESPONSE");
  const bankbook = evidence.find((e) => e.step === "S4_BANKBOOK");

  return (
    <div>
      <StepHeader
        step={8}
        total={8}
        title="ตรวจสอบและยืนยันข้อมูล"
        body="กรุณาตรวจสอบรูปภาพเอกสารทั้งหมดที่คุณอัปโหลด หากถูกต้องแล้ว กดปุ่มเพื่อเสร็จสิ้นการยืนยันตัวตน"
      />

      <div className="max-w-[800px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Column 1: Identity Documents */}
        <div className="space-y-6">
          <div className="border-b border-mp-border pb-2">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-mp-ink-muted">1. เอกสารยืนยันตัวตน</h3>
          </div>

          {idCardRef && (
            <div className="rounded-xl border border-mp-border bg-mp-cream-alt/40 p-4">
              <h4 className="text-[13px] font-semibold text-mp-ink mb-3">
                ภาพบัตรประชาชน (อ้างอิง)
              </h4>
              <div 
                className="relative group aspect-[1.58] w-full rounded-xl overflow-hidden border border-mp-border bg-white shadow-sm hover:scale-[1.02] hover:shadow-md cursor-zoom-in transition-all duration-200"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-kyc-lightbox", { 
                    detail: { url: idCardRef.url, title: "ภาพบัตรประชาชน (อ้างอิง)" } 
                  }));
                }}
              >
                <img src={idCardRef.url} alt="บัตรประชาชนอ้างอิง" className="absolute inset-0 w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[12px] font-semibold text-white bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5" />
                    คลิกเพื่อขยาย
                  </span>
                </div>
              </div>
            </div>
          )}

          {bankbook && (
            <div className="rounded-xl border border-mp-border bg-mp-cream-alt/40 p-4">
              <h4 className="text-[13px] font-semibold text-mp-ink mb-3">
                ภาพหน้าแรกสมุดบัญชีธนาคาร
              </h4>
              <div 
                className="relative group aspect-[1.58] w-full rounded-xl overflow-hidden border border-mp-border bg-white shadow-sm hover:scale-[1.02] hover:shadow-md cursor-zoom-in transition-all duration-200"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-kyc-lightbox", { 
                    detail: { url: bankbook.url, title: "ภาพสมุดบัญชีธนาคาร" } 
                  }));
                }}
              >
                <img src={bankbook.url} alt="สมุดบัญชี" className="absolute inset-0 w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[12px] font-semibold text-white bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5" />
                    คลิกเพื่อขยาย
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Verifications & Screen Captures */}
        <div className="space-y-6">
          <div className="border-b border-mp-border pb-2">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-mp-ink-muted">2. ภาพและผลการตรวจสอบ</h3>
          </div>

          {selfie && (
            <div className="rounded-xl border border-mp-border bg-mp-cream-alt/40 p-4">
              <h4 className="text-[13px] font-semibold text-mp-ink mb-3">
                ภาพถ่ายเซลฟี่ถือบัตรประชาชน
              </h4>
              <div 
                className="relative group aspect-[3/4] w-full max-w-[200px] mx-auto rounded-xl overflow-hidden border border-mp-border bg-white shadow-sm hover:scale-[1.02] hover:shadow-md cursor-zoom-in transition-all duration-200"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-kyc-lightbox", { 
                    detail: { url: selfie.url, title: "ภาพถ่ายเซลฟี่ถือบัตรประชาชน" } 
                  }));
                }}
              >
                <img src={selfie.url} alt="เซลฟี่ถือบัตร" className="absolute inset-0 w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[12px] font-semibold text-white bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5" />
                    คลิกเพื่อขยาย
                  </span>
                </div>
              </div>
            </div>
          )}

          {phone && (
            <div className="rounded-xl border border-mp-border bg-mp-cream-alt/40 p-4">
              <h4 className="text-[13px] font-semibold text-mp-ink mb-3">
                ภาพบันทึกหน้าจอยืนยันรหัส USSD
              </h4>
              <div 
                className="relative group aspect-[3/4] w-full max-w-[200px] mx-auto rounded-xl overflow-hidden border border-mp-border bg-white shadow-sm hover:scale-[1.02] hover:shadow-md cursor-zoom-in transition-all duration-200"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-kyc-lightbox", { 
                    detail: { url: phone.url, title: "ภาพบันทึกหน้าจอยืนยันรหัส USSD" } 
                  }));
                }}
              >
                <img src={phone.url} alt="ผลลัพธ์ USSD" className="absolute inset-0 w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[12px] font-semibold text-white bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5" />
                    คลิกเพื่อขยาย
                  </span>
                </div>
              </div>
            </div>
          )}

          {dgaImages.length > 0 && (
            <div className="rounded-xl border border-mp-border bg-mp-cream-alt/40 p-4">
              <h4 className="text-[13px] font-semibold text-mp-ink mb-3">
                ภาพบันทึกหน้าจอจาก DGA ({dgaImages.length} ภาพ)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {dgaImages.map((img, idx) => (
                  <div 
                    key={img.id} 
                    className="relative group aspect-[3/4] rounded-xl overflow-hidden border border-mp-border bg-white shadow-sm hover:scale-[1.02] hover:shadow-md cursor-zoom-in transition-all duration-200"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("open-kyc-lightbox", { 
                        detail: { url: img.url, title: `ภาพบันทึกหน้าจอจาก DGA (${idx + 1}/${dgaImages.length})` } 
                      }));
                    }}
                  >
                    <img src={img.url} alt={`DGA capture ${idx + 1}`} className="absolute inset-0 w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-white bg-black/60 px-2 py-1 rounded-full flex items-center gap-0.5">
                        <Maximize2 className="w-2.5 h-2.5" />
                        ขยาย
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-mp-ink/80 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[10px] font-medium text-white">
                      ภาพที่ {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[680px] mx-auto text-center text-[12px] text-mp-ink-muted mb-2">
        กรุณาตรวจสอบเอกสารทั้งหมดก่อนกดยืนยัน ข้อมูลจะไม่สามารถแก้ไขได้หลังจากขั้นตอนนี้
      </div>

      <StickyFooter
        onSubmit={handleFinalize}
        onBack={onBack}
        busy={busy}
        disabled={busy}
        submitLabel="ส่งข้อมูลยืนยันตัวตน"
        submitLarge
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// ProgressModal (Non-dismissible processing overlay for all steps)
// ────────────────────────────────────────────────────────────────────

function ProgressModal({
  title,
  subtitle,
  stages,
}: {
  title: string;
  subtitle: string;
  stages: SSEStage[];
}) {
  // Intercept ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const last = stages[stages.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-mp-border shadow-2xl w-full max-w-[480px] overflow-hidden p-6 md:p-8 animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-6">
          <Loader2 className="w-12 h-12 text-mp-coral animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>
            {title}
          </h3>
          <p className="text-[14px] text-mp-ink-muted mt-1 leading-relaxed">
            {subtitle}
            {last && ` (${(last.total_ms / 1000).toFixed(1)} วินาที)`}
          </p>
        </div>

        {stages.length > 0 && (
          <div className="rounded-xl bg-mp-cream-alt/40 border border-mp-border p-4 max-h-[240px] overflow-y-auto">
            <ul className="space-y-3">
              {stages.map((s, idx) => {
                const isLast = idx === stages.length - 1;
                return (
                  <li key={`${s.name}-${idx}`} className="flex items-center gap-3 text-[14px]">
                    {isLast ? (
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <Loader2 className="w-4 h-4 text-mp-coral animate-spin" />
                      </div>
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-mp-forest shrink-0" />
                    )}
                    <span className={`flex-1 text-left ${isLast ? "font-semibold text-mp-ink" : "text-mp-ink-muted"}`}>
                      {s.label ?? s.name}
                    </span>
                    <span className="text-xs text-mp-ink-muted tabular-nums shrink-0">
                      {(s.ms / 1000).toFixed(1)}s
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Step 1 — ID card reference upload
// ────────────────────────────────────────────────────────────────────

function StepIdCardRef({
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
        step={1}
        total={7}
        title="ถ่ายรูปบัตรประชาชน"
        body="ระบบจะอ่านชื่อและเลขบัตรเพื่อใช้เป็นข้อมูลหลัก เปรียบเทียบกับขั้นถัดไป"
      />

      <div className="max-w-[680px] mx-auto mb-5">
        <UploadZone
          file={file}
          onPick={onPick}
          label="แตะเพื่ออัปโหลดรูปบัตร"
          sub="JPG, PNG, HEIC · สูงสุด 10MB"
          icon={IdCard}
          height="min-h-[260px]"
          previewLayout="card"
          aspectRatio="aspect-[1.58]"
        />
      </div>

      <div className="max-w-[680px] mx-auto rounded-xl bg-mp-forest/5 border border-mp-forest/20 px-4 py-3 flex items-start gap-3">
        <Lock className="w-4 h-4 text-mp-forest shrink-0 mt-0.5" />
        <p className="text-[13px] text-mp-forest leading-relaxed">
          บัตรของคุณจะถูกเข้ารหัสและลบทันทีเมื่อการตรวจสอบเสร็จสิ้น
        </p>
      </div>

      <StickyFooter
        onSubmit={onSubmit}
        busy={busy}
        disabled={!file}
        submitLabel="บันทึกบัตรและไปต่อ"
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Step 1 (review phase) — read-only OCR confirmation
// ────────────────────────────────────────────────────────────────────

function StepIdCardReview({
  previewUrl,
  identity,
  busy,
  onConfirm,
  onRetake,
}: {
  previewUrl: string | null;
  identity: IdentityPayload | null;
  busy: boolean;
  onConfirm: () => void;
  onRetake: () => void;
}) {
  const hasIdentity = identity !== null;
  const checksumOk = identity?.checksumValid ?? false;
  const expired = identity?.expired ?? false;
  const hasName = !!(identity?.fullName ?? identity?.firstName);
  const canConfirm = hasIdentity && checksumOk && !expired && hasName;

  return (
    <div>
      <StepHeader
        step={1}
        total={7}
        title="ตรวจสอบข้อมูลบัตร"
        body="ระบบอ่านได้แบบนี้ ตรวจให้แน่ใจก่อนยืนยัน — ข้อมูลนี้จะใช้เป็นหลักเปรียบเทียบทุกขั้นถัดไป แก้ไขไม่ได้หลังจากนี้"
      />

      <div className="max-w-[680px] mx-auto rounded-2xl border border-mp-border bg-white p-5 shadow-sm mb-5">
        <div className="flex flex-col sm:flex-row gap-5">
          {previewUrl && (
            <div 
              className="shrink-0 w-full sm:w-48 aspect-[85/54] rounded-lg overflow-hidden bg-mp-cream-alt border border-mp-border relative group cursor-zoom-in shadow-sm hover:shadow-md transition-shadow"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("open-kyc-lightbox", { 
                  detail: { url: previewUrl, title: "รูปบัตรประชาชน" } 
                }));
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="บัตรประชาชน"
                className="absolute inset-0 w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] font-semibold text-white bg-black/60 px-2 py-1 rounded-full flex items-center gap-0.5">
                  <Maximize2 className="w-2.5 h-2.5" />
                  ขยาย
                </span>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-3">
            <ReviewField
              label="ชื่อ-นามสกุล"
              value={identity?.fullName ?? null}
              ok={hasName}
            />
            <ReviewField
              label="เลขบัตรประชาชน 13 หลัก"
              value={identity?.citizenIdFormatted ?? identity?.citizenId ?? null}
              ok={checksumOk}
              badge={
                checksumOk ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-mp-forest bg-mp-forest/10 rounded-md px-2 py-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    checksum ผ่าน
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 rounded-md px-2 py-0.5">
                    checksum ไม่ผ่าน
                  </span>
                )
              }
            />
            <ReviewField
              label="วันเดือนปีเกิด"
              value={identity?.dobThai ?? identity?.dob ?? null}
              ok={!!identity?.dob}
            />
            <ReviewField
              label="วันหมดอายุ"
              value={identity?.expiryThai ?? identity?.expiry ?? null}
              ok={!!identity?.expiry && !expired}
              badge={
                expired ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 rounded-md px-2 py-0.5">
                    หมดอายุแล้ว
                  </span>
                ) : null
              }
            />
          </div>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto rounded-xl bg-mp-warning/10 border border-mp-warning/30 px-4 py-3 mb-5">
        <p className="text-[13px] text-mp-ink leading-relaxed">
          <strong>หมายเหตุ:</strong> ข้อมูลนี้คือหลักที่ระบบจะใช้ตรวจกับ DGA, เซลฟี่,
          เบอร์โทร และสมุดบัญชี — ถ้าอ่านผิด ทุกขั้นถัดไปจะไม่ผ่าน กรุณาถ่ายใหม่
        </p>
      </div>

      {!canConfirm && hasIdentity && (
        <div className="max-w-[680px] mx-auto rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 mb-5 text-[13px] text-red-800">
          <p className="font-semibold mb-0.5">ยังยืนยันไม่ได้</p>
          <p>
            {!hasName && "ระบบอ่านชื่อจากบัตรไม่ได้ "}
            {!checksumOk && "เลขบัตร 13 หลักไม่ผ่าน checksum "}
            {expired && "บัตรประชาชนหมดอายุแล้ว "}
            — กรุณาถ่ายรูปใหม่ให้คมชัดและอ่านได้ครบ
          </p>
        </div>
      )}

      <div className="max-w-[680px] mx-auto mt-10 flex items-center justify-between pt-6 border-t border-mp-border gap-4">
        <button
          type="button"
          onClick={onRetake}
          disabled={busy}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-mp-border px-5 text-[14px] font-medium text-mp-ink-muted hover:bg-mp-cream-alt hover:text-mp-ink disabled:opacity-50 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          ถ่ายใหม่
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy || !canConfirm}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-mp-coral px-6 text-[15px] font-semibold text-white shadow-sm hover:bg-mp-coral-dark hover:-translate-y-px disabled:opacity-50 disabled:hover:transform-none transition-all"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          ยืนยันและไปต่อ
          {!busy && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function ReviewField({
  label,
  value,
  ok,
  badge,
}: {
  label: string;
  value: string | null;
  ok: boolean;
  badge?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-mp-border last:border-b-0 last:pb-0">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-mp-ink-muted mb-1">
          {label}
        </p>
        <p
          className={
            "text-[15px] " +
            (ok && value
              ? "font-semibold text-mp-ink"
              : "font-medium text-red-700")
          }
        >
          {value || "— อ่านไม่ออก"}
        </p>
      </div>
      {badge && <div className="shrink-0 self-center">{badge}</div>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Step 2 — email lease
// ────────────────────────────────────────────────────────────────────

function StepEmailLease({
  leasedEmail,
  countdownLabel,
  secondsLeft,
  busy,
  onRequestEmail,
  onAdvance,
  emailTab,
  onTabChange,
  onSkipEmail,
  onBack,
  isAlreadyLeased,
}: {
  leasedEmail: string | null;
  countdownLabel: string;
  secondsLeft: number;
  busy: boolean;
  onRequestEmail: () => Promise<void> | void;
  onAdvance: () => void;
  emailTab: "system" | "own";
  onTabChange: (tab: "system" | "own") => void;
  onSkipEmail: () => void;
  onBack?: () => void;
  isAlreadyLeased: boolean;
}) {
  const [showReleaseWarning, setShowReleaseWarning] = useState(isAlreadyLeased);

  if (showReleaseWarning && leasedEmail) {
    return (
      <div className="max-w-[520px] mx-auto rounded-2xl border border-mp-warning/30 bg-white p-6 shadow-md text-center">
        <AlertTriangle className="w-12 h-12 text-mp-warning mx-auto mb-4" />
        <h3 className="text-lg font-bold text-mp-ink mb-2">คุณเคยเช่าอีเมลสำเร็จแล้ว</h3>
        <p className="text-[14px] text-mp-ink-muted mb-6 leading-relaxed">
          ระบบเช่าอีเมลเดิมของคุณคือ <strong className="text-mp-ink">{leasedEmail}</strong> ยังสามารถใช้งานได้อยู่ คุณต้องการเปลี่ยนอีเมลหรือไม่?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => setShowReleaseWarning(false)}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-mp-border px-5 text-[14px] font-medium text-mp-ink hover:bg-mp-cream-alt transition-colors"
          >
            ใช้อีเมลเดิมและดูรหัส OTP
          </button>
          <button
            type="button"
            onClick={async () => {
              setShowReleaseWarning(false);
              await onRequestEmail();
            }}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-5 text-[14px] font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            เปลี่ยนอีเมลใหม่ (ขอใหม่)
          </button>
        </div>
      </div>
    );
  }

  const isWarning = secondsLeft > 0 && secondsLeft <= 300;
  const isDanger = secondsLeft > 0 && secondsLeft <= 60;

  const copy = () => {
    if (typeof window !== "undefined" && leasedEmail) {
      navigator.clipboard.writeText(leasedEmail).catch(() => {});
    }
  };

  return (
    <div>
      <StepHeader
        step={2}
        total={7}
        title={
          emailTab === "system"
            ? leasedEmail
              ? "อีเมลของคุณพร้อมแล้ว"
              : "ขออีเมลจากระบบ"
            : "ใช้อีเมลของคุณเอง"
        }
        body={
          emailTab === "system"
            ? leasedEmail
              ? "คัดลอกอีเมลด้านล่างไปกรอกในเว็บ DGA เพื่อขอ OTP"
              : "ระบบจะให้อีเมลชั่วคราว 25 นาที สำหรับนำไปกรอกในเว็บ DGA เพื่อขอ OTP"
            : "หากคุณมีบัญชีอีเมลเดิม หรือต้องการใช้ช่องทางของคุณเอง คุณไม่จำเป็นต้องเช่าอีเมลจากระบบ"
        }
      />

      <div className="flex rounded-xl p-1 bg-mp-cream-alt border border-mp-border max-w-[480px] mx-auto mb-8">
        <button
          type="button"
          onClick={() => onTabChange("system")}
          className={
            "flex-1 py-2 text-center text-[14px] font-semibold rounded-lg transition-colors " +
            (emailTab === "system"
              ? "bg-white text-mp-ink shadow-sm"
              : "text-mp-ink-muted hover:text-mp-ink")
          }
        >
          ใช้อีเมลชั่วคราวจากระบบ
        </button>
        <button
          type="button"
          onClick={() => onTabChange("own")}
          className={
            "flex-1 py-2 text-center text-[14px] font-semibold rounded-lg transition-colors " +
            (emailTab === "own"
              ? "bg-white text-mp-ink shadow-sm"
              : "text-mp-ink-muted hover:text-mp-ink")
          }
        >
          ใช้อีเมลส่วนตัว
        </button>
      </div>

      {emailTab === "system" ? (
        !leasedEmail ? (
          <>
            <div className="max-w-[640px] mx-auto rounded-xl bg-mp-cream-alt/60 border border-mp-border p-5 mb-6">
              <p className="text-[13px] font-semibold text-mp-ink mb-3">ขั้นตอนถัดไป:</p>
              <ol className="space-y-2.5 text-[14px] text-mp-ink-muted">
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-mp-coral text-white text-[12px] font-bold flex items-center justify-center">1</span>
                  <span>กดปุ่ม &ldquo;ขออีเมล&rdquo; ด้านล่าง</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-mp-cream-alt border border-mp-border text-mp-ink-muted text-[12px] font-bold flex items-center justify-center">2</span>
                  <span>นำอีเมลไปกรอกในเว็บ DGA แล้วขอ OTP</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-mp-cream-alt border border-mp-border text-mp-ink-muted text-[12px] font-bold flex items-center justify-center">3</span>
                  <span>กลับมาดึงรหัส OTP ในขั้นถัดไป</span>
                </li>
              </ol>
            </div>

            <div className="max-w-[680px] mx-auto text-center py-6">
              <Mail className="w-16 h-16 mx-auto mb-4 text-mp-coral/40" strokeWidth={1.5} />
              <button
                type="button"
                onClick={onRequestEmail}
                disabled={busy}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-mp-coral px-8 text-[15px] font-semibold text-white shadow-sm hover:bg-mp-coral-dark disabled:opacity-50 transition-all"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                ขออีเมลจากระบบ
              </button>
            </div>
            <StickyFooter onSubmit={() => {}} busy={busy} disabled onBack={onBack} />
          </>
        ) : (
          <>
            <div className="max-w-[640px] mx-auto rounded-2xl border-2 border-mp-forest/30 bg-mp-forest/5 p-6 mb-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-mp-forest mb-2">อีเมลของคุณ</p>
              <div className="flex items-center gap-3">
                <p
                  className="flex-1 text-[18px] font-semibold text-mp-ink break-all"
                  style={{ fontFamily: "var(--mp-font-display)" }}
                >
                  {leasedEmail}
                </p>
                <button
                  type="button"
                  onClick={copy}
                  aria-label="คัดลอกอีเมล"
                  className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-md text-mp-ink-muted hover:text-mp-coral hover:bg-white transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-mp-forest/15 flex items-center gap-2">
                <Clock
                  className={
                    "w-4 h-4 " +
                    (isDanger ? "text-red-600" : isWarning ? "text-mp-warning" : "text-mp-forest")
                  }
                />
                <span className="text-[13px] text-mp-ink-muted">หมดอายุใน</span>
                <span
                  className={
                    "text-[16px] font-bold tabular-nums " +
                    (isDanger ? "text-red-600" : isWarning ? "text-mp-warning" : "text-mp-forest")
                  }
                >
                  {countdownLabel}
                </span>
              </div>
            </div>

            <div className="max-w-[640px] mx-auto rounded-xl bg-mp-warning/10 border border-mp-warning/30 px-4 py-3">
              <p className="text-[13px] text-mp-ink leading-relaxed">
                <strong>ขั้นถัดไป:</strong> เปิดเว็บ DGA → กรอกอีเมลนี้ → ขอ OTP → กลับมากดปุ่มด้านล่าง
              </p>
            </div>

            <StickyFooter
              onSubmit={onAdvance}
              busy={busy}
              disabled={false}
              submitLabel="ไปดึงรหัส OTP"
              onBack={onBack}
            />
          </>
        )
      ) : (
        <>
          <div className="max-w-[640px] mx-auto rounded-xl bg-mp-cream-alt/60 border border-mp-border p-5 mb-6">
            <p className="text-[13px] font-semibold text-mp-ink mb-3">ขั้นตอนการใช้อีเมลของตนเอง:</p>
            <ol className="space-y-2.5 text-[14px] text-mp-ink-muted">
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-mp-coral text-white text-[12px] font-bold flex items-center justify-center">1</span>
                <span>เปิดแอปหรือหน้าเว็บ DGA / ThaID</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-mp-cream-alt border border-mp-border text-mp-ink-muted text-[12px] font-bold flex items-center justify-center">2</span>
                <span>ลงทะเบียนหรือขอรหัส OTP เข้าอีเมลส่วนตัวของคุณให้เสร็จสิ้นด้วยตนเอง</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-mp-cream-alt border border-mp-border text-mp-ink-muted text-[12px] font-bold flex items-center justify-center">3</span>
                <span>เมื่อเสร็จสิ้นขั้นตอนในเว็บ DGA แล้ว ให้กดยืนยันด้านล่างเพื่อไปต่อ</span>
              </li>
            </ol>
          </div>

          <div className="max-w-[680px] mx-auto text-center py-6">
            <Smartphone className="w-16 h-16 mx-auto mb-4 text-mp-coral/40" strokeWidth={1.5} />
            <p className="text-[14px] text-mp-ink-muted mb-6">
              ระบบจะไม่ทำเรื่องเช่าอีเมลหรือดึง OTP ให้ คุณสามารถดำเนินการต่อได้ทันที
            </p>
          </div>

          <StickyFooter
            onSubmit={onSkipEmail}
            busy={busy}
            disabled={false}
            submitLabel="ฉันยืนยันตัวตนใน DGA เรียบร้อยแล้ว"
            onBack={onBack}
          />
        </>
      )}
    </div>
  );
}

function StepOtp({
  otp,
  email,
  countdownLabel,
  busy,
  onRefetch,
  onConfirm,
  onBack,
}: {
  otp: string | null;
  email: string | null;
  countdownLabel: string;
  busy: boolean;
  onRefetch: () => void;
  onConfirm: () => void;
  onBack?: () => void;
}) {
  return (
    <div>
      <StepHeader
        step={3}
        total={7}
        title="ดึงรหัส OTP ล่าสุด"
        body="หลังกรอกอีเมลใน DGA แล้ว ระบบจะอ่านอีเมลและตรวจชื่อให้ตรงกับบัตรประชาชน"
      />

      {email && (
        <div className="max-w-[640px] mx-auto rounded-xl bg-mp-cream-alt/60 border border-mp-border px-4 py-3 mb-5 flex items-center gap-3">
          <Mail className="w-4 h-4 text-mp-ink-muted shrink-0" />
          <span className="text-[13px] text-mp-ink-muted shrink-0">อีเมล:</span>
          <span className="text-[14px] text-mp-ink font-medium truncate flex-1">{email}</span>
          {countdownLabel !== "00:00" && (
            <span className="text-[12px] text-mp-ink-muted tabular-nums shrink-0">{countdownLabel}</span>
          )}
        </div>
      )}

      {otp ? (
        <>
          <div className="max-w-[640px] mx-auto rounded-2xl border-2 border-mp-coral/30 bg-white p-8 mb-5 text-center shadow-sm">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-mp-coral mb-3">
              รหัส OTP ของคุณ
            </p>
            <p
              className="text-mp-coral mb-2 select-all"
              style={{
                fontFamily: "var(--mp-font-display)",
                fontSize: "44px",
                fontWeight: 700,
                letterSpacing: "0.25em",
                lineHeight: 1.1,
              }}
            >
              {otp}
            </p>
            <p className="text-[12px] text-mp-ink-muted">รหัสนี้ใช้ภายใน 5 นาที</p>
            <button
              type="button"
              onClick={onRefetch}
              disabled={busy}
              className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-mp-border px-4 text-xs font-semibold text-mp-ink-muted hover:bg-mp-cream-alt hover:text-mp-ink transition-colors"
            >
              <RefreshCcw className="w-3 h-3" />
              ดึงรหัสใหม่อีกครั้ง
            </button>
          </div>

          <div className="max-w-[640px] mx-auto rounded-xl bg-mp-warning/10 border border-mp-warning/30 px-4 py-3 mb-5">
            <p className="text-[13px] text-mp-ink leading-relaxed">
              <strong>ขั้นถัดไป:</strong> นำรหัส OTP ไปกรอกในเว็บ DGA → กดยืนยัน → กลับมากดปุ่มด้านล่าง
            </p>
          </div>
        </>
      ) : (
        <div className="max-w-[640px] mx-auto text-center py-6 mb-5">
          <Smartphone className="w-16 h-16 mx-auto mb-4 text-mp-coral/40" strokeWidth={1.5} />
          <p className="text-[14px] text-mp-ink-muted mb-5">
            ระบบจะเข้าอีเมลเพื่ออ่านอัตโนมัติ ใช้เวลาประมาณ 5-15 วินาที
          </p>
          <button
            type="button"
            onClick={onRefetch}
            disabled={busy}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-mp-coral px-8 text-[15px] font-semibold text-white shadow-sm hover:bg-mp-coral-dark disabled:opacity-50 transition-all"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            ดึงรหัส OTP ล่าสุด
          </button>
        </div>
      )}

      <StickyFooter
        onSubmit={onConfirm}
        busy={busy}
        disabled={!otp}
        submitLabel="กรอก OTP ใน DGA เรียบร้อยแล้ว"
        onBack={onBack}
      />
    </div>
  );
}
