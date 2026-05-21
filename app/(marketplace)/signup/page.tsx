"use client";

/**
 * Sign up (basketplace.co/signup) — magic-link-only flow. Seller types
 * email → Resend sends a one-time link → user clicks link → signed in.
 * NO password creation. Google OAuth as alternate path.
 *
 * After submit, form swaps to an inline success banner (NOT a full-page
 * transition). Per-store buyer signup lives separately.
 */

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2, MailCheck, ShieldCheck, Clock, Lock, AlertCircle } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "OAuth ตั้งค่าผิด ตรวจสอบ env vars",
  AccessDenied: "Google ปฏิเสธการเข้าถึง — ลอง add account ใน Test users",
  OAuthCallback: "callback URL ไม่ตรง — ตรวจสอบ Authorized redirect URIs ใน Google Console",
  OAuthSignin: "เริ่ม Google sign-in ไม่ได้",
  OAuthAccountNotLinked: "อีเมลนี้ผูกกับ provider อื่นแล้ว",
  EmailSignin: "ส่งลิงก์ไม่สำเร็จ — ตรวจสอบ EMAIL_SERVER",
  Verification: "ลิงก์หมดอายุหรือใช้แล้ว — ขอใหม่ได้",
};

function ErrorBanner() {
  const params = useSearchParams();
  const error = params.get("error");
  if (!error) return null;
  return (
    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <p className="font-semibold">เกิดข้อผิดพลาด</p>
      <p className="mt-1 text-xs">{ERROR_MESSAGES[error] ?? error}</p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

interface EmailFormProps {
  refCode: string;
  agentName: string;
}

function EmailForm({ refCode, agentName }: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    const res = await signIn("email", {
      email: email.trim(),
      redirect: false,
      callbackUrl: `/apply?ref=${encodeURIComponent(refCode)}`,
    });
    setSubmitting(false);
    if (res?.ok) setSent(true);
  }

  if (sent) {
    return (
      <div
        className="rounded-xl border p-5"
        style={{
          background:
            "color-mix(in srgb, var(--color-mp-forest) 12%, white)",
          borderColor:
            "color-mix(in srgb, var(--color-mp-forest) 30%, transparent)",
        }}
      >
        <div className="flex items-start gap-3">
          <MailCheck className="w-6 h-6 text-mp-forest shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-[16px] font-semibold text-mp-ink mb-1">
              ส่งลิงก์ไปที่อีเมลแล้ว ✉️
            </h3>
            <p className="text-[14px] leading-relaxed text-mp-ink-muted mb-1">
              เราส่งลิงก์เข้าสู่ระบบไปที่{" "}
              <span className="font-medium text-mp-ink">{email}</span> —
              กรุณาเปิดอีเมลและคลิกลิงก์เพื่อเริ่มใช้งาน
            </p>
            <p className="text-[12px] text-mp-ink-muted/80">
              ลิงก์จะหมดอายุภายใน 24 ชั่วโมง
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-[13px] pl-9">
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-mp-coral font-medium hover:underline"
          >
            ส่งลิงก์ใหม่
          </button>
          <span className="text-mp-ink-muted/40">·</span>
          <button
            type="button"
            onClick={() => {
              setEmail("");
              setSent(false);
            }}
            className="text-mp-coral font-medium hover:underline"
          >
            เปลี่ยนอีเมล
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {agentName && (
        <div className="rounded-xl border border-mp-forest/20 bg-mp-forest/5 p-3 text-xs text-mp-forest flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>แนะนำโดยตัวแทน: <strong>{agentName}</strong> ({refCode})</span>
        </div>
      )}
      <div>
        <label htmlFor="signup-email" className="block text-[14px] font-medium text-mp-ink mb-1.5">
          อีเมล
        </label>
        <input
          id="signup-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          placeholder="you@example.com"
          className="w-full h-11 rounded-[10px] border border-mp-border bg-white px-4 text-[15px] text-mp-ink placeholder:text-mp-ink-muted/60 focus:border-mp-coral focus:outline-none focus:ring-2 focus:ring-mp-coral/20 disabled:bg-mp-cream-alt/40 transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-mp-coral px-4 text-[15px] font-semibold text-white shadow-sm hover:bg-mp-coral-dark hover:-translate-y-px disabled:opacity-50 disabled:hover:transform-none transition-all"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "กำลังส่ง..." : "ส่งลิงก์ยืนยันทางอีเมล"}
      </button>
    </form>
  );
}

function SignUpPageContent() {
  const searchParams = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [isValidRef, setIsValidRef] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [agentName, setAgentName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useState(() => {
    // Read code from URL or localStorage
    const urlRef = searchParams.get("ref");
    const storedRef = typeof window !== "undefined" ? window.localStorage.getItem("agent.ref.code") : null;
    const finalCode = urlRef || storedRef;

    if (!finalCode) {
      setIsValidating(false);
      setIsValidRef(false);
      return;
    }

    fetch(`/api/agents/validate?code=${encodeURIComponent(finalCode)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setIsValidRef(true);
          setRefCode(finalCode.toUpperCase());
          setAgentName(data.agentName);
          if (typeof window !== "undefined") {
            window.localStorage.setItem("agent.ref.code", finalCode.toUpperCase());
          }
        } else {
          setIsValidRef(false);
          setErrorMsg(data.detail || "Link Code ไม่ถูกต้อง หรือ ตัวแทนไม่พร้อมใช้งาน");
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("agent.ref.code");
          }
        }
      })
      .catch(() => {
        setIsValidRef(false);
        setErrorMsg("ไม่สามารถตรวจสอบข้อมูลตัวแทนได้ในขณะนี้");
      })
      .finally(() => {
        setIsValidating(false);
      });
  });

  if (isValidating) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-mp-cream">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-mp-coral animate-spin mx-auto mb-3" />
          <p className="text-[15px] text-mp-ink-muted">กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
        </div>
      </div>
    );
  }

  if (!isValidRef) {
    return (
      <div className="mx-auto max-w-[1440px] min-h-[calc(100vh-4rem)] grid lg:grid-cols-[60%_40%] bg-mp-cream">
        <aside
          className="hidden lg:flex flex-col justify-between bg-mp-forest text-mp-cream p-12 relative overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute inset-0">
            <Image
              src="/editorial_bg.png"
              alt=""
              fill
              className="object-cover"
              sizes="60vw"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative z-10">
            <span className="text-[13px] font-medium uppercase tracking-[0.16em] text-mp-cream/70">
              Basketplace
            </span>
          </div>
          <blockquote
            className="relative z-10 max-w-md text-2xl lg:text-3xl leading-snug text-mp-cream font-semibold"
            style={{ fontFamily: "var(--mp-font-display)" }}
          >
            “เข้าใช้งานด้วยระบบตัวแทนเท่านั้น”
          </blockquote>
        </aside>

        <div className="flex items-center justify-center px-6 py-12 lg:py-16 bg-mp-cream">
          <div className="w-full max-w-[400px] text-center lg:text-left">
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-left">
              <div className="flex items-start gap-3 text-red-700">
                <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-[16px] font-semibold mb-1">
                    การเข้าใช้งานถูกจำกัด 🔒
                  </h3>
                  <p className="text-[14px] leading-relaxed text-red-700/80">
                    {errorMsg || "คุณต้องสมัครสมาชิกและเข้ายืนยันตัวตนผ่านลิงก์แนะนำของตัวแทน (Agent) เท่านั้น จึงจะสามารถเปิดร้านค้ากับเราได้"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-mp-ink-muted">หากคุณสนใจร่วมทีมและต้องการเป็นตัวแทนผู้แนะนำร้านค้า:</p>
              <Link
                href="/agent/register"
                className="flex w-full h-11 items-center justify-center rounded-xl bg-mp-coral text-[15px] font-semibold text-white hover:bg-mp-coral-dark transition-all"
              >
                สมัครเป็นตัวแทน (Agent)
              </Link>
              <Link
                href="/signin"
                className="flex w-full h-11 items-center justify-center rounded-xl border border-mp-border bg-white text-[15px] font-semibold text-mp-ink hover:bg-mp-cream-alt/40 transition-all"
              >
                เข้าสู่ระบบ (ถ้ามีบัญชีแล้ว)
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] min-h-[calc(100vh-4rem)] grid lg:grid-cols-[60%_40%] bg-mp-cream">
      {/* LEFT — editorial brand panel */}
      <aside
        className="hidden lg:flex flex-col justify-between bg-mp-forest text-mp-cream p-12 relative overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0">
          <Image
            src="/editorial_bg.png"
            alt=""
            fill
            className="object-cover"
            sizes="60vw"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10">
          <span className="text-[13px] font-medium uppercase tracking-[0.16em] text-mp-cream/70">
            Basketplace
          </span>
        </div>
        <blockquote
          className="relative z-10 max-w-md text-2xl lg:text-3xl leading-snug text-mp-cream font-semibold"
          style={{ fontFamily: "var(--mp-font-display)" }}
        >
          “เปิดร้านบนโดเมนของคุณเอง<br />ไม่ใช่เช่าพื้นที่ใน Shopee”
        </blockquote>
      </aside>

      {/* RIGHT — signup form */}
      <div className="flex items-center justify-center px-6 py-12 lg:py-16 bg-mp-cream">
        <div className="w-full max-w-[400px]">
          <div className="text-center lg:text-left mb-6">
            <h1
              className="text-3xl font-bold text-mp-ink"
              style={{ fontFamily: "var(--mp-font-display)" }}
            >
              เริ่มต้นเปิดร้านของคุณ
            </h1>
            <p className="mt-2 text-[15px] text-mp-ink-muted">
              เราจะส่งลิงก์เข้าสู่ระบบให้ทางอีเมล ไม่ต้องตั้งรหัสผ่าน
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-between gap-3 mb-6 py-3 px-4 rounded-xl bg-white/60 border border-mp-border">
            {[
              { icon: ShieldCheck, label: "ฟรี 100%" },
              { icon: Clock, label: "ใช้เวลา 2 นาที" },
              { icon: Lock, label: "ปลอดภัย PDPA" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[12px] text-mp-ink-muted">
                <Icon className="w-3.5 h-3.5 text-mp-forest" />
                {label}
              </div>
            ))}
          </div>

          <Suspense fallback={null}>
            <ErrorBanner />
          </Suspense>

          <EmailForm refCode={refCode} agentName={agentName} />

          <div className="relative my-6">
            <div className="absolute inset-x-0 top-1/2 h-px bg-mp-border" />
            <span className="relative bg-mp-cream px-3 text-[13px] text-mp-ink-muted">
              หรือ
            </span>
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: `/apply?ref=${encodeURIComponent(refCode)}` })}
            className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl bg-white border border-mp-border text-[15px] font-medium text-mp-ink hover:bg-mp-cream-alt/40 transition-colors"
          >
            <GoogleIcon />
            สมัครด้วย Google
          </button>

          <p className="mt-8 text-center text-[14px] text-mp-ink-muted">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              href={`/signin?ref=${encodeURIComponent(refCode)}`}
              className="font-semibold text-mp-coral hover:underline"
            >
              เข้าสู่ระบบ
            </Link>
          </p>

          <p className="mt-6 text-center text-[12px] text-mp-ink-muted/80">
            การสมัครสมาชิกถือว่าคุณยอมรับ{" "}
            <Link href="/legal/terms" className="underline hover:text-mp-coral">
              ข้อกำหนดการใช้งาน
            </Link>{" "}
            และ{" "}
            <Link href="/legal/privacy" className="underline hover:text-mp-coral">
              นโยบายความเป็นส่วนตัว
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-mp-cream">
        <Loader2 className="w-8 h-8 text-mp-coral animate-spin" />
      </div>
    }>
      <SignUpPageContent />
    </Suspense>
  );
}
