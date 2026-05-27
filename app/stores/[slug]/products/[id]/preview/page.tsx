/**
 * /stores/[slug]/products/[id]/preview — fullscreen live-demo preview
 * for SalepageMarket templates (and any product whose
 * `externalPayload.demoUrl` is set). Renders an iframe of the
 * demoUrl at viewport size with a thin top bar (back link, device
 * toggle, buy CTA).
 *
 * NB: This route inherits `app/stores/[slug]/layout.tsx` so the
 * storefront header/footer would normally wrap the page. To get a
 * true full-viewport feel without restructuring routing, the client
 * `PreviewShell` below positions itself `fixed inset-0 z-[9999]` so
 * the storefront chrome is hidden behind it.
 */
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PreviewShell } from './preview-shell';

export const dynamic = 'force-dynamic';

interface Params {
  params: { slug: string; id: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { titleTh: true, title: true },
  });
  return {
    title: product
      ? `พรีวิว · ${product.titleTh ?? product.title}`
      : 'พรีวิวเทมเพลต',
  };
}

function extractDemoUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;
  if (typeof p.demoUrl === 'string' && p.demoUrl.trim()) return p.demoUrl.trim();
  return null;
}

export default async function ProductPreviewPage({ params }: Params) {
  const product = await prisma.product.findFirst({
    where: { id: params.id, store: { slug: params.slug } },
    include: { store: true },
  });
  if (!product) notFound();

  const demoUrl = extractDemoUrl(product.externalPayload);
  if (!demoUrl) notFound();

  return (
    <PreviewShell
      demoUrl={demoUrl}
      productId={product.id}
      productTitle={product.titleTh ?? product.title}
      storeSlug={product.store.slug}
      storeName={product.store.name}
    />
  );
}
