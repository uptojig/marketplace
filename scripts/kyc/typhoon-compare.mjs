// Parse the Typhoon-OCR markdown saved by typhoon-poc.mjs and compare
// extracted fields against Claude's ground truth (manually verified from
// the same screenshots the user attached). Reports field-by-field accuracy.
//
// Run AFTER typhoon-poc.mjs:
//   node scripts/kyc/typhoon-compare.mjs

import fs from "node:fs";
import path from "node:path";

const IN_DIR = ".tmp-typhoon";

// Ground truth — extracted by Claude (multimodal vision) from the same
// fixture screenshots the user attached. This is the "as DGA displays"
// truth that Typhoon should match.
const GROUND_TRUTH = {
  u1_profile: {
    firstName: "สมคิด",
    lastName: "ผาทอง",
    dob: "25 กันยายน 2540",
    citizenId: "1-3003-01177-04-5",
    registeredAddress: "118 หมู่ที่ 8 ต.กุดโบสถ์ อ.เสิงสาง จ.นครราชสีมา",
    contactAddress: "188 กุดโบส์ หมู่8 ตำบลกุดโบสถ์ อำเภอเสิงสาง จังหวัดนครราชสีมา 30330",
    phone: "0800688770",
    mobilePhone: "080-068-8770",
    email: "banchuphan@outlook.co.th",
  },
  u1_login: {
    username: "1300301177045",
  },
  u2_profile: {
    firstName: "สรสิช",
    lastName: "บุณณะจันทร์",
    dob: "22 กุมภาพันธ์ 2533",
    citizenId: "1-1020-01295-05-4",
    registeredAddress: "บ้านเลขที่ 1 หมู่11 ซอยพระราม 2 ซอย 1 ถนนพระราม 2 แขวงบางมด เขตจอมทอง จังหวัดกรุงเทพมหานคร 10150",
    contactAddress: "บ้านเลขที่ 1 หมู่11 ซอยพระราม 2 ซอย 1 ถนนพระราม 2 แขวงบางมด เขตจอมทอง จังหวัดกรุงเทพมหานคร 10150",
    phone: "0954724815",
    mobilePhone: "095-472-4815",
    email: "fluffy_house@outlook.com",
  },
  u2_login: {
    username: "sorasit.bo22",
  },
  u3_profile: {
    firstName: "ธันว์ภัสสร",
    lastName: "สิรทรัพย์ภาคิน",
    dob: "12 สิงหาคม 2535",
    citizenId: "1-1017-00119-59-9",
    registeredAddress: "199/86 ถ.นวลจันทร์ แขวง นวลจันทร์ เขตบึงกุ่ม กรุงเทพมหานคร",
    contactAddress: "199/86 นวลจันทร์ ซอยนวลจันทร์ ถนน นวลจันทร์ จังหวัดกรุงเทพมหานคร 10230",
    phone: "0827894289",
    mobilePhone: null, // not visible in user's screenshot (browser overlay covers)
    email: null,       // not visible in user's screenshot
  },
  u3_login: {
    username: "1101700119599",
  },
};

// Map Thai labels (as Typhoon emits them) to our internal field keys.
const LABEL_MAP = [
  { keys: ["ชื่อจริง"], field: "firstName" },
  { keys: ["นามสกุล"], field: "lastName" },
  { keys: ["วันเดือนปีเกิด"], field: "dob" },
  { keys: ["เลขประจำตัวประชาชน 13 หลัก", "เลขประจำตัวประชาชน", "เลขประจําตัวประชาชน 13 หลัก"], field: "citizenId" },
  { keys: ["ที่อยู่ตามบัตรประจำตัวประชาชน", "ที่อยู่ตามบัตร"], field: "registeredAddress" },
  { keys: ["ที่อยู่ที่ติดต่อได้"], field: "contactAddress" },
  { keys: ["เบอร์โทรศัพท์มือถือ"], field: "mobilePhone" },
  { keys: ["เบอร์โทรศัพท์"], field: "phone" }, // must come AFTER mobilePhone
  { keys: ["อีเมล"], field: "email" },
  { keys: ["บัญชีผู้ใช้งาน (Username)", "บัญชีผู้ใช้งาน", "Username"], field: "username" },
];

// Strip Markdown markers (asterisks, checkmarks, HTML entities, chevrons)
// that Typhoon appends to values — these are status badges from the UI,
// not part of the captured data.
function clean(value) {
  if (!value) return "";
  return value
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/<br\s*\/?>/g, " ")
    .replace(/<\/?(?:td|tr|table|figure)[^>]*>/g, " ")
    .replace(/\*\*/g, "")
    .replace(/[☑✓✔☑️]/g, "")
    .replace(/\s*>\s*$/g, "") // trailing chevron
    .replace(/\s+/g, " ")
    .trim();
}

// Parse both Markdown pipe tables AND HTML <td> tables. Returns a list
// of [label, value] rows in document order.
function parseTable(markdown) {
  const rows = [];
  // 1. Pipe-separated rows: `| **label** | value | flag |`
  for (const line of markdown.split(/\r?\n/)) {
    if (!/^\s*\|/.test(line)) continue;
    if (/^\s*\|\s*:?---/.test(line)) continue; // separator row
    const cells = line
      .split("|")
      .slice(1, -1) // drop leading/trailing empty
      .map(clean);
    if (cells.length >= 2 && cells[0]) {
      rows.push([cells[0], cells[1]]);
    }
  }
  // 2. HTML <tr><td>...</td><td>...</td></tr>
  const trRe = /<tr>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/g;
  let m;
  while ((m = trRe.exec(markdown)) !== null) {
    rows.push([clean(m[1]), clean(m[2])]);
  }
  return rows;
}

function extractFields(markdown) {
  const rows = parseTable(markdown);
  const out = {};
  for (const [rawLabel, rawValue] of rows) {
    const label = rawLabel.toLowerCase().replace(/\s+/g, "");
    for (const map of LABEL_MAP) {
      const matched = map.keys.some((k) =>
        label.includes(k.toLowerCase().replace(/\s+/g, "")),
      );
      if (matched && rawValue && rawValue !== "--" && !out[map.field]) {
        out[map.field] = rawValue;
        break;
      }
    }
  }
  return out;
}

function normalizeForCompare(value) {
  if (!value) return "";
  return value
    .normalize("NFC")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function compareField(expected, actual) {
  if (expected === null) return { status: "skip", note: "ground truth unknown" };
  if (!actual) return { status: "miss", note: "Typhoon returned nothing" };
  const e = normalizeForCompare(expected);
  const a = normalizeForCompare(actual);
  if (e === a) return { status: "exact" };
  if (a.includes(e) || e.includes(a)) return { status: "partial", note: "substring match" };
  // Edit distance ratio (loose check)
  const ratio = Math.min(e.length, a.length) / Math.max(e.length, a.length);
  return { status: "diff", note: `len ratio ${(ratio * 100).toFixed(0)}%` };
}

let totalExact = 0, totalPartial = 0, totalMiss = 0, totalDiff = 0, totalSkip = 0;

for (const fixture of Object.keys(GROUND_TRUTH)) {
  const mdPath = path.join(IN_DIR, `${fixture}.md`);
  if (!fs.existsSync(mdPath)) {
    console.log(`\n${fixture}: file missing`);
    continue;
  }
  const md = fs.readFileSync(mdPath, "utf8");
  const extracted = extractFields(md);
  const expected = GROUND_TRUTH[fixture];

  console.log(`\n▸ ${fixture}`);
  console.log(`  ${"field".padEnd(20)} ${"expected".padEnd(46)} ${"actual".padEnd(46)} verdict`);
  for (const field of Object.keys(expected)) {
    const exp = expected[field];
    const act = extracted[field] ?? null;
    const cmp = compareField(exp, act);
    const flag =
      cmp.status === "exact" ? "✓ exact"
      : cmp.status === "partial" ? "~ partial"
      : cmp.status === "diff" ? "✗ diff"
      : cmp.status === "miss" ? "✗ miss"
      : "- skip";
    if (cmp.status === "exact") totalExact++;
    else if (cmp.status === "partial") totalPartial++;
    else if (cmp.status === "miss") totalMiss++;
    else if (cmp.status === "diff") totalDiff++;
    else totalSkip++;
    const expShown = exp === null ? "(n/a)" : (exp.length > 44 ? exp.slice(0, 42) + "…" : exp);
    const actShown = act === null ? "(missing)" : (act.length > 44 ? act.slice(0, 42) + "…" : act);
    console.log(`  ${field.padEnd(20)} ${expShown.padEnd(46)} ${actShown.padEnd(46)} ${flag} ${cmp.note ?? ""}`);
  }
  // Save extracted for later inspection
  fs.writeFileSync(
    path.join(IN_DIR, `${fixture}.compare.json`),
    JSON.stringify({ expected, actual: extracted }, null, 2),
  );
}

console.log(`\n${"=".repeat(78)}`);
console.log(`Summary: ${totalExact} exact | ${totalPartial} partial | ${totalDiff} diff | ${totalMiss} miss | ${totalSkip} skipped (ground truth n/a)`);
