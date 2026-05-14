'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: 'OAuth ตั้งค่าผิด ตรวจสอบ env vars',
  AccessDenied: 'Google ปฏิเสธการเข้าถึง',
  OAuthCallback: 'callback URL ไม่ตรง',
  OAuthSignin: 'เริ่ม Google sign-in ไม่ได้',
  OAuthAccountNotLinked: 'อีเมลนี้ผูกกับ provider อื่นแล้ว',
  CredentialsSignin: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
};

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

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

function CredentialsForm({
  defaultCallback,
  isFashionBeauty,
  isTrust,
  isSpecialty,
}: {
  defaultCallback: string;
  isFashionBeauty: boolean;
  isTrust: boolean;
  isSpecialty: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('callbackUrl') || params.get('next') || defaultCallback;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email.trim() || !password) {
      setErr('กรอกอีเมลและรหัสผ่าน');
      return;
    }
    setBusy(true);
    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setErr(ERROR_MESSAGES[res.error] ?? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        return;
      }
      router.push(next);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'network error');
    } finally {
      setBusy(false);
    }
  }

  // Per-family input + button skinning. FB uses pill inputs + pill
  // submit; trust uses squared rounded-sm inputs + uppercase-tracking
  // submit; specialty uses rounded-md kraft inputs + rounded-md submit;
  // default keeps the shadcn baseline.
  const labelClass =
    isFashionBeauty
      ? 'text-xs uppercase tracking-[0.18em]'
      : isTrust
        ? 'text-xs uppercase'
        : isSpecialty
          ? 'text-xs uppercase tracking-[0.16em]'
          : 'text-sm font-medium';
  const labelStyle: React.CSSProperties = isTrust
    ? {
        color: 'var(--shop-ink-muted)',
        letterSpacing: '0.28em',
        fontWeight: 600,
      }
    : { color: 'var(--shop-ink-muted)' };
  const inputClass =
    isFashionBeauty
      ? 'mt-2 rounded-full border-[var(--shop-border)] bg-white px-4 py-5'
      : isTrust
        ? 'mt-2 rounded-sm border-[var(--shop-accent)] bg-white px-4 py-5'
        : isSpecialty
          ? 'mt-2 rounded-md border-[var(--shop-border)] bg-[var(--shop-card)] px-4 py-5'
          : 'mt-1';
  const submitClass =
    isFashionBeauty
      ? 'w-full rounded-full py-6 text-sm font-medium text-white hover:opacity-90'
      : isTrust
        ? 'w-full rounded-sm py-6 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:opacity-90'
        : isSpecialty
          ? 'w-full rounded-md py-6 text-sm font-medium text-white hover:opacity-90'
          : 'w-full';
  const submitStyle =
    isFashionBeauty || isTrust || isSpecialty
      ? { background: 'var(--shop-primary)' }
      : undefined;

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      <label className="block">
        <span className={labelClass} style={labelStyle}>
          อีเมล
        </span>
        <Input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
          className={inputClass}
          placeholder="you@example.com"
        />
      </label>
      <label className="block">
        <span className={labelClass} style={labelStyle}>
          รหัสผ่าน
        </span>
        <Input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          className={inputClass}
        />
      </label>
      {err && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}
      <Button
        type="submit"
        disabled={busy}
        className={submitClass}
        style={submitStyle}
      >
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isTrust ? 'Sign in' : isSpecialty ? 'Sign in' : 'เข้าสู่ระบบ'}
      </Button>
    </form>
  );
}

export function StoreSignInClient({
  storeSlug,
  storeName,
  isFashionBeauty,
  isTrust = false,
  isSpecialty = false,
  defaultCallback,
}: {
  storeSlug: string;
  storeName: string;
  isFashionBeauty: boolean;
  isTrust?: boolean;
  isSpecialty?: boolean;
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
              Welcome back to
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
              เข้าสู่ระบบเพื่อช้อปและติดตามคำสั่งซื้อของคุณ
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
              Maison · Members
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
              Sign in to {storeName}
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
              เข้าสู่ระบบเพื่อช้อปและติดตามคำสั่งซื้อของคุณ
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
              welcome back to
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
              Sign in
            </h1>
            <p
              className="mt-3 text-sm italic"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: SPECIALTY_HAND_FONT,
              }}
            >
              your collection at {storeName} is waiting
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--shop-ink)' }}>
              เข้าสู่ระบบ
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              ช้อปกับ {storeName}
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
              : isTrust
                ? 'rounded-sm border bg-white p-8 shadow-sm'
                : isSpecialty
                  ? 'rounded-md border p-8 shadow-sm'
                  : 'p-6'
          }
          style={{
            borderColor: isTrust ? 'var(--shop-accent)' : 'var(--shop-border)',
            background: 'var(--shop-card)',
          }}
        >
          <Suspense fallback={null}>
            <CredentialsForm
              defaultCallback={defaultCallback}
              isFashionBeauty={isFashionBeauty}
              isTrust={isTrust}
              isSpecialty={isSpecialty}
            />
          </Suspense>

          <div className="relative my-6">
            <div
              className="absolute inset-x-0 top-1/2 h-px"
              style={{
                background: isTrust ? 'var(--shop-accent)' : 'var(--shop-border)',
              }}
            />
            <span
              className={
                isSpecialty
                  ? 'relative bg-[var(--shop-card)] px-3 text-xs uppercase'
                  : 'relative bg-white px-3 text-xs uppercase'
              }
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: isTrust ? '0.28em' : '0.18em',
                fontWeight: isTrust ? 600 : undefined,
              }}
            >
              หรือ
            </span>
          </div>

          <Button
            onClick={() => signIn('google', { callbackUrl: defaultCallback })}
            variant="outline"
            className={
              isFashionBeauty
                ? 'w-full rounded-full border-[var(--shop-border)] py-6'
                : isTrust
                  ? 'w-full rounded-sm border-[var(--shop-ink)] py-6 uppercase tracking-[0.18em]'
                  : isSpecialty
                    ? 'w-full rounded-md border-[var(--shop-border)] py-6'
                    : 'w-full'
            }
          >
            <Mail className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </Card>

        <p
          className="text-center text-sm"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          ยังไม่มีบัญชี?{' '}
          <Link
            href={`/stores/${storeSlug}/signup`}
            className="font-medium hover:underline"
            style={{
              color: isTrust ? 'var(--shop-accent)' : 'var(--shop-primary)',
            }}
          >
            สมัครสมาชิก
          </Link>
        </p>
      </main>
    </div>
  );
}
