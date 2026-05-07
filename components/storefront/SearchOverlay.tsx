"use client";

/**
 * Search overlay — full-screen on mobile, top-anchored modal on desktop.
 * Pattern matches Tailwind UI Plus "Quick Search" with live results.
 *
 * Behavior:
 *   - Open: search icon in nav (or Cmd/Ctrl-K)
 *   - Close: Escape key, backdrop click, or X button
 *   - Type: 300ms debounce, hits /api/stores/[slug]/search
 *   - Results: 10 items max with image + title + category + price
 *   - "Enter" or "ดูทั้งหมด" link → /stores/[slug]/search?q=[query]
 *   - Recent searches stored in localStorage per store
 *   - Empty state: ค้นหายอดนิยม (top categories) when no query yet
 *
 * Theme cascade through var(--shop-*) so the overlay adopts each
 * store's design family colors.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, Clock } from "lucide-react";
import { formatTHB } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  priceTHB: number;
  imageUrl: string | null;
  categoryName: string | null;
}

interface Props {
  storeSlug: string;
  open: boolean;
  onClose: () => void;
}

const RECENT_KEY = (slug: string) => `shop-recent-search-${slug}`;
const MAX_RECENT = 5;

export function SearchOverlay({ storeSlug, open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(RECENT_KEY(storeSlug));
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      /* ignore corrupt */
    }
  }, [storeSlug]);

  // Auto-focus input when overlay opens; close on Escape
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Debounced search — 300ms
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      setTotalMatches(0);
      return;
    }
    setLoading(true);
    const ac = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/stores/${storeSlug}/search?q=${encodeURIComponent(q)}&limit=10`,
          { signal: ac.signal },
        );
        if (!res.ok) return;
        const data = await res.json();
        setResults(data.products ?? []);
        setTotalMatches(data.totalMatches ?? 0);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          /* network — silently empty */
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [query, storeSlug, open]);

  // Save query to recent on result click
  function commitToRecent(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recent.filter((r) => r !== trimmed)].slice(
      0,
      MAX_RECENT,
    );
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY(storeSlug), JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  }

  function clearRecent() {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY(storeSlug));
    } catch {
      /* ignore */
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="ค้นหาสินค้า"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="ปิด"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Panel */}
      <div
        className="relative mt-0 sm:mt-16 w-full sm:max-w-2xl mx-auto bg-[var(--shop-card)] sm:rounded-2xl shadow-2xl ring-1 overflow-hidden flex flex-col max-h-[100vh] sm:max-h-[80vh]"
        style={{
          // ring color via boxShadow trick because Tailwind's ring uses CSS vars
          boxShadow:
            "0 0 0 1px var(--shop-border), 0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
      >
        {/* Search input row — wrapped in form so Enter navigates to /search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = query.trim();
            if (!q) return;
            commitToRecent(q);
            router.push(
              `/stores/${storeSlug}/search?q=${encodeURIComponent(q)}`,
            );
            onClose();
          }}
          className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b"
          style={{ borderColor: "var(--shop-border)" }}
        >
          <Search
            className="h-5 w-5 shrink-0"
            style={{ color: "var(--shop-ink-muted)" }}
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            autoComplete="off"
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: "var(--shop-ink)" }}
          />
          {loading && (
            <span
              className="text-xs"
              style={{ color: "var(--shop-ink-muted)" }}
            >
              กำลังค้นหา...
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="shrink-0 p-1.5 rounded-md transition-opacity hover:opacity-70"
            style={{ color: "var(--shop-ink-muted)" }}
          >
            <X className="h-5 w-5" />
          </button>
        </form>

        {/* Results body */}
        <div className="flex-1 overflow-y-auto">
          {query.trim().length < 1 ? (
            <RecentList
              recent={recent}
              onPick={(q) => setQuery(q)}
              onClear={clearRecent}
            />
          ) : results.length === 0 ? (
            !loading && (
              <div className="p-8 text-center">
                <p
                  className="text-sm"
                  style={{ color: "var(--shop-ink-muted)" }}
                >
                  ไม่พบสินค้าตรงกับ &ldquo;{query}&rdquo;
                </p>
                <p
                  className="text-xs mt-2"
                  style={{ color: "var(--shop-ink-muted)" }}
                >
                  ลองคำอื่น หรือดู{" "}
                  <Link
                    href={`/stores/${storeSlug}/category`}
                    onClick={onClose}
                    className="underline"
                    style={{ color: "var(--shop-primary)" }}
                  >
                    สินค้าทั้งหมด
                  </Link>
                </p>
              </div>
            )
          ) : (
            <ul>
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/stores/${storeSlug}/products/${p.id}`}
                    onClick={() => {
                      commitToRecent(query);
                      onClose();
                    }}
                    className="flex items-center gap-3 px-4 sm:px-5 py-3 transition-colors hover:bg-[color-mix(in_srgb,var(--shop-primary)_6%,transparent)]"
                  >
                    <div
                      className="h-12 w-12 shrink-0 rounded-md overflow-hidden"
                      style={{ background: "var(--shop-bg)" }}
                    >
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.title}
                          width={48}
                          height={48}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm truncate font-medium"
                        style={{ color: "var(--shop-ink)" }}
                      >
                        {p.title}
                      </div>
                      {p.categoryName && (
                        <div
                          className="text-xs mt-0.5 truncate"
                          style={{ color: "var(--shop-ink-muted)" }}
                        >
                          {p.categoryName}
                        </div>
                      )}
                    </div>
                    <div
                      className="text-sm font-semibold whitespace-nowrap shrink-0"
                      style={{ color: "var(--shop-ink)" }}
                    >
                      {formatTHB(p.priceTHB)}
                    </div>
                  </Link>
                </li>
              ))}

              {totalMatches > results.length && (
                <li
                  className="border-t"
                  style={{ borderColor: "var(--shop-border)" }}
                >
                  <Link
                    href={`/stores/${storeSlug}/search?q=${encodeURIComponent(query)}`}
                    onClick={() => {
                      commitToRecent(query);
                      onClose();
                    }}
                    className="block px-4 sm:px-5 py-3 text-sm font-medium text-center hover:underline"
                    style={{ color: "var(--shop-primary)" }}
                  >
                    ดูทั้งหมด {totalMatches.toLocaleString()} รายการ →
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Hint footer (desktop) */}
        <div
          className="hidden sm:flex items-center justify-end gap-3 px-5 py-2 text-xs border-t"
          style={{
            borderColor: "var(--shop-border)",
            color: "var(--shop-ink-muted)",
          }}
        >
          <span>
            กด{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--shop-bg)] font-mono text-[10px]">
              Enter
            </kbd>{" "}
            เพื่อดูทั้งหมด ·{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--shop-bg)] font-mono text-[10px]">
              Esc
            </kbd>{" "}
            เพื่อปิด
          </span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Recent searches list (shown when query is empty)
 * ────────────────────────────────────────────────────────────── */
function RecentList({
  recent,
  onPick,
  onClear,
}: {
  recent: string[];
  onPick: (q: string) => void;
  onClear: () => void;
}) {
  if (recent.length === 0) {
    return (
      <div className="p-8 text-center">
        <p
          className="text-sm"
          style={{ color: "var(--shop-ink-muted)" }}
        >
          ค้นหาสินค้าที่ต้องการในร้านนี้
        </p>
        <p
          className="text-xs mt-2"
          style={{ color: "var(--shop-ink-muted)" }}
        >
          ลองพิมพ์ชื่อ หมวดหมู่ หรือคำในรายละเอียด
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-4 sm:px-5 py-2">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--shop-ink-muted)" }}
        >
          ค้นหาล่าสุด
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs hover:underline"
          style={{ color: "var(--shop-ink-muted)" }}
        >
          ล้าง
        </button>
      </div>
      <ul>
        {recent.map((q, i) => (
          <li key={`${q}-${i}`}>
            <button
              type="button"
              onClick={() => onPick(q)}
              className="w-full flex items-center gap-3 px-4 sm:px-5 py-2.5 text-left text-sm transition-colors hover:bg-[color-mix(in_srgb,var(--shop-primary)_6%,transparent)]"
              style={{ color: "var(--shop-ink)" }}
            >
              <Clock
                className="h-4 w-4 shrink-0"
                style={{ color: "var(--shop-ink-muted)" }}
              />
              <span className="truncate flex-1">{q}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
