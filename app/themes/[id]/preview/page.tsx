/**
 * /themes/[id]/preview — fullscreen salepage preview with demo data.
 * Sits outside the (marketplace) route group so the marketplace
 * header/footer don't wrap the salepage.
 */
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSalepageTemplate } from '@/lib/salepages/registry';
import { DEMO_SALEPAGE } from '@/lib/salepages/demo-data';
import { PreviewBar } from './preview-bar';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const t = getSalepageTemplate(id);
  return {
    title: t ? `Preview · ${t.name}` : 'Preview not found',
    description: t?.description,
  };
}

export default async function SalepagePreviewPage({ params }: Params) {
  const { id } = await params;
  const t = getSalepageTemplate(id);
  if (!t || !t.component) notFound();
  const Salepage = t.component;
  return (
    <PreviewBar
      templateId={t.id}
      templateName={t.name}
      accentColor={t.accentColor}
    >
      <Salepage data={DEMO_SALEPAGE} />
    </PreviewBar>
  );
}
