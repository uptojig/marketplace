import Link from "next/link";
import {
  Clock,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  Hourglass,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  findUserLatestKycSession,
  getWizardSnapshot,
} from "@/lib/kyc/wizard-state";
import { prisma } from "@/lib/prisma";
import KycWizard from "./_components/kyc-wizard";
import KycWizardV3 from "./_components/kyc-wizard-v3";
import { KycResumeRedirect } from "./_components/kyc-resume-redirect";
import { ApplyStartButton } from "./_components/apply-start-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ยืนยันตัวตน · Basketplace",
};

const TERMINAL_REJECT = new Set(["REJECTED"]);
const TERMINAL_APPROVED = new Set(["AUTO_APPROVED"]);
const TERMINAL_REVIEW = new Set(["MANUAL_REVIEW"]);
const IN_PROGRESS = new Set([
  "S1_ID_CARD_REF",
  "S1_ID_CARD_REVIEW",
  "S2_EMAIL_PENDING",
  "S3_OTP_VERIFIED",
  "S1_DGA_CAPTURE",
  "S1_DGA_REVIEW",
  "S2_ID_SELFIE",
  "S3_PHONE_RESPONSE",
  "S4_BANKBOOK_UPLOAD",
]);

const LEGACY_IN_PROGRESS = new Set([
  "S1_DGA_CAPTURE",
  "S1_DGA_REVIEW",
  "S2_ID_SELFIE",
  "S3_PHONE_RESPONSE",
  "S4_BANKBOOK_UPLOAD",
]);

// Auth gate intentionally relaxed — anonymous visitors can preview the
// landing. Once signed in, their prior session (if any) is loaded by
// findUserLatestKycSession. Production should re-add an auth check once
// /signin → /apply round-trip is verified end-to-end.
export default async function ApplyPage({
  searchParams,
}: {
  searchParams: { retry?: string; sid?: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const wantsRetry = searchParams.retry === "1";

  // ?sid= lets anonymous test sessions resume the wizard (their wizard
  // session isn't bound to a User row, so the userId-based lookup below
  // wouldn't surface it). Falls back to user-based lookup when sid omitted.
  const latest = searchParams.sid
    ? await getWizardSnapshot(searchParams.sid).then((s) =>
        s
          ? { id: s.id, state: s.state, createdAt: s.createdAt }
          : null,
      )
    : userId
      ? await findUserLatestKycSession(userId)
      : null;

  if (latest && TERMINAL_APPROVED.has(latest.state)) {
    return <ApprovedScreen />;
  }

  if (latest && TERMINAL_REVIEW.has(latest.state)) {
    return <ReviewScreen createdAt={latest.createdAt} sid={latest.id} />;
  }

  if (latest && TERMINAL_REJECT.has(latest.state) && !wantsRetry) {
    const rejectAudit = await prisma.wizardAuditLog.findFirst({
      where: {
        sessionId: latest.id,
        event: { in: ["admin.reject", "s7.finalize"] },
      },
      orderBy: { ts: "desc" },
    });
    const reason =
      rejectAudit?.payload &&
      typeof rejectAudit.payload === "object" &&
      "reason" in rejectAudit.payload
        ? String((rejectAudit.payload as { reason: unknown }).reason)
        : null;
    return <RejectedScreen reason={reason} />;
  }

  if (latest && IN_PROGRESS.has(latest.state)) {
    return (
      <WizardShell>
        {LEGACY_IN_PROGRESS.has(latest.state)
          ? <KycWizard initialSessionId={latest.id} />
          : <KycWizardV3 initialSessionId={latest.id} />}
      </WizardShell>
    );
  }

  // No session yet (or INIT) → marketing landing
  return <LandingScreen />;
}

// ─────────────────────────────────────────────────────────────────
// LANDING (Stitch Design 01)
// ─────────────────────────────────────────────────────────────────

function LandingScreen() {
  return (
    <div className="mx-auto max-w-[720px] px-5 py-12 md:py-16">
      <KycResumeRedirect />
      <div className="text-center">
        <span className="inline-block text-[13px] font-medium uppercase tracking-[0.16em] text-mp-coral">
          ขั้นตอนที่ 1 — ยืนยันตัวตน
        </span>
        <h1
          className="mt-4 text-3xl md:text-[40px] leading-tight font-bold text-mp-ink"
          style={{ fontFamily: "var(--mp-font-display)" }}
        >
          ยืนยันตัวตนเพื่อเริ่มขาย
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-mp-ink-muted max-w-lg mx-auto">
          เราต้องตรวจสอบตัวตนของคุณตามกฎหมายไทยก่อนเปิดร้าน — ใช้เวลาประมาณ 5-10 นาที
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-px overflow-hidden rounded-xl border border-mp-border bg-mp-border">
        {[
          { icon: Clock, label: "ใช้เวลา 5-10 นาที" },
          { icon: ShieldCheck, label: "ปลอดภัยตาม PDPA" },
          { icon: Sparkles, label: "ระบบ OCR อนุมัติเร็ว" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center justify-center gap-2 bg-white py-4 px-5 text-[14px] text-mp-ink"
          >
            <Icon className="w-4 h-4 text-mp-forest shrink-0" />
            {label}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-mp-cream-alt/60 border border-mp-border p-6 md:p-8">
        <h2
          className="text-[18px] font-semibold text-mp-ink mb-5"
          style={{ fontFamily: "var(--mp-font-display)" }}
        >
          เตรียมพร้อม 7 ขั้นตอน
        </h2>
        <ol className="space-y-4">
          {[
            { n: 1, t: "บัตรประชาชน (Reference OCR)", d: "อัปโหลดก่อนเริ่ม เพื่อเป็นข้อมูลอ้างอิงหลัก" },
            { n: 2, t: "รับอีเมลและดึง OTP", d: "ระบบจ่ายอีเมลชั่วคราวให้ แล้วดึง OTP จากฝั่งเรา" },
            { n: 3, t: "อัปโหลดรูป DGA Capture", d: "ส่งรูปจากหน้าโปรไฟล์ D.GA/ThaID ได้หลายภาพ" },
            { n: 4, t: "ตรวจทานข้อมูล DGA (Step 3.1)", d: "แก้ไข field ที่ OCR อ่านผิดก่อนไปขั้นต่อไป" },
            { n: 5, t: "บัตรประชาชน + เซลฟี่คู่บัตร", d: "ตรวจใบหน้าเทียบกับข้อมูลยืนยันตัวตน" },
            { n: 6, t: "รูป response เบอร์โทรจาก DGA", d: "อัปโหลด screenshot หน้าจอที่ระบบส่งกลับ" },
            { n: 7, t: "สมุดบัญชีธนาคาร", d: "หน้าแรกที่มีชื่อบัญชีเพื่อยืนยันการรับเงิน" },
          ].map((step) => (
            <li key={step.n} className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-mp-coral text-white text-[13px] font-bold flex items-center justify-center">
                {step.n}
              </span>
              <div>
                <p className="text-[15px] font-semibold text-mp-ink">{step.t}</p>
                <p className="text-[13px] text-mp-ink-muted mt-0.5">{step.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-10 text-center">
        <ApplyStartButton />
      </div>

      <div className="mt-8 text-center space-y-1.5">
        <p className="text-[13px] text-mp-ink-muted">
          ข้อมูลของคุณจะใช้เพื่อตรวจสอบกับฐาน DGA และส่งให้ payment gateway เท่านั้น
        </p>
        <p className="text-[13px] text-mp-ink-muted">
          ต้องการความช่วยเหลือ?{" "}
          <a
            href="https://line.me/R/ti/p/@basketplace"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-mp-forest font-medium hover:text-mp-coral transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            @basketplace (LINE)
          </a>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// AUTO_APPROVED
// ─────────────────────────────────────────────────────────────────

function ApprovedScreen() {
  return (
    <div className="mx-auto max-w-[480px] px-5 py-16 md:py-20 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-mp-forest/10 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-mp-forest" strokeWidth={2} />
      </div>
      <span className="inline-block text-[13px] font-medium uppercase tracking-[0.16em] text-mp-forest">
        ยืนยันตัวตนสำเร็จ
      </span>
      <h1
        className="mt-4 text-3xl font-bold text-mp-ink"
        style={{ fontFamily: "var(--mp-font-display)" }}
      >
        เอกสารของคุณผ่านการตรวจสอบแล้ว
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-mp-ink-muted">
        ตอนนี้คุณสามารถสร้างร้านได้ทันที — เราจะนำคุณไปยังตัวช่วยเปิดร้าน
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[13px]">
        {[
          { icon: ShieldCheck, label: "ผ่าน KYC" },
          { icon: CheckCircle2, label: "พร้อมรับเงิน" },
          { icon: Sparkles, label: "เปิดร้านได้เลย" },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full bg-mp-forest/10 text-mp-forest px-3 py-1"
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </span>
        ))}
      </div>
      <Link
        href="/create-store"
        className="mt-10 inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-mp-coral px-10 text-base font-semibold text-white shadow-md hover:bg-mp-coral-dark hover:-translate-y-px transition-all"
      >
        เริ่มสร้างร้าน <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MANUAL_REVIEW
// ─────────────────────────────────────────────────────────────────

function ReviewScreen({ createdAt, sid }: { createdAt: Date; sid: string }) {
  return (
    <div className="mx-auto max-w-[480px] px-5 py-16 md:py-20 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-mp-warning/15 flex items-center justify-center mb-6">
        <Hourglass className="w-10 h-10 text-mp-warning" strokeWidth={2} />
      </div>
      <span className="inline-block text-[13px] font-medium uppercase tracking-[0.16em] text-mp-warning">
        อยู่ระหว่างตรวจสอบ
      </span>
      <h1
        className="mt-4 text-3xl font-bold text-mp-ink"
        style={{ fontFamily: "var(--mp-font-display)" }}
      >
        เราได้รับเอกสารของคุณแล้ว
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-mp-ink-muted">
        ทีมงานกำลังตรวจสอบเอกสารของคุณ ใช้เวลาประมาณ 24-48 ชั่วโมง — เราจะส่งอีเมลแจ้งผลให้ทันที
      </p>
      <div className="mt-6 rounded-xl bg-mp-cream-alt/60 border border-mp-border p-5 text-left">
        <dl className="space-y-2.5 text-[14px]">
          <div className="flex justify-between gap-3">
            <dt className="text-mp-ink-muted">เลขที่คำขอ</dt>
            <dd className="font-mono text-mp-ink text-[13px]">
              {sid.slice(0, 12).toUpperCase()}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-mp-ink-muted">ยื่นเมื่อ</dt>
            <dd className="text-mp-ink">
              {createdAt.toLocaleString("th-TH", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </dd>
          </div>
        </dl>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="https://line.me/R/ti/p/@basketplace"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-mp-border bg-white px-6 text-[15px] font-semibold text-mp-ink hover:bg-mp-cream-alt/60 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          ติดต่อทีมงาน
        </a>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center px-6 text-[14px] text-mp-ink-muted hover:text-mp-ink"
        >
          ← กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// REJECTED
// ─────────────────────────────────────────────────────────────────

function RejectedScreen({ reason }: { reason: string | null }) {
  return (
    <div className="mx-auto max-w-[480px] px-5 py-16 md:py-20 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <XCircle className="w-10 h-10 text-red-600" strokeWidth={2} />
      </div>
      <span className="inline-block text-[13px] font-medium uppercase tracking-[0.16em] text-red-700">
        ไม่ผ่านการตรวจสอบ
      </span>
      <h1
        className="mt-4 text-3xl font-bold text-mp-ink"
        style={{ fontFamily: "var(--mp-font-display)" }}
      >
        เอกสารชุดล่าสุดถูกปฏิเสธ
      </h1>
      {reason && (
        <div className="mt-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-left">
          <p className="text-[13px] font-semibold text-red-900 mb-1">เหตุผลจากทีมงาน:</p>
          <p className="text-[14px] text-red-800 leading-relaxed">{reason}</p>
        </div>
      )}
      <Link
        href="/apply?retry=1"
        className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-mp-coral px-10 text-base font-semibold text-white shadow-md hover:bg-mp-coral-dark hover:-translate-y-px transition-all"
      >
        ส่งเอกสารใหม่อีกครั้ง <ArrowRight className="w-5 h-5" />
      </Link>
      <div className="mt-4">
        <a
          href="https://line.me/R/ti/p/@basketplace"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[14px] text-mp-forest font-medium hover:text-mp-coral transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          ติดต่อทีมงาน
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// WizardShell — brand container around the legacy kyc-wizard component
// ─────────────────────────────────────────────────────────────────

function WizardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[960px] px-5 py-10 md:py-12">
      <div className="mb-6">
        <span className="inline-block text-[13px] font-medium uppercase tracking-[0.16em] text-mp-coral">
          KYC Wizard — ยืนยันตัวตน
        </span>
        <h1
          className="mt-2 text-2xl md:text-3xl font-bold text-mp-ink"
          style={{ fontFamily: "var(--mp-font-display)" }}
        >
          ส่งเอกสารทีละขั้นตอน
        </h1>
        <p className="mt-1.5 text-[14px] text-mp-ink-muted">
          เก็บเอกสารให้ครบทุกขั้นตอน ระบบจะตรวจอัตโนมัติด้วย OCR และ cross-check ตามลำดับ
        </p>
      </div>
      <div className="rounded-2xl border border-mp-border bg-white p-4 md:p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
