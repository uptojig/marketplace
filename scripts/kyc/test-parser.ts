// Smoke tests for the DGA OCR parser sanitizers.
// Run: node --import tsx scripts/kyc/test-parser.ts
//
// Covers:
//   - stripLeakedUrlFromEmail     (Layer 2: post-parser email sanitizer)
//   - classifyChromeLine          (Layer 1: pre-parser whole-line filter)
//   - stripBrowserChromeFromPages (Layer 1 integrated over OCR text[])
//   - findAllAddresses            (split bled registered+contact addresses)

import { splitAtThaiAddressEndpoints, stripLeakedUrlFromEmail } from "../../lib/kyc/identity-extract";
import {
  classifyChromeLine,
  stripBrowserChromeFromPages,
} from "../../lib/kyc/browser-chrome-filter";

interface Case<I, O> {
  name: string;
  input: I;
  expected: O;
}

const EMAIL_CASES: Case<string | undefined, string | undefined>[] = [
  {
    name: "User 3 bug — Safari URL bar bleeds into email",
    input: "connect.egov.go.thuptojig@gmail.com",
    expected: "uptojig@gmail.com",
  },
  {
    name: "Trailing chevron from DGA UI affordance",
    input: "uptojig@gmail.com<",
    expected: "uptojig@gmail.com",
  },
  {
    name: "URL bleed + trailing chevron combined",
    input: "connect.egov.go.thuptojig@gmail.com<",
    expected: "uptojig@gmail.com",
  },
  {
    name: "Clean email — no-op",
    input: "uptojig@gmail.com",
    expected: "uptojig@gmail.com",
  },
  {
    name: "Standard Gmail — no-op",
    input: "test@example.com",
    expected: "test@example.com",
  },
  {
    name: "Email with .co.th domain — no-op (TLD is in DOMAIN, not local)",
    input: "banchuphan@outlook.co.th",
    expected: "banchuphan@outlook.co.th",
  },
  {
    name: "Uppercase email — lowercased",
    input: "User.Name@Example.COM",
    expected: "user.name@example.com",
  },
  {
    name: "Empty value",
    input: undefined,
    expected: undefined,
  },
  {
    name: "Trailing Thai text",
    input: "uptojig@gmail.com อีเมล",
    expected: "uptojig@gmail.com",
  },
];

const CHROME_CASES: Case<string, string | null>[] = [
  { name: "URL bar domain alone",       input: "connect.egov.go.th",     expected: "url_only" },
  { name: "URL with protocol",          input: "https://example.com",    expected: "url_only" },
  { name: "Status bar time",            input: "12:59",                  expected: "status_time" },
  { name: "Status bar time with PM",    input: "1:45 PM",                expected: "status_time" },
  { name: "Status bar battery",         input: "85%",                    expected: "status_battery" },
  { name: "Status bar 5G",              input: "5G",                     expected: "status_carrier" },
  { name: "Status bar LTE",             input: "LTE",                    expected: "status_carrier" },
  { name: "Nav arrow chevron",          input: "<",                      expected: "nav_arrow" },
  { name: "Real email — keep",          input: "user@example.com",       expected: null },
  { name: "Real Thai content — keep",   input: "บัญชีผู้ใช้งาน",            expected: null },
  { name: "Phone number — keep",        input: "0827894289",             expected: null },
  { name: "ID number — keep",           input: "1-1017-00119-59-9",      expected: null },
];

const ADDRESS_CASES: Case<string, string[]>[] = [
  {
    name: "Bleed: registered (กรุงเทพมหานคร-only) + contact (จังหวัด+postal) [User 3]",
    input:
      "199/86 ถ.นวลจันทร์ แขวง นวลจันทร์ เขตบึงกุ่ม กรุงเทพมหานคร 199/86 นวลจันทร์ ซอยนวลจันทร์ ถนน นวลจันทร์ จังหวัดกรุงเทพมหานคร 10230",
    expected: [
      "199/86 ถ.นวลจันทร์ แขวง นวลจันทร์ เขตบึงกุ่ม กรุงเทพมหานคร",
      "199/86 นวลจันทร์ ซอยนวลจันทร์ ถนน นวลจันทร์ จังหวัดกรุงเทพมหานคร 10230",
    ],
  },
  {
    name: "Bleed: two provincial endings (จ.<X> then จังหวัด<X>+postal) [User 1]",
    input:
      "118 หมู่ที่ 8 ต.กุดโบสถ์ อ.เสิงสาง จ.นครราชสีมา 188 กุดโบส์ หมู่8 ตำบลกุดโบสถ์ อำเภอเสิงสาง จังหวัดนครราชสีมา 30330",
    expected: [
      "118 หมู่ที่ 8 ต.กุดโบสถ์ อ.เสิงสาง จ.นครราชสีมา",
      "188 กุดโบส์ หมู่8 ตำบลกุดโบสถ์ อำเภอเสิงสาง จังหวัดนครราชสีมา 30330",
    ],
  },
  {
    name: "Single address with จังหวัด+postal — one segment [User 2]",
    input:
      "บ้านเลขที่ 1 หมู่11 ซอยพระราม 2 ซอย 1 ถนนพระราม 2 แขวงบางมด เขตจอมทอง จังหวัดกรุงเทพมหานคร 10150",
    expected: [
      "บ้านเลขที่ 1 หมู่11 ซอยพระราม 2 ซอย 1 ถนนพระราม 2 แขวงบางมด เขตจอมทอง จังหวัดกรุงเทพมหานคร 10150",
    ],
  },
  { name: "Empty blob", input: "", expected: [] },
  {
    name: "No endpoint markers (garbage text) — no segments",
    input: "this is random text without any thai address markers at all",
    expected: [],
  },
  {
    name: "Adversarial: address with internal '2' (ซอย 2) doesn't split mid-address",
    input:
      "บ้านเลขที่ 1 หมู่11 ซอยพระราม 2 ซอย 1 ถนนพระราม 2 แขวงบางมด เขตจอมทอง จังหวัดกรุงเทพมหานคร 10150",
    expected: [
      "บ้านเลขที่ 1 หมู่11 ซอยพระราม 2 ซอย 1 ถนนพระราม 2 แขวงบางมด เขตจอมทอง จังหวัดกรุงเทพมหานคร 10150",
    ],
  },
];

const PAGES_CASE: Case<string[], { excluded: string[]; kept: string[] }> = {
  name: "Mixed page — strip chrome lines, keep content",
  input: [
    "12:59\nLTE\n100%\nบัญชีผู้ใช้งาน\nuser_123\nอีเมล\nuptojig@gmail.com\nconnect.egov.go.th",
  ],
  expected: {
    excluded: ["12:59", "LTE", "100%", "connect.egov.go.th"],
    kept: ["บัญชีผู้ใช้งาน", "user_123", "อีเมล", "uptojig@gmail.com"],
  },
};

function run() {
  let pass = 0;
  let fail = 0;

  console.log("\n=== stripLeakedUrlFromEmail ===");
  for (const c of EMAIL_CASES) {
    const actual = stripLeakedUrlFromEmail(c.input);
    const ok = actual === c.expected;
    if (ok) { pass += 1; console.log(`  ✓ ${c.name}`); }
    else    { fail += 1; console.log(`  ✗ ${c.name}\n      input=${JSON.stringify(c.input)}\n      expected=${JSON.stringify(c.expected)}\n      actual=${JSON.stringify(actual)}`); }
  }

  console.log("\n=== classifyChromeLine ===");
  for (const c of CHROME_CASES) {
    const actual = classifyChromeLine(c.input);
    const ok = actual === c.expected;
    if (ok) { pass += 1; console.log(`  ✓ ${c.name}  (${actual ?? "kept"})`); }
    else    { fail += 1; console.log(`  ✗ ${c.name}  input=${JSON.stringify(c.input)} expected=${c.expected} actual=${actual}`); }
  }

  console.log("\n=== splitAtThaiAddressEndpoints ===");
  for (const c of ADDRESS_CASES) {
    const actual = splitAtThaiAddressEndpoints(c.input);
    const ok =
      actual.length === c.expected.length &&
      actual.every((a, i) => a === c.expected[i]);
    if (ok) {
      pass += 1;
      console.log(`  ✓ ${c.name}  (${actual.length} segment${actual.length === 1 ? "" : "s"})`);
    } else {
      fail += 1;
      console.log(`  ✗ ${c.name}`);
      console.log(`    expected (${c.expected.length}):`);
      c.expected.forEach((a) => console.log(`      - ${a}`));
      console.log(`    actual   (${actual.length}):`);
      actual.forEach((a) => console.log(`      - ${a}`));
    }
  }

  console.log("\n=== stripBrowserChromeFromPages ===");
  const result = stripBrowserChromeFromPages(PAGES_CASE.input);
  const excludedLines = result.excluded.map((e) => e.line);
  const keptLines = result.pages.join("\n").split("\n");
  const excludedOk = PAGES_CASE.expected.excluded.every((line) => excludedLines.includes(line));
  const keptOk = PAGES_CASE.expected.kept.every((line) => keptLines.includes(line));
  if (excludedOk && keptOk) {
    pass += 1;
    console.log(`  ✓ ${PAGES_CASE.name}`);
    console.log(`    excluded: ${excludedLines.join(" | ")}`);
    console.log(`    kept:     ${keptLines.join(" | ")}`);
  } else {
    fail += 1;
    console.log(`  ✗ ${PAGES_CASE.name}`);
    console.log(`    excluded actual=${excludedLines.join(" | ")}`);
    console.log(`    kept     actual=${keptLines.join(" | ")}`);
  }

  console.log(`\n${pass} pass | ${fail} fail`);
  process.exit(fail === 0 ? 0 : 1);
}

run();
