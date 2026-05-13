import { ContentLayout } from '@/components/content/content-layout';
import { MarketplacePage } from '@/components/layout/marketplace-page';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketplacePage>
      <ContentLayout kind="legal">{children}</ContentLayout>
    </MarketplacePage>
  );
}
