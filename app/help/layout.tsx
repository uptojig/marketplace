import { ContentLayout } from '@/components/content/content-layout';
import { MarketplacePage } from '@/components/layout/marketplace-page';

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketplacePage>
      <ContentLayout kind="help">{children}</ContentLayout>
    </MarketplacePage>
  );
}
