import Link from "next/link";
import { Plus, Search, X, Image as ImageIcon, Languages, FolderTree } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Prisma, StoreApprovalStatus } from "@prisma/client";
import { getStoreQualitySnapshot } from "@/lib/admin/enrich-products";
import { StoreRowActions } from "./row-actions";
import { BulkThemeBar } from "./bulk-theme-bar";
import {
  Button,
  Input,
  OperatorPageHeader,
  OperatorStatusBadge,
  OperatorFilterChips,
  OperatorTable,
  OperatorEmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type StatusTone,
} from "@/components/operator/operator-primitives";

export const dynamic = "force-dynamic";

const APPROVAL_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
] as const satisfies readonly StoreApprovalStatus[];

const STATUS_BADGE: Record<StoreApprovalStatus, { label: string; tone: StatusTone }> = {
  PENDING: { label: "รอตรวจ", tone: "warning" },
  APPROVED: { label: "อนุมัติ", tone: "success" },
  REJECTED: { label: "ปฏิเสธ", tone: "danger" },
  SUSPENDED: { label: "ระงับ", tone: "neutral" },
};

function ApprovalBadge({ status }: { status: StoreApprovalStatus }) {
  const { label, tone } = STATUS_BADGE[status];
  return <OperatorStatusBadge tone={tone}>{label}</OperatorStatusBadge>;
}

function tabHref({ status, q }: { status?: StoreApprovalStatus; q?: string }) {
  const sp = new URLSearchParams();
  if (status) sp.set("status", status);
  if (q) sp.set("q", q);
  const qs = sp.toString();
  return qs ? `/admin/stores?${qs}` : "/admin/stores";
}

function QualityPill({
  icon: Icon,
  label,
  done,
  total,
  invertColors,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  done: number;
  total: number;
  /** Used by the "low-image" pill: ok=0, bad=>0 (inverse of done/total) */
  invertColors?: boolean;
}) {
  const ok = invertColors ? done === 0 : done >= total && total > 0;
  const cls = ok
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : "bg-amber-50 text-amber-700 ring-amber-200";
  const text = invertColors ? `${done}` : `${done}/${total}`;
  return (
    <span
      title={label}
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset tabular-nums ${cls}`}
    >
      <Icon className="h-3 w-3" />
      {text}
    </span>
  );
}

export default async function AdminStoresPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const q = searchParams.q?.trim() || undefined;
  const statusParam = searchParams.status?.toUpperCase();
  const statusFilter = (APPROVAL_STATUSES as readonly string[]).includes(statusParam ?? "")
    ? (statusParam as StoreApprovalStatus)
    : null;

  // Text-only `where` — drives both the listing (combined with status)
  // and the per-status tab counts (so counts respond to the search).
  const textWhere: Prisma.StoreWhereInput | undefined = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
          { owner: { email: { contains: q, mode: "insensitive" } } },
        ],
      }
    : undefined;

  const listWhere: Prisma.StoreWhereInput = {
    ...(textWhere ?? {}),
    ...(statusFilter ? { approvalStatus: statusFilter } : {}),
  };

  const [stores, totalForText, groupCounts] = await Promise.all([
    prisma.store.findMany({
      where: listWhere,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        customDomain: true,
        createdAt: true,
        approvalStatus: true,
        approvalNote: true,
        landingThemeVariant: true,
        owner: { select: { email: true, name: true } },
        _count: { select: { products: true } },
      },
      take: 200,
    }),
    prisma.store.count({ where: textWhere }),
    prisma.store.groupBy({
      by: ["approvalStatus"],
      where: textWhere,
      _count: { _all: true },
    }),
  ]);

  const countByStatus = Object.fromEntries(
    groupCounts.map((g) => [g.approvalStatus, g._count._all] as const),
  ) as Partial<Record<StoreApprovalStatus, number>>;

  // Per-store product-quality snapshot — counts of translated /
  // categorized / low-image. Fan-out is bounded (<= 200 stores per
  // the take above) and each snapshot is three count() queries, so
  // we accept the parallelism rather than wiring a custom join.
  //
  // DEFENSIVE: a single bad row (e.g. a galleryUrls column stored as
  // a malformed Json shape) would otherwise reject the whole
  // Promise.all and crash the page — fall back to `null` per-store
  // so the rest of the table still renders.
  const qualityById = new Map(
    await Promise.all(
      stores.map(async (s) => {
        try {
          return [s.id, await getStoreQualitySnapshot(s.id)] as const;
        } catch (err) {
          console.error(
            `[admin/stores] quality snapshot failed for ${s.slug}:`,
            err instanceof Error ? err.message : err,
          );
          return [s.id, null] as const;
        }
      }),
    ),
  );

  const truncated = stores.length === 200;
  const emptyMessage =
    q || statusFilter
      ? "ไม่พบร้านค้าตามเงื่อนไข — ลองล้างตัวกรอง"
      : "ยังไม่มีร้านค้า — กด “สร้างร้านใหม่” ด้านบนเพื่อเริ่มต้น";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <OperatorPageHeader
        title="ร้านค้าทั้งหมด"
        description={
          <>
            {stores.length === totalForText
              ? `${stores.length} ร้าน`
              : `แสดง ${stores.length} จาก ${totalForText} ร้าน`}
            {truncated && (
              <span className="ml-1 text-primary">(จำกัด 200 ล่าสุด — ใช้ค้นหาเพื่อกรอง)</span>
            )}
          </>
        }
        actions={
          <Button asChild>
            <Link href="/create-store">
              <Plus />
              สร้างร้านใหม่
            </Link>
          </Button>
        }
      />

      {/* Bulk theme picker (collapsed by default) */}
      <BulkThemeBar
        stores={stores.map((s) => ({
          id: s.id,
          slug: s.slug,
          name: s.name,
          landingThemeVariant: s.landingThemeVariant,
        }))}
      />

      {/* Status filter chips */}
      <OperatorFilterChips
        items={[
          { label: `ทั้งหมด (${totalForText})`, href: tabHref({ q }), active: !statusFilter },
          {
            label: `รอตรวจ (${countByStatus.PENDING ?? 0})`,
            href: tabHref({ status: "PENDING", q }),
            active: statusFilter === "PENDING",
          },
          {
            label: `อนุมัติ (${countByStatus.APPROVED ?? 0})`,
            href: tabHref({ status: "APPROVED", q }),
            active: statusFilter === "APPROVED",
          },
          {
            label: `ปฏิเสธ (${countByStatus.REJECTED ?? 0})`,
            href: tabHref({ status: "REJECTED", q }),
            active: statusFilter === "REJECTED",
          },
          {
            label: `ระงับ (${countByStatus.SUSPENDED ?? 0})`,
            href: tabHref({ status: "SUSPENDED", q }),
            active: statusFilter === "SUSPENDED",
          },
        ]}
      />

      {/* Search */}
      <form className="relative flex gap-2" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="ค้นหาชื่อร้าน, slug, หรืออีเมลเจ้าของ..."
            className="pl-9 pr-9"
            aria-label="ค้นหาร้าน"
          />
          {q && (
            <Link
              href={tabHref({ status: statusFilter ?? undefined })}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="ล้างคำค้น"
              prefetch={false}
            >
              <X className="h-4 w-4" />
            </Link>
          )}
        </div>
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        <Button type="submit" variant="outline">
          ค้นหา
        </Button>
      </form>

      {/* Desktop table */}
      <div className="hidden md:block">
        <OperatorTable>
          {stores.length === 0 ? (
            <OperatorEmptyState title={emptyMessage} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ร้าน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="hidden lg:table-cell">เจ้าของ</TableHead>
                  <TableHead className="text-center">สินค้า</TableHead>
                  <TableHead className="hidden xl:table-cell">คุณภาพข้อมูล</TableHead>
                  <TableHead className="hidden lg:table-cell">โดเมน</TableHead>
                  <TableHead className="hidden xl:table-cell">สร้างเมื่อ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link
                        href={`/admin/stores/${s.id}`}
                        className="flex items-center gap-3 hover:opacity-80"
                      >
                        {s.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.logoUrl} alt={s.name} className="h-8 w-8 rounded object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-muted text-xs font-bold text-muted-foreground">
                            {s.name[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">/{s.slug}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <ApprovalBadge status={s.approvalStatus} />
                      {s.approvalNote && (
                        <p className="mt-1 line-clamp-2 max-w-[180px] text-[11px] text-muted-foreground">
                          {s.approvalNote}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <p className="truncate font-medium">{s.owner.name ?? "—"}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.owner.email}</p>
                    </TableCell>
                    <TableCell className="text-center font-medium tabular-nums">
                      {s._count.products}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {(() => {
                        const qty = qualityById.get(s.id);
                        if (!qty || qty.total === 0) {
                          return <span className="text-xs text-muted-foreground">—</span>;
                        }
                        return (
                          <div className="flex flex-wrap gap-1">
                            <QualityPill icon={Languages} label="แปลไทย" done={qty.translated} total={qty.total} />
                            <QualityPill icon={FolderTree} label="Category" done={qty.categorized} total={qty.total} />
                            <QualityPill icon={ImageIcon} label="รูปน้อย" done={qty.lowImage} total={qty.total} invertColors />
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="hidden text-xs lg:table-cell">
                      {s.customDomain ? (
                        <code className="rounded border border-border bg-muted px-1.5 py-0.5 font-semibold text-foreground">
                          {s.customDomain}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground xl:table-cell">
                      {s.createdAt.toLocaleDateString("th-TH")}
                    </TableCell>
                    <TableCell className="relative text-right">
                      <StoreRowActions
                        storeId={s.id}
                        storeSlug={s.slug}
                        storeName={s.name}
                        approvalStatus={s.approvalStatus}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </OperatorTable>
      </div>

      {/* Mobile card stack */}
      <div className="space-y-2 md:hidden">
        {stores.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          stores.map((s) => {
            const qty = qualityById.get(s.id);
            return (
              <div
                key={s.id}
                className="relative rounded-xl border border-border bg-card p-3 text-card-foreground shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <Link href={`/admin/stores/${s.id}`} className="flex flex-1 items-start gap-3">
                    {s.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logoUrl} alt={s.name} className="h-10 w-10 shrink-0 rounded object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-border bg-muted text-sm font-bold text-muted-foreground">
                        {s.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-foreground">{s.name}</p>
                        <ApprovalBadge status={s.approvalStatus} />
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        /{s.slug} • {s._count.products} สินค้า
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{s.owner.email}</p>
                    </div>
                  </Link>
                  <StoreRowActions
                    storeId={s.id}
                    storeSlug={s.slug}
                    storeName={s.name}
                    approvalStatus={s.approvalStatus}
                  />
                </div>
                {qty && qty.total > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 pl-[52px]">
                    <QualityPill icon={Languages} label="แปลไทย" done={qty.translated} total={qty.total} />
                    <QualityPill icon={FolderTree} label="Category" done={qty.categorized} total={qty.total} />
                    <QualityPill icon={ImageIcon} label="รูปน้อย" done={qty.lowImage} total={qty.total} invertColors />
                  </div>
                )}
                {s.customDomain && (
                  <p className="mt-2 pl-[52px] text-[11px] text-muted-foreground">
                    <code className="rounded border border-border bg-muted px-1.5 py-0.5">
                      {s.customDomain}
                    </code>
                  </p>
                )}
                {s.approvalNote && (
                  <p className="mt-2 pl-[52px] text-[11px] text-muted-foreground">{s.approvalNote}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
