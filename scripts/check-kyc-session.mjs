import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const sid = process.argv[2] || "ef624f80-e17f-42ac-af69-c9302577bd54";
const s = await prisma.wizardSession.findUnique({ where: { id: sid } });
if (!s) {
  console.log("NOT FOUND:", sid);
  process.exit(0);
}
console.log("=== SESSION ===");
console.log({
  id: s.id,
  state: s.state,
  finalDecision: s.finalDecision,
  citizenId: s.citizenId,
  terminalAt: s.terminalAt,
  updatedAt: s.updatedAt,
});

console.log("\n=== AUDIT LOG (last 12, oldest first) ===");
const audit = await prisma.wizardAuditLog.findMany({
  where: { sessionId: sid },
  orderBy: { ts: "desc" },
  take: 12,
});
for (const a of audit.reverse()) {
  console.log(
    `${a.ts.toISOString()} | ${a.actor} | ${a.fromState}->${a.toState ?? "-"} | ${a.event}`,
  );
  if (a.payload) {
    const p = JSON.stringify(a.payload);
    console.log("  payload:", p.length > 700 ? p.slice(0, 700) + "..." : p);
  }
}

console.log("\n=== MATCH RESULTS ===");
const matches = await prisma.wizardMatchResult.findMany({
  where: { sessionId: sid },
  orderBy: { createdAt: "desc" },
});
for (const m of matches) {
  console.log(
    `${m.matched ? "✓" : "✗"} ${m.matchType.padEnd(36)} score=${m.score} thr=${m.threshold} | ${m.leftSource}=${(m.leftValue ?? "").toString().slice(0, 40)} vs ${m.rightSource}=${(m.rightValue ?? "").toString().slice(0, 40)}`,
  );
}

await prisma.$disconnect();
