import { CheckoutSteps } from '@/components/checkout/checkout-steps';
import { MarketplacePage } from '@/components/layout/marketplace-page';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketplacePage>
      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
        <CheckoutSteps />
        <div className="mt-6">{children}</div>
      </div>
    </MarketplacePage>
  );
}
