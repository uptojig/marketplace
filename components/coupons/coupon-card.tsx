'use client';

import { Check, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Coupon } from '@/lib/coupons/types';

const COLOR_SCHEMES = {
  red: { bg: 'from-red-500 to-red-600', text: 'text-red-600' },
  blue: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600' },
  purple: { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600' },
  green: { bg: 'from-green-500 to-emerald-600', text: 'text-green-600' },
  amber: { bg: 'from-amber-500 to-orange-600', text: 'text-amber-700' },
};

interface CouponCardProps {
  coupon: Coupon;
  state: 'available' | 'claimed' | 'applied' | 'expired' | 'ineligible';
  ineligibleReason?: string;
  onClick?: () => void;
  actionLabel?: string;
  disabled?: boolean;
}

export function CouponCard({
  coupon,
  state,
  ineligibleReason,
  onClick,
  actionLabel,
  disabled,
}: CouponCardProps) {
  const scheme = COLOR_SCHEMES[coupon.colorScheme ?? 'red'];
  const isDisabled = state === 'expired' || state === 'ineligible' || disabled;

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(coupon.validTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  return (
    <div
      className={cn(
        'relative flex overflow-hidden rounded-lg border bg-card shadow-sm transition',
        isDisabled && 'opacity-60',
        !isDisabled && state === 'available' && 'hover:shadow-md',
      )}
    >
      {/* Left colored strip with discount badge */}
      <div
        className={cn(
          'flex w-24 shrink-0 flex-col items-center justify-center bg-gradient-to-br p-3 text-white',
          scheme.bg,
        )}
      >
        {coupon.discount.kind === 'percent' && (
          <>
            <div className="text-2xl font-bold leading-none">{coupon.discount.percent}%</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide">off</div>
          </>
        )}
        {coupon.discount.kind === 'fixed' && (
          <>
            <div className="text-xs">฿</div>
            <div className="text-2xl font-bold leading-none">{coupon.discount.amount}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide">off</div>
          </>
        )}
        {coupon.discount.kind === 'free_shipping' && (
          <div className="text-center text-[10px] font-bold uppercase leading-tight">
            ส่งฟรี<br />FREE<br />SHIP
          </div>
        )}
      </div>

      {/* Notch (dotted divider) */}
      <div className="relative">
        <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-background" />
        <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-background" />
        <div className="h-full border-l border-dashed border-muted-foreground/40" />
      </div>

      {/* Right content */}
      <div className="flex flex-1 items-center justify-between gap-3 p-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="line-clamp-1 text-sm font-semibold">{coupon.title}</h3>
            {state === 'applied' && (
              <Badge className="bg-green-600 hover:bg-green-600 text-[9px]">
                <Check className="mr-0.5 h-2.5 w-2.5" /> ใช้อยู่
              </Badge>
            )}
          </div>
          {coupon.description && (
            <p className="line-clamp-1 text-xs text-muted-foreground">{coupon.description}</p>
          )}
          <p className="mt-1 text-[10px] text-muted-foreground">โดย {coupon.issuer}</p>
          <div className="mt-1 flex items-center gap-2 text-[10px]">
            <code className={cn('rounded bg-muted px-1.5 py-0.5 font-mono font-semibold', scheme.text)}>
              {coupon.code}
            </code>
            {state !== 'expired' && (
              <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                {daysLeft > 0 ? `เหลือ ${daysLeft} วัน` : 'หมดอายุวันนี้'}
              </span>
            )}
            {state === 'expired' && (
              <span className="text-red-600">หมดอายุแล้ว</span>
            )}
          </div>
          {ineligibleReason && (
            <p className="mt-1 text-[10px] text-amber-600">⚠ {ineligibleReason}</p>
          )}
        </div>

        {onClick && actionLabel && (
          <Button
            size="sm"
            variant={state === 'applied' ? 'outline' : 'default'}
            onClick={onClick}
            disabled={isDisabled}
            className="shrink-0"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
