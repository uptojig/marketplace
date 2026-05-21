import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { evidenceWithPresignedUrls } from "@/lib/kyc/wizard-storage";
import {
  OperatorCard,
  OperatorCallout,
  OperatorTable,
  OperatorStatusBadge,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  kycStateTone,
} from "@/components/operator/operator-primitives";
import { approveKycSession, rejectKycSession } from "../actions";

export const dynamic = "force-dynamic";

const TERMINAL_STATES = new Set(["AUTO_APPROVED", "REJECTED"]);

const STATE_LABEL: Record<string, string> = {
  MANUAL_REVIEW: "รอตรวจ",
  AUTO_APPROVED: "อนุมัติ",
  REJECTED: "ปฏิเสธ",
};

function formatTime(d: Date) {
  return d.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "medium" });
}

export default async function AdminKycDetailPage({ params }: { params: { sid: string } }) {
  const session = await prisma.wizardSession.findUnique({
    where: { id: params.sid },
    include: {
      user: { select: { id: true, email: true, name: true, role: true } },
      evidence: { orderBy: { capturedAt: "asc" } },
      ocrResults: { orderBy: { createdAt: "asc" } },
      matchResults: { orderBy: { createdAt: "asc" } },
      auditLogs: { orderBy: { ts: "asc" } },
      costLogs: { orderBy: { ts: "asc" } },
    },
  });

  if (!session) notFound();

  const evidenceWithUrls = await evidenceWithPresignedUrls(session.id);

  const isPending = session.state === "MANUAL_REVIEW";
  const tone = kycStateTone[session.state] ?? "neutral";
  const stateLabel = STATE_LABEL[session.state] ?? session.state;
  const totalCost = session.costLogs.reduce((sum, row) => sum + Number(row.costThb), 0);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <Link href="/admin/kyc" className="text-xs text-primary hover:underline">
          ← กลับไปที่ KYC list
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">KYC Session</h1>
          <OperatorStatusBadge tone={tone}>{stateLabel}</OperatorStatusBadge>
        </div>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{session.id}</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <OperatorCard title="ผู้สมัคร" className="lg:col-span-2">
          {session.user ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">ชื่อ</dt>
              <dd>{session.user.name ?? "—"}</dd>
              <dt className="text-muted-foreground">อีเมล</dt>
              <dd>{session.user.email}</dd>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-mono text-xs">{session.user.role}</dd>
              <dt className="text-muted-foreground">เลขบัตร</dt>
              <dd className="font-mono text-xs">{session.citizenId ?? "—"}</dd>
            </dl>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Session ไม่ผูกกับ user (อาจเป็น session เก่าก่อน user_id migration)
            </p>
          )}
        </OperatorCard>

        <OperatorCard title="เวลา">
          <dl className="space-y-1 text-xs">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">สร้าง</dt>
              <dd>{formatTime(session.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">อัพเดท</dt>
              <dd>{formatTime(session.updatedAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">หมดอายุ</dt>
              <dd>{formatTime(session.expiresAt)}</dd>
            </div>
            {session.terminalAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">จบ</dt>
                <dd>{formatTime(session.terminalAt)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1">
              <dt className="text-muted-foreground">Cost</dt>
              <dd className="font-mono">฿{totalCost.toFixed(2)}</dd>
            </div>
          </dl>
        </OperatorCard>
      </section>

      {isPending && (
        <OperatorCallout tone="warning" title="การตัดสินใจ">
          <div className="mt-2 flex flex-wrap items-start gap-4">
            <form action={approveKycSession}>
              <input type="hidden" name="sid" value={session.id} />
              <Button type="submit">อนุมัติ — ให้เปิดร้านได้</Button>
            </form>
            <form action={rejectKycSession} className="flex flex-1 items-start gap-2">
              <input type="hidden" name="sid" value={session.id} />
              <Input
                type="text"
                name="reason"
                required
                placeholder="เหตุผลที่ปฏิเสธ"
                className="flex-1 bg-card"
              />
              <Button type="submit" variant="destructive">
                ปฏิเสธ
              </Button>
            </form>
          </div>
        </OperatorCallout>
      )}

      {!isPending && TERMINAL_STATES.has(session.state) && (
        <OperatorCard>
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">Session สรุปแล้ว:</span>
            <OperatorStatusBadge tone={tone}>{stateLabel}</OperatorStatusBadge>
            <span className="text-xs text-muted-foreground">({session.finalDecision ?? "—"})</span>
          </p>
        </OperatorCard>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          เอกสาร ({evidenceWithUrls.length})
        </h2>
        {evidenceWithUrls.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">ยังไม่มีหลักฐานในระบบ</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {evidenceWithUrls.map((e) => (
              <a
                key={e.id}
                href={e.url || undefined}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-lg border border-border bg-card"
              >
                {e.url && e.mime.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.url} alt={e.step} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-muted text-xs text-muted-foreground">
                    {e.mime}
                  </div>
                )}
                <div className="border-t border-border p-2 text-xs">
                  <div className="font-medium">{e.step}</div>
                  <div className="text-muted-foreground">
                    {Math.round(e.bytes / 1024)} KB · {e.width ?? "?"}×{e.height ?? "?"}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          OCR ({session.ocrResults.length})
        </h2>
        {session.ocrResults.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">ยังไม่มี OCR result</p>
        ) : (
          <div className="space-y-2">
            {session.ocrResults.map((o) => (
              <details key={o.id} className="rounded-lg border border-border bg-card p-3 text-sm">
                <summary className="cursor-pointer">
                  <span className="font-medium">{o.provider}</span>{" "}
                  <span className="text-xs text-muted-foreground">
                    confidence={o.confidence !== null ? Number(o.confidence).toFixed(2) : "—"}
                  </span>
                </summary>
                <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(o.extracted, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Match ({session.matchResults.length})
        </h2>
        {session.matchResults.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">ยังไม่มี match result</p>
        ) : (
          <OperatorTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Sources</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Matched</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {session.matchResults.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">{m.matchType}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {m.leftSource} ↔ {m.rightSource}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {m.score !== null ? Number(m.score).toFixed(3) : "—"}
                      {m.threshold !== null && (
                        <span className="text-muted-foreground"> / {Number(m.threshold).toFixed(2)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <OperatorStatusBadge tone={m.matched ? "success" : "danger"}>
                        {m.matched ? "ผ่าน" : "ไม่ผ่าน"}
                      </OperatorStatusBadge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.reason ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </OperatorTable>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Audit log</h2>
        <ol className="space-y-1 rounded-lg border border-border bg-card p-3 text-xs">
          {session.auditLogs.map((a) => (
            <li key={String(a.id)} className="font-mono">
              <span className="text-muted-foreground">{formatTime(a.ts)}</span>{" "}
              <span className="font-semibold">[{a.actor}]</span> {a.event}
              {a.fromState && a.toState && (
                <>
                  {" "}
                  <span className="text-muted-foreground">
                    {a.fromState} → {a.toState}
                  </span>
                </>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
