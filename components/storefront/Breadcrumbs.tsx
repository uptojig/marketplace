/**
 * Breadcrumbs — Tailwind UI Plus pattern
 *   หน้าแรก > หมวดหมู่ > {current}
 *
 * Hidden on mobile (saves space, replaced by sticky back link in
 * page chrome). Shows full path with chevron separators on tablet+.
 *
 * Last segment is rendered as plain text (current page, not clickable).
 */
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden sm:block mb-4"
    >
      <ol className="flex items-center gap-1.5 text-sm flex-wrap">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5"
                  style={{ color: "var(--shop-ink-muted)" }}
                  aria-hidden
                />
              )}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="font-medium truncate max-w-[16rem]"
                  style={{ color: "var(--shop-ink)" }}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:underline truncate max-w-[12rem]"
                  style={{ color: "var(--shop-ink-muted)" }}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
