import { ContentLayout } from '@/components/content/content-layout';

// Chrome (header/footer + theme) comes from app/(marketplace)/layout.tsx now
// that help lives inside the (marketplace) route group.
export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <ContentLayout kind="help">{children}</ContentLayout>;
}
