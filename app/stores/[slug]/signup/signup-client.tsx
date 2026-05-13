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

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';
const SPECIALTY_HAND_FONT =
  'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive';

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
  isSpecialty,
}: {
  defaultCallback: string;
  isFashionBeauty: boolean;
  isSpecialty: boolean;
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

  const labelCls =
    isFashionBeauty || isSpecialty
      ? 'mb-2 block text-xs uppercase tracking-[0.16em]'
      : 'mb-1 block text-sm font-medium';
  const inputCls = isFashionBeauty
    ? 'rounded-full border-[var(--shop-border)] bg-white px-4 py-5'
    : isSpecialty
      ? 'rounded-md border-[var(--shop-border)] bg-[var(--shop-card)] px-4 py-5'
      : '';
  const submitCls = isFashionBeauty
    ? 'w-full rounded-full py-6 text-sm font-medium text-white hover:opacity-90'
    : isSpecialty
      ? 'w-full rounded-md py-6 text-sm font-medium text-white hover:opacity-90'
      : 'w-full';
  const submitStyle =
    isFashionBeauty || isSpecialty
      ? { background: 'var(--shop-primary)' }
      : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <label className="block">
        <span className={labelCls} style={{ color: 'var(--shop-ink-muted)' }}>
          อีเมล
        </span>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputCls}
        />
      </label>
      <Button
        type="submit"
        disabled={submitting}
        className={submitCls}
        style={submitStyle}
      >
        {submitting ? 'กำลังส่ง...' : 'ส่งลิงก์ยืนยันทางอีเมล'}
      </Button>
    </form>
  );
}

export function StoreSignUpClient({
  storeSlug,
  storeName,
  isFashionBeauty,
  isSpecialty,
  defaultCallback,
}: {
  storeSlug: string;
  storeName: string;
  isFashionBeauty: boolean;
  isSpecialty: boolean;
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
        ) : isSpecialty ? (
          <div className="text-center">
            <p
              className="text-lg italic"
              style={{
                color: 'var(--shop-accent)',
                fontFamily: SPECIALTY_HAND_FONT,
              }}
            >
              start your story with
            </p>
            <h1
              className="mt-1 text-4xl sm:text-5xl"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: SPECIALTY_DISPLAY_FONT,
                fontWeight: 500,
                letterSpacing: '-0.005em',
              }}
            >
              Join the maker community
            </h1>
            <p
              className="mt-3 text-sm italic"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: SPECIALTY_HAND_FONT,
              }}
            >
              welcome to {storeName} — handcrafted, one piece at a time
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
          {...(isSpecialty ? { 'data-specialty-kraft': 'true' } : {})}
          className={
            isFashionBeauty
              ? 'rounded-2xl border bg-white p-8 shadow-sm'
              : isSpecialty
                ? 'rounded-md border p-8 shadow-sm'
                : 'p-6'
          }
          style={{
            borderColor: 'var(--shop-border)',
            background: 'var(--shop-card)',
          }}
        >
          <Button
            onClick={() => signIn('google', { callbackUrl: defaultCallback })}
            variant="outline"
            className={
              isFashionBeauty
                ? 'w-full rounded-full border-[var(--shop-border)] py-6'
                : isSpecialty
                  ? 'w-full rounded-md border-[var(--shop-border)] py-6'
                  : 'w-full'
            }
          >
            <Mail className="mr-2 h-4 w-4" />
            สมัครด้วย Google
          </Button>

          <div className="relative my-6">
            <div
              className="absolute inset-x-0 top-1/2 h-px"
              style={{ background: 'var(--shop-border)' }}
            />
            <span
              className="relative bg-[var(--shop-card)] px-3 text-xs uppercase tracking-[0.16em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              หรือ
            </span>
          </div>

          <Suspense fallback={null}>
            <EmailForm
              defaultCallback={defaultCallback}
              isFashionBeauty={isFashionBeauty}
              isSpecialty={isSpecialty}
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
            style={{ color: 'var(--shop-primary)' }}
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </main>
    </div>
  );
}
