'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { MarketplacePage } from '@/components/layout/marketplace-page';
import { CouponPicker } from '@/components/coupons/coupon-picker';
import { useCartStore } from '@/lib/cart/store';
import { getCouponById } from '@/lib/coupons/mock-data';
import { calculate } from '@/lib/coupons/calculator';
import type { CartItem } from '@/lib/cart/types';
import type { Coupon } from '@/lib/coupons/types';

export default function CartPage() {
  return (
    <MarketplacePage>
      <CartContent />
    </MarketplacePage>
  );
}

function CartContent() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const itemsByStore = useCartStore((s) => s.getItemsByStore());
  const selectedIds = useCartStore((s) => s.selectedIds);
  const selected = useCartStore((s) => s.getSelectedItems());
  const subtotal = useCartStore((s) => s.getSelectedSubtotal());
  const appliedCouponIds = useCartStore((s) => s.appliedCouponIds);

  if (items.length === 0) return <EmptyCart />;

  const appliedCoupons = appliedCouponIds
    .map((id) => getCouponById(id))
    .filter((c): c is Coupon => c !== null);

  const calc = calculate({
    items: selected,
    coupons: appliedCoupons,
    shippingPerStore: {}, // no shipping yet in cart view — applied at checkout
  });

  return (
    <div className="mx-auto max-w-5xl px-4 pb-32 pt-6 lg:px-6">
      <h1 className="mb-4 text-xl font-semibold lg:text-2xl">ตะกร้าของฉัน</h1>

      <div className="space-y-4">
        {Array.from(itemsByStore.entries()).map(([storeId, storeItems]) => (
          <StoreGroup key={storeId} storeId={storeId} items={storeItems} />
        ))}
      </div>

      {/* Platform-level coupon row */}
      <Card className="mt-4 flex items-center justify-between p-3">
        <div>
          <p className="text-sm font-medium">คูปอง Basketplace</p>
          <p className="text-xs text-muted-foreground">
            ใช้ได้ทุกร้าน · มีโค้ดส่งฟรี / ลดเงินสด / ลดเปอร์เซ็นต์
          </p>
        </div>
        <CouponPicker />
      </Card>

      <StickyCheckoutBar
        selectedCount={selectedIds.length}
        totalItems={items.length}
        subtotal={subtotal}
        discount={calc.totalDiscount}
        onCheckout={() => router.push('/checkout/shipping')}
      />
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <ShoppingBag className="h-16 w-16 text-muted-foreground" />
      <h2 className="mt-4 text-xl font-semibold">ตะกร้าว่างเปล่า</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        ยังไม่มีสินค้าในตะกร้า ลองเข้าไปดูสินค้าที่หน้าแรกกันก่อน
      </p>
      <Button asChild className="mt-6">
        <Link href="/">เริ่มช้อปปิ้ง</Link>
      </Button>
    </div>
  );
}

function StoreGroup({ storeId, items }: { storeId: string; items: CartItem[] }) {
  const selectedIds = useCartStore((s) => s.selectedIds);
  const selectAllInStore = useCartStore((s) => s.selectAllInStore);
  const deselectAllInStore = useCartStore((s) => s.deselectAllInStore);

  const storeName = items[0]?.storeName ?? 'Store';
  const storeLogo = items[0]?.storeLogo;
  const storeSlug = items[0]?.storeSlug;
  const allSelected = items.every((i) => selectedIds.includes(i.id));
  const subtotal = items
    .filter((i) => selectedIds.includes(i.id))
    .reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
        <Checkbox
          checked={allSelected}
          onCheckedChange={(c) =>
            c ? selectAllInStore(storeId) : deselectAllInStore(storeId)
          }
        />
        <Avatar className="h-7 w-7">
          <AvatarImage src={storeLogo} alt={storeName} />
          <AvatarFallback className="text-[10px]">{storeName.slice(0, 2)}</AvatarFallback>
        </Avatar>
        {storeSlug ? (
          <Link href={`/stores/${storeSlug}`} className="text-sm font-medium hover:underline">
            {storeName}
          </Link>
        ) : (
          <span className="text-sm font-medium">{storeName}</span>
        )}
      </div>

      <div className="divide-y">
        {items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>

      <div className="flex items-center gap-2 border-t bg-muted/10 px-4 py-3">
        <CouponPicker
          filterStoreId={storeId}
          trigger={
            <Button variant="outline" size="sm">
              คูปองร้านนี้
            </Button>
          }
        />
        <div className="ml-auto text-right">
          <div className="text-xs text-muted-foreground">รวมในร้านนี้</div>
          <div className="text-base font-semibold text-red-600">
            ฿{subtotal.toLocaleString()}
          </div>
        </div>
      </div>
    </Card>
  );
}

function CartItemRow({ item }: { item: CartItem }) {
  const selectedIds = useCartStore((s) => s.selectedIds);
  const toggleSelected = useCartStore((s) => s.toggleSelected);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const isSelected = selectedIds.includes(item.id);

  return (
    <div className="flex gap-3 p-4">
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => toggleSelected(item.id)}
        className="mt-1"
      />
      {item.storeSlug ? (
        <Link
          href={`/stores/${item.storeSlug}/products/${item.productId}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded"
        >
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        </Link>
      ) : (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded">
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        {item.storeSlug ? (
          <Link href={`/stores/${item.storeSlug}/products/${item.productId}`}>
            <h3 className="line-clamp-2 text-sm font-medium hover:underline">{item.title}</h3>
          </Link>
        ) : (
          <h3 className="line-clamp-2 text-sm font-medium">{item.title}</h3>
        )}
        {item.variantName && (
          <p className="mt-0.5 text-xs text-muted-foreground">Variant: {item.variantName}</p>
        )}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-semibold text-red-600">
            ฿{item.price.toLocaleString()}
          </span>
          {item.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ฿{item.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        {item.stockLeft != null && item.stockLeft < 10 && (
          <p className="mt-0.5 text-xs text-red-600">เหลือ {item.stockLeft} ชิ้น</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <div className="inline-flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => updateQty(item.id, item.qty - 1)}
              disabled={item.qty <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-10 border-x text-center text-sm">{item.qty}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => updateQty(item.id, item.qty + 1)}
              disabled={!!item.stockLeft && item.qty >= item.stockLeft}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(item.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function StickyCheckoutBar({
  selectedCount,
  totalItems,
  subtotal,
  discount,
  onCheckout,
}: {
  selectedCount: number;
  totalItems: number;
  subtotal: number;
  discount: number;
  onCheckout: () => void;
}) {
  const total = Math.max(0, subtotal - discount);
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 lg:px-6">
        <div className="text-sm text-muted-foreground">
          เลือก <span className="font-semibold text-foreground">{selectedCount}</span>/
          {totalItems} ชิ้น
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-muted-foreground">
            {discount > 0 && (
              <>
                <span className="line-through">฿{subtotal.toLocaleString()}</span>{' '}
                <span className="text-green-600">-฿{discount.toLocaleString()}</span>
              </>
            )}
            {discount === 0 && 'ยอดรวม'}
          </div>
          <div className="text-lg font-bold text-red-600">฿{total.toLocaleString()}</div>
        </div>
        <Button size="lg" onClick={onCheckout} disabled={selectedCount === 0}>
          ชำระเงิน ({selectedCount})
        </Button>
      </div>
    </div>
  );
}
