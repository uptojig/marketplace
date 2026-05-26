/**
 * Read-only helpers around CreditBalance.
 *
 * A buyer's balance is scoped to a (userId, storeId) pair — see the
 * schema comment on CreditBalance for why. Callers that need a numeric
 * THB value should use `getBalanceTHB`; callers that need to display
 * the underlying row (for ledger UIs) should use `getBalanceRow`.
 */
import { prisma } from "@/lib/prisma";

export interface BalanceLookup {
  userId: string;
  storeId: string;
}

/** Returns the current balance in THB, or 0 if no row exists yet. */
export async function getBalanceTHB(input: BalanceLookup): Promise<number> {
  const row = await prisma.creditBalance.findUnique({
    where: { userId_storeId: { userId: input.userId, storeId: input.storeId } },
    select: { balanceTHB: true },
  });
  return row ? Number(row.balanceTHB) : 0;
}

/** Returns the row (or null when the user has never topped up at this
 *  store). Used by admin/ledger surfaces that want the row id. */
export async function getBalanceRow(input: BalanceLookup) {
  return prisma.creditBalance.findUnique({
    where: { userId_storeId: { userId: input.userId, storeId: input.storeId } },
  });
}

/** Returns the most-recent N ledger entries for a (user, store)
 *  balance, joined with order/topup ids so the UI can deep-link. */
export async function listLedger(
  input: BalanceLookup & { limit?: number },
) {
  const balance = await prisma.creditBalance.findUnique({
    where: { userId_storeId: { userId: input.userId, storeId: input.storeId } },
    select: { id: true },
  });
  if (!balance) return [];
  return prisma.creditLedger.findMany({
    where: { balanceId: balance.id },
    orderBy: { createdAt: "desc" },
    take: input.limit ?? 50,
  });
}
