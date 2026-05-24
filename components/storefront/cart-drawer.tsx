'use client';

/**
 * Global cart drawer — slides out from the right whenever the buyer adds
 * something to the cart, or when they click any cart trigger that calls
 * `useCart.openDrawer()`. Mounted once per storefront from
 * `app/stores/[slug]/layout.tsx` so every theme inherits the same drawer
 * UX without each theme rebuilding its own.
 *
 * Theme components should NOT render their own cart popups. The rule for
 * this project is "drawer for everything, no popup" — clicking
 * "หยิบใส่ตะกร้า" calls `useCart.add(...)` which auto-opens this drawer.
 */
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface Props {
  storeSlug: string;
  /** Free-shipping minimum subtotal in THB. Themes can pass their own. */
  freeShippingThreshold?: number;
}

export function CartDrawer({ storeSlug, freeShippingThreshold = 990 }: Props) {
  const open = useCart((s) => s.drawerOpen);
  const closeDrawer = useCart((s) => s.closeDrawer);
  const lines = useCart((s) =>
    s.lines.filter((l) => l.storeSlug === storeSlug),
  );
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const subtotal = lines.reduce((acc, l) => acc + l.priceTHB * l.qty, 0);
  const remaining = Math.max(freeShippingThreshold - subtotal, 0);
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  return (
    <Sheet open={open} onOpenChange={(o) => (o ? null : closeDrawer())}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0"
        style={{ background: 'var(--shop-bg, #ffffff)' }}
      >
        <SheetHeader
          className="px-5 py-4 border-b flex flex-row items-center justify-between space-y-0"
          style={{ borderColor: 'var(--shop-border, #e5e5e5)' }}
        >
          <SheetTitle
            className="flex items-center gap-2 text-base font-[family:var(--font-kanit)] font-bold"
            style={{ color: 'var(--shop-ink, #0a0a0a)' }}
          >
            <ShoppingBag
              size={18}
              style={{ color: 'var(--shop-primary, #0a0a0a)' }}
            />
            ตะกร้าของคุณ
            {lines.length > 0 && (
              <span
                className="ml-1 text-xs font-semibold tabular-nums"
                style={{ color: 'var(--shop-ink-muted, #71717a)' }}
              >
                ({lines.reduce((a, b) => a + b.qty, 0)})
              </span>
            )}
          </SheetTitle>
          <button
            onClick={closeDrawer}
            aria-label="ปิด"
            className="rounded-full p-1.5 transition-colors hover:bg-black/5"
            style={{ color: 'var(--shop-ink-muted, #71717a)' }}
          >
            <X size={18} />
          </button>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div
              className="rounded-full p-6"
              style={{ background: 'var(--shop-bg-soft, #f4f4f5)' }}
            >
              <ShoppingBag
                size={36}
                strokeWidth={1.5}
                style={{ color: 'var(--shop-ink-muted, #71717a)' }}
              />
            </div>
            <div>
              <p
                className="font-[family:var(--font-kanit)] font-bold text-lg"
                style={{ color: 'var(--shop-ink, #0a0a0a)' }}
              >
                ตะกร้ายังว่าง
              </p>
              <p
                className="text-sm mt-1 font-[family:var(--font-prompt)]"
                style={{ color: 'var(--shop-ink-muted, #71717a)' }}
              >
                เริ่มเลือกสินค้าที่คุณชอบกันเลย
              </p>
            </div>
            <button
              onClick={closeDrawer}
              className="mt-2 rounded-full px-6 py-2.5 text-sm font-[family:var(--font-kanit)] font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--shop-primary, #0a0a0a)' }}
            >
              ช้อปต่อ
            </button>
          </div>
        ) : (
          <>
            {freeShippingThreshold > 0 && (
              <div
                className="px-5 py-3 border-b font-[family:var(--font-prompt)]"
                style={{ borderColor: 'var(--shop-border, #e5e5e5)' }}
              >
                {remaining > 0 ? (
                  <p
                    className="text-xs"
                    style={{ color: 'var(--shop-ink, #0a0a0a)' }}
                  >
                    ช้อปอีก{' '}
                    <span
                      className="font-bold tabular-nums"
                      style={{ color: 'var(--shop-primary, #0a0a0a)' }}
                    >
                      {formatTHB(remaining)}
                    </span>{' '}
                    เพื่อรับส่งฟรี
                  </p>
                ) : (
                  <p
                    className="text-xs font-bold"
                    style={{ color: 'var(--shop-savings, #16a34a)' }}
                  >
                    ✓ ฟรีค่าจัดส่งแล้ว
                  </p>
                )}
                <div
                  className="mt-1.5 h-1 rounded-full overflow-hidden"
                  style={{ background: 'var(--shop-bg-soft, #f4f4f5)' }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      background: 'var(--shop-primary, #0a0a0a)',
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {lines.map((line) => (
                <div
                  key={line.productId}
                  className="flex gap-3 rounded-lg p-2.5"
                  style={{ background: 'var(--shop-bg-soft, #fafafa)' }}
                >
                  <div
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-md"
                    style={{ background: 'var(--shop-bg, #ffffff)' }}
                  >
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt={line.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{ color: 'var(--shop-ink-muted, #71717a)' }}
                      >
                        <ShoppingBag size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <p
                      className="text-sm font-[family:var(--font-prompt)] font-semibold line-clamp-2 leading-tight"
                      style={{ color: 'var(--shop-ink, #0a0a0a)' }}
                    >
                      {line.title}
                    </p>
                    <div className="flex items-end justify-between">
                      <div
                        className="inline-flex items-center rounded-full border overflow-hidden"
                        style={{
                          borderColor: 'var(--shop-border, #e5e5e5)',
                          background: 'var(--shop-bg, #ffffff)',
                        }}
                      >
                        <button
                          onClick={() =>
                            setQty(
                              line.productId,
                              Math.max(line.qty - 1, 0),
                              line.storeSlug,
                            )
                          }
                          aria-label="ลดจำนวน"
                          className="px-2 py-1"
                          style={{ color: 'var(--shop-ink, #0a0a0a)' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span
                          className="px-2 text-xs font-bold tabular-nums min-w-[18px] text-center"
                          style={{ color: 'var(--shop-ink, #0a0a0a)' }}
                        >
                          {line.qty}
                        </span>
                        <button
                          onClick={() =>
                            setQty(line.productId, line.qty + 1, line.storeSlug)
                          }
                          aria-label="เพิ่มจำนวน"
                          className="px-2 py-1"
                          style={{ color: 'var(--shop-ink, #0a0a0a)' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <p
                          className="text-sm font-[family:var(--font-kanit)] font-bold tabular-nums"
                          style={{ color: 'var(--shop-primary, #0a0a0a)' }}
                        >
                          {formatTHB(line.priceTHB * line.qty)}
                        </p>
                        <button
                          onClick={() => remove(line.productId, line.storeSlug)}
                          aria-label="ลบสินค้านี้"
                          className="rounded-full p-1 transition-colors hover:bg-black/5"
                          style={{ color: 'var(--shop-ink-muted, #71717a)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="border-t px-5 py-4 space-y-3 font-[family:var(--font-prompt)]"
              style={{ borderColor: 'var(--shop-border, #e5e5e5)' }}
            >
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--shop-ink-muted, #71717a)' }}>
                  ยอดรวม ({lines.reduce((a, b) => a + b.qty, 0)} ชิ้น)
                </span>
                <span
                  className="font-[family:var(--font-kanit)] font-black text-lg tabular-nums"
                  style={{ color: 'var(--shop-primary, #0a0a0a)' }}
                >
                  {formatTHB(subtotal)}
                </span>
              </div>
              <Link
                href={`/stores/${storeSlug}/checkout`}
                onClick={closeDrawer}
                className="block w-full rounded-full py-3 text-center text-sm font-[family:var(--font-kanit)] font-black uppercase text-white transition-opacity hover:opacity-90"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary, #0a0a0a))',
                }}
              >
                ดำเนินการชำระเงิน
              </Link>
              <button
                onClick={closeDrawer}
                className="block w-full rounded-full border py-2.5 text-center text-sm font-[family:var(--font-prompt)] font-semibold transition-colors"
                style={{
                  borderColor: 'var(--shop-border, #e5e5e5)',
                  color: 'var(--shop-ink, #0a0a0a)',
                  background: 'var(--shop-bg, #ffffff)',
                }}
              >
                ช้อปต่อ
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
