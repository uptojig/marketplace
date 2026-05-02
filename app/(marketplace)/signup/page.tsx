"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <p className="font-medium">เกิดข้อผิดพลาด: {error}</p>
      <p className="mt-1 text-xs">{ERROR_MESSAGES[error] ?? "ลองอีกครั้ง"}</p>
    </div>
  );
}

function EmailForm() {
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
      callbackUrl: "/dashboard",
    });
    setSubmitting(false);
    if (res?.ok) setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <p className="font-medium">ส่งลิงก์ไปที่อีเมลแล้ว ✉️</p>
        <p className="mt-1 text-xs">
          เปิดอีเมล {email} แล้วคลิกลิงก์เพื่อยืนยันและเข้าสู่ระบบ
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">อีเมล</span>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </label>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "กำลังส่ง..." : "ส่งลิงก์ยืนยันทางอีเมล"}
      </Button>
    </form>
  );
}

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">สมัครสมาชิก</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          สร้างบัญชีเพื่อช้อปปิ้ง สั่งซื้อ และจัดการร้านค้าของคุณ
        </p>
      </div>

      <Suspense fallback={null}>
        <ErrorBanner />
      </Suspense>

      <Button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full"
      >
        สมัครด้วย Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">หรือ</span>
        </div>
      </div>

      <EmailForm />

      <p className="text-center text-xs text-muted-foreground">
        การสมัครสมาชิกถือว่าคุณยอมรับ
        <Link href="/help/terms" className="ml-1 underline hover:text-foreground">
          ข้อกำหนดการใช้งาน
        </Link>
        {" "}และ
        <Link href="/help/privacy" className="ml-1 underline hover:text-foreground">
          นโยบายความเป็นส่วนตัว
        </Link>
      </p>

      <p className="text-center text-sm">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/signin" className="font-medium text-blue-600 hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
