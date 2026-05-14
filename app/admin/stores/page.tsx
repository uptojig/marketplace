import Link from "next/link";
import { Plus, Search, X, Image as ImageIcon, Languages, FolderTree } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Prisma, StoreApprovalStatus } from "@prisma/client";
import { getStoreQualitySnapshot } from "@/lib/admin/enrich-products";
import { StoreRowActions } from "./row-actions";

export const dynamic = "force-dynamic";

const APPROVAL_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
] as const satisfies readonly StoreApprovalStatus[];

const STATUS_BADGE: Record<
  StoreApprovalStatus,
  { label: string; cls: string; tone: "amber" | "green" | "red" | "gray" }
> = {
  PENDING: { label: "รอตรวจ", cls: "bg-amber-100 text-amber-800", tone: "amber" },
  APPROVED: { label: "อนุมัติ", cls: "bg-green-100 text-green-800", tone: "green" },
  REJECTED: { label: "ปฏิเสธ", cls: "bg-red-100 text-red-800", tone: "red" },
  SUSPENDED: { label: "ระงับ", cls: "bg-gray-200 text-gray-700", tone: "gray" },
};

const TAB_TONE: Record<"all" | "amber" | "green" | "red" | "gray", string> = {
  all: "border-stone-900 text-stone-900",
  amber: "border-amber-500 text-amber-700",
  green: "border-green-600 text-green-700",
  red: "border-red-500 text-red-700",
  gray: "border-stone-400 text-stone-700",
};

function ApprovalBadge({ status }: { status: StoreApprovalStatus }) {
  const { label, cls } = STATUS_BADGE[status];
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

function tabHref({ status, q }: { status?: StoreApprovalStatus; q?: string }) {
  const sp = new URLSearchParams();
  if (status) sp.set("status", status);
  if (q) sp.set("q", q);
  const qs = sp.toString();
  return qs ? `/admin/stores?${qs}` : "/admin/stores";
}

function Tab({
  href,
  active,
  tone,
  label,
  count,
}: {
  href: string;
  active: boolean;
  tone: keyof typeof TAB_TONE;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? TAB_TONE[tone]
          : "border-transparent text-stone-500 hover:text-stone-800"
      }`}
    >
      {label}
      <span
        className={`inline-flex min-w-[1.5rem] justify-center rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
          active
            ? "bg-stone-900 text-white"
            : "bg-stone-100 text-stone-600"
        }`}
      >
        {count}
      </span>
    </Link>
  );
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
    ? "bg-green-50 text-green-700 ring-green-200"
    : "bg-amber-50 text-amber-700 ring-amber-200";
  const text = invertColors ? `${done}` : `${done}/${total}`;
  return (
    <span
      title={label}
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset tabular-nums ${cls}`}
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
  const statusFilter = (APPROVAL_STATUSES as readonly string[]).includes(
    statusParam ?? "",
  )
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

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ร้านค้าทั้งหมด</h1>
          <p className="text-sm text-muted-foreground">
            {stores.length === totalForText
              ? `${stores.length} ร้าน`
              : `แสดง ${stores.length} จาก ${totalForText} ร้าน`}
            {truncated && (
              <span className="ml-1 text-amber-600">
                (จำกัด 200 ล่าสุด — ใช้ค้นหาเพื่อกรอง)
              </span>
            )}
          </p>
        </div>
        <Link
          href="/create-store"
          className="inline-flex items-center gap-1.5 rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          สร้างร้านใหม่
        </Link>
      </div>

      {/* ── Status filter tabs ───────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0 overflow-x-auto border-b">
        <Tab
          href={tabHref({ q })}
          active={!statusFilter}
          tone="all"
          label="ทั้งหมด"
          count={totalForText}
        />
        <Tab
          href={tabHref({ status: "PENDING", q })}
          active={statusFilter === "PENDING"}
          tone="amber"
          label="รอตรวจ"
          count={countByStatus.PENDING ?? 0}
        />
        <Tab
          href={tabHref({ status: "APPROVED", q })}
          active={statusFilter === "APPROVED"}
          tone="green"
          label="อนุมัติ"
          count={countByStatus.APPROVED ?? 0}
        />
        <Tab
          href={tabHref({ status: "REJECTED", q })}
          active={statusFilter === "REJECTED"}
          tone="red"
          label="ปฏิเสธ"
          count={countByStatus.REJECTED ?? 0}
        />
        <Tab
          href={tabHref({ status: "SUSPENDED", q })}
          active={statusFilter === "SUSPENDED"}
          tone="gray"
          label="ระงับ"
          count={countByStatus.SUSPENDED ?? 0}
        />
      </div>

      {/* ── Search ───────────────────────────────────────────────── */}
      <form className="relative flex gap-2" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="ค้นหาชื่อร้าน, slug, หรืออีเมลเจ้าของ..."
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-9 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="ค้นหาร้าน"
          />
          {q && (
            <Link
              href={tabHref({ status: statusFilter ?? undefined })}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              aria-label="ล้างคำค้น"
              prefetch={false}
            >
              <X className="h-4 w-4" />
            </Link>
          )}
        </div>
        {/* Preserve status filter across search submits */}
        {statusFilter && (
          <input type="hidden" name="status" value={statusFilter} />
        )}
        <button
          type="submit"
          className="rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          ค้นหา
        </button>
      </form>

      {/* ── Desktop table ────────────────────────────────────────── */}
      <div className="hidden overflow-hidden rounded-lg border bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">ร้าน</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="hidden px-4 py-3 lg:table-cell">เจ้าของ</th>
                <th className="px-4 py-3 text-center">สินค้า</th>
                <th className="hidden px-4 py-3 xl:table-cell">คุณภาพข้อมูล</th>
                <th className="hidden px-4 py-3 lg:table-cell">โดเมน</th>
                <th className="hidden px-4 py-3 xl:table-cell">สร้างเมื่อ</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stores.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    {q || statusFilter
                      ? "ไม่พบร้านค้าตามเงื่อนไข — ลองล้างตัวกรอง"
                      : "ยังไม่มีร้านค้า — กด “สร้างร้านใหม่” ด้านบนเพื่อเริ่มต้น"}
                  </td>
                </tr>
              ) : (
                stores.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/stores/${s.id}`}
                        className="flex items-center gap-3 hover:opacity-80"
                      >
                        {s.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.logoUrl}
                            alt={s.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-200 text-xs font-bold text-gray-500">
                            {s.name[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            /{s.slug}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <ApprovalBadge status={s.approvalStatus} />
                      {s.approvalNote && (
                        <p className="mt-1 line-clamp-2 max-w-[180px] text-[11px] text-muted-foreground">
                          {s.approvalNote}
                        </p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <p className="truncate">{s.owner.name ?? "—"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.owner.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center font-medium tabular-nums">
                      {s._count.products}
                    </td>
                    <td className="hidden px-4 py-3 xl:table-cell">
                      {(() => {
                        const qty = qualityById.get(s.id);
                        if (!qty || qty.total === 0) {
                          return (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          );
                        }
                        return (
                          <div className="flex flex-wrap gap-1">
                            <QualityPill
                              icon={Languages}
                              label="แปลไทย"
                              done={qty.translated}
                              total={qty.total}
                            />
                            <QualityPill
                              icon={FolderTree}
                              label="Category"
                              done={qty.categorized}
                              total={qty.total}
                            />
                            <QualityPill
                              icon={ImageIcon}
                              label="รูปน้อย"
                              done={qty.lowImage}
                              total={qty.total}
                              invertColors
                            />
                          </div>
                        );
                      })()}
                    </td>
                    <td className="hidden px-4 py-3 text-xs lg:table-cell">
                      {s.customDomain ? (
                        <code className="rounded bg-gray-100 px-1.5 py-0.5">
                          {s.customDomain}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell">
                      {s.createdAt.toLocaleDateString("th-TH")}
                    </td>
                    <td className="relative px-4 py-3 text-right">
                      <StoreRowActions
                        storeId={s.id}
                        storeSlug={s.slug}
                        storeName={s.name}
                        approvalStatus={s.approvalStatus}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile card stack ────────────────────────────────────── */}
      <div className="space-y-2 md:hidden">
        {stores.length === 0 ? (
          <div className="rounded-lg border bg-white px-4 py-12 text-center text-sm text-muted-foreground">
            {q || statusFilter
              ? "ไม่พบร้านค้าตามเงื่อนไข — ลองล้างตัวกรอง"
              : "ยังไม่มีร้านค้า — กด “สร้างร้านใหม่” เพื่อเริ่มต้น"}
          </div>
        ) : (
          stores.map((s) => {
            const qty = qualityById.get(s.id);
            return (
              <div
                key={s.id}
                className="relative rounded-lg border bg-white p-3 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <Link
                    href={`/admin/stores/${s.id}`}
                    className="flex flex-1 items-start gap-3"
                  >
                    {s.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.logoUrl}
                        alt={s.name}
                        className="h-10 w-10 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-200 text-sm font-bold text-gray-500">
                        {s.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{s.name}</p>
                        <ApprovalBadge status={s.approvalStatus} />
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        /{s.slug} • {s._count.products} สินค้า
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.owner.email}
                      </p>
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
                    <QualityPill
                      icon={Languages}
                      label="แปลไทย"
                      done={qty.translated}
                      total={qty.total}
                    />
                    <QualityPill
                      icon={FolderTree}
                      label="Category"
                      done={qty.categorized}
                      total={qty.total}
                    />
                    <QualityPill
                      icon={ImageIcon}
                      label="รูปน้อย"
                      done={qty.lowImage}
                      total={qty.total}
                      invertColors
                    />
                  </div>
                )}
                {s.customDomain && (
                  <p className="mt-2 pl-[52px] text-[11px] text-muted-foreground">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5">
                      {s.customDomain}
                    </code>
                  </p>
                )}
                {s.approvalNote && (
                  <p className="mt-2 pl-[52px] text-[11px] text-muted-foreground">
                    {s.approvalNote}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
