"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, ShieldCheck, Clock, Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function AgentRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    lineId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/agents/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "email_already_in_use") {
          setError("อีเมลนี้ได้รับการลงทะเบียนในระบบแล้ว");
        } else {
          setError(data.detail || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
        }
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
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
            “ร่วมเป็นส่วนหนึ่งกับเรา<br />ชวนเพื่อนมาเปิดร้านเพื่อเติบโตไปด้วยกัน”
          </blockquote>
        </aside>

        {/* RIGHT — Success screen */}
        <div className="flex items-center justify-center px-6 py-12 lg:py-16 bg-mp-cream">
          <div className="w-full max-w-[400px] text-center lg:text-left">
            <div
              className="rounded-xl border p-6 text-left"
              style={{
                background: "color-mix(in srgb, var(--color-mp-forest) 12%, white)",
                borderColor: "color-mix(in srgb, var(--color-mp-forest) 30%, transparent)",
              }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-8 h-8 text-mp-forest shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-mp-ink mb-2">
                    ส่งใบสมัครสำเร็จแล้ว! 🎉
                  </h3>
                  <p className="text-[15px] leading-relaxed text-mp-ink-muted mb-4">
                    เราได้รับใบสมัครของคุณเรียบร้อยแล้ว ใบสมัครของคุณกำลังอยู่ระหว่างการตรวจสอบและอนุมัติจากผู้ดูแลระบบ
                  </p>
                  <p className="text-[14px] leading-relaxed text-mp-ink-muted/80">
                    เราจะติดต่อคุณกลับทางอีเมล <span className="font-semibold text-mp-ink">{formData.email}</span> หรือเบอร์โทรศัพท์ที่แจ้งไว้ภายใน 24-48 ชั่วโมง
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/signin"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-mp-forest px-6 text-[15px] font-semibold text-white shadow-sm hover:bg-mp-forest-dark transition-all"
              >
                ไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </div>
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
            Basketplace Agent
          </span>
        </div>
        <blockquote
          className="relative z-10 max-w-md text-2xl lg:text-3xl leading-snug text-mp-cream font-semibold"
          style={{ fontFamily: "var(--mp-font-display)" }}
        >
          “ร่วมเป็นส่วนหนึ่งกับเรา<br />ชวนเพื่อนมาเปิดร้านเพื่อเติบโตไปด้วยกัน”
        </blockquote>
      </aside>

      {/* RIGHT — register form */}
      <div className="flex items-center justify-center px-6 py-12 lg:py-16 bg-mp-cream overflow-y-auto">
        <div className="w-full max-w-[400px]">
          <div className="text-center lg:text-left mb-6">
            <h1
              className="text-3xl font-bold text-mp-ink"
              style={{ fontFamily: "var(--mp-font-display)" }}
            >
              สมัครเป็นตัวแทน (Agent)
            </h1>
            <p className="mt-2 text-[15px] text-mp-ink-muted">
              สร้างรายได้เสริมด้วยการชวนเพื่อนเปิดร้านค้าออนไลน์
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-between gap-3 mb-6 py-3 px-4 rounded-xl bg-white/60 border border-mp-border">
            {[
              { icon: ShieldCheck, label: "สมัครฟรี" },
              { icon: Clock, label: "อนุมัติใน 24 ชม." },
              { icon: Lock, label: "มั่นใจ ปลอดภัย" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[12px] text-mp-ink-muted">
                <Icon className="w-3.5 h-3.5 text-mp-forest" />
                {label}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">ลงทะเบียนไม่สำเร็จ</p>
                <p className="mt-0.5 text-xs">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="agent-name" className="block text-[14px] font-medium text-mp-ink mb-1">
                ชื่อ-นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                id="agent-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={submitting}
                placeholder="สมชาย ใจดี"
                className="w-full h-11 rounded-[10px] border border-mp-border bg-white px-4 text-[15px] text-mp-ink placeholder:text-mp-ink-muted/60 focus:border-mp-coral focus:outline-none focus:ring-2 focus:ring-mp-coral/20 disabled:bg-mp-cream-alt/40 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="agent-email" className="block text-[14px] font-medium text-mp-ink mb-1">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                id="agent-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={submitting}
                placeholder="somchai@example.com"
                className="w-full h-11 rounded-[10px] border border-mp-border bg-white px-4 text-[15px] text-mp-ink placeholder:text-mp-ink-muted/60 focus:border-mp-coral focus:outline-none focus:ring-2 focus:ring-mp-coral/20 disabled:bg-mp-cream-alt/40 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="agent-password" className="block text-[14px] font-medium text-mp-ink mb-1">
                รหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <input
                id="agent-password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={submitting}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                className="w-full h-11 rounded-[10px] border border-mp-border bg-white px-4 text-[15px] text-mp-ink placeholder:text-mp-ink-muted/60 focus:border-mp-coral focus:outline-none focus:ring-2 focus:ring-mp-coral/20 disabled:bg-mp-cream-alt/40 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="agent-phone" className="block text-[14px] font-medium text-mp-ink mb-1">
                เบอร์โทรศัพท์
              </label>
              <input
                id="agent-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={submitting}
                placeholder="0812345678"
                className="w-full h-11 rounded-[10px] border border-mp-border bg-white px-4 text-[15px] text-mp-ink placeholder:text-mp-ink-muted/60 focus:border-mp-coral focus:outline-none focus:ring-2 focus:ring-mp-coral/20 disabled:bg-mp-cream-alt/40 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="agent-line" className="block text-[14px] font-medium text-mp-ink mb-1">
                LINE ID
              </label>
              <input
                id="agent-line"
                type="text"
                value={formData.lineId}
                onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                disabled={submitting}
                placeholder="line_id"
                className="w-full h-11 rounded-[10px] border border-mp-border bg-white px-4 text-[15px] text-mp-ink placeholder:text-mp-ink-muted/60 focus:border-mp-coral focus:outline-none focus:ring-2 focus:ring-mp-coral/20 disabled:bg-mp-cream-alt/40 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-mp-coral px-4 text-[15px] font-semibold text-white shadow-sm hover:bg-mp-coral-dark hover:-translate-y-px disabled:opacity-50 disabled:hover:transform-none transition-all"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "กำลังส่งข้อมูล..." : "สมัครสมาชิกเป็นตัวแทน"}
            </button>
          </form>

          <p className="mt-8 text-center text-[14px] text-mp-ink-muted">
            มีบัญชีตัวแทนอยู่แล้ว?{" "}
            <Link
              href="/signin"
              className="font-semibold text-mp-coral hover:underline"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
