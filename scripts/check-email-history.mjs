import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const email = process.argv[2] || "pagamaza@outlook.com";

console.log(`=== Sessions that used ${email} ===`);
const audits = await prisma.wizardAuditLog.findMany({
  where: {
    event: "s2.email.request",
    payload: { path: ["email"], equals: email },
  },
  orderBy: { ts: "desc" },
  take: 20,
});
for (const a of audits) {
  console.log(`${a.ts.toISOString()} | sid=${a.sessionId}`);
}

console.log(`\n=== Outlook credential row ===`);
const cred = await prisma.outlookCredentials.findFirst({
  where: { email },
});
console.log(JSON.stringify(cred, null, 2));

console.log(`\n=== Recent OTP events on sessions that used ${email} ===`);
const sids = audits.map((a) => a.sessionId);
const otpAudits = await prisma.wizardAuditLog.findMany({
  where: {
    sessionId: { in: sids },
    event: { startsWith: "s3.otp" },
  },
  orderBy: { ts: "desc" },
  take: 30,
});
for (const a of otpAudits) {
  const p = JSON.stringify(a.payload).slice(0, 200);
  console.log(`${a.ts.toISOString()} | ${a.sessionId.slice(0, 8)} | ${a.event} | ${p}`);
}

await prisma.$disconnect();
