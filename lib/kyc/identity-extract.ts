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

function toIsoThaiDate(value: string | undefined): string | undefined {
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

// DGA profile shows two address blocks: registered (ที่อยู่ตามบัตร) +
// contact (ที่อยู่ที่ติดต่อได้). iApp's plain text often dumps both into
// one cell. Pull the first one that starts at "บ้านเลขที่" or the first
// big Thai address-shaped string ending in a 5-digit postal code OR a
// trailing "จ.<province>" / "จังหวัด<province>" anchor when the registered
// address omits the postal code (some DGA layouts only show postal on the
// contact-address line).
function firstAddressFromText(value: string): string | undefined {
  const flattened = value.replace(/\s+/g, " ").trim();
  const explicit = flattened.match(/บ้านเลขที่[^]*?\b\d{5}\b/);
  if (explicit) return repairThaiAddressLineBreaks(explicit[0]);
  // Fallback: street-number anchor with house number + "หมู่" or similar,
  // ending at postal code OR at province name. Used when the address starts
  // with a raw number (e.g. "118 หมู่ที่ 8 ต.กุดโบสถ์ อ.เสิงสาง จ.นครราชสีมา").
  const inferred = flattened.match(
    /\b\d{1,4}\s*หมู่[^]*?(?:\b\d{5}\b|จ\.[฀-๾]+|จังหวัด[฀-๾]+)/,
  );
  if (inferred) return repairThaiAddressLineBreaks(inferred[0]);
  return undefined;
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

// Heuristic to detect the "registered + contact concatenated in one cell"
// case: the label value contains the same address twice (two postal codes,
// and the first address text is a substring of the whole). Returns true
// when we should fall back to a single deduped copy.
function looksLikeDoubledAddress(label: string, firstAddress?: string): boolean {
  if (!firstAddress) return false;
  const postalCount = label.match(/\b\d{5}\b/g)?.length ?? 0;
  if (postalCount < 2) return false;
  const collapsed = label.replace(/\s+/g, "");
  const firstCollapsed = firstAddress.replace(/\s+/g, "");
  return collapsed.indexOf(firstCollapsed) !== collapsed.lastIndexOf(firstCollapsed);
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

  const citizenIdLabel = digitsOnly(labelValues.citizenId ?? getRecordValue(raw, "citizenId", "cid", "idNumber", "id_number"));
  const citizenId = citizenIdLabel && citizenIdLabel.length === 13 ? citizenIdLabel : citizenIdFromText(blob);

  const dobLabel = text(labelValues.dobThai ?? getRecordValue(raw, "dob", "dobThai", "birthDate", "birth_date"));
  const dob = toIsoThaiDate(dobLabel) ?? thaiDobFromText(blob);

  const rawAddressLabel = text(labelValues.addressByID ?? getRecordValue(raw, "addressByID", "addressById", "address", "registeredAddress"));
  // Strip "ประจำตัวประชาชน" label noise that bleeds into the value when iApp
  // returns the label fragments interleaved with the address text.
  const strippedAddressLabel = rawAddressLabel
    ? stripAddressByIdLabelNoise(rawAddressLabel)
    : undefined;
  const contactAddressLabel = text(labelValues.contactAddress ?? getRecordValue(raw, "contactAddress", "contact_address"));
  // If both addresses dump into one cell, split them by the first valid
  // address (ending at postal code) — DGA always lists registered first.
  const firstAddress = firstAddressFromText(blob);
  const addressLabel = looksLikeThaiAddress(strippedAddressLabel)
    ? strippedAddressLabel
    : undefined;
  const addressFull = addressLabel
    ? repairThaiAddressLineBreaks(addressLabel)
    : firstAddress;
  // Detect the "doubled" case where the label parser captured both
  // registered + contact in a single string; collapse to the deduped
  // single address recovered from the blob.
  const contactDoubled = contactAddressLabel
    ? looksLikeDoubledAddress(contactAddressLabel, firstAddress)
    : false;
  const contactAddressFull = contactDoubled
    ? firstAddress
    : contactAddressLabel
      ? repairThaiAddressLineBreaks(contactAddressLabel)
      : firstAddress;

  const emailLabel = text(labelValues.email ?? getRecordValue(raw, "email"))?.toLowerCase();
  const cleanedEmail = emailLabel?.includes("@") ? emailLabel : emailFromText(blob);

  return {
    citizenId,
    thName: {
      prefix,
      first: firstName,
      middle: middleName,
      last: lastName,
      full: fullName,
    },
    dob,
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
