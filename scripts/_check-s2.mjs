// Inspect the S2 verify audit payload for the latest run.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
try {
  const sid = process.argv[2];
  const rows = await prisma.wizardAuditLog.findMany({
    where: sid ? { sessionId: sid } : { event: { startsWith: "s2." } },
    orderBy: { ts: "desc" },
    take: 5,
  });
  for (const r of rows) {
    console.log("---");
    console.log("ts:", r.ts.toISOString(), "sid:", r.sessionId);
    console.log("event:", r.event, "fromState:", r.fromState, "→", r.toState);
    console.log("payload:", JSON.stringify(r.payload, null, 2));
  }
} finally {
  await prisma.$disconnect();
}
