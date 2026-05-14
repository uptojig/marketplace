'use client';

/**
 * ProductDetailTabs — Description / Specifications / Reviews / Shipping.
 *
 * Tabs are conditional: any tab whose data source is empty is removed
 * entirely (no "ยังไม่มีข้อมูล" stubs visible to the buyer). Description
 * always shows (with a contact-store fallback when empty). Shipping
 * always shows (static + store name). Specifications + Reviews appear
 * only when there's real data to render.
 */

import Link from 'next/link';
import { MessageSquare, Truck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface ProductDetailTabsProduct {
  description: string;
  attributes: Record<string, string>;
}

export interface ProductDetailTabsStore {
  slug: string;
  name: string;
}

export function ProductDetailTabs({
  product,
  store,
}: {
  product: ProductDetailTabsProduct;
  store: ProductDetailTabsStore;
}) {
  const hasSpecs = Object.keys(product.attributes).length > 0;
  const hasDescription = product.description.trim().length > 0;
  // Reviews data isn't wired yet anywhere — keep the tab hidden until
  // the Review model lands and a real query feeds it.
  const hasReviews = false;

  const triggerClass =
    'data-active:border-primary data-active:text-foreground rounded-none border-b-2 border-transparent px-4 pb-2 text-sm';

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="h-10 w-full justify-start gap-2 overflow-x-auto rounded-none border-b bg-transparent p-0">
        <TabsTrigger value="description" className={triggerClass}>
          รายละเอียด
        </TabsTrigger>
        {hasSpecs && (
          <TabsTrigger value="specifications" className={triggerClass}>
            ข้อมูลจำเพาะ
          </TabsTrigger>
        )}
        {hasReviews && (
          <TabsTrigger value="reviews" className={triggerClass}>
            รีวิว
          </TabsTrigger>
        )}
        <TabsTrigger value="shipping" className={triggerClass}>
          การจัดส่ง
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="pt-4">
        <div className="prose prose-sm max-w-none">
          {hasDescription ? (
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {product.description.trim()}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              ทางร้านยังไม่ได้ใส่รายละเอียดสินค้านี้ — สอบถามข้อมูลเพิ่มเติมได้ที่{' '}
              <Link
                href={`/stores/${store.slug}/contact`}
                className="font-medium underline"
                style={{ color: 'var(--shop-primary)' }}
              >
                หน้าติดต่อร้าน
              </Link>
            </p>
          )}
        </div>
      </TabsContent>

      {hasSpecs && (
        <TabsContent value="specifications" className="pt-4">
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {Object.entries(product.attributes).map(([k, v]) => (
                <tr key={k}>
                  <td className="py-2 pr-4 text-muted-foreground">{k}</td>
                  <td className="py-2 text-right font-medium">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
      )}

      {hasReviews && (
        <TabsContent value="reviews" className="pt-4">
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">ยังไม่มี reviews</p>
            <p className="text-xs text-muted-foreground">
              เป็นคนแรกที่รีวิวสินค้านี้หลังการสั่งซื้อ
            </p>
          </div>
        </TabsContent>
      )}

      <TabsContent value="shipping" className="pt-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Truck className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">ตารางจัดส่ง</div>
              <div className="text-muted-foreground">
                ส่งทุกวันจันทร์-ศุกร์ (เว้นวันหยุดราชการ) ปกติได้รับภายใน 3-5 วันทำการ
              </div>
            </div>
          </div>
          <div className="border-t pt-3">
            <div className="font-medium">ผู้จัดส่ง</div>
            <div className="text-muted-foreground">{store.name}</div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
