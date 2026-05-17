// Run the new auto-detector against both users' selfie-holding-ID fixtures
// and save the cropped output. Then call iApp ocrThaiIdFront on the result
// to verify the citizen ID is recoverable.
import { autoExtractIdCard } from "../lib/kyc/id-card-detector";
import { iapp } from "../lib/kyc/iapp-client";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const CASES = [
  { label: "User 1 (Test1)", path: "C:/Users/riwki/Downloads/Archive/Test1/FACE_AND_ID.jpg", expectCitizenId: "1300301177045" },
  { label: "User 2 (Archive)", path: "C:/Users/riwki/Downloads/Archive/Face_and_ID.jpg", expectCitizenId: null },
];

async function run(label: string, srcPath: string, expectCitizenId: string | null) {
  console.log("\n" + "═".repeat(70));
  console.log(label, "—", srcPath);
  console.log("═".repeat(70));
  const buffer = await readFile(srcPath);
  console.log(`Loaded: ${buffer.length} bytes`);

  const result = await autoExtractIdCard(buffer, { confidenceThreshold: 0.15 });
  console.log("\n--- Detection ---");
  console.log(`imageSize    : ${result.detection.imageWidth}×${result.detection.imageHeight}`);
  console.log(`candidates   : ${result.detection.candidateCount}`);
  console.log(`confidence   : ${result.detection.confidence.toFixed(3)}`);
  if (result.detection.quad) {
    const q = result.detection.quad;
    console.log(`quad TL=${q.topLeft.x},${q.topLeft.y}  TR=${q.topRight.x},${q.topRight.y}  BR=${q.bottomRight.x},${q.bottomRight.y}  BL=${q.bottomLeft.x},${q.bottomLeft.y}`);
  } else {
    console.log("quad         : NONE");
  }

  if (!result.buffer) {
    console.log("❌ No crop produced");
    return;
  }
  const outDir = ".tmp-kyc-test";
  await mkdir(outDir, { recursive: true });
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const outPath = join(outDir, `${slug}_held_id_cropped.jpg`);
  await writeFile(outPath, result.buffer);
  console.log(`\n--- Crop ---\nSaved: ${outPath} (${result.buffer.length} bytes)`);

  console.log("\n--- iApp OCR on cropped image ---");
  try {
    const ocr = await iapp.ocrThaiIdFront(result.buffer);
    const summary = {
      id_number: ocr.data.id_number,
      th_name: ocr.data.th_name,
      en_name: ocr.data.en_name,
      th_dob: ocr.data.th_dob,
      en_dob: ocr.data.en_dob,
      detection_score: ocr.data.detection_score,
      th_expire: ocr.data.th_expire,
    };
    console.log(JSON.stringify(summary, null, 2));
    if (expectCitizenId) {
      const match = ocr.data.id_number === expectCitizenId;
      console.log(`\n${match ? "✓" : "❌"} citizen ID match: got ${JSON.stringify(ocr.data.id_number)} expect ${expectCitizenId}`);
    }
  } catch (e: any) {
    console.log("❌ iApp OCR failed:", e?.message ?? e);
  }
}

async function main() {
  for (const c of CASES) {
    try {
      await run(c.label, c.path, c.expectCitizenId);
    } catch (e: any) {
      console.error(`${c.label} FAIL:`, e?.message ?? e);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
