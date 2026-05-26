/**
 * /stores/[slug]/account/credit — buyer's per-store credit wallet.
 *
 * Server shell handles auth + initial data fetch. The CreditClient
 * child runs the top-up form, ledger UI, and the post-redirect poll
 * triggered by ?topup=<id> when the buyer returns from AnyPay.
 */
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getBalanceTHB, listLedger } from '@/lib/credit/balance';
import { CreditClient } from './credit-client';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return { title: `เครดิตร้าน — ${params.slug}` };
}

export default async function CreditPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { topup?: string };
}) {
  const session = await getServerSession(authOptions);
  const callbackUrl = `/stores/${params.slug}/account/credit`;
  if (!session?.user?.email) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const [user, store] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    }),
    prisma.store.findUnique({
      where: { slug: params.slug },
      select: { id: true, slug: true, name: true },
    }),
  ]);

  if (!user) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  if (!store) {
    redirect(`/stores/${params.slug}`);
  }

  const [balanceTHB, ledgerRows] = await Promise.all([
    getBalanceTHB({ userId: user.id, storeId: store.id }),
    listLedger({ userId: user.id, storeId: store.id, limit: 20 }),
  ]);

  // Hydrate topup reference numbers so the ledger UI can link to
  // /receipts/<ref> without a client round-trip.
  const topupIds = ledgerRows
    .map((e) => e.topupId)
    .filter((id): id is string => Boolean(id));
  const topupRefs = topupIds.length
    ? await prisma.creditTopup.findMany({
        where: { id: { in: topupIds } },
        select: { id: true, referenceNumber: true },
      })
    : [];
  const refByTopupId = new Map(
    topupRefs.map((t) => [t.id, t.referenceNumber] as const),
  );

  const initialLedger = ledgerRows.map((e) => ({
    id: e.id,
    type: e.type as 'TOPUP' | 'SPEND' | 'REFUND' | 'ADJUST',
    amountTHB: Number(e.amountTHB),
    balanceAfterTHB: Number(e.balanceAfter),
    orderId: e.orderId,
    topupId: e.topupId,
    topupRef: e.topupId ? (refByTopupId.get(e.topupId) ?? null) : null,
    note: e.note,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <CreditClient
      storeSlug={store.slug}
      storeName={store.name}
      initialBalanceTHB={balanceTHB}
      initialLedger={initialLedger}
      pendingTopupId={searchParams.topup ?? null}
    />
  );
}
