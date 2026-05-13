'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fetchIntentStatus, pollIntentUntilTerminal } from '@/lib/anypay/intent-client';
import type { AnypayIntentResponse } from '@/lib/anypay/intent-server';

export default function ProcessingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const intentId = params.get('intent');
  const orderRef = params.get('order');

  const [intent, setIntent] = useState<AnypayIntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!intentId) {
      router.replace('/cart');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        // Initial fetch — sometimes intent arrives at terminal state immediately
        const initial = await fetchIntentStatus(intentId);
        if (cancelled) return;
        setIntent(initial);

        if (initial.status !== 'succeeded' && initial.status !== 'failed' && initial.status !== 'expired') {
          await pollIntentUntilTerminal(
            intentId,
            (snapshot) => !cancelled && setIntent(snapshot),
          );
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'unknown');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [intentId, router]);

  useEffect(() => {
    if (intent?.status === 'succeeded' && orderRef) {
      // Redirect after short delay so user sees the success state
      const t = setTimeout(() => {
        router.replace(`/order/${orderRef}/success?intent=${intentId}`);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [intent?.status, orderRef, intentId, router]);

  if (!intentId) return null;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      {error ? (
        <ErrorState message={error} />
      ) : !intent ? (
        <LoadingState message="กำลังเชื่อมต่อ Anypay..." />
      ) : intent.status === 'succeeded' ? (
        <SuccessState />
      ) : intent.status === 'failed' || intent.status === 'expired' ? (
        <FailedState reason={intent.failureReason} status={intent.status} />
      ) : intent.qrCode ? (
        <PromptPayQR qrCode={intent.qrCode} amount={intent.amount} expiresAt={intent.expiresAt} />
      ) : (
        <LoadingState message="กำลังรอผลการชำระเงิน..." />
      )}
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <>
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </>
  );
}

function SuccessState() {
  return (
    <>
      <CheckCircle2 className="h-16 w-16 text-green-600" />
      <h1 className="mt-4 text-xl font-semibold">ชำระเงินสำเร็จ</h1>
      <p className="mt-1 text-sm text-muted-foreground">กำลังพาไปยังหน้าสรุปคำสั่งซื้อ...</p>
    </>
  );
}

function FailedState({ reason, status }: { reason?: string; status: string }) {
  return (
    <>
      <XCircle className="h-16 w-16 text-destructive" />
      <h1 className="mt-4 text-xl font-semibold">
        {status === 'expired' ? 'โค้ดหมดเวลา' : 'การชำระเงินไม่สำเร็จ'}
      </h1>
      {reason && <p className="mt-1 text-sm text-muted-foreground">{reason}</p>}
      <div className="mt-6 flex gap-2">
        <Button variant="outline" onClick={() => history.back()}>
          ลองใหม่
        </Button>
        <Button asChild>
          <a href="/cart">กลับไปตะกร้า</a>
        </Button>
      </div>
    </>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <>
      <XCircle className="h-16 w-16 text-destructive" />
      <h1 className="mt-4 text-xl font-semibold">เกิดข้อผิดพลาด</h1>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Button asChild className="mt-6">
        <a href="/account/orders">ดูคำสั่งซื้อทั้งหมด</a>
      </Button>
    </>
  );
}

function PromptPayQR({
  qrCode,
  amount,
  expiresAt,
}: {
  qrCode: string;
  amount: number;
  expiresAt?: string;
}) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [expiresAt]);

  return (
    <Card className="w-full p-6">
      <h1 className="mb-2 text-lg font-semibold">สแกน QR เพื่อชำระเงิน</h1>
      <p className="mb-4 text-2xl font-bold text-red-600">฿{amount.toLocaleString()}</p>
      <div className="mx-auto mb-4 aspect-square w-full max-w-[240px]">
        <Image
          src={qrCode}
          alt="PromptPay QR"
          width={240}
          height={240}
          className="h-full w-full"
          unoptimized
        />
      </div>
      {secondsLeft !== null && (
        <p className="text-xs text-muted-foreground">
          หมดอายุใน {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
        </p>
      )}
      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> รอตรวจสอบการชำระเงิน...
      </p>
    </Card>
  );
}
