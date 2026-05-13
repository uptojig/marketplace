'use client';

import { useState } from 'react';
import { Ticket, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/cart/store';
import { useUserCouponsStore } from '@/lib/coupons/store';
import {
  getActiveCoupons,
  getCouponByCode,
  getCouponById,
} from '@/lib/coupons/mock-data';
import {
  COUPON_ERROR_MESSAGE,
  type Coupon,
  type CouponValidationError,
} from '@/lib/coupons/types';
import { isCouponExpired, validate } from '@/lib/coupons/calculator';
import { CouponCard } from './coupon-card';

type Tab = 'available' | 'claimed' | 'expired';

interface CouponPickerProps {
  trigger?: React.ReactNode;
  /** Optional filter: only show coupons applicable to this store */
  filterStoreId?: string;
}

export function CouponPicker({ trigger, filterStoreId }: CouponPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('available');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  const items = useCartStore((s) => s.getSelectedItems());
  const appliedIds = useCartStore((s) => s.appliedCouponIds);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  const claimedIds = useUserCouponsStore((s) => s.claimedCouponIds);
  const claim = useUserCouponsStore((s) => s.claim);

  const allCoupons = getActiveCoupons();
  const filterByStore = (c: Coupon) =>
    !filterStoreId || c.scope.type === 'platform' || (c.scope.type === 'store' && c.scope.storeId === filterStoreId) || c.discount.kind === 'free_shipping';

  const available = allCoupons.filter(filterByStore);
  const claimed = available.filter((c) => claimedIds.includes(c.id));
  const expired = [...allCoupons.filter((c) => isCouponExpired(c))];

  const appliedCoupons = appliedIds
    .map((id) => getCouponById(id))
    .filter((c): c is Coupon => c !== null);

  const handleApply = (coupon: Coupon) => {
    if (appliedIds.includes(coupon.id)) {
      removeCoupon(coupon.id);
      return;
    }
    const err = validate(coupon, {
      items,
      shippingPerStore: {},
      existingCoupons: appliedCoupons,
    });
    if (err) {
      setCodeError(COUPON_ERROR_MESSAGE[err]);
      setTimeout(() => setCodeError(null), 3000);
      return;
    }
    if (!claimedIds.includes(coupon.id)) claim(coupon.id);
    applyCoupon(coupon.id);
    setCodeError(null);
  };

  const handleAddByCode = () => {
    setCodeError(null);
    const found = getCouponByCode(code.trim());
    if (!found) {
      setCodeError(COUPON_ERROR_MESSAGE.not_found);
      return;
    }
    handleApply(found);
    setCode('');
  };

  const getValidationError = (coupon: Coupon): CouponValidationError | null => {
    const err = validate(coupon, {
      items,
      shippingPerStore: {},
      existingCoupons: appliedCoupons.filter((c) => c.id !== coupon.id),
    });
    return err;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Ticket className="mr-1 h-4 w-4" />
            ใช้คูปอง
            {appliedIds.length > 0 && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                {appliedIds.length}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>เลือกคูปอง</SheetTitle>
          <SheetDescription>
            ใช้ได้ 1 ร้าน + 1 ส่วนกลาง + 1 ส่งฟรี รวมกัน
          </SheetDescription>
        </SheetHeader>

        {/* Code input */}
        <div className="my-4 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="ใส่โค้ดส่วนลด"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="uppercase"
            />
            <Button onClick={handleAddByCode} disabled={!code.trim()}>
              ใช้
            </Button>
          </div>
          {codeError && <p className="text-xs text-red-600">{codeError}</p>}
        </div>

        {/* Tabs */}
        <div className="mb-3 flex border-b">
          {(
            [
              ['available', 'ใช้ได้', available.length],
              ['claimed', 'เก็บแล้ว', claimed.length],
              ['expired', 'หมดอายุ', expired.length],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex-1 border-b-2 px-3 py-2 text-sm transition',
                tab === key
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {label} {count > 0 && <span className="text-xs">({count})</span>}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2 pb-6">
          {tab === 'available' &&
            available.map((c) => {
              const err = getValidationError(c);
              const isApplied = appliedIds.includes(c.id);
              return (
                <CouponCard
                  key={c.id}
                  coupon={c}
                  state={isApplied ? 'applied' : err && err !== 'already_applied' ? 'ineligible' : 'available'}
                  ineligibleReason={err && err !== 'already_applied' ? COUPON_ERROR_MESSAGE[err] : undefined}
                  actionLabel={isApplied ? 'เอาออก' : err && err !== 'already_applied' ? undefined : 'ใช้'}
                  onClick={
                    isApplied
                      ? () => removeCoupon(c.id)
                      : err && err !== 'already_applied'
                        ? undefined
                        : () => handleApply(c)
                  }
                />
              );
            })}
          {tab === 'claimed' &&
            (claimed.length === 0 ? (
              <EmptyState text="ยังไม่ได้เก็บคูปองไว้" />
            ) : (
              claimed.map((c) => {
                const err = getValidationError(c);
                const isApplied = appliedIds.includes(c.id);
                return (
                  <CouponCard
                    key={c.id}
                    coupon={c}
                    state={isApplied ? 'applied' : err && err !== 'already_applied' ? 'ineligible' : 'claimed'}
                    ineligibleReason={err && err !== 'already_applied' ? COUPON_ERROR_MESSAGE[err] : undefined}
                    actionLabel={isApplied ? 'เอาออก' : err && err !== 'already_applied' ? undefined : 'ใช้'}
                    onClick={
                      isApplied
                        ? () => removeCoupon(c.id)
                        : err && err !== 'already_applied'
                          ? undefined
                          : () => handleApply(c)
                    }
                  />
                );
              })
            ))}
          {tab === 'expired' &&
            (expired.length === 0 ? (
              <EmptyState text="ไม่มีคูปองหมดอายุ" />
            ) : (
              expired.map((c) => <CouponCard key={c.id} coupon={c} state="expired" />)
            ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <Ticket className="h-10 w-10 text-muted-foreground/50" />
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
