#!/usr/bin/env node
/**
 * KYC wizard end-to-end benchmark.
 *
 * Runs the full wizard flow N times per fixture, discards the first 2 runs
 * as warmup (ONNX cold start, DB pool warmup), then reports per-step:
 *
 *   - HTTP wall time (what the user perceives)
 *   - Server processing time (route entry → response, no network)
 *   - Per-stage breakdown (from _timings_ms in response)
 *
 * Output: ASCII table + CSV (.tmp-kyc-test/bench-{fixture}.csv) for later
 * analysis. Compares each step's p95 against the 5s target.
 *
 * Usage:
 *   node scripts/kyc/bench.mjs --fixture test1 --runs 15
 *   node scripts/kyc/bench.mjs --fixture archive --runs 15
 *   node scripts/kyc/bench.mjs --fixture both --runs 15
 */
import fs from "node:fs";
import path from "node:path";

const ARGS = parseArgs(process.argv.slice(2));
const BASE = process.env.BASE || "http://localhost:3000";
const RUNS = Number(ARGS.runs ?? 15);
const WARMUP = Number(ARGS.warmup ?? 2);
const TARGET_MS = 5000;
const FIXTURE = ARGS.fixture ?? "test1";

const FIXTURES = {
  test1: {
    label: "User 1 (Test1)",
    dir: "C:/Users/riwki/Downloads/Archive/Test1",
    files: {
      image1: { name: "DGA_IMAGE1.jpg", mime: "image/jpeg" },
      image2: { name: "DGA_IMAGE2.jpg", mime: "image/jpeg" },
      id_front: { name: "NATIONAL_ID.jpg", mime: "image/jpeg" },
      selfie:   { name: "FACE_AND_ID.jpg", mime: "image/jpeg" },
      phone:    { name: "Phone.jpg",       mime: "image/jpeg" },
      bank:     { name: "Book_Bank.jpg",   mime: "image/jpeg" },
    },
  },
  archive: {
    label: "User 2 (Archive)",
    dir: "C:/Users/riwki/Downloads/Archive",
    files: {
      image1: { name: "DGA_IMAGE1.jpeg", mime: "image/jpeg" },
      image2: { name: "DGA_IMAGE2.jpeg", mime: "image/jpeg" },
      id_front: { name: "National_ID.png", mime: "image/png" },
      selfie:   { name: "Face_and_ID.jpg", mime: "image/jpeg" },
      phone:    { name: "Phone.jpeg",      mime: "image/jpeg" },
      bank:     { name: "Book_Bank.jpg",   mime: "image/jpeg" },
    },
  },
};

const STEPS = [
  { key: "s1", label: "S1 DGA_CAPTURE", path: "s3/dga-capture",
    fields: (f) => ({ image1: readImg(f.dir, f.files.image1), image2: readImg(f.dir, f.files.image2) }) },
  { key: "s2", label: "S2 ID_SELFIE",   path: "s1/id-card",
    fields: (f) => ({ id_front: readImg(f.dir, f.files.id_front), selfie: readImg(f.dir, f.files.selfie) }) },
  { key: "s3", label: "S3 PHONE",       path: "s4/ussd",
    fields: (f) => ({ image: readImg(f.dir, f.files.phone) }) },
  { key: "s4", label: "S4 BANKBOOK",    path: "s6/bankbook",
    fields: (f) => ({ image: readImg(f.dir, f.files.bank) }) },
];

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = argv[i + 1]?.startsWith("--") ? true : argv[i + 1];
      out[key] = val;
      if (val !== true) i += 1;
    }
  }
  return out;
}

function readImg(dir, file) {
  const full = path.join(dir, file.name);
  return { buf: fs.readFileSync(full), name: file.name, mime: file.mime };
}

async function createSession() {
  const r = await fetch(`${BASE}/api/wizard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  }).then((res) => res.json());
  return r?.session_id ?? r?.id;
}

async function callStep(sid, step, fixture) {
  const form = new FormData();
  for (const [k, v] of Object.entries(step.fields(fixture))) {
    form.append(k, new Blob([v.buf], { type: v.mime }), v.name);
  }
  const t0 = Date.now();
  let resp, json;
  try {
    resp = await fetch(`${BASE}/api/wizard/${sid}/${step.path}`, { method: "POST", body: form });
    json = await resp.json().catch(() => null);
  } catch (e) {
    return { httpMs: Date.now() - t0, status: 0, error: e.message, timings: null };
  }
  return {
    httpMs: Date.now() - t0,
    status: resp.status,
    timings: json?._timings_ms ?? null,
    body: json,
  };
}

function pct(arr, p) {
  if (arr.length === 0) return NaN;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

function pad(s, n) { return String(s).padEnd(n); }
function num(v) { return Number.isFinite(v) ? v.toFixed(0).padStart(6) : "    -"; }

function summarize(label, samples) {
  if (samples.length === 0) return { label, p50: NaN, p95: NaN, p99: NaN, min: NaN, max: NaN, avg: NaN, n: 0 };
  const sum = samples.reduce((a, b) => a + b, 0);
  return {
    label,
    n: samples.length,
    min: Math.min(...samples),
    max: Math.max(...samples),
    avg: sum / samples.length,
    p50: pct(samples, 50),
    p95: pct(samples, 95),
    p99: pct(samples, 99),
  };
}

function flag(p95) {
  if (!Number.isFinite(p95)) return "    ";
  return p95 <= TARGET_MS ? " OK " : " ❌ ";
}

async function benchFixture(fixtureKey) {
  const fixture = FIXTURES[fixtureKey];
  if (!fixture) throw new Error(`Unknown fixture: ${fixtureKey}`);
  console.log("\n" + "═".repeat(78));
  console.log(`Benchmark — ${fixture.label}`);
  console.log(`Runs: ${RUNS} (warmup ${WARMUP} discarded), target: each step p95 ≤ ${TARGET_MS}ms`);
  console.log("═".repeat(78));

  // Per-step samples (kept across runs)
  const stepSamples = {};
  // Per-stage samples (only collected after warmup; key = `${step.key}.${stageName}`)
  const stageSamples = {};
  for (const step of STEPS) stepSamples[step.key] = { http: [], total: [] };

  for (let run = 0; run < RUNS; run += 1) {
    const isWarmup = run < WARMUP;
    process.stdout.write(`run ${String(run + 1).padStart(2)}/${RUNS}${isWarmup ? " [warmup]" : ""}: `);
    const sid = await createSession();
    if (!sid) { console.log("FAIL to create session"); continue; }
    let stepFailedAt = null;
    for (const step of STEPS) {
      const result = await callStep(sid, step, fixture);
      process.stdout.write(`${step.key}=${result.httpMs}ms `);
      if (result.status !== 200) {
        process.stdout.write(`[HTTP ${result.status}] `);
        stepFailedAt = step.key;
        break;
      }
      if (!isWarmup) {
        stepSamples[step.key].http.push(result.httpMs);
        if (result.timings) {
          stepSamples[step.key].total.push(result.timings._total_ms ?? 0);
          for (const [stage, ms] of Object.entries(result.timings)) {
            if (stage === "_total_ms") continue;
            const key = `${step.key}.${stage}`;
            (stageSamples[key] ||= []).push(ms);
          }
        }
      }
    }
    console.log(stepFailedAt ? `(stopped at ${stepFailedAt})` : "✓");
  }

  // Report
  console.log("\n" + "─".repeat(78));
  console.log(`PER-STEP HTTP WALL TIME (after warmup, n=${RUNS - WARMUP})`);
  console.log("─".repeat(78));
  console.log(pad("step", 20) + pad("n", 4) + pad("min", 8) + pad("p50", 8) + pad("p95", 8) + pad("p99", 8) + pad("max", 8) + " 5s target");
  for (const step of STEPS) {
    const stats = summarize(step.label, stepSamples[step.key].http);
    console.log(
      pad(stats.label, 20) +
      pad(stats.n, 4) +
      num(stats.min) + "  " +
      num(stats.p50) + "  " +
      num(stats.p95) + "  " +
      num(stats.p99) + "  " +
      num(stats.max) + "  " +
      flag(stats.p95),
    );
  }

  console.log("\n" + "─".repeat(78));
  console.log("PER-STAGE BREAKDOWN (server-side, p50 / p95)");
  console.log("─".repeat(78));
  const stagesByStep = {};
  for (const key of Object.keys(stageSamples)) {
    const [stepKey, stage] = key.split(".", 2);
    (stagesByStep[stepKey] ||= []).push({ stage, samples: stageSamples[key] });
  }
  for (const step of STEPS) {
    const stages = stagesByStep[step.key] ?? [];
    if (!stages.length) continue;
    console.log(`\n  ${step.label}`);
    for (const { stage, samples } of stages) {
      const s = summarize(stage, samples);
      console.log(`    ${pad(stage, 28)}  p50=${num(s.p50)}  p95=${num(s.p95)}  max=${num(s.max)}`);
    }
  }

  // CSV dump
  const outDir = ".tmp-kyc-test";
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const csvLines = ["step,stage,n,p50_ms,p95_ms,p99_ms,min_ms,max_ms,avg_ms"];
  for (const step of STEPS) {
    const s = summarize("http", stepSamples[step.key].http);
    csvLines.push([step.key, "_http", s.n, s.p50, s.p95, s.p99, s.min, s.max, s.avg.toFixed(1)].join(","));
    for (const { stage, samples } of stagesByStep[step.key] ?? []) {
      const ss = summarize(stage, samples);
      csvLines.push([step.key, stage, ss.n, ss.p50, ss.p95, ss.p99, ss.min, ss.max, ss.avg.toFixed(1)].join(","));
    }
  }
  const csvPath = path.join(outDir, `bench-${fixtureKey}.csv`);
  fs.writeFileSync(csvPath, csvLines.join("\n"));
  console.log(`\nCSV: ${csvPath}`);

  // 5-second-target summary
  console.log("\n" + "═".repeat(78));
  console.log("VS 5-SECOND TARGET");
  console.log("═".repeat(78));
  for (const step of STEPS) {
    const s = summarize(step.label, stepSamples[step.key].http);
    const verdict = !Number.isFinite(s.p95) ? "(no data)"
                  : s.p95 <= TARGET_MS ? `✓ within 5s (p95=${s.p95}ms)`
                  : `❌ exceeds 5s (p95=${s.p95}ms, ${(s.p95 - TARGET_MS)}ms over)`;
    console.log(`  ${pad(step.label, 22)} ${verdict}`);
  }
}

async function main() {
  if (FIXTURE === "both") {
    await benchFixture("test1");
    await benchFixture("archive");
  } else {
    await benchFixture(FIXTURE);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
