'use client';

import Link from 'next/link';
import { Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CouponCard } from '@/components/coupons/coupon-card';
import { getCouponById } from '@/lib/coupons/mock-data';
import { useUserCouponsStore } from '@/lib/coupons/store';
import { isCouponExpired } from '@/lib/coupons/calculator';

export default function MyCouponsPage() {
  const claimedIds = useUserCouponsStore((s) => s.claimedCouponIds);
  const unclaim = useUserCouponsStore((s) => s.unclaim);

  const claimed = claimedIds
    .map((id) => getCouponById(id))
    .filter((c): c is NonNullable<typeof c> => c !== null);

  const active = claimed.filter((c) => !isCouponExpired(c));
  const expired = claimed.filter((c) => isCouponExpired(c));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold lg:text-2xl">คูปองของฉัน</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/coupons">
            <Ticket className="mr-1 h-4 w-4" /> หาคูปองเพิ่ม
          </Link>
        </Button>
      </div>

      {claimed.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Ticket className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">ยังไม่ได้เก็บคูปองไว้</p>
          <Button asChild className="mt-4">
            <Link href="/coupons">ไปหาคูปอง</Link>
          </Button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                ใช้ได้ ({active.length})
              </h2>
              <div className="space-y-2">
                {active.map((c) => (
                  <CouponCard
                    key={c.id}
                    coupon={c}
                    state="claimed"
                    actionLabel="เอาออก"
                    onClick={() => unclaim(c.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {expired.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                หมดอายุแล้ว ({expired.length})
              </h2>
              <div className="space-y-2">
                {expired.map((c) => (
                  <CouponCard
                    key={c.id}
                    coupon={c}
                    state="expired"
                    actionLabel="ลบ"
                    onClick={() => unclaim(c.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
