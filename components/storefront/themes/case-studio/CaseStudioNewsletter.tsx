'use client';

/**
 * CaseStudioNewsletter — email opt-in form.
 *
 * Client component (needs local form + submission state). v1 behavior
 * per spec: no backend wiring. The submit handler just shows a thank-
 * you confirmation message in-place — the actual email collection
 * schema can land in a future PR alongside a real
 * `POST /api/stores/[slug]/newsletter` endpoint.
 *
 * TODO: when the endpoint exists, swap the local `submitted` state
 * for a fetch() that POSTs `{ email, storeSlug }` and surfaces
 * server errors via the same toast spot.
 *
 * Visual: pink gradient bg, centered kicker → H2 → sub copy → email
 * input + black "รับโค้ด" button → fine-print legal line.
 */

import { useState, type FormEvent } from 'react';

interface Props {
  storeSlug: string;
}

export function CaseStudioNewsletter({ storeSlug: _storeSlug }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    // Trivial client-side guard — no API to hit yet.
    if (!email.trim() || !email.includes('@')) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }
    // No backend wired yet — see TODO above. We just acknowledge
    // success so the UI feels real and operators can ship the
    // homepage without blocking on schema work.
    setSubmitted(true);
  }

  return (
    <section
      className="px-4 sm:px-6 py-20 text-center"
      style={{
        background:
          'linear-gradient(135deg, #FFE5EC 0%, #FFF5F7 100%)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: '720px' }}>
        <p
          className="font-bold uppercase mb-3.5"
          style={{
            fontSize: '11px',
            letterSpacing: '2.5px',
            color: '#FF3366',
          }}
        >
          Stay in the Drop
        </p>
        <h2
          className="mb-3"
          style={{
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 800,
            letterSpacing: '-1px',
            color: '#0A0A0F',
          }}
        >
          รับส่วนลด 10% สำหรับคำสั่งแรก
        </h2>
        <p
          className="mb-7 mx-auto"
          style={{
            fontSize: '14px',
            color: '#6B7280',
            maxWidth: '480px',
          }}
        >
          สมัครรับข่าวสาร · แจ้งดรอปใหม่ · โปรลับเฉพาะสมาชิก · ไม่สแปม
        </p>

        {submitted ? (
          <div
            className="mx-auto"
            style={{
              maxWidth: '460px',
              padding: '18px 22px',
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '14px',
              color: '#0A0A0F',
              fontWeight: 600,
            }}
          >
            ขอบคุณ! เราจะส่งโค้ดส่วนลดให้ทางอีเมล
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 mx-auto"
            style={{ maxWidth: '460px' }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="flex-1"
              style={{
                padding: '16px 20px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#FFFFFF',
                color: '#0A0A0F',
              }}
            />
            <button
              type="submit"
              className="transition hover:opacity-90"
              style={{
                padding: '16px 28px',
                background: '#0A0A0F',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '14px',
                borderRadius: '8px',
                border: 0,
                cursor: 'pointer',
              }}
            >
              รับโค้ด
            </button>
          </form>
        )}

        {error && (
          <p
            className="mt-3"
            style={{ fontSize: '12px', color: '#DC2626' }}
          >
            {error}
          </p>
        )}

        <p
          className="mt-4"
          style={{ fontSize: '11px', color: '#6B7280' }}
        >
          การสมัครถือเป็นการยอมรับ <span style={{ textDecoration: 'underline' }}>นโยบายความเป็นส่วนตัว</span>
        </p>
      </div>
    </section>
  );
}
