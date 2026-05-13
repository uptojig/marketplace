'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/cart/store';
import { paymentMethods } from '@/lib/checkout/mock-data';
import { useCheckoutStore } from '@/lib/checkout/store';
import type { PaymentMethod } from '@/lib/checkout/types';
import { OrderSummary } from '@/components/checkout/order-summary';

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const selectedItems = useCartStore((s) => s.getSelectedItems());
  const addressId = useCheckoutStore((s) => s.selectedAddressId);
  const payment = useCheckoutStore((s) => s.selectedPaymentMethod);
  const setPayment = useCheckoutStore((s) => s.setPayment);

  // Guard: must complete previous step
  useEffect(() => {
    if (selectedItems.length === 0) router.replace('/cart');
    else if (!addressId) router.replace('/checkout/shipping');
  }, [selectedItems.length, addressId, router]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <CreditCard className="h-4 w-4" /> เลือกวิธีชำระเงิน
          </h2>
          <div className="space-y-2">
            {paymentMethods.map((m) => (
              <Card
                key={m.id}
                onClick={() => m.available && setPayment(m.id as PaymentMethod)}
                className={cn(
                  'p-4 transition',
                  m.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                  payment === m.id
                    ? 'border-primary ring-1 ring-primary'
                    : m.available && 'hover:border-foreground/30',
                )}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    checked={payment === m.id}
                    onChange={() => setPayment(m.id as PaymentMethod)}
                    disabled={!m.available}
                  />
                  <div className="text-2xl">{m.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium">{m.label}</div>
                    <div className="text-xs text-muted-foreground">{m.description}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            การชำระเงินดำเนินการอย่างปลอดภัยผ่าน Anypay — TAS Payment Hub
          </p>
        </section>

        <div className="flex items-center justify-between pt-4">
          <Button variant="ghost" asChild>
            <Link href="/checkout/shipping">← กลับ</Link>
          </Button>
          <Button
            size="lg"
            disabled={!payment}
            onClick={() => router.push('/checkout/review')}
          >
            ต่อไป → ตรวจสอบคำสั่งซื้อ
          </Button>
        </div>
      </div>

      <aside className="hidden lg:block">
        <OrderSummary showShipping showPaymentFee />
      </aside>
    </div>
  );
}
