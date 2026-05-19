// POC: test Typhoon OCR on 6 DGA fixtures (3 users × profile + login pages).
// Compares output against business-required fields (the same 9 that S1 v2's
// checklist looks for). Saves raw Markdown response + extracted fields to
// .tmp-typhoon/ for human inspection.
//
// Run: node --env-file=.env scripts/kyc/typhoon-poc.mjs
//
// Sources:
//   - Typhoon OCR docs: https://docs.opentyphoon.ai/en/ocr/
//   - SDK ref (OpenAI-compatible chat completions, model=typhoon-ocr):
//     https://github.com/scb-10x/typhoon-ocr

import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.TYPHOON_BASE_URL || "https://api.opentyphoon.ai/v1";
const API_KEY = process.env.TYPHOON_API_KEY;
const MODEL = "typhoon-ocr"; // v1.5, 2B params, layout-aware Markdown out

if (!API_KEY) {
  console.error("TYPHOON_API_KEY missing — run with node --env-file=.env");
  process.exit(1);
}

const OUT_DIR = ".tmp-typhoon";
fs.mkdirSync(OUT_DIR, { recursive: true });

const FIXTURES = [
  // user 1 — สมคิด ผาทอง (Test1)
  { id: "u1_profile", path: "C:/Users/riwki/Downloads/Archive/Test1/DGA_IMAGE1.jpg", role: "profile", user: "User 1 (สมคิด)" },
  { id: "u1_login",   path: "C:/Users/riwki/Downloads/Archive/Test1/DGA_IMAGE2.jpg", role: "login",   user: "User 1 (สมคิด)" },
  // user 2 — สรสิช บุณณะจันทร์ (Archive)
  { id: "u2_profile", path: "C:/Users/riwki/Downloads/Archive/DGA_IMAGE1.jpeg",      role: "profile", user: "User 2 (สรสิช)" },
  { id: "u2_login",   path: "C:/Users/riwki/Downloads/Archive/DGA_IMAGE2.jpeg",      role: "login",   user: "User 2 (สรสิช)" },
  // user 3 — ธันว์ภัสสร สิรทรัพย์ภาคิน (Telegram Desktop)
  { id: "u3_profile", path: "C:/Users/riwki/Downloads/Telegram Desktop/DGA_IMAGE1.jpg", role: "profile", user: "User 3 (ธันว์ภัสสร)" },
  { id: "u3_login",   path: "C:/Users/riwki/Downloads/Telegram Desktop/DGA_IMAGE2.jpg", role: "login",   user: "User 3 (ธันว์ภัสสร)" },
];

// Same business-required fields S1 v2 checks. Each rule has a Thai-label
// regex + a pattern test we apply to the parsed identity from Typhoon's
// Markdown. Capture-as-is — store raw OCR string.
const FIELDS = [
  { key: "firstName",         pattern: /ชื่อจริง[^\n]*?\n([^\n]+)/ },
  { key: "lastName",          pattern: /นามสกุล[^\n]*?\n([^\n]+)/ },
  { key: "dob",               pattern: /วันเดือนปีเกิด[^\n]*?\n([^\n]+)/ },
  { key: "citizenId",         pattern: /เลข\s*ประจ[ําำ]\s*ตัว\s*ประชาชน\s*13\s*หลัก[^\n]*?\n([^\n]+)|(\d-\d{4}-\d{5}-\d{2}-\d)/ },
  { key: "registeredAddress", pattern: /ที่อยู่ตามบัตร[^\n]*?\n([^\n]+(?:\n[^\n]+){0,3})/ },
  { key: "contactAddress",    pattern: /ที่อยู่ที่ติดต่อได้[^\n]*?\n([^\n]+(?:\n[^\n]+){0,3})/ },
  { key: "phone",             pattern: /เบอร์โทรศัพท์(?!\s*มือถือ)[^\n]*?\n([^\n]+)/ },
  { key: "mobilePhone",       pattern: /เบอร์โทรศัพท์\s*มือถือ[^\n]*?\n([^\n]+)/ },
  { key: "email",             pattern: /อีเมล[^\n]*?\n([^\n]+)/ },
];

// Prompt aligned with Typhoon v1.5 default behavior: layout-aware Markdown
// output, preserve original text exactly. No translation/normalization.
const PROMPT =
  "Extract all visible text from this Thai DGA Digital ID profile screenshot. " +
  "Preserve the document structure — keep label-value rows together, one per line. " +
  "Output Markdown. Do NOT translate, normalize, or reformat values — return text " +
  "exactly as displayed (keep Thai Buddhist year, dashes in ID number, line breaks).";

function fileToDataUrl(p) {
  const buf = fs.readFileSync(p);
  const ext = path.extname(p).toLowerCase().replace(".", "");
  const mime = ext === "png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function callTyphoon(fixture) {
  const dataUrl = fileToDataUrl(fixture.path);
  const body = {
    model: MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: PROMPT },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    max_tokens: 16384,
    temperature: 0.0,
  };
  const t0 = Date.now();
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const ms = Date.now() - t0;
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    return { ok: false, status: res.status, ms, error: JSON.stringify(json).slice(0, 300) };
  }
  const text = json?.choices?.[0]?.message?.content ?? "";
  return { ok: true, status: 200, ms, text, usage: json?.usage };
}

function extractFields(markdown) {
  const out = {};
  for (const field of FIELDS) {
    const m = markdown.match(field.pattern);
    if (m) {
      out[field.key] = (m[1] ?? m[2] ?? "").trim().replace(/\s+/g, " ");
    } else {
      out[field.key] = null;
    }
  }
  return out;
}

(async () => {
  console.log(`\n=== Typhoon OCR POC ===`);
  console.log(`Base URL : ${BASE_URL}`);
  console.log(`Model    : ${MODEL}`);
  console.log(`Key tail : ...${API_KEY.slice(-4)}`);
  console.log(`Fixtures : ${FIXTURES.length}`);
  console.log(`Output   : ${OUT_DIR}/`);
  console.log("─".repeat(78));

  for (const fixture of FIXTURES) {
    console.log(`\n▸ ${fixture.id} — ${fixture.user} — ${fixture.role}`);
    console.log(`  file: ${path.basename(fixture.path)}`);
    const result = await callTyphoon(fixture);
    if (!result.ok) {
      console.log(`  ❌ HTTP ${result.status} (${result.ms}ms): ${result.error}`);
      continue;
    }
    console.log(`  ✓ HTTP 200 in ${result.ms}ms, tokens=${result.usage?.completion_tokens ?? "?"}`);
    const fields = extractFields(result.text);
    console.log(`  fields:`);
    for (const [key, value] of Object.entries(fields)) {
      const flag = value ? "✓" : "✗";
      const shown = value ? (value.length > 60 ? value.slice(0, 60) + "…" : value) : "(missing)";
      console.log(`    ${flag} ${key.padEnd(20)} ${shown}`);
    }
    // Persist for inspection
    fs.writeFileSync(path.join(OUT_DIR, `${fixture.id}.md`), result.text);
    fs.writeFileSync(
      path.join(OUT_DIR, `${fixture.id}.fields.json`),
      JSON.stringify({ user: fixture.user, role: fixture.role, ms: result.ms, fields }, null, 2),
    );
  }
  console.log(`\n${"─".repeat(78)}\nAll done. Inspect ${OUT_DIR}/ for raw Markdown + extracted fields.`);
})();
