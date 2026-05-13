'use client';

// Public coupon catalog — Group G gap from the marketplace-templates
// scaffold. Reads mockCoupons + uses the existing CouponCard component
// and the client-side useUserCouponsStore to claim. Server enforcement
// at order placement (`validateCouponServer`) is the real gate; this
// page is the discovery + claim UX.
//
// /account/coupons (the "my coupons" view) already links here via its
// "หาคูปองเพิ่ม" button, so users had a dead destination until now.

import Link from 'next/link';
import { Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CouponCard } from '@/components/coupons/coupon-card';
import { mockCoupons } from '@/lib/coupons/mock-data';
import { useUserCouponsStore } from '@/lib/coupons/store';
import { isCouponExpired } from '@/lib/coupons/calculator';
import type { Coupon } from '@/lib/coupons/types';

type Section = {
  title: string;
  description: string;
  coupons: Coupon[];
};

export default function PublicCouponsPage() {
  const claimedIds = useUserCouponsStore((s) => s.claimedCouponIds);
  const claim = useUserCouponsStore((s) => s.claim);

  const active = mockCoupons.filter((c) => !isCouponExpired(c));

  const sections: Section[] = [
    {
      title: 'คูปอง Basketplace',
      description: 'ใช้ได้ทุกร้านบนแพลตฟอร์ม',
      coupons: active.filter((c) => c.scope.type === 'platform'),
    },
    {
      title: 'คูปองร้านค้า',
      description: 'ใช้ได้เฉพาะร้านที่ออกคูปอง',
      coupons: active.filter((c) => c.scope.type === 'store'),
    },
    {
      title: 'คูปองหมวดหมู่',
      description: 'ใช้ได้กับสินค้าในหมวดที่กำหนด',
      coupons: active.filter((c) => c.scope.type === 'category'),
    },
    {
      title: 'คูปองเฉพาะสินค้า',
      description: 'ใช้ได้กับ SKU ที่ผู้ขายเลือก',
      coupons: active.filter((c) => c.scope.type === 'product'),
    },
  ].filter((s) => s.coupons.length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold lg:text-2xl">คูปองทั้งหมด</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            เก็บคูปองที่สนใจ แล้วเลือกใช้ตอนเช็คเอาท์
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/account/coupons">
            <Ticket className="mr-1 h-4 w-4" /> คูปองของฉัน
          </Link>
        </Button>
      </div>

      {sections.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-6 space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-sm font-semibold">{s.title}</h2>
              <p className="text-xs text-muted-foreground">{s.description}</p>
              <div className="mt-3 space-y-2">
                {s.coupons.map((c) => {
                  const isClaimed = claimedIds.includes(c.id);
                  return (
                    <CouponCard
                      key={c.id}
                      coupon={c}
                      state={isClaimed ? 'claimed' : 'available'}
                      actionLabel={isClaimed ? 'เก็บแล้ว' : 'เก็บคูปอง'}
                      onClick={isClaimed ? undefined : () => claim(c.id)}
                      disabled={isClaimed}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Ticket className="h-12 w-12 text-muted-foreground/50" />
      <p className="mt-3 text-sm text-muted-foreground">
        ยังไม่มีคูปองที่ใช้ได้ในตอนนี้ ลองกลับมาดูใหม่
      </p>
      <Button asChild className="mt-4">
        <Link href="/">กลับหน้าแรก</Link>
      </Button>
    </div>
  );
}
