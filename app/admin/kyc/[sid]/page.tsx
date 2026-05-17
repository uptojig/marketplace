import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { evidenceWithPresignedUrls } from "@/lib/kyc/wizard-storage";
import { approveKycSession, rejectKycSession } from "../actions";

export const dynamic = "force-dynamic";

const TERMINAL_STATES = new Set(["AUTO_APPROVED", "REJECTED"]);

const STATE_BADGE: Record<string, { label: string; cls: string }> = {
  MANUAL_REVIEW: { label: "รอตรวจ", cls: "bg-amber-100 text-amber-800" },
  AUTO_APPROVED: { label: "อนุมัติ", cls: "bg-green-100 text-green-800" },
  REJECTED: { label: "ปฏิเสธ", cls: "bg-red-100 text-red-800" },
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
  const badge = STATE_BADGE[session.state] ?? {
    label: session.state,
    cls: "bg-gray-100 text-gray-700",
  };
  const totalCost = session.costLogs.reduce((sum, row) => sum + Number(row.costThb), 0);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <Link href="/admin/kyc" className="text-xs text-blue-600 hover:underline">
          ← กลับไปที่ KYC list
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold">KYC Session</h1>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{session.id}</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">ผู้สมัคร</h2>
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
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold">เวลา</h2>
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
            <div className="flex justify-between border-t pt-1">
              <dt className="text-muted-foreground">Cost</dt>
              <dd className="font-mono">฿{totalCost.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {isPending && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-amber-900">การตัดสินใจ</h2>
          <div className="flex flex-wrap items-start gap-4">
            <form action={approveKycSession}>
              <input type="hidden" name="sid" value={session.id} />
              <button
                type="submit"
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                อนุมัติ — ให้เปิดร้านได้
              </button>
            </form>
            <form action={rejectKycSession} className="flex flex-1 items-start gap-2">
              <input type="hidden" name="sid" value={session.id} />
              <input
                type="text"
                name="reason"
                required
                placeholder="เหตุผลที่ปฏิเสธ"
                className="flex-1 rounded-md border border-amber-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                ปฏิเสธ
              </button>
            </form>
          </div>
        </section>
      )}

      {!isPending && TERMINAL_STATES.has(session.state) && (
        <section className="rounded-lg border bg-white p-4">
          <p className="text-sm">
            <span className="font-semibold">Session สรุปแล้ว:</span>{" "}
            <span className={`rounded px-1.5 py-0.5 text-xs ${badge.cls}`}>{badge.label}</span>{" "}
            <span className="text-xs text-muted-foreground">
              ({session.finalDecision ?? "—"})
            </span>
          </p>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold">เอกสาร ({evidenceWithUrls.length})</h2>
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
                className="block overflow-hidden rounded-lg border bg-white"
              >
                {e.url && e.mime.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.url}
                    alt={e.step}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-gray-100 text-xs text-muted-foreground">
                    {e.mime}
                  </div>
                )}
                <div className="border-t p-2 text-xs">
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
        <h2 className="mb-3 text-sm font-semibold">OCR ({session.ocrResults.length})</h2>
        {session.ocrResults.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">ยังไม่มี OCR result</p>
        ) : (
          <div className="space-y-2">
            {session.ocrResults.map((o) => (
              <details key={o.id} className="rounded-lg border bg-white p-3 text-sm">
                <summary className="cursor-pointer">
                  <span className="font-medium">{o.provider}</span>{" "}
                  <span className="text-xs text-muted-foreground">
                    confidence={o.confidence !== null ? Number(o.confidence).toFixed(2) : "—"}
                  </span>
                </summary>
                <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                  {JSON.stringify(o.extracted, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Match ({session.matchResults.length})</h2>
        {session.matchResults.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">ยังไม่มี match result</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Sources</th>
                  <th className="px-3 py-2 text-left">Score</th>
                  <th className="px-3 py-2 text-left">Matched</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {session.matchResults.map((m) => (
                  <tr key={m.id}>
                    <td className="px-3 py-2 font-mono">{m.matchType}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {m.leftSource} ↔ {m.rightSource}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {m.score !== null ? Number(m.score).toFixed(3) : "—"}
                      {m.threshold !== null && (
                        <span className="text-muted-foreground">
                          {" "}
                          / {Number(m.threshold).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          m.matched
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {m.matched ? "ผ่าน" : "ไม่ผ่าน"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{m.reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Audit log</h2>
        <ol className="space-y-1 rounded-lg border bg-white p-3 text-xs">
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
