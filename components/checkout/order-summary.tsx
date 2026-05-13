'use client';

import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/cart/store';
import { mockShippingOptions } from '@/lib/checkout/mock-data';
import { useCheckoutStore } from '@/lib/checkout/store';
import { calculate } from '@/lib/coupons/calculator';
import { getCouponById } from '@/lib/coupons/mock-data';
import type { Coupon } from '@/lib/coupons/types';

interface OrderSummaryProps {
  showShipping?: boolean;
  showPaymentFee?: boolean;
}

const COD_FEE = 20;

export function OrderSummary({
  showShipping = false,
  showPaymentFee = false,
}: OrderSummaryProps) {
  const selected = useCartStore((s) => s.getSelectedItems());
  const appliedCouponIds = useCartStore((s) => s.appliedCouponIds);
  const shippingByStore = useCheckoutStore((s) => s.shippingByStore);
  const paymentMethod = useCheckoutStore((s) => s.selectedPaymentMethod);

  const storeIds = Array.from(new Set(selected.map((i) => i.storeId)));
  const coupons = appliedCouponIds
    .map((id) => getCouponById(id))
    .filter((c): c is Coupon => c !== null);

  // Resolve shipping per store (with freeAbove threshold)
  const shippingPerStore: Record<string, number> = {};
  if (showShipping) {
    for (const sid of storeIds) {
      const optId = shippingByStore[sid];
      const opt = mockShippingOptions.find((o) => o.id === optId);
      if (!opt) continue;
      const storeSubtotal = selected
        .filter((i) => i.storeId === sid)
        .reduce((s, i) => s + i.price * i.qty, 0);
      shippingPerStore[sid] =
        opt.freeAbove && storeSubtotal >= opt.freeAbove ? 0 : opt.price;
    }
  }

  const calc = calculate({
    items: selected,
    coupons,
    shippingPerStore,
    paymentMethod: paymentMethod ?? undefined,
  });

  const paymentFee = showPaymentFee && paymentMethod === 'cod' ? COD_FEE : 0;
  const shippingAfter = Object.values(calc.shippingAfterDiscount).reduce((a, b) => a + b, 0);
  // Item discounts only (exclude shipping discount, already removed from shippingAfter)
  const itemDiscount = calc.appliedCoupons
    .filter((c) => c.slot !== 'shipping')
    .reduce((s, c) => s + c.amount, 0);
  const shippingDiscount = calc.appliedCoupons
    .filter((c) => c.slot === 'shipping')
    .reduce((s, c) => s + c.amount, 0);

  const total = Math.max(0, calc.subtotal + shippingAfter + paymentFee - itemDiscount);

  return (
    <Card className="sticky top-20 self-start p-4">
      <h2 className="mb-3 font-semibold">สรุปคำสั่งซื้อ</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>สินค้า ({selected.length} ชิ้น)</span>
          <span>฿{calc.subtotal.toLocaleString()}</span>
        </div>
        {showShipping && (
          <div className="flex justify-between">
            <span>ค่าจัดส่ง ({storeIds.length} ร้าน)</span>
            <span>
              {shippingAfter === 0 ? (
                <span className="text-green-600">ฟรี</span>
              ) : shippingDiscount > 0 ? (
                <>
                  <span className="mr-1 text-xs text-muted-foreground line-through">
                    ฿{calc.shippingTotal.toLocaleString()}
                  </span>
                  ฿{shippingAfter.toLocaleString()}
                </>
              ) : (
                `฿${shippingAfter.toLocaleString()}`
              )}
            </span>
          </div>
        )}
        {showPaymentFee && paymentFee > 0 && (
          <div className="flex justify-between">
            <span>ค่าธรรมเนียม COD</span>
            <span>฿{paymentFee.toLocaleString()}</span>
          </div>
        )}

        {/* Per-coupon discount breakdown */}
        {calc.appliedCoupons.length > 0 && (
          <>
            <Separator />
            {calc.appliedCoupons.map((ac) => {
              const c = coupons.find((x) => x.id === ac.couponId);
              return (
                <div
                  key={ac.couponId}
                  className="flex justify-between text-green-600"
                >
                  <span className="truncate text-xs">
                    {c?.title ?? ac.code}
                    <code className="ml-1 rounded bg-green-100 px-1 text-[9px] font-mono text-green-800 dark:bg-green-950/30">
                      {ac.code}
                    </code>
                  </span>
                  <span>−฿{ac.amount.toLocaleString()}</span>
                </div>
              );
            })}
          </>
        )}

        <Separator className="my-2" />
        <div className="flex items-baseline justify-between">
          <span className="font-semibold">ยอดรวม</span>
          <span className="text-xl font-bold text-red-600">฿{total.toLocaleString()}</span>
        </div>

        {calc.totalDiscount > 0 && (
          <p className="rounded-md bg-green-50 px-2 py-1 text-center text-xs text-green-700 dark:bg-green-950/20 dark:text-green-300">
            ประหยัดไป ฿{calc.totalDiscount.toLocaleString()}
          </p>
        )}
      </div>
    </Card>
  );
}
