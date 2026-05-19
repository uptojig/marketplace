import type { Identity } from "@/types/identity";
import type { OcrBookBankResult, OcrIdCardFrontResult } from "./types";
import { parseIappDate } from "./thai-id-validator";

function digitsOnly(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const digits = String(value).replace(/\D+/g, "");
  return digits || undefined;
}

function text(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  return trimmed || undefined;
}

function compactName(...parts: Array<string | undefined>): string | undefined {
  const full = parts
    .filter((part) => {
      const normalized = part?.trim().toLowerCase();
      return Boolean(normalized && !["-", "--", ">", "dga", "dga digital id"].includes(normalized));
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return full || undefined;
}

function toIsoDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = parseIappDate(value);
  if (!parsed) return undefined;
  return parsed.toISOString().slice(0, 10);
}

const THAI_MONTHS: Record<string, number> = {
  "ม.ค.": 1,
  "มกราคม": 1,
  "ก.พ.": 2,
  "กุมภาพันธ์": 2,
  "มี.ค.": 3,
  "มีนาคม": 3,
  "เม.ย.": 4,
  "เมษายน": 4,
  "พ.ค.": 5,
  "พฤษภาคม": 5,
  "มิ.ย.": 6,
  "มิถุนายน": 6,
  "ก.ค.": 7,
  "กรกฎาคม": 7,
  "ส.ค.": 8,
  "สิงหาคม": 8,
  "ก.ย.": 9,
  "กันยายน": 9,
  "ต.ค.": 10,
  "ตุลาคม": 10,
  "พ.ย.": 11,
  "พฤศจิกายน": 11,
  "ธ.ค.": 12,
  "ธันวาคม": 12,
};

export function toIsoThaiDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/\s+/g, " ").trim();
  const match = normalized.match(/(\d{1,2})\s+([^\s]+)\s+(\d{4})/);
  if (!match) return toIsoDate(normalized) ?? normalized;
  const day = Number(match[1]);
  const month = THAI_MONTHS[match[2]];
  const rawYear = Number(match[3]);
  if (!month || !day || !rawYear) return normalized;
  const year = rawYear > 2400 ? rawYear - 543 : rawYear;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function getRecordValue(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return undefined;
}

// Keys to skip when collecting OCR'd text from raw responses. Two reasons:
//  1. layout/metadata strings ("Table", "Figure", "CenTitle", bbox numbers)
//     pollute the parser blob and bleed into name/address values.
//  2. iApp's Layout response duplicates the same content across multiple
//     overlapping components (Table + Figure for the same card region),
//     which breaks the label-position parser because the same label
//     appears multiple times at out-of-order positions. The plain `text`
//     array preserves the document's natural reading order, so we stick
//     with that single source and skip `layout` entirely for parsing.
//     (Layout is still captured separately by image-redaction for bboxes.)
const METADATA_KEYS = new Set([
  "type",
  "bb_left",
  "bb_top",
  "bb_right",
  "bb_bottom",
  "page",
  "time",
  "ic",
  "ms",
  "duration",
  "status_code",
  "request_id",
  "layout",
]);

function collectRawText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(collectRawText);
  return Object.entries(value)
    .filter(([key]) => !METADATA_KEYS.has(key))
    .flatMap(([, v]) => collectRawText(v));
}

const DGA_LABEL_PATTERNS: Array<{ key: string; pattern: RegExp }> = [
  { key: "prefix", pattern: /คำนำหน้าชื่อ/ },
  { key: "firstName", pattern: /ชื่อจริง/ },
  { key: "middleName", pattern: /ชื่อกลาง/ },
  { key: "lastName", pattern: /นามสกุล/ },
  { key: "dobThai", pattern: /วันเดือนปีเกิด/ },
  { key: "citizenId", pattern: /เลข\s*ประจำ\s*ตัว\s*ประชาชน\s*13\s*หลัก/ },
  // DGA's "ที่อยู่ตามบัตรประจำตัวประชาชน" wraps onto 3 lines in some screen
  // sizes, with the registered address VALUE interleaved between label
  // fragments. Loosen the pattern to just the unique "ที่อยู่ตามบัตร" prefix
  // — the value-slicing logic below grabs everything up to the next label.
  { key: "addressByID", pattern: /ที่อยู่ตามบัตร/ },
  { key: "contactAddress", pattern: /ที่อยู่ที่ติดต่อได้/ },
  // Mobile label "เบอร์โทรศัพท์มือถือ" likewise splits as "เบอร์โทรศัพท์มือ"
  // [value] "ถือ" on narrow phones. Match the prefix only, then accept the
  // trailing "ถือ" as part of the value (cleanDgaLabelValue strips it).
  // Phone label uses negative lookahead so "เบอร์โทรศัพท์มือ" (split mobile)
  // doesn't double-match into both keys.
  { key: "phone", pattern: /เบอร์โทรศัพท์(?!มือ)/ },
  { key: "mobilePhone", pattern: /เบอร์โทรศัพท์มือ/ },
  { key: "email", pattern: /อีเมล/ },
];

// Markdown table separator rows look like `|---|---|` or `| --- | --- |`.
// DGA uses `--` (exactly two dashes) as a "no value" placeholder — we keep
// those as a valid value, not a separator. Threshold: ≥3 dashes/equals.
const MARKDOWN_SEPARATOR = /^[\s|]*[-=]{3,}[\s|=-]*$/;

function cleanDgaLabelValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  // Typhoon OCR v1.5 returns layout-aware output — values may be wrapped
  // in HTML tables (<td>x</td>) or markdown tables (| x |), and DGA rows
  // include a green-check marker [✓] plus a > arrow at the end of each row.
  // Strip all those decorations before collapsing whitespace. Email is then
  // de-spaced since OCR sometimes wraps long addresses onto two lines.
  const cleaned = value
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/<\/?(?:table|thead|tbody|tr|td|th|br|p|div|span)[^>]*>/gi, "\n")
    .replace(/\[\s*[✓✔]\s*\]/g, "")
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^\s*[>|]+\s*/, "")
        .replace(/\s*[>|]+\s*$/, "")
        .replace(MARKDOWN_SEPARATOR, "")
        .trim(),
    )
    .filter((line) => line && line !== ">" && !MARKDOWN_SEPARATOR.test(line))
    .join(" ")
    .replace(/\s*\|\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return undefined;
  return cleaned.includes("@") ? cleaned.replace(/\s+/g, "") : cleaned;
}

function parseDgaThaiLabelValues(raw: Record<string, unknown>): Record<string, string> {
  const blob = collectRawText(raw)
    .join("\n")
    .replace(/&gt;/g, ">")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
  if (!blob) return {};

  const matches = DGA_LABEL_PATTERNS
    .map((label) => {
      const match = label.pattern.exec(blob);
      return match ? { key: label.key, index: match.index, end: match.index + match[0].length } : null;
    })
    .filter((match): match is { key: string; index: number; end: number } => Boolean(match))
    .sort((left, right) => left.index - right.index);

  const values: Record<string, string> = {};
  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];
    const value = cleanDgaLabelValue(blob.slice(current.end, next?.index));
    if (value) values[current.key] = value;
  }
  return values;
}

function phoneLast4From(value: unknown): string | undefined {
  const digits = digitsOnly(value);
  return digits && digits.length >= 4 ? digits.slice(-4) : undefined;
}

function citizenIdFromText(value: string): string | undefined {
  const match = value.match(/\d-\d{4}-\d{5}-\d{2}-\d|\b\d{13}\b/);
  return digitsOnly(match?.[0]);
}

function phoneLast4FromText(value: string): string | undefined {
  return value.match(/0[689][-\s]?x{2,4}[-\s]?(\d{4})/i)?.[1];
}

// Regex extractors for structured fields — used as fallbacks when iApp's
// plain-text OCR interleaves labels and values from a multi-column form
// (DGA Digital ID profile is a 2-column table; iApp reads top-to-bottom
// across both columns so label-position parsing alone misses entries).
function emailFromText(value: string): string | undefined {
  // Collapse any whitespace that fell inside an email (Thai OCR sometimes
  // breaks a long address onto two lines mid-token).
  const flattened = value.replace(/\s+(?=[A-Za-z0-9_.+-]+@)/g, "").replace(/@\s+/g, "@").replace(/\.\s+/g, ".");
  const match = flattened.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return match?.[0]?.toLowerCase();
}

// Defense-in-depth against browser-chrome OCR contamination. When iPhone
// Safari's URL bar overlay (e.g. "connect.egov.go.th") gets OCR'd on the
// same line as the user's email, our greedy email regex captures the whole
// concatenated string: "connect.egov.go.thuptojig@gmail.com".
//
// Strategy: in the local part (everything before "@"), look for a TLD
// substring (.go.th, .com, etc.) that has MORE local-part chars after it.
// A real email's local part wouldn't contain a TLD-shape followed by more
// chars — that pattern only comes from a domain bleeding into the front
// of the value. Strip everything up to and including that TLD.
//
// Also trims trailing non-email garbage (chevrons, Thai chars, whitespace)
// — chevron `>` is the "tap to expand" affordance on each DGA row, which
// iApp's OCR sometimes reads as `<` and appends to the email value.
//
// Order matters: try the longest TLDs first ("go.th" before "th") so
// ".go.th" wins when both are present.
const URL_TLDS_LONGEST_FIRST = [
  ".go.th",
  ".co.th",
  ".or.th",
  ".ac.th",
  ".in.th",
  ".info",
  ".gov",
  ".edu",
  ".com",
  ".net",
  ".org",
  ".biz",
  ".io",
  ".co",
  ".th",
] as const;
const EMAIL_TRAILING_GARBAGE = /[<>‹›「」「」⟨⟩\s฀-๿].*$/;

export function stripLeakedUrlFromEmail(value: string | undefined): string | undefined {
  if (!value) return value;

  // Strip trailing chevron/Thai/whitespace + anything after — those are
  // never part of a real email and they break the local-part check below.
  let cleaned = value.replace(EMAIL_TRAILING_GARBAGE, "").trim().toLowerCase();
  if (!cleaned) return undefined;

  const atIdx = cleaned.indexOf("@");
  if (atIdx <= 0) return cleaned;

  const local = cleaned.slice(0, atIdx);
  for (const tld of URL_TLDS_LONGEST_FIRST) {
    const tldIdx = local.lastIndexOf(tld);
    if (tldIdx >= 0 && tldIdx + tld.length < local.length) {
      // TLD found AND there's more local-part text after it → URL bleed.
      return cleaned.slice(tldIdx + tld.length);
    }
  }
  return cleaned;
}

function mobilePhoneFromText(value: string): string | undefined {
  // Thai mobile: 10 digits total (e.g. 080-068-8770), prefix 06/08/09.
  // Layout-aware OCR may insert spaces/dashes between groups, so accept
  // dashes OR spaces between the 3-3-4 groups. Earlier regex used
  // `\b0[689][-\s]?\d{3}[-\s]?\d{4}\b` which only counts 9 digits
  // (2+3+4) — that fails on the standard 10-digit Thai mobile format.
  const dashed = value.match(/\b0[689]\d[-\s]?\d{3}[-\s]?\d{4}\b/);
  return dashed?.[0]?.trim();
}

function landlinePhoneFromText(value: string): string | undefined {
  // Thai landline: 10 digits starting 02 (Bangkok) or 0[3-7]X.
  // Exclude the mobile range so we don't double-count.
  const flattened = value.replace(/\s+/g, " ");
  const match = flattened.match(/\b0[2-57][-\s]?\d{3,4}[-\s]?\d{4}\b/);
  return match?.[0]?.replace(/[\s-]/g, "");
}

const THAI_MONTH_REGEX_SOURCE = Object.keys(THAI_MONTHS)
  .map((month) => month.replace(/\./g, "\\."))
  .join("|");

function thaiDobFromText(value: string): string | undefined {
  const re = new RegExp(`(\\d{1,2})\\s+(${THAI_MONTH_REGEX_SOURCE})\\s+(\\d{4})`);
  const match = re.exec(value);
  if (!match) return undefined;
  return toIsoThaiDate(match[0]);
}

// Extract just the "DD <ThaiMonth> YYYY" substring from a possibly-noisy
// slice — used when DGA's label regex misses the next-label boundary and
// the dob slice ends up containing trailing fragments like "เลขประจําตัว
// 1-1017-00119-59-9 ประชาชน 13 หลัก". We want the clean DGA-displayed form,
// not the whole noisy slice.
function thaiDobRawFromText(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const re = new RegExp(`\\b(\\d{1,2})\\s+(${THAI_MONTH_REGEX_SOURCE})\\s+(\\d{4})\\b`);
  const match = re.exec(value);
  return match?.[0]?.trim();
}

// Extract the Thai citizen-ID "as displayed" pattern (`1-1017-00119-59-9`)
// from a possibly-noisy text fragment. The dashed form is the canonical
// way DGA renders the field. Falls back to `\d{13}` if the dashed format
// isn't present.
function citizenIdFormattedFromText(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const dashed = value.match(/\d-\d{4}-\d{5}-\d{2}-\d/);
  if (dashed) return dashed[0];
  const bare = value.match(/\b\d{13}\b/);
  return bare?.[0];
}

// Repair common Thai word-break artifacts that show up when iApp's OCR
// splits a long address mid-syllable across two lines: e.g. the province
// "กรุงเทพมหานคร" emerges as "กรุงเทพมหาน" + "คร" on two lines and ends up
// joined with a stray space. Normalize known province-name fragments back.
function repairThaiAddressLineBreaks(value: string): string {
  return value
    .replace(/มหาน\s+คร/g, "มหานคร")
    .replace(/มหา\s+นคร/g, "มหานคร")
    .replace(/นคร\s+ราชสีมา/g, "นครราชสีมา")
    .replace(/นคร\s+ปฐม/g, "นครปฐม")
    .replace(/นคร\s+สวรรค์/g, "นครสวรรค์")
    .replace(/นคร\s+ศรีธรรมราช/g, "นครศรีธรรมราช")
    .replace(/\s+/g, " ")
    .trim();
}

// Universal structural endpoints of a Thai address — every formal Thai
// address ends at จังหวัด<X> / จ.<X> / กรุงเทพมหานคร, optionally followed
// by a 5-digit postal code (per Universal Postal Union SAFD Thailand and
// the Thai government addressing standard). This is a structural truth
// independent of how the address STARTS (which can be "บ้านเลขที่ <N>",
// "<N> หมู่...", "<N>/<sub> ถ....", etc.).
//
// Splitting on these endpoints handles iApp's column-first OCR bleed: if
// the parser slices "ที่อยู่ตามบัตร" empty and "ที่อยู่ที่ติดต่อได้" gets
// BOTH addresses concatenated, we split that fat slice into N segments
// using these endpoints — no value-format pattern matching required.
//
// Priority order = longest-first so "(จังหวัด|จ\.)<X>\s+<NNNNN>" wins
// over either part alone. This prevents mid-address splits when an
// address ends with BOTH a province and a postal code (the postal becomes
// part of the same segment, not a separate spurious one).
const THAI_ADDRESS_ENDPOINT_RE =
  /(?:(?:จังหวัด|จ\.)[฀-๿]+\s+\d{5}\b|กรุงเทพมหานคร\s+\d{5}\b|\b\d{5}\b|(?:จังหวัด|จ\.)[฀-๿]+|กรุงเทพมหานคร)/g;

/**
 * Split a text blob at every Thai-address structural endpoint marker.
 * Each segment runs from the previous endpoint (or blob start) through
 * the current endpoint, inclusive. Segments shorter than 10 chars are
 * filtered as noise. Caller is responsible for assigning segments to
 * labels (e.g., first → registered, second → contact).
 *
 * Format-agnostic: doesn't care HOW each address starts (slash-numbered,
 * "บ้านเลขที่", "<N> หมู่", or any future DGA format). Only relies on the
 * structural END of a Thai address, which is fixed by postal regulations.
 */
export function splitAtThaiAddressEndpoints(blob: string): string[] {
  if (!blob) return [];
  const flat = blob.replace(/\s+/g, " ").trim();
  if (!flat) return [];

  const out: string[] = [];
  let lastEnd = 0;
  let match: RegExpExecArray | null;
  THAI_ADDRESS_ENDPOINT_RE.lastIndex = 0;
  while ((match = THAI_ADDRESS_ENDPOINT_RE.exec(flat)) !== null) {
    const end = match.index + match[0].length;
    const segment = flat.slice(lastEnd, end).trim();
    if (segment.length >= 10) {
      out.push(repairThaiAddressLineBreaks(segment));
    }
    lastEnd = end;
  }
  return out;
}

// When iApp's layout-aware OCR returns the registered-address VALUE
// interleaved with the label fragments ("ที่อยู่ตามบัตร / value / ประจำตัว
// / value / ประชาชน"), the cleaner leaves the label words inline. Strip
// them so the address comes out clean before downstream matching.
function stripAddressByIdLabelNoise(value: string): string {
  return value
    .replace(/\bประจำตัวประชาชน\b/g, " ")
    .replace(/\bประจำตัว\b/g, " ")
    .replace(/\bประชาชน\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeThaiAddress(value: string | undefined): boolean {
  if (!value) return false;
  return /บ้านเลขที่|หมู่(?:ที่)?|ซอย|ซ\.|ถนน|แขวง|เขต|ตำบล|ต\.|อำเภอ|อ\.|จังหวัด|จ\.|\b\d{5}\b/.test(value);
}

// The DGA screenshot is a full phone screen — iApp's column-aware OCR
// often interleaves the phone's STATUS BAR text (signal strength, time,
// "5G", "LTE", "Wi-Fi") with the adjacent firstName/lastName cells when
// they sit at the top of the form. Similarly the "ชื่อกลาง" middle-name
// label sometimes bleeds into the firstName value (OCR'd as "ชอกลาง"
// when characters are dropped). Strip those artifacts before downstream
// name matching, which compares the cleaned tokens against the ID card.
function cleanThaiNameValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const cleaned = value
    // Status bar artifacts
    .replace(/\b\d{1,2}:\d{2}\b/g, " ")                            // clock time e.g. "19:24"
    .replace(/\b(?:5G|4G|3G|LTE|Wi[\s-]?Fi|VoLTE)\b/gi, " ")       // network labels
    .replace(/[*=•·●]/g, " ")                                       // status icons / glyphs
    .replace(/(?<![฀-๿])\b\d{1,3}\b(?![฀-๿])/g, " ") // free-standing 1-3 digit numbers (signal %, battery %)
    // DGA form label fragments that bleed across cells. OCR sometimes
    // drops the diacritics — "ชื่อกลาง" becomes "ชอกลาง" / "ชี่อกลาง" /
    // "ชอ กลาง". Use a relaxed pattern that tolerates missing/wrong vowel
    // marks and an optional internal space.
    .replace(/ชื?่?[ออ]?[\s]?กลาง/g, " ")
    .replace(/ชื?่?[ออ]?[\s]?จริง/g, " ")
    .replace(/นามสกุล/g, " ")
    .replace(/คำนำหน้าชื่อ/g, " ")
    // The DGA name cell only carries Thai characters. Any free-standing
    // Latin letter or short Latin word is an OCR misread of a status bar
    // icon ("d" for download, "G" for "5G" remnant, etc.) — drop them.
    .replace(/\b[A-Za-z]{1,3}\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || undefined;
}

export function fromIappFront(ocr: OcrIdCardFrontResult): Identity {
  const thFull = ocr.th_name?.trim() || compactName(ocr.th_init, ocr.th_fname, ocr.th_lname);
  const enFull = ocr.en_name?.trim() || compactName(ocr.en_init, ocr.en_fname, ocr.en_lname);

  return {
    citizenId: digitsOnly(ocr.id_number),
    thName: {
      prefix: text(ocr.th_init),
      first: text(ocr.th_fname),
      last: text(ocr.th_lname),
      full: thFull,
    },
    enName: {
      prefix: text(ocr.en_init),
      first: text(ocr.en_fname),
      last: text(ocr.en_lname),
      full: enFull,
    },
    dob: toIsoDate(ocr.en_dob),
    address: {
      full: text(ocr.address || ocr.home_address),
      subdistrict: text(ocr.sub_district),
      district: text(ocr.district),
      province: text(ocr.province),
      postal: text(ocr.postal_code),
    },
  };
}

export function fromTyphoonDga(raw: Record<string, unknown>): Identity {
  const labelValues = parseDgaThaiLabelValues(raw);
  // Full-text fallbacks — iApp's plain-text OCR doesn't preserve clean
  // label→value pairs for the citizenId, email, and phone fields because
  // the DGA form has a multi-column layout. Regex extractors scan the
  // full blob to recover them when label-position parsing comes up short.
  const blob = collectRawText(raw).join("\n");
  // Strip phone status bar artifacts (5G/LTE/clock/signal-%) and DGA
  // form label fragments (ชื่อกลาง / ชื่อจริง / นามสกุล) that bleed into
  // the name cells when iApp's column-aware OCR reads them top-to-bottom.
  const firstName = cleanThaiNameValue(
    text(labelValues.firstName ?? getRecordValue(raw, "firstName", "first_name", "first")),
  );
  const middleName = cleanThaiNameValue(
    text(labelValues.middleName ?? getRecordValue(raw, "middleName", "middle_name", "middle")),
  );
  const lastName = cleanThaiNameValue(
    text(labelValues.lastName ?? getRecordValue(raw, "lastName", "last_name", "last")),
  );
  const prefix = text(labelValues.prefix ?? getRecordValue(raw, "prefix", "title"));
  const rawFullName = text(getRecordValue(raw, "name", "fullName", "full_name"));
  const fullName = rawFullName && !/DGA\s+Digital\s+ID/i.test(rawFullName)
    ? rawFullName
    : compactName(prefix, firstName, middleName, lastName);
  const phone =
    text(labelValues.phone ?? getRecordValue(raw, "phone", "telephone")) ?? landlinePhoneFromText(blob);
  // mobilePhone label is "เบอร์โทรศัพท์มือถือ" but iApp's layout OCR may
  // wrap it as "เบอร์โทรศัพท์มือ\n[value]\nถือ". The loosened pattern
  // (.../เบอร์โทรศัพท์มือ/) catches both, but the captured value can carry
  // a trailing "ถือ" fragment. Run mobilePhoneFromText on the label value
  // first to extract just the 10-digit phone, then fall back to the blob.
  const mobileRaw =
    text(labelValues.mobilePhone ?? getRecordValue(raw, "mobilePhone", "mobile_phone", "mobile")) ?? "";
  const mobilePhone =
    mobilePhoneFromText(mobileRaw) ??
    mobilePhoneFromText(blob) ??
    (mobileRaw || undefined);

  // citizenId: preserve BOTH forms — the raw DGA-shown format
  // ("1-1017-00119-59-9" with dashes) for UI display, and the digits-only
  // form for cross-match. UI shouldn't fake a format that DGA didn't show.
  //
  // Tricky: DGA wraps the label "เลขประจำตัวประชาชน 13 หลัก" across two
  // lines on narrow phones with the VALUE rendered between them. That
  // means our label-position parser may miss the boundary entirely and
  // the slice for adjacent labels (dob, address) absorbs the value. We
  // extract the structured ID pattern (`X-XXXX-XXXXX-XX-X` or 13-digit)
  // from the label slice if present, otherwise from the full blob.
  const citizenIdLabelText = text(labelValues.citizenId ?? getRecordValue(raw, "citizenId", "cid", "idNumber", "id_number"));
  const citizenIdFormatted =
    citizenIdFormattedFromText(citizenIdLabelText) ?? citizenIdFormattedFromText(blob);
  const citizenId = citizenIdFormatted ? digitsOnly(citizenIdFormatted) : citizenIdFromText(blob);

  // dob: preserve BOTH forms — the raw DGA-shown date ("12 สิงหาคม 2535"
  // in Thai BE) for UI display, and the ISO CE form for cross-match.
  // Same wrapping issue as citizenId: the dob slice may carry noise from
  // the next field, so extract just the "DD <ThaiMonth> YYYY" substring.
  const dobLabel = text(labelValues.dobThai ?? getRecordValue(raw, "dob", "dobThai", "birthDate", "birth_date"));
  const dobRaw = thaiDobRawFromText(dobLabel) ?? thaiDobRawFromText(blob);
  const dob = toIsoThaiDate(dobRaw ?? dobLabel) ?? thaiDobFromText(blob);

  const rawAddressLabel = text(labelValues.addressByID ?? getRecordValue(raw, "addressByID", "addressById", "address", "registeredAddress")) ?? "";
  const strippedAddressLabel = stripAddressByIdLabelNoise(rawAddressLabel);
  const contactAddressLabel = text(labelValues.contactAddress ?? getRecordValue(raw, "contactAddress", "contact_address")) ?? "";

  // Generic column-bleed detection: when iApp's column-first OCR places
  // BOTH address values in the contact slice (registered slice ends up
  // empty between adjacent "ที่อยู่ตามบัตร" and "ที่อยู่ที่ติดต่อได้" labels),
  // the registered slice fails looksLikeThaiAddress and the contact slice
  // contains a fat blob with two endpoint markers. Split using universal
  // Thai-address structural endpoints (จังหวัด / postal code) — works
  // for ANY value format, including DGA UI revisions we haven't seen yet.
  const registeredHasContent = looksLikeThaiAddress(strippedAddressLabel) && strippedAddressLabel.length >= 10;

  let addressFull: string | undefined;
  let contactAddressFull: string | undefined;

  if (!registeredHasContent && contactAddressLabel) {
    const segments = splitAtThaiAddressEndpoints(contactAddressLabel);
    if (segments.length >= 2) {
      addressFull = segments[0];
      contactAddressFull = segments[1];
    } else if (segments.length === 1) {
      // DGA shows the same address for both labels — assign to both.
      addressFull = segments[0];
      contactAddressFull = segments[0];
    }
  }

  // No bleed detected — use each label's own slice independently.
  if (addressFull === undefined && registeredHasContent) {
    addressFull = repairThaiAddressLineBreaks(strippedAddressLabel);
  }
  if (contactAddressFull === undefined && looksLikeThaiAddress(contactAddressLabel)) {
    contactAddressFull = repairThaiAddressLineBreaks(contactAddressLabel);
  }

  const emailLabel = text(labelValues.email ?? getRecordValue(raw, "email"))?.toLowerCase();
  const rawEmail = emailLabel?.includes("@") ? emailLabel : emailFromText(blob);
  const cleanedEmail = stripLeakedUrlFromEmail(rawEmail);

  return {
    citizenId,
    citizenIdFormatted,
    thName: {
      prefix,
      first: firstName,
      middle: middleName,
      last: lastName,
      full: fullName,
    },
    dob,
    dobRaw,
    address: {
      full: addressFull,
    },
    contactAddress: {
      full: contactAddressFull,
    },
    phone,
    mobilePhone,
    phoneLast4: phoneLast4From(mobilePhone || phone),
    email: cleanedEmail,
    username: text(getRecordValue(raw, "username")),
    userType: text(getRecordValue(raw, "userType", "user_type")),
    authMethod: text(getRecordValue(raw, "authMethod", "auth_method")),
    ialLevels: Array.isArray(raw.ialLevels)
      ? raw.ialLevels.map((item) => String(item))
      : undefined,
  };
}

// Parser for iApp ocrDocument output on DGA USSD-response screenshots.
//
// The screenshot is a full phone screen that contains:
//   1. The dialer's recent-calls list (multiple unmasked phone numbers,
//      visible at the top — these are NOT what we want)
//   2. The DGA carrier-lookup response (anchored by header
//      "ข้อมูลผู้ให้บริการเครือข่าย" and the matching verb "ตรงกับ")
//      Example: "1300301177045 ตรงกับ 08-xxxx-8770 ตรวจสอบ 15/05/26 21:37"
//
// Typhoon's vision LLM mis-classified the recent-calls list as the response
// (picked the first phone numbers it saw). Switching to iApp ocrDocument
// gives us the full raw text; we then anchor on the Thai marker words to
// isolate the response section before extracting CID + phone last-4.
export function fromIappUssd(ocr: {
  text?: string[];
}): {
  citizenId?: string;
  phoneLast4?: string;
  matchWordFound: boolean;
  responseText?: string;
} {
  const fullText = (ocr.text ?? []).join("\n");
  if (!fullText) return { matchWordFound: false };

  const matchWordFound = /ตรง\s*กับ/.test(fullText);
  // The "response" section spans from the carrier header (or the matching
  // verb "ตรงกับ", whichever comes first) to the next clear boundary
  // ("ตกลง" / "OK" button / end of text). Restrict downstream regexes to
  // this slice so the recent-calls list above can't pollute matches.
  const anchorIndex = (() => {
    const carrier = fullText.search(/ข้อมูล\s*ผู้\s*ให้\s*บริการ\s*เครือ\s*ข่าย/);
    if (carrier >= 0) return carrier;
    const trongKap = fullText.search(/ตรง\s*กับ/);
    if (trongKap >= 0) {
      // Back up ~80 chars so we capture the CID that precedes "ตรงกับ".
      return Math.max(0, trongKap - 80);
    }
    return -1;
  })();
  const responseText = anchorIndex >= 0 ? fullText.slice(anchorIndex) : undefined;
  // Prefer the anchored slice; fall back to full text only if no anchor
  // matched (extremely degraded screenshot).
  const searchText = responseText ?? fullText;

  // Citizen ID: 13 consecutive digits, OR dashed form 1-3003-01177-04-5.
  const cidMatch = searchText.match(/\d-\d{4}-\d{5}-\d{2}-\d|\b\d{13}\b/);
  const citizenId = cidMatch ? digitsOnly(cidMatch[0]) : undefined;

  // Masked phone "0[689]-xxxx-XXXX" or "0[689] xxxx XXXX". Must contain the
  // mask "xxxx" to distinguish from unmasked dialer numbers.
  const maskedMatch = searchText.match(/\b0[689][-\s.]?x{2,4}[-\s.]?(\d{4})\b/i);
  const phoneLast4 = maskedMatch?.[1];

  return { citizenId, phoneLast4, matchWordFound, responseText };
}

export function fromIappBookBank(ocr: OcrBookBankResult): Pick<Identity, "thName" | "bankAccount"> {
  const result = ocr.bank_book_results;
  const holder = text(ocr.account_name ?? result?.account_name);
  return {
    thName: holder ? { full: holder } : undefined,
    bankAccount: {
      holder,
      number: text(ocr.account_number ?? result?.account_number),
      bank: text(ocr.bank_name ?? result?.bank_name),
      branch: text(ocr.bank_branch ?? result?.bank_branch),
    },
  };
}
