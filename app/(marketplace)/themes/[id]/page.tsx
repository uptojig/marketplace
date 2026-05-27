/**
 * /themes/[id] — detail page for a single salepage template. Big
 * description, sample screenshot, and the two CTAs (Live Preview +
 * Use This Template). Use button is wired but the install flow lands
 * in Phase 2 — currently routes to /signup with the template id as
 * a query param so we can pick it up after they create an account.
 *
 * Server entrypoint owns params + 404 + data lookup; the interactive
 * view lives in `./_components/detail-view.tsx` (client) because the
 * "ใช้เทมเพลตนี้" Link uses an onClick handler and event handlers
 * cannot be passed through a Server Component boundary.
 */
import { notFound } from 'next/navigation';
import { getSalepageTemplate } from '@/lib/salepages/registry';
import { ThemeDetailView } from './_components/detail-view';

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ThemeDetailPage({ params }: Params) {
  const { id } = await params;
  const t = getSalepageTemplate(id);
  if (!t) notFound();

  return <ThemeDetailView template={t} />;
}
