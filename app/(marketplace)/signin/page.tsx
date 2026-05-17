"use client";

/**
 * Sign in (basketplace.co/signin) — seller-facing email+password or
 * Google OAuth. Wrapped in the marketplace shell so brand chrome
 * (MarketplaceHeader + MarketplaceFooter) is supplied by
 * app/(marketplace)/layout.tsx. We render only the content panel.
 *
 * Per-store BUYER signin lives at /stores/[slug]/signin (separate flow).
 *
 * Auth providers wired in lib/auth.ts: credentials (bcrypt) + Google.
 * Magic-link email provider is reserved for /signup (signup-only).
 */

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "OAuth ตั้งค่าผิด ตรวจสอบ env vars",
  AccessDenied: "Google ปฏิเสธการเข้าถึง — ลอง add account ใน Test users",
  OAuthCallback: "callback URL ไม่ตรง — ตรวจสอบ Authorized redirect URIs ใน Google Console",
  OAuthSignin: "เริ่ม Google sign-in ไม่ได้",
  OAuthAccountNotLinked: "อีเมลนี้ผูกกับ provider อื่นแล้ว",
  CredentialsSignin: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
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

function CredentialsForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || params.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email.trim() || !password) {
      setErr("กรอกอีเมลและรหัสผ่าน");
      return;
    }
    setBusy(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setErr(ERROR_MESSAGES[res.error] ?? "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }
      router.push(next);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="signin-email" className="block text-[14px] font-medium text-mp-ink mb-1.5">
          อีเมล
        </label>
        <input
          id="signin-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
          placeholder="you@example.com"
          className="w-full h-11 rounded-[10px] border border-mp-border bg-white px-4 text-[15px] text-mp-ink placeholder:text-mp-ink-muted/60 focus:border-mp-coral focus:outline-none focus:ring-2 focus:ring-mp-coral/20 disabled:bg-mp-cream-alt/40 transition-colors"
        />
      </div>
      <div>
        <label htmlFor="signin-password" className="block text-[14px] font-medium text-mp-ink mb-1.5">
          รหัสผ่าน
        </label>
        <input
          id="signin-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          className="w-full h-11 rounded-[10px] border border-mp-border bg-white px-4 text-[15px] text-mp-ink focus:border-mp-coral focus:outline-none focus:ring-2 focus:ring-mp-coral/20 disabled:bg-mp-cream-alt/40 transition-colors"
        />
      </div>
      {err && (
        <div className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {err}
        </div>
      )}
      <button
        type="submit"
        disabled={busy}
        className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-mp-coral px-4 text-[15px] font-semibold text-white shadow-sm hover:bg-mp-coral-dark hover:-translate-y-px disabled:opacity-50 disabled:hover:transform-none transition-all"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        เข้าสู่ระบบ
      </button>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-[60%_40%]">
      {/* LEFT — editorial brand panel (desktop only) */}
      <aside
        className="hidden lg:flex flex-col justify-between bg-mp-forest text-mp-cream p-12 relative overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 opacity-30">
          <Image
            src="https://lh3.googleusercontent.com/aida/ADBb0uj0zmNhSKLUFr6Uh4Mn7FA4zICX4lG-W3XOJYgAOytDBlgdZMKmlWn9RB0sPK8BkIAL72JAS3DrU25b90tUeJWV62pP79jZ_wbz_Y2EUZ2zbB2Ctie-LupndgCrLndIdUEv2Il1Rt8EpCjc49_fHL-doyqv6pYiGFs-Yf6HuiZMWbD5tS65OalWNWMyyVgmaNAFNxsfiOXwQR95JpV6y-eKwrzFULILSQShC_iSXanOyB02n8HOZimpMA"
            alt=""
            fill
            className="object-cover"
            sizes="60vw"
            priority
          />
          <div className="absolute inset-0 bg-mp-forest/50" />
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

      {/* RIGHT — sign-in form */}
      <div className="flex items-center justify-center px-6 py-12 lg:py-16 bg-mp-cream">
        <div className="w-full max-w-[400px]">
          <div className="text-center lg:text-left mb-8">
            <h1
              className="text-3xl font-bold text-mp-ink"
              style={{ fontFamily: "var(--mp-font-display)" }}
            >
              ยินดีต้อนรับกลับ
            </h1>
            <p className="mt-2 text-[15px] text-mp-ink-muted">
              เข้าสู่ระบบเพื่อจัดการร้านค้าของคุณ
            </p>
          </div>

          <Suspense fallback={null}>
            <ErrorBanner />
          </Suspense>

          <Suspense fallback={null}>
            <CredentialsForm />
          </Suspense>

          <div className="relative my-6">
            <div className="absolute inset-x-0 top-1/2 h-px bg-mp-border" />
            <span className="relative bg-mp-cream px-3 text-[13px] text-mp-ink-muted">
              หรือ
            </span>
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl bg-white border border-mp-border text-[15px] font-medium text-mp-ink hover:bg-mp-cream-alt/40 transition-colors"
          >
            <GoogleIcon />
            ดำเนินการต่อด้วย Google
          </button>

          <p className="mt-8 text-center text-[14px] text-mp-ink-muted">
            ยังไม่มีบัญชี?{" "}
            <Link
              href="/signup"
              className="font-semibold text-mp-coral hover:underline"
            >
              สมัครสมาชิก
            </Link>
          </p>

          <p className="mt-6 text-center text-[12px] text-mp-ink-muted/80">
            การเข้าสู่ระบบหมายความว่าคุณยอมรับ{" "}
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
