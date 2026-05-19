import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import type { Identity } from "@/types/identity";

const DEFAULT_IMAP_HOST = "imap.gmail.com";
const DEFAULT_IMAP_PORT = 993;

export interface OtpMailHit {
  otp: string;
  uid: number;
  subject: string;
  matchedName: boolean;
  matchedCitizenId: boolean;
  matchReason: "both" | "name" | "citizen_id" | "none";
  receivedAt: Date | null;
}

export class ImapNotConfiguredError extends Error {
  constructor() {
    super("Gmail IMAP credentials are not configured");
    this.name = "ImapNotConfiguredError";
  }
}

function stripHtmlTags(input: string): string {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&");
}

function decodeQuotedPrintableLite(input: string): string {
  return input
    .replace(/=\r?\n/g, "")
    .replace(/=([A-Fa-f0-9]{2})/g, (_match, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    );
}

function digitsOnly(input: string): string {
  return input.replace(/\D+/g, "");
}

function normalizeForContains(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function extractOtp(text: string): string | null {
  const matches = text.match(/(?<!\d)\d{6}(?!\d)/g);
  if (!matches || matches.length === 0) return null;
  return matches[matches.length - 1] ?? null;
}

function extractCitizenIdCandidates(text: string): string[] {
  const out = new Set<string>();
  const push = (raw: string) => {
    const normalized = digitsOnly(raw);
    if (normalized.length === 13) out.add(normalized);
  };

  const byLoosePattern = text.match(/\d[\d\-\s]{10,24}\d/g) ?? [];
  for (const match of byLoosePattern) push(match);

  const byUsernameLabel = text.matchAll(
    /(?:username|user\s*name|\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19)\s*[:\uFF1A]\s*([0-9\-\s]{6,30})/giu,
  );
  for (const match of byUsernameLabel) {
    if (match[1]) push(match[1]);
  }

  return Array.from(out);
}

function getNameCandidates(identity: Identity | null): string[] {
  if (!identity?.thName && !identity?.enName) return [];
  const values = new Set<string>();
  const add = (value: string | undefined) => {
    if (!value) return;
    const normalized = normalizeForContains(value);
    if (normalized) values.add(normalized);
  };
  add(identity?.thName?.full);
  add(identity?.thName?.first);
  add(identity?.thName?.last);
  add(identity?.enName?.full);
  add(identity?.enName?.first);
  add(identity?.enName?.last);
  return Array.from(values);
}

function isRecipientMatch(toAddresses: string[], expectedEmail: string): boolean {
  const target = expectedEmail.trim().toLowerCase();
  if (!target) return true;
  return toAddresses.some((address) => address.trim().toLowerCase() === target);
}

function extractEmails(input: string): string[] {
  const hits = input.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  return hits.map((value) => value.trim().toLowerCase());
}

function isRecipientMatchFromRaw(rawText: string, expectedEmail: string): boolean {
  const target = expectedEmail.trim().toLowerCase();
  if (!target) return true;
  const lines = rawText.split(/\r?\n/);
  const rawCandidates: string[] = [];

  for (const line of lines) {
    if (!/^\s*(to|x-original-to|x-forwarded-to|delivered-to)\s*:/i.test(line)) continue;
    rawCandidates.push(...extractEmails(line));
  }

  if (rawCandidates.some((value) => value === target)) return true;

  // Fallback for clients that inline-forward and don't preserve raw headers
  // in strict RFC form. Still requires exact email match.
  return rawText.toLowerCase().includes(target);
}

function hasNameMatch(mailText: string, identity: Identity | null): boolean {
  const candidates = getNameCandidates(identity);
  if (candidates.length === 0) return false;

  const normalizedText = normalizeForContains(mailText);
  const first = normalizeForContains(identity?.thName?.first ?? identity?.enName?.first ?? "");
  const last = normalizeForContains(identity?.thName?.last ?? identity?.enName?.last ?? "");
  if (first && last && normalizedText.includes(first) && normalizedText.includes(last)) {
    return true;
  }
  return candidates.some((candidate) => normalizedText.includes(candidate));
}

function hasCitizenIdMatch(mailText: string, identity: Identity | null): boolean {
  const id = digitsOnly(identity?.citizenId ?? identity?.citizenIdFormatted ?? "");
  if (id.length !== 13) return false;
  const candidates = extractCitizenIdCandidates(mailText);
  return candidates.includes(id);
}

export async function fetchLatestOtpFromImap(args: {
  recipientEmail: string;
  identity: Identity | null;
  maxAgeMinutes?: number;
  maxScan?: number;
}): Promise<OtpMailHit | null> {
  const user = process.env.KYC_GMAIL_IMAP_USER?.trim();
  const pass = process.env.KYC_GMAIL_IMAP_APP_PASSWORD?.trim();
  if (!user || !pass) throw new ImapNotConfiguredError();

  const host = process.env.KYC_GMAIL_IMAP_HOST?.trim() || DEFAULT_IMAP_HOST;
  const port = Number(process.env.KYC_GMAIL_IMAP_PORT || DEFAULT_IMAP_PORT);
  const maxAgeMinutes = args.maxAgeMinutes ?? 10;
  const maxScan = Math.max(1, Math.min(args.maxScan ?? 25, 100));
  const since = new Date(Date.now() - maxAgeMinutes * 60 * 1000);

  const client = new ImapFlow({
    host,
    port,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  await client.connect();
  const lock = await client.getMailboxLock("INBOX");
  try {
    const unseen = await client.search({ seen: false, since }, { uid: true });
    const recent = await client.search({ since }, { uid: true });
    const uids = Array.from(new Set([...(unseen ?? []), ...(recent ?? [])]));
    if (uids.length === 0) return null;

    const sortedDesc = [...uids].sort((a, b) => b - a).slice(0, maxScan);
    for (const uid of sortedDesc) {
      const message = await client.fetchOne(
        String(uid),
        { envelope: true, source: true, internalDate: true },
        { uid: true },
      ) as {
        envelope?: { subject?: string; to?: Array<{ address?: string }> };
        source?: Buffer;
        internalDate?: Date;
      } | null;

      if (!message) continue;
      if (message.internalDate && message.internalDate.getTime() < since.getTime()) continue;
      const toAddresses = (message.envelope?.to ?? [])
        .map((entry) => entry.address ?? "")
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      const parsed = message.source
        ? await simpleParser(message.source).catch(() => null)
        : null;
      const parsedToAddresses = parsed?.to?.value
        ?.map((entry) => entry.address ?? "")
        .filter(Boolean)
        .map((value) => value.toLowerCase()) ?? [];

      const subject = message.envelope?.subject ?? parsed?.subject ?? "";
      const raw = message.source ? message.source.toString("utf8") : "";
      const decodedRaw = decodeQuotedPrintableLite(raw);
      const parsedText = parsed?.text ?? "";
      const parsedHtmlText =
        typeof parsed?.html === "string"
          ? stripHtmlTags(parsed.html)
          : parsed?.html
            ? stripHtmlTags(String(parsed.html))
            : "";
      const recipientMatch =
        isRecipientMatch([...toAddresses, ...parsedToAddresses], args.recipientEmail) ||
        isRecipientMatchFromRaw(decodedRaw, args.recipientEmail);
      if (!recipientMatch) continue;

      // OTP / name / cid haystack is body-only — mailparser already
      // decoded the human-visible text/html. We deliberately exclude the
      // raw decoded source: it carries MIME headers, multipart boundary
      // strings, and DKIM signatures whose random hex runs happen to
      // contain 6-digit substrings the OTP regex picks up. Boundary
      // strings sit at the end of the message body, so they ALWAYS beat
      // the real OTP under "last 6-digit match" tie-breaking.
      // Recipient matching above still uses the raw source because the
      // recipient address lives in the header.
      const haystack = `${subject}\n${parsedText}\n${parsedHtmlText}`;
      const otp = extractOtp(haystack);
      if (!otp) continue;

      const matchedName = hasNameMatch(haystack, args.identity);
      const matchedCitizenId = hasCitizenIdMatch(haystack, args.identity);
      const matchReason: OtpMailHit["matchReason"] =
        matchedName && matchedCitizenId
          ? "both"
          : matchedName
            ? "name"
            : matchedCitizenId
              ? "citizen_id"
              : "none";

      return {
        otp,
        uid,
        subject,
        matchedName,
        matchedCitizenId,
        matchReason,
        receivedAt: message.internalDate ?? null,
      };
    }
    return null;
  } finally {
    lock.release();
    await client.logout().catch(() => undefined);
  }
}
