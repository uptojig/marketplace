"use client";

import { useState } from "react";
import { CheckCircle2, MessageCircleMore, Send } from "lucide-react";

interface Props {
  storeSlug: string;
  storeName: string;
}

export function ContactForm({ storeSlug, storeName }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/stores/${storeSlug}/contact`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; details?: unknown }
        | null;
      if (!res.ok || !data?.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "ส่งข้อความไม่สำเร็จ กรุณาลองอีกครั้ง",
        );
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่งข้อความไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div
        className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-xl border p-8 text-center"
        style={{
          background: "var(--shop-card)",
          borderColor: "var(--shop-border)",
        }}
      >
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="mt-4 text-base font-medium" style={{ color: "var(--shop-ink)" }}>
          ส่งข้อความแล้ว
        </p>
        <p className="mt-2 max-w-sm text-sm" style={{ color: "var(--shop-ink-muted)" }}>
          ขอบคุณที่ติดต่อ {storeName} — ทีมงานจะตอบกลับทางอีเมล/โทรที่ให้ไว้โดยเร็วที่สุด
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setName("");
            setEmail("");
            setPhone("");
            setMessage("");
          }}
          className="mt-6 text-sm hover:underline"
          style={{ color: "var(--shop-primary)" }}
        >
          ส่งข้อความใหม่
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl border p-6 sm:p-8"
      style={{
        background: "var(--shop-card)",
        borderColor: "var(--shop-border)",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <MessageCircleMore className="h-5 w-5 text-gray-400" />
        <h2 className="text-base font-semibold" style={{ color: "var(--shop-ink)" }}>
          ส่งข้อความถึงร้าน
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "var(--shop-ink-muted)" }}>
            ชื่อ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            placeholder="ชื่อ-นามสกุล"
            className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2"
            style={{
              borderColor: "var(--shop-border)",
              color: "var(--shop-ink)",
            }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--shop-ink-muted)" }}>
              อีเมล (ไม่บังคับ)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              placeholder="you@example.com"
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                borderColor: "var(--shop-border)",
                color: "var(--shop-ink)",
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--shop-ink-muted)" }}>
              เบอร์โทร (ไม่บังคับ)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={submitting}
              placeholder="08x-xxx-xxxx"
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                borderColor: "var(--shop-border)",
                color: "var(--shop-ink)",
              }}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "var(--shop-ink-muted)" }}>
            ข้อความ <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={submitting}
            rows={6}
            placeholder="บอกเราว่าเราช่วยคุณได้อย่างไร"
            className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2"
            style={{
              borderColor: "var(--shop-border)",
              color: "var(--shop-ink)",
            }}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--shop-primary)" }}
        >
          <Send className="h-4 w-4" />
          {submitting ? "กำลังส่ง..." : "ส่งข้อความ"}
        </button>
      </form>
    </div>
  );
}
