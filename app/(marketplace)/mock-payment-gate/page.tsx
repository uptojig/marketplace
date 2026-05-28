"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function MockPaymentGate() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("order_id");
  const amount = Number(params.get("amount") ?? 0);
  const tx = params.get("tx") ?? `MOCK-${Date.now()}`;
  const returnUrl = params.get("return_url");
  const [error, setError] = useState<string | null>(null);
  const firedRef = useRef(false);

  const simulate = useCallback(async () => {
    if (!orderId || firedRef.current) return;
    firedRef.current = true;
    try {
      const res = await fetch("/api/webhook/anypay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: "PAID",
          order_id: orderId,
          transaction_id: tx,
          amount,
        }),
      });
      if (!res.ok) throw new Error(`การชำระเงินล้มเหลว (${res.status})`);
      if (returnUrl) {
        window.location.href = returnUrl;
      } else {
        router.push(`/order-success?orderId=${orderId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }, [orderId, amount, tx, returnUrl, router]);

  useEffect(() => {
    void simulate();
  }, [simulate]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="mx-auto max-w-sm space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">การชำระเงินล้มเหลว</h2>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => { firedRef.current = false; setError(null); void simulate(); }}
            className="mt-2 rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-sm space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center">
          <svg className="h-12 w-12 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">กำลังดำเนินการชำระเงิน...</h2>
        <p className="text-sm text-gray-500">กรุณารอสักครู่ ระบบกำลังประมวลผล</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="mx-auto max-w-sm space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center">
            <svg className="h-12 w-12 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <MockPaymentGate />
    </Suspense>
  );
}
