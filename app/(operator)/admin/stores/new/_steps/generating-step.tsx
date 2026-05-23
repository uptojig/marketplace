"use client";

/**
 * GeneratingStep — terminal state of the new-store wizard.
 *
 * Displays a spinner + the latest NDJSON status line streamed back from
 * `POST /api/admin/stores/[id]/generate-landing`. Mirrors the visual
 * language of Phase D's `_landing/status-card.tsx` but is duplicated
 * here intentionally so the new-store wizard never has to import from
 * a stage-D sibling (no cross-stage dep).
 *
 * The created storeId is rendered as an escape-hatch link in case the
 * landing stream errors out mid-flight — the operator can still open
 * the store and inspect / retry from the edit page.
 */

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type GeneratingStepProps = {
  statusText: string | null;
  createdStoreId: string | null;
};

export function GeneratingStep({
  statusText,
  createdStoreId,
}: GeneratingStepProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-md border border-amber-200 bg-amber-50 px-6 py-8 text-center"
    >
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600" aria-hidden="true" />
      <p className="mt-4 text-sm font-medium text-amber-900">
        {statusText ?? "กำลังประมวลผล..."}
      </p>
      {createdStoreId && (
        <>
          <p className="mt-2 text-xs text-amber-700">
            ร้านถูกสร้างแล้ว — กำลังออกแบบหน้าเว็บ...
          </p>
          <p className="mt-3 text-xs">
            <Link
              href={`/admin/stores/${createdStoreId}`}
              className="text-amber-800 underline hover:text-amber-900"
            >
              เปิดหน้าจัดการร้าน →
            </Link>
          </p>
        </>
      )}
      <p className="mt-4 text-xs text-stone-500">
        สามารถเปิดหน้าอื่นได้เลย — ระบบจะออกแบบเสร็จในเบื้องหลัง
      </p>
    </div>
  );
}
