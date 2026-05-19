// Replicate the EXACT haystack the otp-imap route builds, so we can
// see why extractOtp returns a value that doesn't appear in the
// human-visible email body. The route includes the raw decoded source
// in addition to subject/text/html — that pulls in RFC headers, MIME
// boundaries, DKIM signatures, base64 fragments, etc. — any of which
// can contain stray 6-digit substrings.

import { readFileSync } from "node:fs";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

try {
  const env = readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"));
  for (const line of env) {
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
} catch {}

function stripHtmlTags(input) {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&");
}
function decodeQuotedPrintableLite(input) {
  return input
    .replace(/=\r?\n/g, "")
    .replace(/=([A-Fa-f0-9]{2})/g, (_m, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
}

const uid = Number(process.argv[2] ?? 21);
const client = new ImapFlow({
  host: process.env.KYC_GMAIL_IMAP_HOST?.trim() || "imap.gmail.com",
  port: Number(process.env.KYC_GMAIL_IMAP_PORT || 993),
  secure: true,
  auth: { user: process.env.KYC_GMAIL_IMAP_USER, pass: process.env.KYC_GMAIL_IMAP_APP_PASSWORD },
  logger: false,
});

await client.connect();
const lock = await client.getMailboxLock("INBOX");
try {
  const message = await client.fetchOne(
    String(uid),
    { envelope: true, source: true, internalDate: true },
    { uid: true },
  );
  if (!message) {
    console.log(`No UID ${uid}`);
    process.exit(0);
  }
  const parsed = await simpleParser(message.source);
  const subject = message.envelope?.subject ?? parsed.subject ?? "";
  const raw = message.source ? message.source.toString("utf8") : "";
  const decodedRaw = decodeQuotedPrintableLite(raw);
  const parsedText = parsed.text ?? "";
  const parsedHtmlText = typeof parsed.html === "string" ? stripHtmlTags(parsed.html) : parsed.html ? stripHtmlTags(String(parsed.html)) : "";
  const plain = stripHtmlTags(decodedRaw);

  // Match the FIXED route (body-only, no raw source — MIME boundary
  // hex contained `449825` and contaminated the last-match pick):
  const haystack = `${subject}\n${parsedText}\n${parsedHtmlText}`;
  const matches = haystack.match(/(?<!\d)\d{6}(?!\d)/g) ?? [];

  console.log(`Total 6-digit matches in route haystack: ${matches.length}`);
  console.log("FIRST 10:", matches.slice(0, 10));
  console.log("LAST 10:", matches.slice(-10));
  console.log(`LAST match (what extractOtp returns): ${matches[matches.length - 1]}`);

  // Find context of the last match
  const target = matches[matches.length - 1];
  if (target) {
    const idx = haystack.lastIndexOf(target);
    const ctxStart = Math.max(0, idx - 100);
    const ctxEnd = Math.min(haystack.length, idx + 120);
    console.log(`\nContext around last match "${target}":`);
    console.log("---");
    console.log(haystack.slice(ctxStart, ctxEnd).replace(/\s+/g, " "));
    console.log("---");
  }

  // Break down per-source
  console.log("\nBy-source counts:");
  console.log(`  subject:        ${(subject.match(/(?<!\d)\d{6}(?!\d)/g) ?? []).length}`);
  console.log(`  parsed.text:    ${(parsedText.match(/(?<!\d)\d{6}(?!\d)/g) ?? []).length}`);
  console.log(`  html stripped:  ${(parsedHtmlText.match(/(?<!\d)\d{6}(?!\d)/g) ?? []).length}`);
  console.log(`  raw-decoded:    ${(plain.match(/(?<!\d)\d{6}(?!\d)/g) ?? []).length}`);

  // Print decoded-raw 6-digit matches with context
  const rawMatches = [...plain.matchAll(/(?<!\d)(\d{6})(?!\d)/g)];
  console.log("\nDecoded-raw matches with context:");
  for (const m of rawMatches.slice(-15)) {
    const i = m.index ?? 0;
    const ctx = plain.slice(Math.max(0, i - 60), Math.min(plain.length, i + 80)).replace(/\s+/g, " ");
    console.log(`  ${m[1]}: ...${ctx}...`);
  }
} finally {
  lock.release();
  await client.logout().catch(() => undefined);
}
