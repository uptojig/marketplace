#!/usr/bin/env node
/**
 * End-to-end KYC wizard test against the local dev server.
 *
 * Hits our /api/wizard/* endpoints (which in turn call iApp + Typhoon
 * OCR) — this is a REAL spend test, ~฿5-15 per full run depending on
 * how many OCR calls the steps trigger.
 *
 * Image archive expected at C:/Users/riwki/Downloads/Archive with:
 *   DGA_IMAGE1.jpeg, DGA_IMAGE2.jpeg  → S1_DGA_CAPTURE (s1/dga-add-image × N + s1/dga-finalize)
 *   National_ID.png, Face_and_ID.jpg → S2_ID_SELFIE   (s1/id-card)
 *   Phone.jpeg                       → S3_PHONE_RESPONSE (s4/ussd)
 *   Book_Bank.jpg                    → S4_BANKBOOK_UPLOAD (s6/bankbook)
 *
 * Usage: node scripts/kyc/test-flow.mjs
 *        BASE=http://localhost:3000 node scripts/kyc/test-flow.mjs
 */
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE || "http://localhost:3000";
const ARCHIVE = process.env.ARCHIVE || "C:/Users/riwki/Downloads/Archive";

const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

function readImage(name, mime) {
  const p = path.join(ARCHIVE, name);
  if (!fs.existsSync(p)) {
    throw new Error(`Missing archive image: ${p}`);
  }
  return { buf: fs.readFileSync(p), name, mime };
}

function summarize(json) {
  if (!json) return null;
  // Trim down the noisy snapshot fields for readable output
  const out = {};
  for (const k of [
    "ok",
    "id",
    "session_id",
    "state",
    "finalDecision",
    "completedSteps",
    "error",
    "errorCode",
    "message",
    "missing",
    "ocr",
    "matches",
    "matched",
    "reason",
    "evidence",
    "latestMatches",
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
      } else if (v !== null && v !== undefined) {
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
  const trimmed = summarize(json) ?? text.slice(0, 600);
  console.log("  " + JSON.stringify(trimmed, null, 2).split("\n").join("\n  "));
  return { status: res.status, ok: res.ok, json, text, ms };
}

async function main() {
  console.log("════════════════════════════════════════════════════════");
  console.log("KYC End-to-End Flow Test");
  console.log("════════════════════════════════════════════════════════");
  console.log("  Archive:", ARCHIVE);
  console.log("  Server :", BASE);

  // ─── Step 0: Create fresh session ──────────────────────────
  // /api/wizard expects no formData — send empty JSON body
  const sess = await fetch(`${BASE}/api/wizard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  }).then((r) => r.json());
  console.log("\n▸ 0. Create session\n  POST /api/wizard");
  console.log("  ", JSON.stringify(sess, null, 2).split("\n").join("\n  "));
  const sid = sess?.session_id ?? sess?.id;
  if (!sid) {
    console.log(`\n${RED}❌ Could not create session — abort.${RESET}`);
    process.exit(1);
  }
  console.log(`  ${GREEN}✓ Session ID: ${sid}${RESET}`);

  // ─── Step 1: DGA capture (S1 v2 — incremental multi-image) ─
  // Server expects N add-image calls (one image per request) then a
  // finalize call. Send 2 images here to match the legacy 2-image flow.
  await call(
    "1a. S1_DGA_CAPTURE — POST /s1/dga-add-image (1/2)",
    `${BASE}/api/wizard/${sid}/s1/dga-add-image`,
    "POST",
    { image: readImage("DGA_IMAGE1.jpeg", "image/jpeg") },
  );
  await call(
    "1b. S1_DGA_CAPTURE — POST /s1/dga-add-image (2/2)",
    `${BASE}/api/wizard/${sid}/s1/dga-add-image`,
    "POST",
    { image: readImage("DGA_IMAGE2.jpeg", "image/jpeg") },
  );
  await call(
    "1c. S1_DGA_CAPTURE — POST /s1/dga-finalize",
    `${BASE}/api/wizard/${sid}/s1/dga-finalize`,
    "POST",
    {},
  );

  // ─── Step 2: ID card + selfie ──────────────────────────────
  // selfie_held_id_crop is normally generated client-side via Canvas
  // crop of the selfie. For server test we fall back to sending the
  // raw selfie as the crop — server may reject it as not-cropped.
  await call(
    "2. S2_ID_SELFIE — POST /s1/id-card",
    `${BASE}/api/wizard/${sid}/s1/id-card`,
    "POST",
    {
      id_front: readImage("National_ID.png", "image/png"),
      selfie: readImage("Face_and_ID.jpg", "image/jpeg"),
      // No client-side crop — backend auto-detects ID via YOLO.
    },
  );

  // ─── Step 3: Phone DGA response screenshot ─────────────────
  await call(
    "3. S3_PHONE_RESPONSE — POST /s4/ussd",
    `${BASE}/api/wizard/${sid}/s4/ussd`,
    "POST",
    {
      image: readImage("Phone.jpeg", "image/jpeg"),
    },
  );

  // ─── Step 4: Bankbook (final → AUTO_APPROVED or REJECTED) ──
  await call(
    "4. S4_BANKBOOK_UPLOAD — POST /s6/bankbook",
    `${BASE}/api/wizard/${sid}/s6/bankbook`,
    "POST",
    {
      image: readImage("Book_Bank.jpg", "image/jpeg"),
    },
  );

  // ─── Final snapshot ────────────────────────────────────────
  const final = await call(
    "FINAL — GET /api/wizard/{sid}",
    `${BASE}/api/wizard/${sid}`,
    "GET",
    null,
  );

  console.log("\n════════════════════════════════════════════════════════");
  const state = final.json?.state ?? "(unknown)";
  const verdict =
    state === "AUTO_APPROVED" ? `${GREEN}✓ AUTO_APPROVED — KYC passed${RESET}`
    : state === "REJECTED"      ? `${RED}✗ REJECTED${RESET}`
    : state === "MANUAL_REVIEW" ? `${YELLOW}⚠ MANUAL_REVIEW — needs human${RESET}`
    : `${YELLOW}IN_PROGRESS — state=${state}${RESET}`;
  console.log("Final verdict:", verdict);
  console.log("Session ID  :", sid);
  console.log("Inspect at  :", `${BASE}/admin/kyc/${sid}`);
}

main().catch((e) => {
  console.error(`\n${RED}❌ FATAL: ${e.message}${RESET}`);
  console.error(e.stack);
  process.exit(1);
});
