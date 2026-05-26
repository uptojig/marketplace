/**
 * Atomic credit spend.
 *
 * `spendCredit` is the ONLY way to debit a CreditBalance. It uses a
 * conditional `updateMany` (`where: { balanceTHB: { gte: amount } }`)
 * so two concurrent purchases can never both succeed against the same
 * balance — the second one finds count=0 and surfaces InsufficientCredit.
 *
 * Caller (checkout) is responsible for marking the Order PAID afterwards
 * inside the same Prisma transaction so a crash between the two writes
 * doesn't burn credit without paying for the order.
 */
import { Prisma, type PrismaClient } from "@prisma/client";

export interface SpendCreditInput {
  userId: string;
  storeId: string;
  amountTHB: number;
  /** Order this spend settles — recorded on the ledger row. */
  orderId: string;
  note?: string;
}

export class InsufficientCreditError extends Error {
  readonly name = "InsufficientCreditError";
  constructor(public required: number, public available: number) {
    super(
      `Insufficient credit — need ${required} THB, have ${available} THB`,
    );
  }
}

/**
 * Must be called inside an outer `prisma.$transaction` — pass the `tx`
 * client so the spend + the Order PAID transition commit atomically.
 *
 * Throws InsufficientCreditError when the balance is too low (or the
 * row doesn't exist yet). Returns the new balance on success.
 */
export async function spendCredit(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$transaction" | "$on" | "$use" | "$extends">,
  input: SpendCreditInput,
): Promise<{ balanceAfterTHB: number }> {
  if (!Number.isFinite(input.amountTHB) || input.amountTHB <= 0) {
    throw new Error("amountTHB must be positive");
  }
  const amount = new Prisma.Decimal(input.amountTHB);

  const existing = await tx.creditBalance.findUnique({
    where: {
      userId_storeId: { userId: input.userId, storeId: input.storeId },
    },
    select: { id: true, balanceTHB: true },
  });
  if (!existing) {
    throw new InsufficientCreditError(input.amountTHB, 0);
  }

  // Conditional decrement — only succeeds when the row still has
  // enough balance. Concurrent spends serialize through this WHERE
  // clause; the loser sees count=0 and bails out.
  const result = await tx.creditBalance.updateMany({
    where: {
      id: existing.id,
      balanceTHB: { gte: amount },
    },
    data: { balanceTHB: { decrement: amount } },
  });
  if (result.count === 0) {
    throw new InsufficientCreditError(
      input.amountTHB,
      Number(existing.balanceTHB),
    );
  }

  const after = await tx.creditBalance.findUniqueOrThrow({
    where: { id: existing.id },
    select: { balanceTHB: true },
  });

  await tx.creditLedger.create({
    data: {
      balanceId: existing.id,
      type: "SPEND",
      // Stored as negative — the sum of amountTHB across a balance's
      // ledger entries should always equal balanceTHB.
      amountTHB: amount.negated(),
      balanceAfter: after.balanceTHB,
      orderId: input.orderId,
      note: input.note ?? `Order ${input.orderId}`,
    },
  });

  return { balanceAfterTHB: Number(after.balanceTHB) };
}
