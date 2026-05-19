// Scan last N emails in the IMAP inbox and print: UID, date, recipient,
// subject, first 6-digit match. Useful when a session reports a wrong
// OTP and we need to figure out which email the value came from.

import { readFileSync } from "node:fs";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

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
} catch {}

const user = process.env.KYC_GMAIL_IMAP_USER?.trim();
const pass = process.env.KYC_GMAIL_IMAP_APP_PASSWORD?.trim();
if (!user || !pass) {
  console.error("Missing IMAP env");
  process.exit(1);
}

const limit = Number(process.argv[2] ?? 15);
const findOtp = process.argv[3];

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
  const since = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours
  const uids = await client.search({ since }, { uid: true });
  if (!uids || uids.length === 0) {
    console.log("No mail in last 3h");
    process.exit(0);
  }
  const sorted = [...uids].sort((a, b) => b - a).slice(0, limit);
  for (const uid of sorted) {
    const msg = await client.fetchOne(
      String(uid),
      { envelope: true, source: true, internalDate: true },
      { uid: true },
    );
    if (!msg) continue;
    const parsed = await simpleParser(msg.source).catch(() => null);
    const to = msg.envelope?.to?.map((e) => e.address).join(", ") ?? "";
    const subject = msg.envelope?.subject ?? "";
    const text = parsed?.text ?? "";
    const html = typeof parsed?.html === "string" ? parsed.html : String(parsed?.html ?? "");
    const stripped = html.replace(/<[^>]+>/g, " ");
    const hay = `${subject}\n${text}\n${stripped}`;
    const matches = hay.match(/(?<!\d)\d{6}(?!\d)/g) ?? [];
    const otps = Array.from(new Set(matches));
    const matchesTarget = findOtp ? otps.includes(findOtp) : false;
    console.log(
      `${matchesTarget ? "*" : " "} UID=${uid} ${msg.internalDate?.toISOString()} | to=${to} | otps=[${otps.join(",")}] | subject="${subject.slice(0, 50)}"`,
    );
  }
} finally {
  lock.release();
  await client.logout().catch(() => undefined);
}
