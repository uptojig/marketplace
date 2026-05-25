"use client";

/**
 * Column definitions for the /admin/stores OperatorDataTable.
 *
 * Separated from the page so the Tanstack ColumnDef array stays
 * readable. Each row receives a fully-resolved StoreRow from the
 * server component — including the per-store quality snapshot — so
 * cells never have to await anything.
 *
 * Visibility defaults set in `defaultColumnVisibility` on the page
 * level (the user can override per-session via the columns toggle in
 * the OperatorDataTable toolbar).
 */

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Image as ImageIcon,
  Languages,
  FolderTree,
} from "lucide-react";
import type { StoreApprovalStatus } from "@prisma/client";

import { createSelectionColumn } from "@/components/operator/operator-data-table";

import { ApprovalBadge, QualityPill } from "./_cells";
import { StoreRowActions } from "./row-actions";

export interface StoreRow {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  customDomain: string | null;
  createdAt: Date;
  approvalStatus: StoreApprovalStatus;
  approvalNote: string | null;
  landingThemeVariant: string | null;
  hasLandingContent: boolean;
  owner: { email: string | null; name: string | null };
  productCount: number;
  quality: {
    total: number;
    translated: number;
    categorized: number;
    lowImage: number;
  } | null;
}

const dateFmt = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "2-digit",
});

export function storeColumns(): ColumnDef<StoreRow>[] {
  return [
    createSelectionColumn<StoreRow>(),
    {
      id: "name",
      accessorKey: "name",
      header: "ร้าน",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <Link
            href={`/admin/stores/${s.id}`}
            className="flex items-center gap-3 hover:opacity-80"
          >
            {s.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.logoUrl}
                alt={s.name}
                className="h-8 w-8 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border bg-muted text-xs font-bold text-muted-foreground">
                {s.name[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{s.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                /{s.slug}
              </p>
            </div>
          </Link>
        );
      },
      enableHiding: false,
    },
    {
      id: "approvalStatus",
      accessorKey: "approvalStatus",
      header: "สถานะ",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="space-y-1">
            <ApprovalBadge status={s.approvalStatus} />
            {s.approvalNote && (
              <p className="line-clamp-2 max-w-[180px] text-[11px] text-muted-foreground">
                {s.approvalNote}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: "owner",
      header: "เจ้าของ",
      cell: ({ row }) => {
        const o = row.original.owner;
        return (
          <div className="min-w-0 text-xs">
            <p className="truncate font-medium text-foreground">
              {o.name ?? "—"}
            </p>
            <p className="truncate text-muted-foreground">{o.email ?? "—"}</p>
          </div>
        );
      },
    },
    {
      id: "productCount",
      accessorKey: "productCount",
      header: () => <span className="block text-center">สินค้า</span>,
      cell: ({ row }) => (
        <p className="text-center font-medium tabular-nums">
          {row.original.productCount}
        </p>
      ),
      sortingFn: (a, b) => a.original.productCount - b.original.productCount,
    },
    {
      id: "quality",
      header: "คุณภาพข้อมูล",
      cell: ({ row }) => {
        const q = row.original.quality;
        if (!q || q.total === 0) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            <QualityPill
              icon={Languages}
              label="แปลไทย"
              done={q.translated}
              total={q.total}
            />
            <QualityPill
              icon={FolderTree}
              label="Category"
              done={q.categorized}
              total={q.total}
            />
            <QualityPill
              icon={ImageIcon}
              label="รูปน้อย"
              done={q.lowImage}
              total={q.total}
              invertColors
            />
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "domain",
      header: "โดเมน",
      cell: ({ row }) => {
        const d = row.original.customDomain;
        return d ? (
          <code className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold text-foreground">
            {d}
          </code>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
      enableSorting: false,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "สร้างเมื่อ",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {dateFmt.format(row.original.createdAt)}
        </span>
      ),
      sortingFn: (a, b) =>
        a.original.createdAt.getTime() - b.original.createdAt.getTime(),
    },
    {
      id: "actions",
      header: () => <span className="block text-right">จัดการ</span>,
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex justify-end">
            <StoreRowActions
              storeId={s.id}
              storeSlug={s.slug}
              storeName={s.name}
              approvalStatus={s.approvalStatus}
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
