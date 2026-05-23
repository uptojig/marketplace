"use client";

/**
 * <OperatorPageHeader>
 *
 * Phase A primitive — consistent top-of-page header for operator/admin
 * detail pages. Slots:
 *   • backHref / backLabel — left rail (default "ย้อนกลับ")
 *   • title / titleNode    — main heading (titleNode wins for custom JSX
 *                            like rendered logos)
 *   • subtitle             — secondary line beneath the title
 *   • actions              — right-aligned action buttons / links
 *   • meta                 — pill row below the subtitle for status
 *                            badges (approval status, kpi chips, etc.)
 *
 * The actions slot is what the page reposition step uses to host the
 * approval-status badge + change-approval dropdown so the approval panel
 * doesn't eat 240px of vertical real estate above the form.
 */

import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

export type OperatorPageHeaderProps = {
  backHref?: string;
  backLabel?: string;
  title?: string;
  titleNode?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
};

export function OperatorPageHeader({
  backHref,
  backLabel = "ย้อนกลับ",
  title,
  titleNode,
  subtitle,
  actions,
  meta,
  className,
}: OperatorPageHeaderProps) {
  return (
    <header className={cn("space-y-2", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {titleNode ?? (
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          )}
          {subtitle && (
            <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
          )}
          {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
