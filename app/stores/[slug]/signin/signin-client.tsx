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
}: {
  defaultCallback: string;
  isFashionBeauty: boolean;
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

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      <label className="block">
        <span
          className={
            isFashionBeauty
              ? 'text-xs uppercase tracking-[0.18em]'
              : 'text-sm font-medium'
          }
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          อีเมล
        </span>
        <Input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
          className={
            isFashionBeauty
              ? 'mt-2 rounded-full border-[var(--shop-border)] bg-white px-4 py-5'
              : 'mt-1'
          }
          placeholder="you@example.com"
        />
      </label>
      <label className="block">
        <span
          className={
            isFashionBeauty
              ? 'text-xs uppercase tracking-[0.18em]'
              : 'text-sm font-medium'
          }
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          รหัสผ่าน
        </span>
        <Input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          className={
            isFashionBeauty
              ? 'mt-2 rounded-full border-[var(--shop-border)] bg-white px-4 py-5'
              : 'mt-1'
          }
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
        className={
          isFashionBeauty
            ? 'w-full rounded-full py-6 text-sm font-medium text-white hover:opacity-90'
            : 'w-full'
        }
        style={
          isFashionBeauty ? { background: 'var(--shop-primary)' } : undefined
        }
      >
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        เข้าสู่ระบบ
      </Button>
    </form>
  );
}

export function StoreSignInClient({
  storeSlug,
  storeName,
  isFashionBeauty,
  defaultCallback,
}: {
  storeSlug: string;
  storeName: string;
  isFashionBeauty: boolean;
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
          className={
            isFashionBeauty
              ? 'rounded-2xl border bg-white p-8 shadow-sm'
              : 'p-6'
          }
          style={{
            borderColor: 'var(--shop-border)',
            background: 'var(--shop-card)',
          }}
        >
          <Suspense fallback={null}>
            <CredentialsForm
              defaultCallback={defaultCallback}
              isFashionBeauty={isFashionBeauty}
            />
          </Suspense>

          <div className="relative my-6">
            <div
              className="absolute inset-x-0 top-1/2 h-px"
              style={{ background: 'var(--shop-border)' }}
            />
            <span
              className="relative bg-white px-3 text-xs uppercase tracking-[0.18em]"
              style={{ color: 'var(--shop-ink-muted)' }}
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
            style={{ color: 'var(--shop-primary)' }}
          >
            สมัครสมาชิก
          </Link>
        </p>
      </main>
    </div>
  );
}
