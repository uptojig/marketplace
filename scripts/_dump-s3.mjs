// Dump the S3 phone-response OCR result from DB so we can see exactly what
// Typhoon returned and where the field extraction went wrong.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
try {
  const sid = process.argv[2] ?? "0c70ac35-e36b-40aa-82bd-bf70553b962c";
  const row = await prisma.wizardOcrResult.findFirst({
    where: { sessionId: sid, provider: "typhoon_ussd" },
    orderBy: { createdAt: "desc" },
  });
  if (!row) { console.log("no typhoon_ussd OCR row"); process.exit(0); }
  console.log("== extracted ==");
  console.log(JSON.stringify(row.extracted, null, 2));
  console.log("\n== rawResponse ==");
  console.log(JSON.stringify(row.rawResponse, null, 2));
} finally {
  await prisma.$disconnect();
}
