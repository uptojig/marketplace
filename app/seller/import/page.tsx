'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  CheckSquare,
  ChevronDown,
  Filter,
  FolderPlus,
  Loader2,
  Package,
  Search,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MarketplacePage } from '@/components/layout/marketplace-page';
import { FilterSidebar } from '@/components/seller/import/filter-sidebar';
import { ActiveFilterChips } from '@/components/seller/import/active-filter-chips';
import { ViewModeToggle, type ViewMode } from '@/components/seller/import/view-mode-toggle';
import { CompactCard } from '@/components/seller/import/compact-card';
import { ListRow } from '@/components/seller/import/list-row';
import { ProductCard } from '@/components/seller/import/product-card';
import { AddToCollectionMenu } from '@/components/seller/import/add-to-collection-menu';
import { ENABLED_SOURCES } from '@/lib/import-sources';
import { useCollectionStore } from '@/lib/import-collections/store';
import type {
  AnnotatedSupplierProduct,
  ImportSource,
} from '@/lib/import-sources/types';
import { useFilterStore } from '@/lib/import-filters/store';
import { getActiveFilterCount } from '@/lib/import-filters/types';
import { createImportJob } from '@/lib/import-jobs/actions';

const PAGE_SIZE_BY_MODE: Record<ViewMode, number> = {
  grid: 30,
  compact: 60,
  list: 100,
};

export default function SellerImportPage() {
  const router = useRouter();
  const f = useFilterStore((s) => s.current);
  const setFilter = useFilterStore((s) => s.setFilter);
  const collectionCount = useCollectionStore((s) => s.collections.length);

  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [results, setResults] = useState<AnnotatedSupplierProduct[]>([]);
  const [totalCount, setTotalCount] = useState<number | undefined>();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [pending, startTransition] = useTransition();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleSearch = async () => {
    setSearching(true);
    setSelected(new Set());
    try {
      const res = await fetch('/api/import/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: f.source,
          keyword: f.keyword,
          minPrice: f.minPriceUSD || undefined,
          maxPrice: f.maxPriceUSD < 100 ? f.maxPriceUSD : undefined,
          minRating: f.minRating || undefined,
          minOrders: f.minOrders || undefined,
          freeShipping: f.freeShipping || undefined,
          shipFromTH: f.shipFromTH || undefined,
          maxShippingDays: f.maxShippingDays < 30 ? f.maxShippingDays : undefined,
          hasVariants: f.hasVariants || undefined,
          hasMultipleImages: f.hasMultipleImages || undefined,
          thaiCategories: f.selectedCategories.length ? f.selectedCategories : undefined,
          marketplaceStatus: f.marketplaceStatusFilter.length ? f.marketplaceStatusFilter : undefined,
          sortBy: f.sortBy === 'margin' ? 'price_asc' : f.sortBy,
          limit: PAGE_SIZE_BY_MODE[viewMode],
        }),
      });
      const data = await res.json();
      setResults(data.products ?? []);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // Re-run on filter or view mode change (debounced)
  useEffect(() => {
    if (results.length === 0 && f.keyword === '') return;
    const t = setTimeout(() => handleSearch(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    f.source, f.minPriceUSD, f.maxPriceUSD, f.minRating, f.minOrders,
    f.freeShipping, f.shipFromTH, f.maxShippingDays, f.hasVariants,
    f.hasMultipleImages, f.selectedCategories, f.marketplaceStatusFilter, f.sortBy, viewMode,
  ]);

  // Client-side filters (IP + tag blacklist + margin sort)
  const visibleResults = useMemo(() => {
    let list = results;

    if (f.hideRejected) list = list.filter((p) => p.ipVerdict !== 'REJECTED');
    if (f.hideFlagged) list = list.filter((p) => p.ipVerdict !== 'FLAGGED');

    if (f.excludeTags.length > 0) {
      list = list.filter((p) => !p.supplierTags?.some((t) => f.excludeTags.includes(t)));
    }

    if (f.sortBy === 'margin') {
      list = [...list].sort((a, b) => {
        const aMargin = (a.listPrice ?? a.costPrice * 2) / a.costPrice;
        const bMargin = (b.listPrice ?? b.costPrice * 2) / b.costPrice;
        return bMargin - aMargin;
      });
    }

    return list;
  }, [results, f.hideRejected, f.hideFlagged, f.excludeTags, f.sortBy]);

  const hiddenCount = results.length - visibleResults.length;
  const activeFilterCount = getActiveFilterCount(f);

  // Selection tools
  const selectableIds = visibleResults.filter((p) => p.ipVerdict !== 'REJECTED').map((p) => p.externalId);
  const acceptedIds = visibleResults.filter((p) => p.ipVerdict === 'ACCEPTED').map((p) => p.externalId);
  const allVisibleSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => setSelected(new Set(selectableIds));
  const selectAccepted = () => setSelected(new Set(acceptedIds));
  const invertSelection = () => {
    setSelected((prev) => {
      const next = new Set<string>();
      for (const id of selectableIds) {
        if (!prev.has(id)) next.add(id);
      }
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  const handleProcessSelected = () => {
    if (selected.size === 0) return;
    startTransition(async () => {
      const job = await createImportJob({
        storeId: 'store_1',
        source: f.source,
        externalIds: Array.from(selected),
      });
      router.push(`/seller/import/${job.jobId}`);
    });
  };

  return (
    <MarketplacePage>
      <div className="mx-auto max-w-[1440px] px-4 py-6 lg:px-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold lg:text-2xl">นำเข้าสินค้า</h1>
            <p className="text-xs text-muted-foreground">
              ค้นหาจาก supplier → กรอง IP + แปลภาษา → นำเข้าร้าน
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/seller/import/collections">
              <FolderPlus className="h-3.5 w-3.5" />
              คอลเลคชั่น{collectionCount > 0 && ` (${collectionCount})`}
            </Link>
          </Button>
        </div>

        {/* Source tabs */}
        <div className="mb-4 flex gap-1 border-b">
          {ENABLED_SOURCES.map((s) => (
            <button
              key={s.source}
              onClick={() => setFilter('source', s.source as ImportSource)}
              className={cn(
                'border-b-2 px-4 py-2 text-sm transition',
                f.source === s.source
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search row */}
        <div className="mb-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`ค้นหาสินค้าจาก ${ENABLED_SOURCES.find((s) => s.source === f.source)?.label}...`}
              value={f.keyword}
              onChange={(e) => setFilter('keyword', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <div className="mt-4">
                <FilterSidebar onApply={() => setMobileFiltersOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <Button onClick={handleSearch} disabled={searching}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ค้นหา'}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-md border bg-card p-4 pr-3">
              <FilterSidebar />
            </div>
          </aside>

          <main className="min-w-0">
            <ActiveFilterChips />

            {/* Toolbar: select tools + view mode */}
            {results.length > 0 && (
              <div className="mb-3 flex flex-wrap items-center gap-3 rounded-md border bg-card px-3 py-2">
                {/* Bulk select dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <CheckSquare
                        className={cn(
                          'h-4 w-4',
                          allVisibleSelected && 'fill-primary text-primary',
                        )}
                      />
                      <span className="text-xs">เลือก</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={selectAllVisible}>
                      เลือกทุกอันที่แสดง ({selectableIds.length})
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={selectAccepted}>
                      เลือกเฉพาะ "ผ่าน IP" ({acceptedIds.length})
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={invertSelection}>
                      สลับการเลือก
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={clearSelection} disabled={selected.size === 0}>
                      ล้างทั้งหมด
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-6" />

                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{visibleResults.length}</span>
                  {hiddenCount > 0 && (
                    <span className="text-amber-600"> · ซ่อน {hiddenCount}</span>
                  )}
                  {selected.size > 0 && (
                    <span> · เลือก <span className="font-medium text-primary">{selected.size}</span></span>
                  )}
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <select
                    value={f.sortBy}
                    onChange={(e) => setFilter('sortBy', e.target.value as typeof f.sortBy)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="orders">ขายดี</option>
                    <option value="rating">เรตติ้ง</option>
                    <option value="price_asc">ราคาต่ำ→สูง</option>
                    <option value="price_desc">ราคาสูง→ต่ำ</option>
                    <option value="margin">กำไรสูง</option>
                  </select>
                  <ViewModeToggle value={viewMode} onChange={setViewMode} />
                </div>
              </div>
            )}

            {/* Empty state */}
            {!searching && results.length === 0 && f.keyword === '' && (
              <EmptyState source={f.source} />
            )}

            {/* Results */}
            {viewMode === 'grid' && (
              <div className="grid gap-3 pb-32 sm:grid-cols-2 xl:grid-cols-3">
                {visibleResults.map((p) => (
                  <ProductCard
                    key={p.externalId}
                    product={p}
                    selected={selected.has(p.externalId)}
                    onToggle={() => toggleSelect(p.externalId)}
                  />
                ))}
              </div>
            )}

            {viewMode === 'compact' && (
              <div className="grid gap-2 pb-32 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {visibleResults.map((p) => (
                  <CompactCard
                    key={p.externalId}
                    product={p}
                    selected={selected.has(p.externalId)}
                    onToggle={() => toggleSelect(p.externalId)}
                  />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="rounded-md border bg-card pb-32">
                {visibleResults.map((p) => (
                  <ListRow
                    key={p.externalId}
                    product={p}
                    selected={selected.has(p.externalId)}
                    onToggle={() => toggleSelect(p.externalId)}
                  />
                ))}
              </div>
            )}

            {visibleResults.length === 0 && results.length > 0 && (
              <div className="flex flex-col items-center py-12 text-center">
                <Package className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  ตัวกรองทำให้ไม่เหลือสินค้าใน {results.length} ผลการค้นหา
                </p>
              </div>
            )}
          </main>
        </div>

        {/* Sticky selection bar */}
        {selected.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur">
            <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 lg:px-6">
              <div className="text-sm">
                เลือก <span className="font-semibold">{selected.size}</span> รายการ
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="hidden sm:block text-xs text-muted-foreground">
                ประมวลผลทันที — หรือเพิ่มเข้าคอลเลคชั่นเพื่อจัดการเป็นกลุ่ม
              </div>
              <div className="ml-auto flex items-center gap-2">
                <AddToCollectionMenu
                  products={visibleResults.filter((p) => selected.has(p.externalId))}
                  trigger={
                    <Button variant="outline" size="lg" className="gap-1">
                      <FolderPlus className="h-4 w-4" />
                      เพิ่มในคอลเลคชั่น
                    </Button>
                  }
                />
                <Button
                  size="lg"
                  className="min-w-[180px]"
                  onClick={handleProcessSelected}
                  disabled={pending}
                >
                  {pending ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" /> กำลังประมวลผล...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1 h-4 w-4" /> ประมวลผลตอนนี้ ({selected.size})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MarketplacePage>
  );
}

function EmptyState({ source }: { source: ImportSource }) {
  const setFilter = useFilterStore((s) => s.setFilter);
  const sourceName = ENABLED_SOURCES.find((s) => s.source === source)?.label ?? source;

  const suggestions = [
    'wireless earbuds', 'water bottle', 'phone holder',
    'silicone baking', 'storage organizer', 'laptop stand', 'resistance bands',
  ];

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Package className="h-12 w-12 text-muted-foreground/50" />
      <p className="mt-3 text-sm text-muted-foreground">ค้นหาสินค้าจาก {sourceName} เพื่อเริ่ม</p>
      <p className="mt-1 text-[11px] text-muted-foreground">หรือลองคำค้นยอดนิยม:</p>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setFilter('keyword', s)}
            className="rounded-full border bg-card px-3 py-1 text-[11px] hover:bg-accent"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
