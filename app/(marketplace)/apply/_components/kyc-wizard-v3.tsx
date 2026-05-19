"use client";

/**
 * KYC Wizard v3 — Reference-OCR 3-step pre-flow.
 *
 * Scope: ONLY the three pre-flow steps that were added on top of the
 * existing kyc-wizard.tsx pipeline:
 *
 *   1. ID card upload  (reference OCR — anchor for downstream
 *                       cross-check; backend state S1_ID_CARD_REF)
 *   2. Email lease     (25-min temp inbox from outlook_pool;
 *                       backend state S2_EMAIL_PENDING)
 *   3. Fetch OTP       (IMAP read + name match against Step 1 anchor;
 *                       backend state S3_OTP_VERIFIED; confirm POST
 *                       transitions to S1_DGA_CAPTURE — legacy state)
 *
 * Steps 4-7 of the product spec (DGA multi-image capture, DGA review,
 * ID + selfie, phone/USSD response, bankbook) live in kyc-wizard.tsx
 * and are reached automatically: once /s3/confirm bumps the session
 * to S1_DGA_CAPTURE, the LEGACY_HANDOFF_STATES effect router.replace's
 * /apply, and page.tsx routes the now-legacy state to <KycWizard>.
 *
 * Visual language matches the Editorial Merchant Stitch designs and
 * mirrors the per-step layout of kyc-wizard.tsx: sticky stepper, dashed
 * cream upload zones, instruction cards on cream-alt, coral primary CTA
 * + ghost back. Brand chrome (header/footer) comes from the layout.
 */

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  IdCard,
  Loader2,
  Lock,
  Mail,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
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
}

interface KycWizardV3Props {
  initialSessionId?: string;
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

// Full 7-step view shared with legacy kyc-wizard.tsx — the stepper
// shows the entire journey so users always see where they are in
// relation to the full flow, even though v3 only OWNS steps 1-3
// (legacy KycWizard takes over from step 4 onward via the LEGACY_HANDOFF
// effect). Step 4.1 (DGA review) is folded into step 4 in the stepper —
// it's a sub-state of the same visual step. Labels match the wording in
// the LandingScreen at app/(marketplace)/apply/page.tsx so the stepper
// dots can be cross-referenced with the landing's numbered list.
type StepKey =
  | "S1_ID_CARD_REF"
  | "S2_EMAIL_PENDING"
  | "S3_OTP_VERIFIED"
  | "S1_DGA_CAPTURE"
  | "S2_ID_SELFIE"
  | "S3_PHONE_RESPONSE"
  | "S4_BANKBOOK_UPLOAD";

const STEPS: Array<{ state: StepKey; label: string }> = [
  { state: "S1_ID_CARD_REF", label: "บัตร" },
  { state: "S2_EMAIL_PENDING", label: "อีเมล" },
  { state: "S3_OTP_VERIFIED", label: "OTP" },
  { state: "S1_DGA_CAPTURE", label: "D.GA" },
  { state: "S2_ID_SELFIE", label: "เซลฟี่" },
  { state: "S3_PHONE_RESPONSE", label: "เบอร์" },
  { state: "S4_BANKBOOK_UPLOAD", label: "บัญชี" },
];

// S1_ID_CARD_REVIEW is a sub-state of step 1 in the stepper view — same
// visual dot as S1_ID_CARD_REF, just a different render branch.
const STEP_INDEX_BY_STATE: Partial<Record<WizardState, number>> = {
  S1_ID_CARD_REF: 0,
  S1_ID_CARD_REVIEW: 0,
  S2_EMAIL_PENDING: 1,
  S3_OTP_VERIFIED: 2,
  S1_DGA_CAPTURE: 3,
  S1_DGA_REVIEW: 3,
  S2_ID_SELFIE: 4,
  S3_PHONE_RESPONSE: 5,
  S4_BANKBOOK_UPLOAD: 6,
};

const LOCAL_STORAGE_KEY = "kyc.session.v3";
const TERMINAL_STATES = new Set<WizardState>(["AUTO_APPROVED", "REJECTED", "MANUAL_REVIEW"]);
const LEGACY_HANDOFF_STATES = new Set<WizardState>([
  "S1_DGA_CAPTURE",
  "S1_DGA_REVIEW",
  "S2_ID_SELFIE",
  "S3_PHONE_RESPONSE",
  "S4_BANKBOOK_UPLOAD",
]);

function readCache(): LocalCache | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LocalCache;
    if (!parsed.sid) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(cache: LocalCache) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));
}

function clearCache() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOCAL_STORAGE_KEY);
}

async function postJson<T>(url: string, init?: RequestInit): Promise<T & { ok?: boolean; error?: string }> {
  const res = await fetch(url, init);
  const payload = await res.json();
  if (!res.ok || payload?.ok === false) {
    const error = payload?.error ?? `Request failed (${res.status})`;
    throw new Error(error);
  }
  return payload;
}

export default function KycWizardV3({ initialSessionId }: KycWizardV3Props) {
  const router = useRouter();
  const handoffRequested = useRef(false);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null);
  const [state, setState] = useState<WizardState>("INIT");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [idFront, setIdFront] = useState<File | null>(null);
  // Preview blob kept around for the REVIEW screen — the server doesn't
  // hand back a public thumbnail URL (the evidence is private storage),
  // so we render the client's own File via URL.createObjectURL.
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [identity, setIdentity] = useState<IdentityPayload | null>(null);
  const [leasedEmail, setLeasedEmail] = useState<string | null>(null);
  const [leaseExpiresAt, setLeaseExpiresAt] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [otp, setOtp] = useState<string | null>(null);

  useEffect(() => {
    if (!idFront) {
      setIdFrontPreview(null);
      return;
    }
    const url = URL.createObjectURL(idFront);
    setIdFrontPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [idFront]);

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

  useEffect(() => {
    if (!sessionId) return;
    writeCache({
      sid: sessionId,
      email: leasedEmail,
      expiresAt: leaseExpiresAt,
    });
  }, [sessionId, leasedEmail, leaseExpiresAt]);

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
    if (!sessionId) return;
    if (!TERMINAL_STATES.has(state)) return;
    router.replace(`/apply?sid=${encodeURIComponent(sessionId)}`);
    router.refresh();
  }, [router, sessionId, state]);

  useEffect(() => {
    if (!sessionId) return;
    if (!LEGACY_HANDOFF_STATES.has(state)) {
      handoffRequested.current = false;
      return;
    }
    if (handoffRequested.current) return;
    handoffRequested.current = true;
    router.replace(`/apply?sid=${encodeURIComponent(sessionId)}`);
    router.refresh();
  }, [router, sessionId, state]);

  async function refresh(sid: string) {
    try {
      const res = await postJson<SnapshotPayload>(`/api/wizard/${sid}`);
      if (res.state) setState(res.state);
      setSessionId(sid);
    } catch {
      // ignore - startup hydration can race with server
    }
  }

  async function startSession() {
    setBusy(true);
    setError(null);
    try {
      const res = await postJson<{ session_id: string; state: WizardState }>("/api/wizard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ metadata: { entry: "kyc-v3" } }),
      });
      setSessionId(res.session_id);
      setState(res.state);
      setInfo("เริ่มคำขอ KYC แล้ว");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

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
      setState(res.state);
      if (res.identity) setIdentity(res.identity);
      setInfo(null);
      // Keep idFront so the REVIEW screen can show the thumbnail. The
      // image only clears once the vendor confirms (or retakes).
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
      setState(res.state);
      setIdFront(null);
      setIdentity(null);
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
      setState(res.state);
      setIdFront(null);
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
      const nextEmail = res.email ?? null;
      const nextExpiry = res.expires_at ?? null;
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
      setOtp(res.otp);
      setState(res.state);
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
      setState(res.state);
      setInfo("ยืนยัน OTP แล้ว กำลังไปขั้นอัปโหลดรูป DGA");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const countdownLabel = useMemo(() => {
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [secondsLeft]);

  const currentIdx = useMemo(() => {
    if (TERMINAL_STATES.has(state)) return STEPS.length - 1;
    const i = STEP_INDEX_BY_STATE[state];
    return i ?? -1;
  }, [state]);

  // ── Render branches ─────────────────────────────────────────────

  if (state === "INIT" && !sessionId) {
    return <IntroScreen onStart={startSession} busy={busy} error={error} />;
  }

  if (TERMINAL_STATES.has(state)) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 text-mp-forest mx-auto mb-3" />
          <p className="text-[15px] text-mp-ink-muted">กำลังบันทึกผล... รีเฟรชหน้าเพื่อดูสรุป</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Stepper currentIdx={currentIdx} />

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

        {state === "S1_ID_CARD_REF" && (
          <StepIdCardRef
            file={idFront}
            onPick={setIdFront}
            busy={busy}
            onSubmit={submitIdCard}
          />
        )}

        {state === "S1_ID_CARD_REVIEW" && (
          <StepIdCardReview
            previewUrl={idFrontPreview}
            identity={identity}
            busy={busy}
            onConfirm={confirmIdCard}
            onRetake={retakeIdCard}
          />
        )}

        {state === "S2_EMAIL_PENDING" && (
          <StepEmailLease
            leasedEmail={leasedEmail}
            countdownLabel={countdownLabel}
            secondsLeft={secondsLeft}
            busy={busy}
            onRequest={requestEmail}
            onAdvance={fetchOtp}
          />
        )}

        {state === "S3_OTP_VERIFIED" && (
          <StepOtp
            otp={otp}
            email={leasedEmail}
            countdownLabel={countdownLabel}
            busy={busy}
            onRefetch={fetchOtp}
            onConfirm={confirmOtpStep}
          />
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Sticky 4-dot stepper (matches kyc-wizard.tsx Stepper styling)
// ────────────────────────────────────────────────────────────────────

function Stepper({ currentIdx }: { currentIdx: number }) {
  return (
    <div className="sticky top-16 z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-4 bg-white border-b border-mp-border">
      <div className="flex items-center gap-2 max-w-[680px] mx-auto">
        {STEPS.map((step, i) => {
          const isActive = i === currentIdx;
          const isDone = i < currentIdx;
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
// Intro (shown when a visitor lands without a session)
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
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-mp-coral/10 flex items-center justify-center">
        <ShieldCheck className="w-8 h-8 text-mp-coral" />
      </div>
      <h2
        className="text-2xl font-bold text-mp-ink mb-3"
        style={{ fontFamily: "var(--mp-font-display)" }}
      >
        เริ่มยืนยันตัวตน
      </h2>
      <p className="text-[15px] text-mp-ink-muted mb-6">
        4 ขั้นตอน ใช้เวลา 5-10 นาที — เตรียมบัตรประชาชนและมือถือไว้ใกล้ตัว
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
// Shared per-step primitives (ported from kyc-wizard.tsx)
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
  icon: Icon = Upload,
  height = "min-h-[200px]",
}: {
  file: File | null;
  onPick: (f: File | null) => void;
  label: string;
  sub: string;
  icon?: typeof Upload;
  height?: string;
}) {
  const id = `upload-${label.replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 6)}`;
  return (
    <div>
      <input
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e: ChangeEvent<HTMLInputElement>) => onPick(e.target.files?.[0] ?? null)}
      />
      <label
        htmlFor={id}
        className={
          "block cursor-pointer rounded-xl border-2 border-dashed transition " +
          (file
            ? "border-mp-forest bg-mp-forest/5"
            : "border-mp-coral/40 bg-mp-cream-alt/40 hover:bg-mp-cream-alt/60 hover:border-mp-coral")
        }
      >
        {file ? (
          <div className={`flex items-center gap-4 p-5 ${height}`}>
            <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-mp-cream-alt border border-mp-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-mp-forest mb-0.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-[13px] font-semibold">อัปโหลดแล้ว</span>
              </div>
              <p className="text-[14px] text-mp-ink truncate">{file.name}</p>
              <p className="text-[12px] text-mp-ink-muted">{(file.size / 1024).toFixed(0)} KB</p>
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
}: {
  onSubmit: () => void;
  busy: boolean;
  disabled: boolean;
  submitLabel?: string;
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
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-mp-coral px-6 text-[15px] font-semibold text-white shadow-sm hover:bg-mp-coral-dark hover:-translate-y-px disabled:opacity-50 disabled:hover:transform-none transition-all"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {submitLabel}
        {!busy && <ArrowRight className="w-4 h-4" />}
      </button>
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
//
// The vendor sees the fields the system extracted as the cross-check
// anchor. By design fields are NOT editable: an editable anchor lets a
// vendor forge name/citizenId to defeat downstream cross-checks. If the
// read is wrong, "ถ่ายใหม่" is the only path forward.
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
            <div className="shrink-0 w-full sm:w-48 aspect-[85/54] rounded-lg overflow-hidden bg-mp-cream-alt border border-mp-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="บัตรประชาชน"
                className="w-full h-full object-cover"
              />
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
// Step 2 — email lease (two states: empty → leased with countdown)
// ────────────────────────────────────────────────────────────────────

function StepEmailLease({
  leasedEmail,
  countdownLabel,
  secondsLeft,
  busy,
  onRequest,
  onAdvance,
}: {
  leasedEmail: string | null;
  countdownLabel: string;
  secondsLeft: number;
  busy: boolean;
  onRequest: () => void;
  onAdvance: () => void;
}) {
  const isWarning = secondsLeft > 0 && secondsLeft <= 300;
  const isDanger = secondsLeft > 0 && secondsLeft <= 60;

  if (!leasedEmail) {
    return (
      <div>
        <StepHeader
          step={2}
          total={7}
          title="ขออีเมลจากระบบ"
          body="ระบบจะให้อีเมลชั่วคราว 25 นาที สำหรับนำไปกรอกในเว็บ DGA เพื่อขอ OTP"
        />

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

        <div className="max-w-[680px] mx-auto text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 text-mp-coral/40" strokeWidth={1.5} />
          <button
            type="button"
            onClick={onRequest}
            disabled={busy}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-mp-coral px-8 text-[15px] font-semibold text-white shadow-sm hover:bg-mp-coral-dark disabled:opacity-50 transition-all"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            ขออีเมลจากระบบ
          </button>
        </div>
      </div>
    );
  }

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
        title="อีเมลของคุณพร้อมแล้ว"
        body="คัดลอกอีเมลด้านล่างไปกรอกในเว็บ DGA เพื่อขอ OTP"
      />

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
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Step 3 — fetch OTP from leased inbox
// ────────────────────────────────────────────────────────────────────

function StepOtp({
  otp,
  email,
  countdownLabel,
  busy,
  onRefetch,
  onConfirm,
}: {
  otp: string | null;
  email: string | null;
  countdownLabel: string;
  busy: boolean;
  onRefetch: () => void;
  onConfirm: () => void;
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
          </div>

          <div className="max-w-[640px] mx-auto mb-5">
            <button
              type="button"
              onClick={onRefetch}
              disabled={busy}
              className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-mp-border text-[14px] text-mp-ink-muted hover:bg-mp-cream-alt hover:text-mp-ink disabled:opacity-50 transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              ดึงรหัสใหม่อีกครั้ง
            </button>
          </div>

          <div className="max-w-[640px] mx-auto rounded-xl bg-mp-warning/10 border border-mp-warning/30 px-4 py-3">
            <p className="text-[13px] text-mp-ink leading-relaxed">
              <strong>ขั้นถัดไป:</strong> นำรหัส OTP ไปกรอกในเว็บ DGA → กดยืนยัน → กลับมากดปุ่มด้านล่าง
            </p>
          </div>
        </>
      ) : (
        <div className="max-w-[640px] mx-auto text-center mb-5">
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
        submitLabel="กรอก OTP ใน DGA แล้ว"
      />
    </div>
  );
}

