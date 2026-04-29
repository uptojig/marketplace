"use client";

import { Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "OAuth ตั้งค่าผิด ตรวจสอบ env vars",
  AccessDenied: "Google ปฏิเสธการเข้าถึง — ลอง add account ใน Test users",
  OAuthCallback: "callback URL ไม่ตรง — ตรวจสอบ Authorized redirect URIs ใน Google Console",
  OAuthSignin: "เริ่ม Google sign-in ไม่ได้",
  OAuthAccountNotLinked: "อีเมลนี้ผูกกับ provider อื่นแล้ว",
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
      <Button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
        Continue with Google
      </Button>
      <p className="text-sm">
        ยังไม่มีบัญชี?{" "}
        <Link href="/signup" className="font-medium text-blue-600 hover:underline">
          สมัครสมาชิก
        </Link>
      </p>
    </div>
  );
}
