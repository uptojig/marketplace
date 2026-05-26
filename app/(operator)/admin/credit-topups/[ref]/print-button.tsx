"use client";

import { Printer } from "lucide-react";

export function PrintEvidenceButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
    >
      <Printer className="h-4 w-4" />
      Export Dispute Evidence
    </button>
  );
}
