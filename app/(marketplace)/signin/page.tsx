"use client";

// TODO(cleanup): per Shopify-like architecture, buyer sign-in lives at
// /stores/[slug]/signin (introduced in the fashion-beauty design pilot,
// PR claude/design-fashion-beauty-pilot). Keep this central path only
// for seller onboarding → /dashboard until all buyer callers (checkout
// bounce, account redirect, order-success redirect) are pointing at
// the per-store route. Then this file can be deleted.

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "OAuth ตั้งค่าผิด ตรวจสอบ env vars",
  AccessDenied: "Google ปฏิเสธการเข้าถึง — ลอง add account ใน Test users",
  OAuthCallback:
    "callback URL ไม่ตรง — ตรวจสอบ Authorized redirect URIs ใน Google Console",
  OAuthSignin: "เริ่ม Google sign-in ไม่ได้",
  OAuthAccountNotLinked: "อีเมลนี้ผูกกับ provider อื่นแล้ว",
  CredentialsSignin: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
};

function ErrorBanner() {
  const params = useSearchParams();
  const error = params.get("error");
  if (!error) return null;
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <p className="font-medium">เกิดข้อผิดพลาด: {error}</p>
      <p className="mt-1 text-xs">{ERROR_MESSAGES[error] ?? "ลองอีกครั้ง"}</p>
    </div>
  );
}

function CredentialsForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
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
        setErr(
          ERROR_MESSAGES[res.error] ??
            "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        );
        return;
      }
      // success — manually redirect since redirect:false
      router.push(next);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 text-left">
      <label className="block">
        <span className="text-sm font-medium">อีเมล</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm disabled:bg-gray-100"
          placeholder="you@example.com"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">รหัสผ่าน</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm disabled:bg-gray-100"
        />
      </label>
      {err && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}
      <button
        type="submit"
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        เข้าสู่ระบบ
      </button>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-sm space-y-6 text-center">
      <h1 className="text-2xl font-semibold">เข้าสู่ระบบ</h1>
      <Suspense fallback={null}>
        <ErrorBanner />
      </Suspense>
      <p className="text-sm text-muted-foreground">
        เข้าสู่ระบบเพื่อจัดการร้านค้าของคุณ
      </p>

      <Suspense fallback={null}>
        <CredentialsForm />
      </Suspense>

      <div className="relative py-2">
        <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200" />
        <span className="relative bg-white px-3 text-xs text-muted-foreground">
          หรือ
        </span>
      </div>

      <Button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full"
      >
        Continue with Google
      </Button>

      <p className="text-sm">
        ยังไม่มีบัญชี?{" "}
        <Link
          href="/signup"
          className="font-medium text-blue-600 hover:underline"
        >
          สมัครสมาชิก
        </Link>
      </p>
    </div>
  );
}
