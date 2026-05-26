"use client";

/**
 * Inline hide/unhide button for the admin reviews moderation table.
 * Calls PATCH /api/admin/reviews/[id] then router.refresh() so the
 * surrounding server-component list re-renders with the new state.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
  reviewId: string;
  hidden: boolean;
}

export function ReviewRowActions({ reviewId, hidden }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: hidden ? "unhide" : "hide" }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.error ?? "ทำรายการไม่สำเร็จ");
        setBusy(false);
        return;
      }
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("ทำรายการไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  const loading = busy || pending;

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handle}
        disabled={loading}
        className={
          hidden
            ? "inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-semibold hover:bg-muted disabled:opacity-50"
            : "inline-flex items-center gap-1 rounded-md bg-destructive px-2.5 py-1 text-xs font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
        }
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        {hidden ? "ยกเลิกซ่อน" : "ซ่อน"}
      </button>
      {error ? (
        <span className="text-[10px] text-destructive">{error}</span>
      ) : null}
    </div>
  );
}
