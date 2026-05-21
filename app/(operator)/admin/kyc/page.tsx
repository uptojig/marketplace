import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  OperatorPageHeader,
  OperatorTable,
  OperatorFilterChips,
  OperatorStatusBadge,
  OperatorEmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  kycStateTone,
} from "@/components/operator/operator-primitives";

export const dynamic = "force-dynamic";

type Tab = "review" | "approved" | "rejected" | "in_progress" | "all";

const TAB_LABELS: Record<Tab, string> = {
  review: "รอตรวจสอบ",
  approved: "อนุมัติ",
  rejected: "ปฏิเสธ",
  in_progress: "กำลังยื่น",
  all: "ทั้งหมด",
};

const STATE_LABEL: Record<string, string> = {
  MANUAL_REVIEW: "รอตรวจ",
  AUTO_APPROVED: "อนุมัติ",
  REJECTED: "ปฏิเสธ",
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
      <OperatorPageHeader
        title="KYC ผู้สมัครเป็นผู้ขาย"
        description="ตรวจสอบเอกสาร vendor ก่อนอนุญาตให้เปิดร้านค้า"
      />

      <OperatorFilterChips
        items={(Object.keys(TAB_LABELS) as Tab[]).map((t) => ({
          label: `${TAB_LABELS[t]} (${TAB_COUNTS[t]})`,
          href: t === "review" ? "/admin/kyc" : `/admin/kyc?tab=${t}`,
          active: t === tab,
        }))}
      />

      {sessions.length === 0 ? (
        <OperatorTable>
          <OperatorEmptyState title={`ยังไม่มี session ในหมวด "${TAB_LABELS[tab]}"`} />
        </OperatorTable>
      ) : (
        <OperatorTable>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>เลขบัตร</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>สร้าง</TableHead>
                <TableHead>จบ</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    {s.user ? (
                      <>
                        <div className="font-medium text-foreground">{s.user.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{s.user.email}</div>
                      </>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">anonymous</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {s.citizenId ? `…${s.citizenId.slice(-4)}` : "—"}
                  </TableCell>
                  <TableCell>
                    <OperatorStatusBadge tone={kycStateTone[s.state] ?? "neutral"}>
                      {STATE_LABEL[s.state] ?? s.state}
                    </OperatorStatusBadge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.createdAt.toLocaleString("th-TH", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.terminalAt
                      ? s.terminalAt.toLocaleString("th-TH", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/kyc/${s.id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      ดูรายละเอียด →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </OperatorTable>
      )}
    </div>
  );
}
