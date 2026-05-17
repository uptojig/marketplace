// Unit-test the new iApp-based USSD parser against both users' Phone.jpg.
import { iapp } from "../lib/kyc/iapp-client";
import { fromIappUssd } from "../lib/kyc/identity-extract";
import { readFile } from "node:fs/promises";

const CASES = [
  { label: "User 1 (Test1)", path: "C:/Users/riwki/Downloads/Archive/Test1/Phone.jpg", expectCid: "1300301177045", expectLast4: "8770" },
  { label: "User 2 (Archive)", path: "C:/Users/riwki/Downloads/Archive/Phone.jpeg", expectCid: null, expectLast4: null },
];

async function run(label: string, src: string, expectCid: string | null, expectLast4: string | null) {
  console.log("\n" + "═".repeat(70));
  console.log(label, "—", src);
  console.log("═".repeat(70));
  const buf = await readFile(src);
  const ocr = await iapp.ocrDocument(buf);
  console.log(`iApp ic=${ocr.ic} ms=${ocr.ms}`);
  const text = (ocr.data?.text ?? []).join("\n");
  console.log("\n--- Raw OCR text ---\n" + text);

  const parsed = fromIappUssd(ocr.data);
  console.log("\n--- Parsed ---");
  console.log(`citizenId       : ${parsed.citizenId ?? "(none)"}`);
  console.log(`phoneLast4      : ${parsed.phoneLast4 ?? "(none)"}`);
  console.log(`matchWordFound  : ${parsed.matchWordFound}`);
  console.log(`response slice  : ${parsed.responseText?.slice(0, 200) ?? "(no anchor)"}`);

  console.log("\n--- Expectations ---");
  if (expectCid) console.log(`CID  : ${parsed.citizenId === expectCid ? "✓" : "❌"} got ${parsed.citizenId} expect ${expectCid}`);
  if (expectLast4) console.log(`Last4: ${parsed.phoneLast4 === expectLast4 ? "✓" : "❌"} got ${parsed.phoneLast4} expect ${expectLast4}`);
}

async function main() {
  for (const c of CASES) {
    try { await run(c.label, c.path, c.expectCid, c.expectLast4); }
    catch (e: any) { console.error(`${c.label} FAIL:`, e?.message ?? e); }
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
