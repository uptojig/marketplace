'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Plus, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/cart/store';
import {
  getAddresses,
  getDefaultAddressId,
  mockShippingOptions,
} from '@/lib/checkout/mock-data';
import { useCheckoutStore } from '@/lib/checkout/store';
import { OrderSummary } from '@/components/checkout/order-summary';

export default function CheckoutShippingPage() {
  const router = useRouter();
  const selectedItems = useCartStore((s) => s.getSelectedItems());
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);
  const setAddress = useCheckoutStore((s) => s.setAddress);
  const shippingByStore = useCheckoutStore((s) => s.shippingByStore);
  const setShipping = useCheckoutStore((s) => s.setShipping);

  const addresses = getAddresses();

  // Auto-select default address + default shipping on mount
  useEffect(() => {
    if (!selectedAddressId) setAddress(getDefaultAddressId());
  }, [selectedAddressId, setAddress]);

  // Redirect to cart if nothing selected
  useEffect(() => {
    if (selectedItems.length === 0) router.replace('/cart');
  }, [selectedItems.length, router]);

  const storeIds = Array.from(new Set(selectedItems.map((i) => i.storeId)));
  const itemsByStore = useCartStore((s) => s.getItemsByStore());

  const canProceed =
    !!selectedAddressId && storeIds.every((sid) => !!shippingByStore[sid]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {/* Address selection */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <MapPin className="h-4 w-4" /> ที่อยู่จัดส่ง
          </h2>
          <div className="space-y-2">
            {addresses.map((a) => {
              const selected = a.id === selectedAddressId;
              return (
                <Card
                  key={a.id}
                  onClick={() => setAddress(a.id)}
                  className={cn(
                    'cursor-pointer p-4 transition',
                    selected
                      ? 'border-primary ring-1 ring-primary'
                      : 'hover:border-foreground/30',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selected}
                      onChange={() => setAddress(a.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{a.fullName}</span>
                        <span className="text-sm text-muted-foreground">{a.phone}</span>
                        {a.isDefault && <Badge variant="secondary">ค่าเริ่มต้น</Badge>}
                        {a.label === 'home' && <Badge variant="outline">บ้าน</Badge>}
                        {a.label === 'office' && <Badge variant="outline">ที่ทำงาน</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {a.line1}
                        {a.line2 && `, ${a.line2}`}
                        <br />
                        {a.subDistrict} {a.district} {a.province} {a.postalCode}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/account/addresses/new">
                <Plus className="mr-1 h-4 w-4" /> เพิ่มที่อยู่ใหม่
              </Link>
            </Button>
          </div>
        </section>

        <Separator />

        {/* Shipping per store */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Truck className="h-4 w-4" /> วิธีจัดส่ง (แยกต่อร้าน)
          </h2>
          <div className="space-y-3">
            {storeIds.map((storeId) => {
              const storeItems = itemsByStore.get(storeId) ?? [];
              const storeSubtotal = storeItems
                .filter((i) => selectedItems.find((s) => s.id === i.id))
                .reduce((sum, i) => sum + i.price * i.qty, 0);
              const storeName = storeItems[0]?.storeName ?? 'Store';
              const storeLogo = storeItems[0]?.storeLogo;
              const selectedOpt = shippingByStore[storeId];
              return (
                <Card key={storeId} className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={storeLogo} />
                      <AvatarFallback className="text-[10px]">
                        {storeName.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{storeName}</span>
                  </div>
                  <div className="space-y-2">
                    {mockShippingOptions.map((opt) => {
                      const isFree = opt.freeAbove && storeSubtotal >= opt.freeAbove;
                      return (
                        <label
                          key={opt.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-md border p-3 transition',
                            selectedOpt === opt.id
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-foreground/30',
                          )}
                        >
                          <input
                            type="radio"
                            name={`ship-${storeId}`}
                            checked={selectedOpt === opt.id}
                            onChange={() => setShipping(storeId, opt.id)}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{opt.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {opt.carrier} · ส่งถึงใน {opt.estimatedDays.min}–
                              {opt.estimatedDays.max} วัน
                            </div>
                          </div>
                          <div className="text-right text-sm font-semibold">
                            {isFree ? (
                              <span className="text-green-600">ฟรี</span>
                            ) : (
                              `฿${opt.price}`
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <div className="flex items-center justify-between pt-4">
          <Button variant="ghost" asChild>
            <Link href="/cart">← กลับไปที่ตะกร้า</Link>
          </Button>
          <Button
            size="lg"
            disabled={!canProceed}
            onClick={() => router.push('/checkout/payment')}
          >
            ต่อไป → การชำระเงิน
          </Button>
        </div>
      </div>

      <aside className="hidden lg:block">
        <OrderSummary showShipping />
      </aside>
    </div>
  );
}
