'use client';

import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'shipping', label: 'ที่อยู่จัดส่ง', path: '/checkout/shipping' },
  { id: 'payment', label: 'การชำระเงิน', path: '/checkout/payment' },
  { id: 'review', label: 'ตรวจสอบ', path: '/checkout/review' },
];

export function CheckoutSteps() {
  const pathname = usePathname();
  const activeIdx = STEPS.findIndex((s) => pathname.startsWith(s.path));

  return (
    <div className="flex items-center justify-center gap-2 lg:gap-4">
      {STEPS.map((step, i) => {
        const isActive = i === activeIdx;
        const isComplete = i < activeIdx;
        return (
          <div key={step.id} className="flex items-center gap-2 lg:gap-3">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                isComplete && 'border-green-600 bg-green-600 text-white',
                isActive && 'border-primary bg-primary text-primary-foreground',
                !isActive &&
                  !isComplete &&
                  'border-muted-foreground/30 text-muted-foreground',
              )}
            >
              {isComplete ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                'hidden text-sm lg:inline',
                isActive ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="h-px w-8 bg-muted-foreground/30 lg:w-12" />
            )}
          </div>
        );
      })}
    </div>
  );
}
