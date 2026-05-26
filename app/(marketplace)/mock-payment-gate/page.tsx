"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatTHB } from "@/lib/utils";

function MockPaymentGate() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("order_id");
  const amount = Number(params.get("amount") ?? 0);
  const tx = params.get("tx") ?? `MOCK-${Date.now()}`;
  // Honor the return_url the AnyPay intent set. Falls back to a
  // sensible default per intent type below.
  const returnUrl = params.get("return_url");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoCountdown, setAutoCountdown] = useState(3);

  const simulate = useCallback(
    async (status: "PAID" | "FAILED") => {
      if (!orderId) return;
      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch("/api/webhook/anypay", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            status,
            order_id: orderId,
            transaction_id: tx,
            amount,
          }),
        });
        if (!res.ok) throw new Error(`Webhook failed (${res.status})`);
        if (status === "PAID") {
          if (returnUrl) {
            window.location.href = returnUrl;
          } else {
            router.push(`/order-success?orderId=${orderId}`);
          }
        } else {
          setError("Payment marked failed");
          setSubmitting(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Webhook failed");
        setSubmitting(false);
      }
    },
    [orderId, amount, tx, returnUrl, router],
  );

  // Auto-PAID after a short countdown — operator can click "Cancel"
  // to abort and pick FAILED if they want to test the failure path.
  // Mirrors real AnyPay's automatic redirect-on-success behavior so
  // buyers aren't left wondering whether to click anything.
  const cancelledRef = useRef(false);
  useEffect(() => {
    if (!orderId) return;
    let tick: ReturnType<typeof setInterval> | null = null;
    tick = setInterval(() => {
      if (cancelledRef.current) return;
      setAutoCountdown((c) => {
        if (c <= 1) {
          if (tick) clearInterval(tick);
          void simulate("PAID");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (tick) clearInterval(tick);
    };
  }, [orderId, simulate]);

  const cancelAuto = () => {
    cancelledRef.current = true;
    setAutoCountdown(0);
  };

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-lg border p-8 text-center">
      <h1 className="text-xl font-semibold">AnyPay Mock Gateway</h1>
      <p className="text-sm text-muted-foreground">
        This is a local-only simulator for AnyPay. In production, AnyPay&rsquo;s hosted page replaces this.
      </p>
      <div className="rounded-md bg-muted p-4 text-sm">
        <div>Order: <span className="font-mono">{orderId}</span></div>
        <div>Transaction: <span className="font-mono">{tx}</span></div>
        <div>Amount: <strong>{formatTHB(amount)}</strong></div>
      </div>
      <div className="flex flex-col gap-2">
        {autoCountdown > 0 && !submitting ? (
          <>
            <Button disabled className="opacity-80">
              ดำเนินการชำระอัตโนมัติใน {autoCountdown}…
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={cancelAuto}
            >
              หยุดอัตโนมัติ
            </Button>
          </>
        ) : (
          <>
            <Button disabled={submitting} onClick={() => simulate("PAID")}>
              {submitting ? "Sending webhook…" : "Simulate PAID"}
            </Button>
            <Button disabled={submitting} variant="outline" onClick={() => simulate("FAILED")}>
              Simulate FAILED
            </Button>
          </>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <MockPaymentGate />
    </Suspense>
  );
}
