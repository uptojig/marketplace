// Quick smoke test for iApp KYC env config.
//
// Verifies:
//   1. IAPP_API_KEY authenticates (no 401/403)
//   2. Endpoint URLs are reachable (no 404)
//   3. Network OK
//
// We send a tiny 1x1 JPEG so iApp will reject it with a business-logic error
// (e.g., "no face detected"). That's expected — we only care that the request
// got through.
//
// Run: node --env-file=.env scripts/kyc/smoke.mjs

const API_KEY = process.env.IAPP_API_KEY;
const BASE = process.env.IAPP_BASE_URL ?? "https://api.iapp.co.th";

if (!API_KEY) {
  console.error("IAPP_API_KEY is missing. Run with: node --env-file=.env scripts/kyc/smoke.mjs");
  process.exit(1);
}

// Minimal 1x1 white JPEG (~125 bytes)
const TINY_JPEG_B64 =
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A//Z";
const tinyJpeg = Buffer.from(TINY_JPEG_B64, "base64");

async function probe(label, path, fields) {
  const url = `${BASE}${path}`;
  const form = new FormData();
  for (const [name, buf] of Object.entries(fields)) {
    form.append(name, new Blob([buf], { type: "image/jpeg" }), `${name}.jpg`);
  }
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { apikey: API_KEY },
      body: form,
    });
    const ms = Date.now() - t0;
    const text = await res.text();
    const verdict =
      res.status === 401 || res.status === 403
        ? "❌ AUTH FAILED"
        : res.status === 404
          ? "❌ NOT FOUND"
          : res.status >= 200 && res.status < 300
            ? "✅ OK"
            : "✅ AUTH OK (business-logic error expected)";
    console.log(`${verdict}  ${label}`);
    console.log(`    HTTP ${res.status} in ${ms}ms`);
    console.log(`    Body: ${text.slice(0, 300)}`);
    console.log();
    return { ok: res.status !== 401 && res.status !== 403 && res.status !== 404, status: res.status };
  } catch (err) {
    console.log(`❌ NETWORK ERROR  ${label}`);
    console.log(`    ${err instanceof Error ? err.message : String(err)}`);
    console.log();
    return { ok: false, status: 0 };
  }
}

console.log(`Base URL : ${BASE}`);
console.log(`Key tail : ...${API_KEY.slice(-4)}`);
console.log(`Tiny JPEG: ${tinyJpeg.length} bytes`);
console.log();

const results = [];
results.push(
  await probe("Thai ID OCR (front)", "/v3/store/ekyc/thai-national-id-card/front", {
    file: tinyJpeg,
  }),
);
results.push(
  await probe("Face Passive Liveness", "/v3/store/ekyc/face-passive-liveness", {
    file: tinyJpeg,
  }),
);
results.push(
  await probe("Face Verification", "/v3/store/ekyc/face-verification", {
    file1: tinyJpeg,
    file2: tinyJpeg,
  }),
);

const allReachable = results.every((r) => r.ok);
console.log(allReachable ? "✅ env works — all endpoints reachable with current key" : "❌ env has issues — see above");
process.exit(allReachable ? 0 : 1);
