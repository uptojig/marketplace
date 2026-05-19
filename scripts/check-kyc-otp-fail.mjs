import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const sid = process.argv[2];
if (!sid) {
  console.log("usage: node scripts/check-kyc-otp-fail.mjs <sid>");
  process.exit(1);
}

const ocrRows = await prisma.wizardOcrResult.findMany({
  where: { sessionId: sid },
  orderBy: { createdAt: "asc" },
});

for (const row of ocrRows) {
  console.log(`\n=== OCR ${row.provider} @ ${row.createdAt.toISOString()} ===`);
  console.log("extracted:", JSON.stringify(row.extracted, null, 2));
}

console.log("\n=== AUDIT — s3.otp events (full payload) ===");
const audit = await prisma.wizardAuditLog.findMany({
  where: { sessionId: sid, event: { startsWith: "s3.otp" } },
  orderBy: { ts: "asc" },
});
for (const a of audit) {
  console.log(`${a.ts.toISOString()} | ${a.event}`);
  console.log("  payload:", JSON.stringify(a.payload, null, 2));
}

await prisma.$disconnect();
