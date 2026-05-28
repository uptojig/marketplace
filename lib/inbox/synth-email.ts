/**
 * Deterministic synthetic email generation for phone-only customers.
 *
 * Format: <merchantSlug>.<nameSlug>-<hash6>@inbox.basketplace.co
 *   e.g. sheetlab-th.somchai-jaidee-a3f9k2@inbox.basketplace.co
 *
 * Properties:
 *   - Deterministic: same (storeSlug, name, userId) → same address, so
 *     it can be recomputed any time without a mapping table.
 *   - Store-scoped: the merchant slug prefixes the local part so the
 *     same person at two stores gets two distinct inboxes.
 *   - Collision-safe: a 6-char base32 hash of the immutable userId
 *     disambiguates identical names within one store (32^6 ≈ 1.07e9).
 *   - Stable on rename: the hash is derived from userId (NOT the name),
 *     so editing the display name doesn't change the address. The
 *     nameSlug is a snapshot for readability only.
 *
 * Phase 1 the address is delivered IN-APP (see InboxMessage + the
 * sendEmail short-circuit). It is NOT a real external mailbox until the
 * inbound MX provider is wired up.
 */

export const INBOX_DOMAIN = 'inbox.basketplace.co';

/**
 * Minimal Thai → Latin phonetic transliteration. Not linguistically
 * perfect — just enough to produce a readable, URL-safe slug from a
 * Thai display name. Consonants map to their initial-position romanized
 * sound; vowels/tone marks collapse to a best-effort Latin vowel or are
 * dropped. Names with no mappable characters fall back to a hash-only
 * slug (see slugifyName).
 */
// Keys are quoted strings throughout — several Thai vowels are combining
// marks (zero-width) that are invalid as bare object-literal keys.
const THAI_MAP: Record<string, string> = {
  'ก': 'k', 'ข': 'kh', 'ฃ': 'kh', 'ค': 'kh', 'ฅ': 'kh', 'ฆ': 'kh',
  'ง': 'ng', 'จ': 'ch', 'ฉ': 'ch', 'ช': 'ch', 'ซ': 's', 'ฌ': 'ch',
  'ญ': 'y', 'ฎ': 'd', 'ฏ': 't', 'ฐ': 'th', 'ฑ': 'th', 'ฒ': 'th',
  'ณ': 'n', 'ด': 'd', 'ต': 't', 'ถ': 'th', 'ท': 'th', 'ธ': 'th',
  'น': 'n', 'บ': 'b', 'ป': 'p', 'ผ': 'ph', 'ฝ': 'f', 'พ': 'ph',
  'ฟ': 'f', 'ภ': 'ph', 'ม': 'm', 'ย': 'y', 'ร': 'r', 'ล': 'l',
  'ว': 'w', 'ศ': 's', 'ษ': 's', 'ส': 's', 'ห': 'h', 'ฬ': 'l',
  'อ': 'o', 'ฮ': 'h',
  // Vowels (standalone + combining)
  'ะ': 'a', 'ั': 'a', 'า': 'a', 'ำ': 'am', 'ิ': 'i', 'ี': 'i',
  'ึ': 'ue', 'ื': 'ue', 'ุ': 'u', 'ู': 'u', 'เ': 'e', 'แ': 'ae',
  'โ': 'o', 'ใ': 'ai', 'ไ': 'ai', 'ๅ': 'a', '็': '', '่': '', '้': '',
  '๊': '', '๋': '', '์': '', 'ๆ': '', 'ฯ': '',
};

function transliterateThai(input: string): string {
  let out = '';
  for (const ch of input) {
    if (THAI_MAP[ch] !== undefined) {
      out += THAI_MAP[ch];
    } else if (/[a-zA-Z0-9]/.test(ch)) {
      out += ch;
    } else if (/\s/.test(ch)) {
      out += '-';
    }
    // everything else (emoji, punctuation, other scripts) dropped
  }
  return out;
}

/**
 * Turn a display name into a URL/email-safe slug. Returns '' when the
 * name produces no usable characters — caller falls back to hash-only.
 */
export function slugifyName(name: string): string {
  return transliterateThai(name.trim().toLowerCase())
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30)
    .replace(/-$/g, '');
}

/**
 * Crockford-ish base32 of a SHA-256 digest, first `len` chars. Lowercase
 * + no ambiguous chars so the email local-part stays clean.
 */
async function hash32(input: string, len: number): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  const alphabet = 'abcdefghijklmnopqrstuvwxyz234567'; // 32 chars, no 0/1/8/9
  let out = '';
  for (let i = 0; i < len; i++) {
    out += alphabet[bytes[i] % 32];
  }
  return out;
}

export interface SynthEmailInput {
  storeSlug: string;
  name: string;
  /** Immutable User.id — anchors the collision-resistant hash suffix. */
  userId: string;
}

/**
 * Build the deterministic synthetic address. Async because it uses the
 * WebCrypto digest (available in both Node 20+ and the edge runtime).
 */
export async function deterministicEmail(
  input: SynthEmailInput,
): Promise<string> {
  const storeSlug = input.storeSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const nameSlug = slugifyName(input.name) || 'u';
  const suffix = await hash32(input.userId, 6);
  return `${storeSlug}.${nameSlug}-${suffix}@${INBOX_DOMAIN}`;
}

/** True when an address is one of our in-app synthetic inbox addresses. */
export function isInboxAddress(addr: string): boolean {
  return addr.trim().toLowerCase().endsWith(`@${INBOX_DOMAIN}`);
}

/**
 * Pull the merchant slug back out of a synthetic address (everything
 * before the first dot in the local part). Returns null for non-inbox
 * addresses or malformed local parts. Used by the inbound webhook to
 * attribute a message to its store.
 */
export function merchantSlugFromInboxAddress(addr: string): string | null {
  if (!isInboxAddress(addr)) return null;
  const local = addr.split('@')[0] ?? '';
  const dot = local.indexOf('.');
  if (dot <= 0) return null;
  return local.slice(0, dot);
}
