import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BlockProps } from '@/lib/templates/renderer';
import type { PricingTier } from '@/lib/templates/types';

export function PricingTierBlock({ block, store }: BlockProps) {
  if (block.variant !== 'table') return null;

  const product = store.products.find((p) => p.pricingTiers?.length) ?? store.products[0];
  if (!product) return null;

  // Fallback demo tiers (derive from base price)
  const tiers: PricingTier[] = product.pricingTiers ?? [
    { minQuantity: 1, pricePerUnit: product.price },
    { minQuantity: 10, pricePerUnit: Math.round(product.price * 0.9) },
    { minQuantity: 50, pricePerUnit: Math.round(product.price * 0.8) },
    { minQuantity: 100, pricePerUnit: Math.round(product.price * 0.7) },
  ];

  return (
    <div className="p-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Wholesale pricing</h2>
            <Badge variant="secondary">MOQ: {tiers[0].minQuantity}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-y bg-muted/30 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Quantity</th>
                <th className="px-4 py-2 text-right font-medium">Price / unit</th>
                <th className="px-4 py-2 text-right font-medium">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tiers.map((t, i) => {
                const savings =
                  i === 0 ? 0 : Math.round((1 - t.pricePerUnit / tiers[0].pricePerUnit) * 100);
                return (
                  <tr key={t.minQuantity}>
                    <td className="px-4 py-2.5">{t.minQuantity}+ units</td>
                    <td className="px-4 py-2.5 text-right font-semibold">
                      ฿{t.pricePerUnit.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs">
                      {savings > 0 ? <span className="text-green-600">−{savings}%</span> : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
