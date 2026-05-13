'use client';

/**
 * ProductDetailTabs — Description / Specifications / Reviews / Shipping.
 *
 * Sits below the <ProductDetailHero> on the product detail page. Replaces
 * the inline Description / Specifications sections from the scaffold port
 * (components/store-blocks/product-detail-block.tsx) with a proper Tabs UI
 * + Reviews and Shipping placeholders matching the user's design ref.
 *
 * Data sources:
 *  - Description: Prisma `Product.descriptionTh ?? Product.description`,
 *    cleaned upstream by `lib/format/cleanDescription`.
 *  - Specifications: future Prisma `Product.attributes` Json blob, until
 *    then we surface whatever the caller passes (or hide the tab content).
 *  - Reviews: placeholder. No Review model yet.
 *    TODO(reviews): swap placeholder for a real list once the Review
 *    model lands. Likely a server component fed by a paginated query.
 *  - Shipping: static copy + the store's display name so users know who
 *    ships the order. The shipping cadence ("ส่งทุกวันจันทร์-ศุกร์") is a
 *    Basketplace-wide default; per-store overrides can be added later via
 *    Store.shippingNote or similar.
 *    TODO(shipping): per-store override copy once the schema gains a
 *    `shippingPolicy` / `shippingNote` field on Store.
 */

import { MessageSquare, Truck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface ProductDetailTabsProduct {
  description: string;
  /** Free-form key/value spec sheet (e.g. {"Material": "Cotton"}). */
  attributes: Record<string, string>;
}

export interface ProductDetailTabsStore {
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

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="h-10 w-full justify-start gap-2 overflow-x-auto rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="description"
          className="data-active:border-primary data-active:text-foreground rounded-none border-b-2 border-transparent px-4 pb-2 text-sm"
        >
          รายละเอียด
        </TabsTrigger>
        <TabsTrigger
          value="specifications"
          className="data-active:border-primary data-active:text-foreground rounded-none border-b-2 border-transparent px-4 pb-2 text-sm"
        >
          ข้อมูลจำเพาะ
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="data-active:border-primary data-active:text-foreground rounded-none border-b-2 border-transparent px-4 pb-2 text-sm"
        >
          รีวิว
        </TabsTrigger>
        <TabsTrigger
          value="shipping"
          className="data-active:border-primary data-active:text-foreground rounded-none border-b-2 border-transparent px-4 pb-2 text-sm"
        >
          การจัดส่ง
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="pt-4">
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {product.description.trim() || 'ไม่มีรายละเอียดสินค้า'}
          </p>
        </div>
      </TabsContent>

      <TabsContent value="specifications" className="pt-4">
        {hasSpecs ? (
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
        ) : (
          <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลจำเพาะ</p>
        )}
      </TabsContent>

      <TabsContent value="reviews" className="pt-4">
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">ยังไม่มี reviews</p>
          <p className="text-xs text-muted-foreground">
            เป็นคนแรกที่รีวิวสินค้านี้หลังการสั่งซื้อ
          </p>
        </div>
      </TabsContent>

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
