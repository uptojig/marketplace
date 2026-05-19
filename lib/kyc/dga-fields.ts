// S1 v2: field rules for incremental DGA capture.
//
// Philosophy — DGA is the source of truth (state-verified). Our job is to
// CAPTURE the label/value pairs shown on the DGA profile screen, not to
// re-validate format. So rules are LOOSE: any value the parser dragged out
// is `captured`; we only flag a warning when shape looks impossible
// (e.g. citizenId with !=13 digits, email missing "@"). Warnings DO NOT
// block finalize — DGA shows it, we trust it.
//
// 9 required + 2 optional. Finalize passes when all 9 required have a row
// (state ∈ { captured, captured_warn }). Missing → block.

import { toIsoThaiDate } from "@/lib/kyc/identity-extract";
import type { Identity } from "@/types/identity";

export type FieldState = "missing" | "captured" | "captured_warn";

export const DGA_REQUIRED_KEYS = [
  "firstName",
  "lastName",
  "dob",
  "citizenId",
  "registeredAddress",
  "contactAddress",
  "phone",
  "mobilePhone",
  "email",
] as const;

export const DGA_OPTIONAL_KEYS = ["prefix", "middleName"] as const;

export type DgaRequiredKey = (typeof DGA_REQUIRED_KEYS)[number];
export type DgaOptionalKey = (typeof DGA_OPTIONAL_KEYS)[number];
export type DgaFieldKey = DgaRequiredKey | DgaOptionalKey;

// Fields the vendor CANNOT edit in S1_DGA_REVIEW. These are the strict
// exact-match anchors in S2/S5 cross-match — if a user could overwrite
// them, an adversary could align them with someone else's ID card and
// bypass identity verification. Vendor must re-upload a clearer DGA
// screenshot to fix an OCR misread on these fields.
export const LOCKED_FIELD_KEYS = new Set<DgaFieldKey>(["citizenId", "dob"]);

export function isLockedField(key: string): boolean {
  return LOCKED_FIELD_KEYS.has(key as DgaFieldKey);
}

export interface FieldRule {
  key: DgaFieldKey;
  /** Thai display label shown in the checklist UI. */
  label: string;
  /** Regex that matches the DGA UI label in the OCR'd text blob. */
  labelPattern: RegExp;
  /** False = doesn't block finalize even if missing. */
  required: boolean;
  /** Read the value for this field from a parsed Identity object. */
  fromIdentity: (id: Identity) => string | undefined;
  /** Level-1 structural check. Only called when value is non-empty. */
  evaluate: (value: string) => { state: "captured" | "captured_warn"; warning?: string };
}

const captured = (): { state: "captured" } => ({ state: "captured" });
const warn = (warning: string): { state: "captured_warn"; warning: string } => ({
  state: "captured_warn",
  warning,
});

function digitsOnly(value: string): string {
  return value.replace(/\D+/g, "");
}

function isParseableDate(value: string): boolean {
  // Accept ISO "YYYY-MM-DD" OR Thai "DD <month> YYYY-BE" — parser already
  // normalizes to ISO, but DGA-raw values may still leak through if the
  // Thai-date converter fails.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const t = new Date(`${value}T00:00:00Z`).getTime();
    return Number.isFinite(t);
  }
  // Loose Thai-date detector: has Thai month word + 4-digit BE year.
  return /(?:ม\.ค|ก\.พ|มี\.ค|เม\.ย|พ\.ค|มิ\.ย|ก\.ค|ส\.ค|ก\.ย|ต\.ค|พ\.ย|ธ\.ค|มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s*\d{4}/.test(
    value,
  );
}

export const DGA_FIELD_RULES: FieldRule[] = [
  {
    key: "firstName",
    label: "ชื่อจริง",
    labelPattern: /ชื่อจริง/,
    required: true,
    fromIdentity: (id) => id.thName?.first,
    evaluate: () => captured(),
  },
  {
    key: "lastName",
    label: "นามสกุล",
    labelPattern: /นามสกุล/,
    required: true,
    fromIdentity: (id) => id.thName?.last,
    evaluate: () => captured(),
  },
  {
    key: "dob",
    label: "วันเดือนปีเกิด",
    labelPattern: /วันเดือนปีเกิด/,
    required: true,
    // Prefer the raw DGA-shown form ("12 สิงหาคม 2535") for display; fall
    // back to the ISO form only when OCR couldn't capture a Thai-date string.
    fromIdentity: (id) => id.dobRaw ?? id.dob,
    evaluate: (value) =>
      isParseableDate(value) ? captured() : warn("รูปแบบวันที่ไม่ปกติ โปรดตรวจสอบ"),
  },
  {
    key: "citizenId",
    label: "เลขบัตรประชาชน",
    labelPattern: /เลข\s*ประจำ\s*ตัว\s*ประชาชน\s*13\s*หลัก/,
    required: true,
    // Prefer the raw DGA-shown form ("1-1017-00119-59-9" with dashes) for
    // display; fall back to digits-only when the formatted form wasn't
    // captured. Cross-match always uses digits-only via Identity.citizenId.
    fromIdentity: (id) => id.citizenIdFormatted ?? id.citizenId,
    evaluate: (value) => {
      const digits = digitsOnly(value);
      if (digits.length === 13) return captured();
      return warn(`เลขบัตรไม่ใช่ 13 หลัก (พบ ${digits.length} หลัก)`);
    },
  },
  {
    key: "registeredAddress",
    label: "ที่อยู่ตามบัตรประจำตัวประชาชน",
    labelPattern: /ที่อยู่ตามบัตร/,
    required: true,
    fromIdentity: (id) => id.address?.full,
    evaluate: (value) =>
      value.trim().length >= 10 ? captured() : warn("ที่อยู่สั้นผิดปกติ โปรดตรวจสอบ"),
  },
  {
    key: "contactAddress",
    label: "ที่อยู่ที่ติดต่อได้",
    labelPattern: /ที่อยู่ที่ติดต่อได้/,
    required: true,
    fromIdentity: (id) => id.contactAddress?.full,
    evaluate: (value) =>
      value.trim().length >= 10 ? captured() : warn("ที่อยู่สั้นผิดปกติ โปรดตรวจสอบ"),
  },
  {
    key: "phone",
    label: "เบอร์โทรศัพท์",
    // Negative lookahead so this doesn't double-match into mobilePhone label.
    labelPattern: /เบอร์โทรศัพท์(?!มือ)/,
    required: true,
    fromIdentity: (id) => id.phone,
    evaluate: () => captured(),
  },
  {
    key: "mobilePhone",
    label: "เบอร์โทรศัพท์มือถือ",
    labelPattern: /เบอร์โทรศัพท์มือ/,
    required: true,
    fromIdentity: (id) => id.mobilePhone,
    evaluate: () => captured(),
  },
  {
    key: "email",
    label: "อีเมล",
    labelPattern: /อีเมล/,
    required: true,
    fromIdentity: (id) => id.email,
    evaluate: (value) => {
      const atIdx = value.indexOf("@");
      if (atIdx < 1) return warn("อีเมลขาดเครื่องหมาย @");
      if (!value.slice(atIdx + 1).includes(".")) return warn("อีเมลขาดโดเมน (.)");
      return captured();
    },
  },
  // Optional — captured if parser finds them, never blocks finalize.
  {
    key: "prefix",
    label: "คำนำหน้าชื่อ",
    labelPattern: /คำนำหน้าชื่อ/,
    required: false,
    fromIdentity: (id) => id.thName?.prefix,
    evaluate: () => captured(),
  },
  {
    key: "middleName",
    label: "ชื่อกลาง",
    labelPattern: /ชื่อกลาง/,
    required: false,
    fromIdentity: (id) => id.thName?.middle,
    evaluate: () => captured(),
  },
];

const RULE_BY_KEY = new Map<DgaFieldKey, FieldRule>(
  DGA_FIELD_RULES.map((r) => [r.key, r] as const),
);

export function getFieldRule(key: string): FieldRule | undefined {
  return RULE_BY_KEY.get(key as DgaFieldKey);
}

/**
 * Pull every field the parser managed to extract from a single image's
 * Identity output. Returns a map of fieldKey → value (only fields with
 * non-empty values). Used by `processDgaImage` to decide which rows to
 * UPSERT for this evidence.
 *
 * Filters out the special "--" placeholder DGA uses for empty fields,
 * so re-uploading a fuller screenshot can replace a "--" row with the
 * real value.
 */
export function extractFieldsFromIdentity(identity: Identity): Map<DgaFieldKey, string> {
  const out = new Map<DgaFieldKey, string>();
  for (const rule of DGA_FIELD_RULES) {
    const raw = rule.fromIdentity(identity)?.trim();
    if (!raw) continue;
    if (raw === "--" || raw === "—") continue;
    out.set(rule.key, raw);
  }
  return out;
}

/**
 * Row shape we read from prisma.wizardDgaField for checklist evaluation.
 * Kept loose so callers can pass either WizardDgaField (full model) or a
 * subset selected via prisma.findMany({ select }).
 */
export interface DgaFieldRow {
  fieldKey: string;
  value: string;
  evidenceId: string;
  shapeOk?: boolean;
  warning?: string | null;
  confidence?: number | null;
  originalValue?: string | null;
  editedByUser?: boolean;
}

export interface ChecklistEntry {
  key: DgaFieldKey;
  label: string;
  required: boolean;
  state: FieldState;
  value: string | null;
  warning: string | null;
  evidenceId: string | null;
  /** True for citizenId + dob — UI renders as disabled input with 🔒. */
  locked: boolean;
  /** First-captured OCR value when `editedByUser=true`; null if untouched. */
  originalValue: string | null;
  editedByUser: boolean;
}

/**
 * Build the per-field checklist from accumulated rows. Missing rows show
 * up as `state: "missing"`. UI uses this to render ⬜/✅/⚠️ icons.
 */
export function buildChecklistFromRows(rows: DgaFieldRow[]): ChecklistEntry[] {
  const byKey = new Map(rows.map((r) => [r.fieldKey, r] as const));
  return DGA_FIELD_RULES.map((rule) => {
    const locked = LOCKED_FIELD_KEYS.has(rule.key);
    const row = byKey.get(rule.key);
    if (!row) {
      return {
        key: rule.key,
        label: rule.label,
        required: rule.required,
        state: "missing",
        value: null,
        warning: null,
        evidenceId: null,
        locked,
        originalValue: null,
        editedByUser: false,
      };
    }
    return {
      key: rule.key,
      label: rule.label,
      required: rule.required,
      state: row.shapeOk === false ? "captured_warn" : "captured",
      value: row.value,
      warning: row.warning ?? null,
      evidenceId: row.evidenceId,
      locked,
      originalValue: row.originalValue ?? null,
      editedByUser: row.editedByUser ?? false,
    };
  });
}

export function readyToFinalize(entries: ChecklistEntry[]): boolean {
  return entries
    .filter((e) => e.required)
    .every((e) => e.state !== "missing");
}

/**
 * Reverse-map: turn accumulated rows back into an Identity object for
 * write-out at finalize time. Downstream S2/S3/S4 expect a canonical
 * `dga` provider row with this shape so they can cross-match unchanged.
 */
export function identityFromRows(rows: DgaFieldRow[]): Identity {
  const byKey = new Map(rows.map((r) => [r.fieldKey, r.value] as const));
  const identity: Identity = {};

  // citizenId stored raw ("1-1017-00119-59-9"). Reconstruct BOTH forms:
  //   citizenId          → digits-only for cross-match
  //   citizenIdFormatted → raw with dashes for UI display
  const cid = byKey.get("citizenId");
  if (cid) {
    identity.citizenId = digitsOnly(cid);
    identity.citizenIdFormatted = cid;
  }

  const first = byKey.get("firstName");
  const last = byKey.get("lastName");
  const prefix = byKey.get("prefix");
  const middle = byKey.get("middleName");
  if (first || last || prefix || middle) {
    identity.thName = {
      ...(prefix ? { prefix } : {}),
      ...(first ? { first } : {}),
      ...(middle ? { middle } : {}),
      ...(last ? { last } : {}),
      full: [prefix, first, middle, last].filter(Boolean).join(" ").trim() || undefined,
    };
  }

  // dob stored raw ("12 สิงหาคม 2535"). Reconstruct BOTH forms:
  //   dob    → ISO YYYY-MM-DD for cross-match
  //   dobRaw → original Thai BE string for UI display
  const dob = byKey.get("dob");
  if (dob) {
    identity.dob = toIsoThaiDate(dob) ?? dob;
    identity.dobRaw = dob;
  }

  const addr = byKey.get("registeredAddress");
  if (addr) identity.address = { full: addr };

  const contact = byKey.get("contactAddress");
  if (contact) identity.contactAddress = { full: contact };

  const phone = byKey.get("phone");
  if (phone) identity.phone = phone;

  const mobile = byKey.get("mobilePhone");
  if (mobile) {
    identity.mobilePhone = mobile;
    const md = digitsOnly(mobile);
    if (md.length >= 4) identity.phoneLast4 = md.slice(-4);
  }

  const email = byKey.get("email");
  if (email) identity.email = email;

  return identity;
}
