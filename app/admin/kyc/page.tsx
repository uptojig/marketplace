import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Tab = "review" | "approved" | "rejected" | "in_progress" | "all";

const TAB_LABELS: Record<Tab, string> = {
  review: "รอตรวจสอบ",
  approved: "อนุมัติ",
  rejected: "ปฏิเสธ",
  in_progress: "กำลังยื่น",
  all: "ทั้งหมด",
};

const STATE_BADGE: Record<string, { label: string; cls: string }> = {
  MANUAL_REVIEW: { label: "รอตรวจ", cls: "bg-amber-100 text-amber-800" },
  AUTO_APPROVED: { label: "อนุมัติ", cls: "bg-green-100 text-green-800" },
  REJECTED: { label: "ปฏิเสธ", cls: "bg-red-100 text-red-800" },
};

function stateFilter(tab: Tab) {
  if (tab === "review") return { state: "MANUAL_REVIEW" };
  if (tab === "approved") return { state: "AUTO_APPROVED" };
  if (tab === "rejected") return { state: "REJECTED" };
  if (tab === "in_progress") {
    return { state: { notIn: ["AUTO_APPROVED", "REJECTED", "MANUAL_REVIEW"] } };
  }
  return {};
}

function StateBadge({ state }: { state: string }) {
  const meta = STATE_BADGE[state] ?? { label: state, cls: "bg-gray-100 text-gray-700" };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

export default async function AdminKycListPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = (
    ["review", "approved", "rejected", "in_progress", "all"].includes(searchParams.tab ?? "")
      ? searchParams.tab
      : "review"
  ) as Tab;

  const where = stateFilter(tab);

  const [sessions, counts] = await Promise.all([
    prisma.wizardSession.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { id: true, email: true, name: true } } },
    }),
    prisma.wizardSession.groupBy({
      by: ["state"],
      _count: { _all: true },
    }),
  ]);

  const stateCount = (s: string) => counts.find((c) => c.state === s)?._count._all ?? 0;
  const inProgressCount = counts
    .filter((c) => !["AUTO_APPROVED", "REJECTED", "MANUAL_REVIEW"].includes(c.state))
    .reduce((sum, c) => sum + c._count._all, 0);

  const TAB_COUNTS: Record<Tab, number> = {
    review: stateCount("MANUAL_REVIEW"),
    approved: stateCount("AUTO_APPROVED"),
    rejected: stateCount("REJECTED"),
    in_progress: inProgressCount,
    all: counts.reduce((sum, c) => sum + c._count._all, 0),
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">KYC ผู้สมัครเป็นผู้ขาย</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ตรวจสอบเอกสาร vendor ก่อนอนุญาตให้เปิดร้านค้า
        </p>
      </header>

      <nav className="flex gap-1 border-b">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <Link
            key={t}
            href={t === "review" ? "/admin/kyc" : `/admin/kyc?tab=${t}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              t === tab
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {TAB_LABELS[t]}{" "}
            <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
              {TAB_COUNTS[t]}
            </span>
          </Link>
        ))}
      </nav>

      {sessions.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          ยังไม่มี session ในหมวด "{TAB_LABELS[tab]}"
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Vendor</th>
                <th className="px-4 py-3 text-left">เลขบัตร</th>
                <th className="px-4 py-3 text-left">สถานะ</th>
                <th className="px-4 py-3 text-left">สร้าง</th>
                <th className="px-4 py-3 text-left">จบ</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {s.user ? (
                      <>
                        <div className="font-medium">{s.user.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{s.user.email}</div>
                      </>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">anonymous</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {s.citizenId ? `…${s.citizenId.slice(-4)}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StateBadge state={s.state} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {s.createdAt.toLocaleString("th-TH", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {s.terminalAt
                      ? s.terminalAt.toLocaleString("th-TH", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/kyc/${s.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      ดูรายละเอียด →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
