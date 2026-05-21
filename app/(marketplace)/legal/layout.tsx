import { ContentLayout } from '@/components/content/content-layout';

// Chrome (header/footer + theme) comes from app/(marketplace)/layout.tsx now
// that legal lives inside the (marketplace) route group.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <ContentLayout kind="legal">{children}</ContentLayout>;
}
