"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, AlertCircle } from "lucide-react";

export function KycLocalRefGate() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const storedRef = window.localStorage.getItem("agent.ref.code");
    if (storedRef) {
      // Re-trigger /apply with the ref parameter
      const params = new URLSearchParams(window.location.search);
      params.set("ref", storedRef);
      router.replace(`/apply?${params.toString()}`);
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-mp-cream">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-mp-coral animate-spin mx-auto mb-3" />
          <p className="text-[15px] text-mp-ink-muted">กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-[60%_40%]">
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
          “เข้าใช้งานด้วยระบบตัวแทนเท่านั้น”
        </blockquote>
      </aside>

      {/* RIGHT — block message */}
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
                  คุณต้องยืนยันตัวตนผ่านลิงก์แนะนำของตัวแทน (Agent) เท่านั้น หากไม่มีลิงก์จะไม่สามารถกรอกข้อมูลยืนยันตัวตนหรือสมัครร้านค้าได้
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
          </div>
        </div>
      </div>
    </div>
  );
}
