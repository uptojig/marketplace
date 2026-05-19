// Test DGA OCR using the same production pipeline used by the API route.
//
// Run:
//   node scripts/kyc/test-dga-iapp.mjs <image-path> [ground-truth-id]
//
// Ground truth IDs:
//   sirapob_desktop
//   sirapob_mobile

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const imagePath = process.argv[2];
const truthId = process.argv[3] ?? null;

if (!imagePath) {
  console.error("Usage: node scripts/kyc/test-dga-iapp.mjs <image-path> [ground-truth-id]");
  process.exit(1);
}

if (!fs.existsSync(imagePath)) {
  console.error(`Image not found: ${imagePath}`);
  process.exit(1);
}

const GROUND_TRUTH = {
  sirapob_desktop: {
    firstName: "สิรภพ",
    lastName: "ต้นเอี่ยม",
    dob: "21 กันยายน 2543",
    citizenId: "1-1017-00288-05-6",
    registeredAddress: "99/111 หมู่ที่ 2 ต.บึงทองหลาง อ.ลำลูกกา จ.ปทุมธานี",
    contactAddress: "99/111 หมู่2 ตำบลบึงทองหลาง อำเภอลำลูกกา จังหวัดปทุมธานี 12150",
    phone: "0917799614",
    mobilePhone: "091-779-9614",
    email: "y2kshop3@outlook.com",
  },
  sirapob_mobile: {
    firstName: "สิรภพ",
    lastName: "ตันเอี่ยม",
    dob: "21 กันยายน 2543",
    citizenId: "1-1017-00288-05-6",
    registeredAddress: "99/111 หมู่ที่ 2 ต.บึงทองหลาง อ.ลำลูกกา จ.ปทุมธานี",
    contactAddress:
      "2233/2235 SnoozeApartment ซอย ลาดพร้าว55/2 ถนนลาดพร้าว แขวงสะพานสอง เขต วังทองหลาง จังหวัด กรุงเทพมหานคร 10310",
    phone: "0917799614",
    mobilePhone: "091-779-9614",
    email: "y2kshop3@outlook.com",
  },
};

function normalize(value) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function compare(extracted, truth) {
  const keys = Object.keys(truth);
  let pass = 0;
  console.log("\n=== FIELD-BY-FIELD COMPARISON ===");
  for (const key of keys) {
    const got = normalize(extracted[key]);
    const expect = normalize(truth[key]);
    const exact = got === expect;
    const containsEither = Boolean(got) && (got.includes(expect) || expect.includes(got));
    let mark = "✗";
    if (exact) mark = "✓";
    else if (containsEither) mark = "~";
    if (exact) pass += 1;
    console.log(`  ${mark} ${key.padEnd(20)} expect="${expect}"`);
    if (!exact) {
      console.log(`    ${" ".repeat(20)} got   ="${got || "(MISSING)"}"`);
    }
  }
  console.log(`\nScore: ${pass}/${keys.length} exact`);
}

const pipelineRunner = `
import fs from "node:fs";
import pipeline from "./lib/kyc/dga-ocr-pipeline.ts";
import redactionLib from "./lib/kyc/image-redaction.ts";
const { runDgaOcrPipeline } = pipeline;
const { redactDgaSensitiveRegions, redactDgaUsernameText } = redactionLib;
const imagePath = process.argv[1];
const buffer = fs.readFileSync(imagePath);
const result = await runDgaOcrPipeline(buffer);
const redaction = await redactDgaSensitiveRegions(buffer);
const usernameTextRedaction = redactDgaUsernameText(result.selected.cleanedOcr.text ?? []);
const redactionRequired = redaction.redactionRequired || usernameTextRedaction.redactionRequired;
const redactionStatus = redactionRequired && !redaction.blurredChanged
  ? "failed"
  : redaction.redactionStatus;

function normalizeLine(value) {
  return (value ?? "").replace(/\\s+/g, " ").trim();
}

function hasUsernameAnchor(value) {
  return /(?:\\u0e1a\\u0e31\\u0e0d\\u0e0a\\u0e35\\u0e1c\\u0e39\\u0e49\\u0e43\\u0e0a\\u0e49\\u0e07\\u0e32\\u0e19|\\u0e0a\\u0e37\\u0e48\\u0e2d\\u0e1c\\u0e39\\u0e49\\u0e43\\u0e0a\\u0e49\\u0e07\\u0e32\\u0e19|\\u0e0a\\u0e35\\u0e1c\\u0e39\\u0e49\\u0e43\\u0e0a\\u0e49\\u0e07\\u0e32\\u0e19|\\(\\s*username\\s*\\)|\\busername\\b)/iu.test(value);
}

function detectUsernameContextLeak(pages) {
  const lines = pages.flatMap((page) => page.split(/\\r?\\n/));
  for (let i = 0; i < lines.length; i += 1) {
    const line = normalizeLine(lines[i]);
    if (!line) continue;
    const hasAnchor = hasUsernameAnchor(line);
    const hasRawValue = /\\b\\d{8,20}\\b/.test(line) || /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}/.test(line);
    if (hasAnchor && hasRawValue && !line.includes("[REDACTED_USERNAME]")) {
      return { leaked: true, line };
    }
    if (hasAnchor && i + 1 < lines.length) {
      const nextLine = normalizeLine(lines[i + 1]);
      if (
        nextLine &&
        nextLine !== "[REDACTED_USERNAME]" &&
        (/^\\d{8,20}$/.test(nextLine) || /^[A-Za-z0-9._%+-]{4,64}$/.test(nextLine))
      ) {
        return { leaked: true, line: nextLine };
      }
    }
  }
  return { leaked: false, line: null };
}

const usernameLeak = detectUsernameContextLeak(usernameTextRedaction.pages);
const identity = result.selected.identity;
const payload = {
  selectedPass: result.selected.name,
  passCount: result.passes.length,
  passScores: result.passes.map((pass) => ({
    pass: pass.name,
    score: pass.score,
    requiredFilled: pass.requiredFilled,
    missingRequired: pass.missingRequired,
    missingCritical: pass.missingCritical,
  })),
  extracted: {
    firstName: identity.thName?.first ?? null,
    lastName: identity.thName?.last ?? null,
    dob: identity.dobRaw ?? identity.dob ?? null,
    citizenId: identity.citizenIdFormatted ?? identity.citizenId ?? null,
    registeredAddress: identity.address?.full ?? null,
    contactAddress: identity.contactAddress?.full ?? null,
    phone: identity.phone ?? null,
    mobilePhone: identity.mobilePhone ?? null,
    email: identity.email ?? null,
  },
  redaction: {
    required: redactionRequired,
    status: redactionStatus,
    redacted: redaction.blurredChanged,
    regionCount: redaction.regions.length,
    regions: redaction.regions.map((region) => ({
      bbox: region.bbox,
      reason: region.reason,
      componentType: region.component_type,
    })),
    usernameAnchorCount: redaction.anchorCount,
    usernameCandidateCount: redaction.candidateCount,
    usernameTextRedactionCount: usernameTextRedaction.redactedCount,
    usernameContextLeak: usernameLeak,
  },
};
console.log(JSON.stringify(payload));
`;

const started = Date.now();
const run = spawnSync(
  process.execPath,
  ["--import", "tsx", "--env-file=.env", "-e", pipelineRunner, imagePath],
  {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 8,
  },
);
const elapsed = Date.now() - started;

if (run.status !== 0) {
  console.error("Pipeline execution failed.");
  console.error(run.stderr || run.stdout || "(no output)");
  process.exit(run.status || 1);
}

let parsed;
try {
  parsed = JSON.parse(run.stdout.trim());
} catch (error) {
  console.error("Cannot parse pipeline output.");
  console.error(run.stdout);
  process.exit(1);
}

const imageBuffer = fs.readFileSync(imagePath);

console.log("=== IMAGE ===");
console.log(`path:  ${imagePath}`);
console.log(`name:  ${path.basename(imagePath)}`);
console.log(`size:  ${imageBuffer.length} bytes`);
console.log(`latency: ${elapsed}ms`);

console.log("\n=== PIPELINE SUMMARY ===");
console.log(`selected_pass: ${parsed.selectedPass}`);
console.log(`pass_count: ${parsed.passCount}`);
for (const pass of parsed.passScores) {
  console.log(
    `  - ${pass.pass}: score=${pass.score}, required=${pass.requiredFilled}, missing=[${pass.missingRequired.join(", ")}]`,
  );
}

console.log("\n=== EXTRACTED FIELDS ===");
for (const [key, value] of Object.entries(parsed.extracted)) {
  console.log(`  ${key}: ${value ?? "(MISSING)"}`);
}

console.log("\n=== REDACTION ===");
console.log(`required: ${parsed.redaction.required}`);
console.log(`status: ${parsed.redaction.status}`);
console.log(`redacted: ${parsed.redaction.redacted}`);
console.log(`regions: ${parsed.redaction.regionCount}`);
for (const region of parsed.redaction.regions ?? []) {
  const box = region.bbox ?? {};
  console.log(
    `  - reason=${region.reason}, type=${region.componentType}, bbox=[${box.left},${box.top},${box.right},${box.bottom}]`,
  );
}
console.log(`username_anchor_count: ${parsed.redaction.usernameAnchorCount}`);
console.log(`username_candidate_count: ${parsed.redaction.usernameCandidateCount}`);
console.log(`username_text_redaction_count: ${parsed.redaction.usernameTextRedactionCount}`);
console.log(`username_context_leak: ${parsed.redaction.usernameContextLeak.leaked}`);
if (parsed.redaction.usernameContextLeak.line) {
  console.log(`username_context_leak_line: ${parsed.redaction.usernameContextLeak.line}`);
}

if (parsed.redaction.required && parsed.redaction.status === "failed") {
  console.error("\nASSERT FAILED: username redaction was required but not completed.");
  process.exit(2);
}
if (parsed.redaction.usernameContextLeak.leaked) {
  console.error("\nASSERT FAILED: sanitized OCR still leaks username context.");
  process.exit(2);
}

if (!truthId) {
  console.log("\n(no ground truth supplied — pass ground-truth-id as 2nd arg to compare)");
  console.log(`available: ${Object.keys(GROUND_TRUTH).join(", ")}`);
} else if (!GROUND_TRUTH[truthId]) {
  console.log(`\nUnknown ground truth id: ${truthId}`);
  console.log(`available: ${Object.keys(GROUND_TRUTH).join(", ")}`);
} else {
  compare(parsed.extracted, GROUND_TRUTH[truthId]);
}
