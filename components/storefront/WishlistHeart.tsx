"use client";

/**
 * Heart icon that toggles a product's membership in the buyer's wishlist.
 *
 * Mount anywhere a PDP / catalog card wants a save-for-later button.
 * Hydrates from /api/wishlist/check on mount; click POSTs/DELETEs.
 * Guests see an unfilled heart and a sign-in nudge when they click.
 */
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface WishlistHeartProps {
  productId: string;
  /** Optional CSS class for the wrapping <button>. */
  className?: string;
  /** Optional label after the icon ("เพิ่มในรายการโปรด"). */
  showLabel?: boolean;
  /** Optional return-to URL after sign-in. Defaults to the current page. */
  signInCallbackUrl?: string;
}

export function WishlistHeart({
  productId,
  className,
  showLabel = false,
  signInCallbackUrl,
}: WishlistHeartProps) {
  const router = useRouter();
  const [saved, setSaved] = useState<boolean | null>(null);
  const [guest, setGuest] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/wishlist/check?productId=${encodeURIComponent(productId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setSaved(Boolean(data.in));
        setGuest(Boolean(data.guest));
      })
      .catch(() => {
        if (!cancelled) setSaved(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function handleClick() {
    if (guest) {
      const callback = signInCallbackUrl
        ?? (typeof window !== "undefined" ? window.location.pathname : "/");
      router.push(`/signin?callbackUrl=${encodeURIComponent(callback)}`);
      return;
    }
    if (busy || saved === null) return;
    setBusy(true);
    const next = !saved;
    setSaved(next);
    try {
      if (next) {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      } else {
        await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, {
          method: "DELETE",
        });
      }
    } catch {
      // Optimistic state already flipped; if the call fails we revert.
      setSaved(!next);
    } finally {
      setBusy(false);
    }
  }

  const filled = saved === true;
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={filled ? "ลบจากรายการโปรด" : "บันทึกเป็นรายการโปรด"}
      aria-pressed={filled}
      disabled={busy}
      className={
        className
        ?? "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition-colors hover:bg-zinc-50 disabled:opacity-60"
      }
      style={{ color: filled ? "#dc2626" : "var(--shop-ink, #1f2937)" }}
    >
      <Heart
        className="h-4 w-4"
        fill={filled ? "#dc2626" : "none"}
        strokeWidth={2}
      />
      {showLabel ? (
        <span>{filled ? "อยู่ในรายการโปรด" : "บันทึกไว้ดูทีหลัง"}</span>
      ) : null}
    </button>
  );
}
