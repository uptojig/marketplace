// Connects to the configured IMAP inbox and prints raw + decoded text of
// recent OTP emails so we can see whether the user's name / cid is
// actually present in the body the matcher is scanning.

import { readFileSync } from "node:fs";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

// Tiny .env loader so this script can run without a dotenv dependency.
try {
  const env = readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"));
  for (const line of env) {
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // ignore — env vars may already be set
}

const user = process.env.KYC_GMAIL_IMAP_USER?.trim();
const pass = process.env.KYC_GMAIL_IMAP_APP_PASSWORD?.trim();
if (!user || !pass) {
  console.error("Missing KYC_GMAIL_IMAP_USER / KYC_GMAIL_IMAP_APP_PASSWORD env");
  process.exit(1);
}

const targetUid = Number(process.argv[2] ?? 19);
const recipient = process.argv[3]?.toLowerCase() ?? null;

const client = new ImapFlow({
  host: process.env.KYC_GMAIL_IMAP_HOST?.trim() || "imap.gmail.com",
  port: Number(process.env.KYC_GMAIL_IMAP_PORT || 993),
  secure: true,
  auth: { user, pass },
  logger: false,
});

await client.connect();
const lock = await client.getMailboxLock("INBOX");
try {
  const message = await client.fetchOne(
    String(targetUid),
    { envelope: true, source: true, internalDate: true },
    { uid: true },
  );
  if (!message) {
    console.log(`No message with UID ${targetUid}`);
    process.exit(0);
  }
  console.log("=== ENVELOPE ===");
  console.log("subject:", message.envelope?.subject);
  console.log("to:", message.envelope?.to);
  console.log("from:", message.envelope?.from);
  console.log("date:", message.internalDate?.toISOString());

  const parsed = await simpleParser(message.source);
  console.log("\n=== PARSED TEXT (first 3000 chars) ===");
  console.log((parsed.text ?? "").slice(0, 3000));
  console.log("\n=== PARSED HTML STRIPPED (first 3000 chars) ===");
  const html = typeof parsed.html === "string" ? parsed.html : String(parsed.html ?? "");
  const stripped = html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&");
  console.log(stripped.slice(0, 3000));
  console.log("\n=== 6-DIGIT MATCHES IN HAYSTACK (in order) ===");
  const haystack = `${parsed.subject ?? ""}\n${parsed.text ?? ""}\n${stripped}`;
  const matches = haystack.match(/(?<!\d)\d{6}(?!\d)/g) ?? [];
  matches.forEach((m, i) => console.log(`  [${i}] ${m}${i === matches.length - 1 ? "  <-- extractOtp returns this (LAST)" : ""}`));
  console.log("\n=== NAME / CID SEARCH ===");
  if (process.argv.includes("--cid")) {
    const cid = process.argv[process.argv.indexOf("--cid") + 1];
    console.log(`contains cid '${cid}':`, haystack.includes(cid));
  }
} finally {
  lock.release();
  await client.logout().catch(() => undefined);
}
