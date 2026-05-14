'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: 'OAuth ตั้งค่าผิด ตรวจสอบ env vars',
  AccessDenied: 'Google ปฏิเสธการเข้าถึง',
  OAuthSignin: 'เริ่ม Google sign-in ไม่ได้',
  EmailSignin: 'ส่งลิงก์ไม่สำเร็จ',
  Verification: 'ลิงก์หมดอายุหรือใช้แล้ว',
};

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

function ErrorBanner() {
  const params = useSearchParams();
  const error = params.get('error');
  if (!error) return null;
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <p className="font-medium">เกิดข้อผิดพลาด: {error}</p>
      <p className="mt-1 text-xs">{ERROR_MESSAGES[error] ?? 'ลองอีกครั้ง'}</p>
    </div>
  );
}

function EmailForm({
  defaultCallback,
  isFashionBeauty,
  isTrust,
  isElectronicsTech,
}: {
  defaultCallback: string;
  isFashionBeauty: boolean;
  isTrust: boolean;
  isElectronicsTech: boolean;
}) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    const res = await signIn('email', {
      email: email.trim(),
      redirect: false,
      callbackUrl: defaultCallback,
    });
    setSubmitting(false);
    if (res?.ok) setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <p className="font-medium">ส่งลิงก์ไปที่อีเมลแล้ว</p>
        <p className="mt-1 text-xs">
          เปิดอีเมล {email} แล้วคลิกลิงก์เพื่อยืนยันและเข้าสู่ระบบ
        </p>
      </div>
    );
  }

  // Per-family input + submit skinning. Trust uses squared rounded-sm
  // inputs with gold-hairline borders + uppercase-tracking submit;
  // electronics-tech uses rounded-md inputs with slate borders + bold
  // sans submit.
  const labelClass =
    isFashionBeauty
      ? 'mb-2 block text-xs uppercase tracking-[0.18em]'
      : isTrust
        ? 'mb-2 block text-xs uppercase'
        : isElectronicsTech
          ? 'mb-2 block text-[11px] uppercase'
          : 'mb-1 block text-sm font-medium';
  const labelStyle: React.CSSProperties = isTrust
    ? {
        color: 'var(--shop-ink-muted)',
        letterSpacing: '0.28em',
        fontWeight: 600,
      }
    : isElectronicsTech
      ? {
          color: 'var(--shop-ink-muted)',
          fontFamily: TECH_MONO_FONT,
          letterSpacing: '0.16em',
          fontWeight: 600,
        }
      : { color: 'var(--shop-ink-muted)' };
  const inputClass =
    isFashionBeauty
      ? 'rounded-full border-[var(--shop-border)] bg-white px-4 py-5'
      : isTrust
        ? 'rounded-sm border-[var(--shop-accent)] bg-white px-4 py-5'
        : isElectronicsTech
          ? 'rounded-md border-[var(--shop-border)] bg-white px-4 py-5'
          : '';
  const submitClass =
    isFashionBeauty
      ? 'w-full rounded-full py-6 text-sm font-medium text-white hover:opacity-90'
      : isTrust
        ? 'w-full rounded-sm py-6 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:opacity-90'
        : isElectronicsTech
          ? 'w-full rounded-md py-6 text-sm font-bold text-white hover:opacity-90'
          : 'w-full';
  const submitStyle =
    isFashionBeauty || isTrust || isElectronicsTech
      ? { background: 'var(--shop-primary)' }
      : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <label className="block">
        <span className={labelClass} style={labelStyle}>
          อีเมล
        </span>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </label>
      <Button
        type="submit"
        disabled={submitting}
        className={submitClass}
        style={submitStyle}
      >
        {submitting
          ? 'กำลังส่ง...'
          : isTrust
            ? 'Send sign-up link'
            : isElectronicsTech
              ? 'Send sign-up link'
              : 'ส่งลิงก์ยืนยันทางอีเมล'}
      </Button>
    </form>
  );
}

export function StoreSignUpClient({
  storeSlug,
  storeName,
  isFashionBeauty,
  isTrust = false,
  isElectronicsTech = false,
  defaultCallback,
}: {
  storeSlug: string;
  storeName: string;
  isFashionBeauty: boolean;
  isTrust?: boolean;
  isElectronicsTech?: boolean;
  defaultCallback: string;
}) {
  return (
    <div className="bg-[var(--shop-bg)] min-h-[80vh]">
      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:py-20">
        {isFashionBeauty ? (
          <div className="text-center">
            <p
              className="text-xs uppercase tracking-[0.22em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              Join the world of
            </p>
            <h1
              className="mt-2 text-4xl sm:text-5xl"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: FB_DISPLAY_FONT,
                fontWeight: 500,
                letterSpacing: '-0.005em',
              }}
            >
              {storeName}
            </h1>
            <p
              className="mt-3 text-sm italic"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              สมัครเพื่อรับข้อเสนอพิเศษและคอลเลคชั่นใหม่ก่อนใคร
            </p>
          </div>
        ) : isTrust ? (
          <div className="text-center">
            <p
              className="text-xs uppercase"
              style={{
                color: 'var(--shop-accent)',
                letterSpacing: '0.28em',
                fontWeight: 600,
              }}
            >
              Maison · New Members
            </p>
            <h1
              className="mt-3 text-4xl sm:text-5xl"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: TRUST_DISPLAY_FONT,
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}
            >
              Create your account
            </h1>
            <div
              aria-hidden
              className="mx-auto mt-5 h-px w-16"
              style={{ background: 'var(--shop-accent)' }}
            />
            <p
              className="mt-5 text-sm"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              สมัครเพื่อเริ่มสะสมที่ {storeName}
            </p>
          </div>
        ) : isElectronicsTech ? (
          <div className="text-center">
            <p
              data-tech-mono="true"
              className="text-[11px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.16em',
                fontWeight: 600,
              }}
            >
              Account Access · New
            </p>
            <h1
              className="mt-3 text-3xl sm:text-4xl"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: TECH_DISPLAY_FONT,
                fontWeight: 700,
                letterSpacing: '-0.015em',
              }}
            >
              Create account
            </h1>
            <p
              className="mt-4 text-sm"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              สมัครเพื่อช้อปและติดตามคำสั่งซื้อที่ {storeName}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--shop-ink)' }}>
              สมัครสมาชิก
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              เริ่มช้อปกับ {storeName}
            </p>
          </div>
        )}

        <Suspense fallback={null}>
          <ErrorBanner />
        </Suspense>

        <Card
          className={
            isFashionBeauty
              ? 'rounded-2xl border bg-white p-8 shadow-sm'
              : isTrust
                ? 'rounded-sm border bg-white p-8 shadow-sm'
                : isElectronicsTech
                  ? 'rounded-md border bg-white p-8'
                  : 'p-6'
          }
          style={{
            borderColor: isTrust ? 'var(--shop-accent)' : 'var(--shop-border)',
            background: 'var(--shop-card)',
          }}
        >
          <Button
            onClick={() => signIn('google', { callbackUrl: defaultCallback })}
            variant="outline"
            className={
              isFashionBeauty
                ? 'w-full rounded-full border-[var(--shop-border)] py-6'
                : isTrust
                  ? 'w-full rounded-sm border-[var(--shop-ink)] py-6 uppercase tracking-[0.18em]'
                  : isElectronicsTech
                    ? 'w-full rounded-md border-[var(--shop-border)] py-6 font-semibold'
                    : 'w-full'
            }
          >
            <Mail className="mr-2 h-4 w-4" />
            สมัครด้วย Google
          </Button>

          <div className="relative my-6">
            <div
              className="absolute inset-x-0 top-1/2 h-px"
              style={{
                background: isTrust ? 'var(--shop-accent)' : 'var(--shop-border)',
              }}
            />
            <span
              className="relative bg-white px-3 text-xs uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: isTrust
                  ? '0.28em'
                  : isElectronicsTech
                    ? '0.16em'
                    : '0.18em',
                fontWeight: isTrust || isElectronicsTech ? 600 : undefined,
                fontFamily: isElectronicsTech ? TECH_MONO_FONT : undefined,
              }}
            >
              {isElectronicsTech ? 'OR' : 'หรือ'}
            </span>
          </div>

          <Suspense fallback={null}>
            <EmailForm
              defaultCallback={defaultCallback}
              isFashionBeauty={isFashionBeauty}
              isTrust={isTrust}
              isElectronicsTech={isElectronicsTech}
            />
          </Suspense>

          <p
            className="mt-6 text-center text-xs"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            การสมัครสมาชิกถือว่าคุณยอมรับ{' '}
            <Link href="/help/terms" className="underline">
              ข้อกำหนด
            </Link>{' '}
            และ{' '}
            <Link href="/help/privacy" className="underline">
              นโยบายความเป็นส่วนตัว
            </Link>
          </p>
        </Card>

        <p
          className="text-center text-sm"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          มีบัญชีอยู่แล้ว?{' '}
          <Link
            href={`/stores/${storeSlug}/signin`}
            className="font-medium hover:underline"
            style={{
              color: isTrust ? 'var(--shop-accent)' : 'var(--shop-primary)',
            }}
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </main>
    </div>
  );
}
