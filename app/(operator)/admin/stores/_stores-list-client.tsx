"use client";

/**
 * Client wrapper that owns the OperatorDataTable + bulk-actions for
 * /admin/stores. The server component (page.tsx) does all the DB work
 * and hands a serializable StoreRow[] down — this component only
 * mediates UI state (selection, search input, column visibility).
 *
 * The OperatorDataTable handles its own selection state internally
 * and surfaces it through the `bulkActions` render prop, so we don't
 * need a separate selection container here.
 */

import * as React from "react";
import { OperatorDataTable } from "@/components/operator/operator-data-table";

import { storeColumns, type StoreRow } from "./_columns";
import { BulkActions } from "./_bulk-actions";
import { StoreFilterPopovers, ActiveFilterChips } from "./_toolbar";

interface Props {
  stores: StoreRow[];
  emptyMessage: string;
}

export function StoresListClient({ stores, emptyMessage }: Props) {
  const columns = React.useMemo(() => storeColumns(), []);
  return (
    <div className="flex flex-col gap-3">
      <OperatorDataTable<StoreRow>
        columns={columns}
        data={stores}
        enableRowSelection
        searchKey="name"
        searchPlaceholder="ค้นหาชื่อร้าน..."
        filters={<StoreFilterPopovers />}
        emptyState={emptyMessage}
        bulkActions={(selected) => <BulkActions selected={selected} />}
        pageSize={50}
        defaultColumnVisibility={{
          domain: false,
          createdAt: false,
        }}
      />
      <ActiveFilterChips />
    </div>
  );
}
