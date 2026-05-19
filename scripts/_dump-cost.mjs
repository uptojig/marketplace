// Dump iApp cost log for a session to see actual per-call ms.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
try {
  const sid = process.argv[2];
  if (!sid) { console.error("usage: node _dump-cost.mjs <sid>"); process.exit(1); }
  const rows = await prisma.wizardCostLog.findMany({
    where: { sessionId: sid },
    orderBy: { ts: "asc" },
  });
  console.log("endpoint                    ic    duration_ms  created");
  console.log("─".repeat(72));
  for (const r of rows) {
    const ep = String(r.endpoint).padEnd(28);
    const ic = String(r.units).padStart(5);
    const ms = String(r.durationMs).padStart(10);
    console.log(`${ep}${ic}  ${ms}  ${r.ts.toISOString().slice(11, 23)}`);
  }
  console.log("─".repeat(72));
  const total = rows.reduce((s, r) => s + Number(r.units), 0);
  const totalMs = rows.reduce((s, r) => s + (r.durationMs ?? 0), 0);
  console.log(`TOTAL                         ${String(total).padStart(5)}  ${String(totalMs).padStart(10)}`);
} finally {
  await prisma.$disconnect();
}
