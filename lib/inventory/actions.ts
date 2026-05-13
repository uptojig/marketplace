"use server";

// Atomic inventory lifecycle: lock → consume / release.
//
// lock: ADD qty to stockReserved IF (stockTotal - stockReserved) >= qty.
//       Atomic via a single UPDATE-WHERE in Postgres — race-free even
//       under concurrent checkout.
// consume: payment succeeded → decrement BOTH stockTotal and stockReserved.
// release: payment failed / order cancelled → decrement stockReserved
//          (never below zero).
//
// Prisma doesn't expose increment-with-predicate as a typed helper, so
// we use $executeRawUnsafe with parameterized values. The schema's
// columns are all numeric so SQL injection surface is nil; we still
// $1/$2 the values to be safe.

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface InventoryRequest {
  productId: string;
  variantId?: string;
  qty: number;
}

export interface InventoryLockResult {
  ok: boolean;
  failed: Array<{
    productId: string;
    variantId?: string;
    reason: "out_of_stock" | "not_found";
  }>;
}

type Client = Prisma.TransactionClient | typeof prisma;

export async function lockInventory(
  requests: InventoryRequest[],
  tx: Client = prisma,
): Promise<InventoryLockResult> {
  const failed: InventoryLockResult["failed"] = [];

  for (const req of requests) {
    if (req.variantId) {
      const updated = await tx.$executeRawUnsafe<number>(
        `UPDATE "ProductVariant"
         SET "stockReserved" = "stockReserved" + $1
         WHERE id = $2 AND ("stockTotal" - "stockReserved") >= $1`,
        req.qty,
        req.variantId,
      );
      if (updated === 0) {
        failed.push({
          productId: req.productId,
          variantId: req.variantId,
          reason: "out_of_stock",
        });
      }
    } else {
      const updated = await tx.$executeRawUnsafe<number>(
        `UPDATE "Product"
         SET "stockReserved" = "stockReserved" + $1
         WHERE id = $2 AND ("stockTotal" - "stockReserved") >= $1`,
        req.qty,
        req.productId,
      );
      if (updated === 0) {
        failed.push({ productId: req.productId, reason: "out_of_stock" });
      }
    }
  }

  return { ok: failed.length === 0, failed };
}

export async function releaseInventory(
  requests: InventoryRequest[],
  tx: Client = prisma,
): Promise<void> {
  for (const req of requests) {
    if (req.variantId) {
      await tx.$executeRawUnsafe(
        `UPDATE "ProductVariant"
         SET "stockReserved" = GREATEST(0, "stockReserved" - $1)
         WHERE id = $2`,
        req.qty,
        req.variantId,
      );
    } else {
      await tx.$executeRawUnsafe(
        `UPDATE "Product"
         SET "stockReserved" = GREATEST(0, "stockReserved" - $1)
         WHERE id = $2`,
        req.qty,
        req.productId,
      );
    }
  }
}

export async function consumeInventory(
  requests: InventoryRequest[],
  tx: Client = prisma,
): Promise<void> {
  for (const req of requests) {
    if (req.variantId) {
      await tx.$executeRawUnsafe(
        `UPDATE "ProductVariant"
         SET "stockTotal" = "stockTotal" - $1,
             "stockReserved" = GREATEST(0, "stockReserved" - $1)
         WHERE id = $2`,
        req.qty,
        req.variantId,
      );
    } else {
      await tx.$executeRawUnsafe(
        `UPDATE "Product"
         SET "stockTotal" = "stockTotal" - $1,
             "stockReserved" = GREATEST(0, "stockReserved" - $1)
         WHERE id = $2`,
        req.qty,
        req.productId,
      );
    }
  }
}
