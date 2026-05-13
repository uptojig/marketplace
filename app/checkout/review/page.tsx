'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useCartStore } from '@/lib/cart/store';
import { placeOrder } from '@/lib/orders/actions';
import {
  getAddresses,
  mockShippingOptions,
  paymentMethods,
} from '@/lib/checkout/mock-data';
import { useCheckoutStore } from '@/lib/checkout/store';
import { OrderSummary } from '@/components/checkout/order-summary';
import { CouponPicker } from '@/components/coupons/coupon-picker';
import { calculate } from '@/lib/coupons/calculator';
import { getCouponById } from '@/lib/coupons/mock-data';
import type { Coupon } from '@/lib/coupons/types';

const COD_FEE = 20;

export default function CheckoutReviewPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useCartStore((s) => s.getSelectedItems());
  const itemsByStore = useCartStore((s) => s.getItemsByStore());
  const appliedCouponIds = useCartStore((s) => s.appliedCouponIds);
  const removeSelected = useCartStore((s) => s.removeSelected);
  const checkout = useCheckoutStore();

  useEffect(() => {
    if (selected.length === 0) router.replace('/cart');
    else if (!checkout.selectedAddressId) router.replace('/checkout/shipping');
    else if (!checkout.selectedPaymentMethod) router.replace('/checkout/payment');
  }, [selected.length, checkout.selectedAddressId, checkout.selectedPaymentMethod, router]);

  const address = getAddresses().find((a) => a.id === checkout.selectedAddressId);
  const payment = paymentMethods.find((p) => p.id === checkout.selectedPaymentMethod);
  const storeIds = Array.from(new Set(selected.map((i) => i.storeId)));

  const coupons = appliedCouponIds
    .map((id) => getCouponById(id))
    .filter((c): c is Coupon => c !== null);

  const shippingPerStore: Record<string, number> = {};
  const shippingDetailByStore: Record<string, { optionId: string; price: number }> = {};
  for (const sid of storeIds) {
    const optId = checkout.shippingByStore[sid];
    const opt = mockShippingOptions.find((o) => o.id === optId);
    if (!opt) continue;
    const sub = selected.filter((i) => i.storeId === sid).reduce((s, i) => s + i.price * i.qty, 0);
    const price = opt.freeAbove && sub >= opt.freeAbove ? 0 : opt.price;
    shippingPerStore[sid] = price;
    shippingDetailByStore[sid] = { optionId: optId, price };
  }

  const calc = calculate({
    items: selected,
    coupons,
    shippingPerStore,
    paymentMethod: checkout.selectedPaymentMethod ?? undefined,
  });

  const paymentFee = checkout.selectedPaymentMethod === 'cod' ? COD_FEE : 0;
  const itemDiscount = calc.appliedCoupons
    .filter((c) => c.slot !== 'shipping')
    .reduce((s, c) => s + c.amount, 0);
  const shippingAfter = Object.values(calc.shippingAfterDiscount).reduce((a, b) => a + b, 0);
  const total = Math.max(0, calc.subtotal + shippingAfter + paymentFee - itemDiscount);

  const handlePlaceOrder = () => {
    if (!agreed || !address || !payment) return;
    setError(null);

    startTransition(async () => {
      const cartId = `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const result = await placeOrder({
        cartId,
        items: selected,
        addressId: address.id,
        paymentMethod: checkout.selectedPaymentMethod as 'promptpay' | 'card' | 'wallet' | 'bnpl' | 'cod',
        shippingByStore: shippingDetailByStore,
        couponIds: appliedCouponIds,
        notesByStore: checkout.notesByStore,
      });

      if (!result.ok) {
        setError(translateError(result.error ?? 'unknown'));
        return;
      }

      removeSelected();
      checkout.reset();

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        router.push(
          `/checkout/processing?intent=${result.intentId}&order=${result.orderRefs?.[0] ?? ''}`,
        );
      }
    });
  };

  if (!address || !payment) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card className="p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="font-semibold">ที่อยู่จัดส่ง</h3>
            <Link href="/checkout/shipping" className="text-xs text-primary hover:underline">
              เปลี่ยน
            </Link>
          </div>
          <p className="text-sm">
            <span className="font-medium">{address.fullName}</span>{' '}
            <span className="text-muted-foreground">{address.phone}</span>
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {address.line1}
            {address.line2 && `, ${address.line2}`}, {address.subDistrict} {address.district}{' '}
            {address.province} {address.postalCode}
          </p>
        </Card>

        {storeIds.map((storeId) => {
          const storeItems = (itemsByStore.get(storeId) ?? []).filter((i) =>
            selected.some((s) => s.id === i.id),
          );
          const storeName = storeItems[0]?.storeName ?? 'Store';
          const storeLogo = storeItems[0]?.storeLogo;
          const shippingOptId = checkout.shippingByStore[storeId];
          const shippingOpt = mockShippingOptions.find((o) => o.id === shippingOptId);
          const note = checkout.notesByStore[storeId] ?? '';

          return (
            <Card key={storeId} className="overflow-hidden">
              <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={storeLogo} />
                  <AvatarFallback className="text-[10px]">
                    {storeName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{storeName}</span>
              </div>
              <div className="divide-y">
                {storeItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded">
                      <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="flex-1">
                      <p className="line-clamp-2 text-sm">{item.title}</p>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground">{item.variantName}</p>
                      )}
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm">x{item.qty}</span>
                        <span className="text-sm font-semibold">
                          ฿{(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {shippingOpt && (
                <div className="border-t bg-muted/10 px-4 py-2 text-xs text-muted-foreground">
                  📦 {shippingOpt.name} · ส่งถึงใน {shippingOpt.estimatedDays.min}–
                  {shippingOpt.estimatedDays.max} วัน
                </div>
              )}
              <div className="border-t p-3">
                <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" /> ข้อความถึงร้าน (ไม่บังคับ)
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => checkout.setNote(storeId, e.target.value)}
                  placeholder="เช่น ห่อของขวัญ, ใส่ใบเสร็จ, ฯลฯ"
                  className="min-h-[60px] text-sm"
                />
              </div>
            </Card>
          );
        })}

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">คูปอง ({calc.appliedCoupons.length})</h3>
            <CouponPicker
              trigger={
                <Button variant="outline" size="sm">
                  เลือกคูปอง
                </Button>
              }
            />
          </div>
          {calc.appliedCoupons.length === 0 ? (
            <p className="text-xs text-muted-foreground">ไม่ได้ใช้คูปอง</p>
          ) : (
            <div className="space-y-1">
              {calc.appliedCoupons.map((ac) => {
                const c = coupons.find((x) => x.id === ac.couponId);
                return (
                  <div key={ac.couponId} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{c?.title ?? ac.code}</span>
                    <span className="font-medium text-green-600">
                      −฿{ac.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="text-2xl">{payment.icon}</div>
          <div className="flex-1">
            <div className="font-medium">{payment.label}</div>
            <div className="text-xs text-muted-foreground">{payment.description}</div>
          </div>
          <Link href="/checkout/payment" className="text-xs text-primary hover:underline">
            เปลี่ยน
          </Link>
        </Card>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />
          <span>
            ฉันยอมรับ{' '}
            <Link href="/legal/terms" className="text-primary hover:underline">
              เงื่อนไขการใช้บริการ
            </Link>{' '}
            และ{' '}
            <Link href="/legal/privacy" className="text-primary hover:underline">
              นโยบายความเป็นส่วนตัว
            </Link>
          </span>
        </label>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" asChild>
            <Link href="/checkout/payment">← กลับ</Link>
          </Button>
          <Button
            size="lg"
            disabled={!agreed || pending}
            onClick={handlePlaceOrder}
            className="min-w-[180px]"
          >
            {pending ? (
              'กำลังประมวลผล...'
            ) : (
              <>
                <CheckCircle2 className="mr-1 h-4 w-4" />
                สั่งซื้อ ฿{total.toLocaleString()}
              </>
            )}
          </Button>
        </div>
      </div>

      <aside className="hidden lg:block">
        <OrderSummary showShipping showPaymentFee />
      </aside>
    </div>
  );
}

function translateError(code: string): string {
  if (code.startsWith('out_of_stock')) return 'สินค้าบางรายการหมดสต๊อก กรุณาลองใหม่';
  if (code.startsWith('coupon_') && code.includes('invalid')) return 'คูปองใช้ไม่ได้ ลบและลองใหม่';
  if (code === 'invalid_address') return 'ที่อยู่ไม่ถูกต้อง';
  if (code === 'empty_cart') return 'ตะกร้าว่าง';
  if (code === 'anypay_unreachable') return 'ระบบชำระเงินมีปัญหา ลองอีกครั้งใน 1 นาที';
  return `เกิดข้อผิดพลาด: ${code}`;
}
