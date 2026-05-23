"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
  Columns3Icon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table as ReactTable,
  type VisibilityState,
} from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ── Public API ──────────────────────────────────────────────────────────────
export interface OperatorDataTableProps<TData> {
  columns: ColumnDef<TData, any>[]
  /**
   * Pass `undefined` to render the skeleton-loading state. Pass `[]` to
   * render the empty state. Phase B-F pages should pass the resolved
   * (server-fetched) array.
   */
  data: TData[] | undefined
  // Selection
  enableRowSelection?: boolean
  onSelectionChange?: (selectedRows: TData[]) => void
  // Filters
  filters?: React.ReactNode
  searchKey?: string
  searchPlaceholder?: string
  // Pagination
  pageSize?: number
  // Empty state
  emptyState?: React.ReactNode
  // Toolbar slots
  toolbarLeft?: React.ReactNode
  toolbarRight?: React.ReactNode
  // Bulk actions (sticky bottom bar when rows selected)
  bulkActions?: (selectedRows: TData[]) => React.ReactNode
  // Optional: render-prop access to the underlying tanstack table instance
  // (mostly useful for Phase B-F integration tests / external "reset filters" CTAs).
  tableRef?: (table: ReactTable<TData>) => void
  // Style overrides
  className?: string
  // Default visibility state for columns (column id → visible boolean)
  defaultColumnVisibility?: VisibilityState
}

const DEFAULT_PAGE_SIZE = 20
const DEBOUNCE_MS = 300

// ── Selection column factory ────────────────────────────────────────────────
// Pages should prepend this to their column list when they want the table to
// render a selection checkbox column.
export function createSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: "__select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="เลือกทั้งหมด"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="เลือกแถวนี้"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 36,
  }
}

// ── Hook: debounce a primitive value ───────────────────────────────────────
function useDebounced<T>(value: T, delay = DEBOUNCE_MS): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ── Main component ─────────────────────────────────────────────────────────
export function OperatorDataTable<TData>({
  columns,
  data,
  enableRowSelection = false,
  onSelectionChange,
  filters,
  searchKey,
  searchPlaceholder = "ค้นหา...",
  pageSize = DEFAULT_PAGE_SIZE,
  emptyState,
  toolbarLeft,
  toolbarRight,
  bulkActions,
  tableRef,
  className,
  defaultColumnVisibility,
}: OperatorDataTableProps<TData>) {
  const isLoading = data === undefined
  const safeData = React.useMemo<TData[]>(() => data ?? [], [data])

  // Internal search input (uncontrolled UI, debounced into a column filter)
  const [searchInput, setSearchInput] = React.useState("")
  const debouncedSearch = useDebounced(searchInput, DEBOUNCE_MS)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(defaultColumnVisibility ?? {})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  const table = useReactTable<TData>({
    data: safeData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Expose the table instance to the parent (optional)
  React.useEffect(() => {
    tableRef?.(table)
  }, [table, tableRef])

  // Wire the debounced search input into the matching column's filter value.
  React.useEffect(() => {
    if (!searchKey) return
    table.getColumn(searchKey)?.setFilterValue(debouncedSearch || undefined)
  }, [debouncedSearch, searchKey, table])

  // Notify parent of selection changes — only when the underlying set
  // actually changes, never on every render.
  const selectedRowIdsKey = Object.keys(rowSelection).sort().join("|")
  React.useEffect(() => {
    if (!onSelectionChange) return
    const rows = table.getSelectedRowModel().rows.map((r) => r.original)
    onSelectionChange(rows)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRowIdsKey])

  const selectedCount = Object.keys(rowSelection).length
  const visibleColumnCount = table.getVisibleLeafColumns().length || 1
  const showEmptyState = !isLoading && table.getRowModel().rows.length === 0
  const hideableColumns = table
    .getAllLeafColumns()
    .filter((c) => c.getCanHide())

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {searchKey && (
            <div className="relative w-full sm:w-72">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8"
                aria-label={searchPlaceholder}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  aria-label="ล้างคำค้นหา"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded text-muted-foreground transition-colors hover:text-foreground"
                >
                  <XIcon className="size-4" />
                </button>
              )}
            </div>
          )}
          {filters}
          {toolbarLeft}
        </div>
        <div className="flex items-center gap-2">
          {toolbarRight}
          {hideableColumns.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns3Icon aria-hidden="true" />
                  <span className="max-sm:sr-only">คอลัมน์</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>แสดงคอลัมน์</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hideableColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize()
                          ? `${header.getSize()}px`
                          : undefined,
                      }}
                      className="px-3 text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="-mx-1 inline-flex items-center gap-1.5 rounded px-1 py-0.5 font-medium hover:text-foreground"
                          aria-label={`Sort by ${typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : header.id}`}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {sorted === "asc" ? (
                            <ChevronUpIcon
                              className="size-3.5 opacity-70"
                              aria-hidden="true"
                            />
                          ) : sorted === "desc" ? (
                            <ChevronDownIcon
                              className="size-3.5 opacity-70"
                              aria-hidden="true"
                            />
                          ) : (
                            <ChevronsUpDownIcon
                              className="size-3.5 opacity-40"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`}>
                  {Array.from({ length: visibleColumnCount }).map((__, c) => (
                    <TableCell key={c} className="px-3 py-3">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : showEmptyState ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnCount}
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyState ?? "ไม่พบรายการ"}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────────── */}
      {!isLoading && safeData.length > 0 && (
        <div className="flex flex-col-reverse items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <span aria-live="polite">
            {selectedCount > 0 ? (
              <>
                เลือกแล้ว <span className="font-medium">{selectedCount}</span>{" "}
                จาก {table.getFilteredRowModel().rows.length} รายการ
              </>
            ) : (
              <>
                หน้า {table.getState().pagination.pageIndex + 1} จาก{" "}
                {table.getPageCount() || 1} (
                {table.getFilteredRowModel().rows.length} รายการ)
              </>
            )}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="หน้าก่อนหน้า"
            >
              <ChevronLeftIcon aria-hidden="true" />
              <span className="max-sm:sr-only">ก่อนหน้า</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="หน้าถัดไป"
            >
              <span className="max-sm:sr-only">ถัดไป</span>
              <ChevronRightIcon aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Sticky bulk-actions bar ──────────────────────────────────── */}
      {bulkActions && selectedCount > 0 && (
        <div
          role="region"
          aria-label="การจัดการแถวที่เลือก"
          className="sticky bottom-4 z-20 mx-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-xl bg-popover px-4 py-3 text-sm shadow-lg ring-1 ring-foreground/10 transition-all duration-150 ease-out"
        >
          <div className="flex items-center gap-3">
            <span className="font-medium">
              เลือก {selectedCount} รายการ
            </span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => table.resetRowSelection()}
            >
              ล้าง
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {bulkActions(
              table.getSelectedRowModel().rows.map((r) => r.original)
            )}
          </div>
        </div>
      )}
    </div>
  )
}
