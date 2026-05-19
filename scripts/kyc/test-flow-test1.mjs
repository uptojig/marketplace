#!/usr/bin/env node
// One-off variant of test-flow.mjs that points at the Test1 archive (real
// person fixtures) with .jpg + UPPER_SNAKE filenames. Outputs the wizard
// session id at the end so we can pull raw iApp OCR responses from the DB.
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE || "http://localhost:3000";
const ARCHIVE = process.env.ARCHIVE || "C:/Users/riwki/Downloads/Archive/Test1";

const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

function readImage(name, mime) {
  const p = path.join(ARCHIVE, name);
  if (!fs.existsSync(p)) throw new Error(`Missing archive image: ${p}`);
  return { buf: fs.readFileSync(p), name, mime };
}

function summarize(json) {
  if (!json) return null;
  const out = {};
  for (const k of [
    "ok", "id", "session_id", "state", "finalDecision", "completedSteps",
    "error", "errorCode", "message", "missing", "missing_fields", "field_errors",
    "ocr", "matches", "matched", "reason", "evidence", "latestMatches",
    "extracted", "confidence", "image_count", "image2_redacted_count",
  ]) {
    if (k in json) out[k] = json[k];
  }
  return out;
}

async function call(label, url, method, formFields) {
  process.stdout.write(`\n${CYAN}▸ ${label}${RESET}\n  ${DIM}${method} ${url}${RESET}\n`);
  const t0 = Date.now();
  let body;
  if (formFields) {
    const form = new FormData();
    for (const [k, v] of Object.entries(formFields)) {
      if (v && typeof v === "object" && "buf" in v) {
        form.append(k, new Blob([v.buf], { type: v.mime }), v.name);
        process.stdout.write(`  ${DIM}↑ ${k} = ${v.name} (${v.buf.length}b)${RESET}\n`);
      } else if (v != null) {
        form.append(k, String(v));
      }
    }
    body = form;
  }
  let res, text;
  try {
    res = await fetch(url, { method, body });
    text = await res.text();
  } catch (e) {
    console.log(`  ${RED}❌ NETWORK: ${e.message}${RESET}`);
    return { status: 0, json: null, text: "" };
  }
  const ms = Date.now() - t0;
  let json = null;
  try { json = JSON.parse(text); } catch {}
  const statusColor = res.ok ? GREEN : RED;
  console.log(`  ${statusColor}HTTP ${res.status}${RESET} ${DIM}in ${ms}ms${RESET}`);
  const trimmed = summarize(json) ?? text.slice(0, 800);
  console.log("  " + JSON.stringify(trimmed, null, 2).split("\n").join("\n  "));
  return { status: res.status, ok: res.ok, json, text, ms };
}

async function main() {
  console.log("════════════════════════════════════════════════════════");
  console.log("KYC End-to-End Flow Test  —  Test1 (real-person fixtures)");
  console.log("════════════════════════════════════════════════════════");
  console.log("  Archive:", ARCHIVE);
  console.log("  Server :", BASE);

  const sess = await fetch(`${BASE}/api/wizard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  }).then((r) => r.json());
  console.log("\n▸ 0. Create session\n  POST /api/wizard");
  console.log("  ", JSON.stringify(sess, null, 2).split("\n").join("\n  "));
  const sid = sess?.session_id ?? sess?.id;
  if (!sid) { console.log(`\n${RED}❌ Could not create session — abort.${RESET}`); process.exit(1); }
  console.log(`  ${GREEN}✓ Session ID: ${sid}${RESET}`);

  // S1 v2 — incremental multi-image: 2 add-image calls + 1 finalize.
  await call(
    "1a. S1_DGA_CAPTURE — POST /s1/dga-add-image (1/2)",
    `${BASE}/api/wizard/${sid}/s1/dga-add-image`,
    "POST",
    { image: readImage("DGA_IMAGE1.jpg", "image/jpeg") },
  );
  await call(
    "1b. S1_DGA_CAPTURE — POST /s1/dga-add-image (2/2)",
    `${BASE}/api/wizard/${sid}/s1/dga-add-image`,
    "POST",
    { image: readImage("DGA_IMAGE2.jpg", "image/jpeg") },
  );
  await call(
    "1c. S1_DGA_CAPTURE — POST /s1/dga-finalize",
    `${BASE}/api/wizard/${sid}/s1/dga-finalize`,
    "POST",
    {},
  );

  await call(
    "2. S2_ID_SELFIE — POST /s1/id-card",
    `${BASE}/api/wizard/${sid}/s1/id-card`,
    "POST",
    {
      id_front: readImage("NATIONAL_ID.jpg", "image/jpeg"),
      selfie: readImage("FACE_AND_ID.jpg", "image/jpeg"),
      // Don't pre-send a held_id_crop — let the backend auto-detect the
      // card via YOLO and crop it itself. This matches what the wizard
      // frontend does today (no canvas crop UI yet).
    },
  );

  await call(
    "3. S3_PHONE_RESPONSE — POST /s4/ussd",
    `${BASE}/api/wizard/${sid}/s4/ussd`,
    "POST",
    {
      image: readImage("Phone.jpg", "image/jpeg"),
    },
  );

  await call(
    "4. S4_BANKBOOK_UPLOAD — POST /s6/bankbook",
    `${BASE}/api/wizard/${sid}/s6/bankbook`,
    "POST",
    {
      image: readImage("Book_Bank.jpg", "image/jpeg"),
    },
  );

  const final = await call(
    "FINAL — GET /api/wizard/{sid}",
    `${BASE}/api/wizard/${sid}`,
    "GET",
    null,
  );

  console.log("\n════════════════════════════════════════════════════════");
  const state = final.json?.state ?? "(unknown)";
  const verdict =
    state === "AUTO_APPROVED" ? `${GREEN}✓ AUTO_APPROVED${RESET}`
    : state === "REJECTED"      ? `${RED}✗ REJECTED${RESET}`
    : state === "MANUAL_REVIEW" ? `${YELLOW}⚠ MANUAL_REVIEW${RESET}`
    : `${YELLOW}IN_PROGRESS — state=${state}${RESET}`;
  console.log("Final verdict:", verdict);
  console.log("Session ID  :", sid);
  console.log("Inspect at  :", `${BASE}/admin/kyc/${sid}`);
  // Machine-readable handoff for the follow-up DB query.
  console.log(`SID=${sid}`);
}

main().catch((e) => {
  console.error(`\n${RED}❌ FATAL: ${e.message}${RESET}`);
  console.error(e.stack);
  process.exit(1);
});
