// V3 — Detect the card via text-density: edges → tight horizontal dilation
// (merges text lines into rows) → tight vertical dilation (merges rows into
// a block) → largest block = card region. Robust to occluded outer edges
// because we identify the card by what's INSIDE it, not its outline.
import sharp from "sharp";
import cv from "@techstark/opencv-js";
import { readFile } from "node:fs/promises";

const ID_ASPECT = 85.6 / 53.98;

async function loadMat(buffer: Buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return {
    mat: cv.matFromImageData({
      data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
      width: info.width,
      height: info.height,
    }),
    width: info.width,
    height: info.height,
  };
}

async function ready() {
  await new Promise<void>((r) => {
    if (typeof cv.Mat === "function") r();
    else cv.onRuntimeInitialized = () => r();
  });
}

async function main() {
  await ready();
  const path = process.argv[2] ?? "C:/Users/riwki/Downloads/Archive/Test1/FACE_AND_ID.jpg";
  const slug = process.argv[3] ?? "user1";
  const buf = await readFile(path);
  const { mat: src, width, height } = await loadMat(buf);
  console.log(`Image: ${width}×${height}`);

  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const edges = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.GaussianBlur(gray, blurred, new cv.Size(3, 3), 0, 0, cv.BORDER_DEFAULT);
  cv.Canny(blurred, edges, 50, 150);

  // Horizontal dilation: merge characters into lines
  const hKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(25, 3));
  const hDilated = new cv.Mat();
  cv.dilate(edges, hDilated, hKernel);
  hKernel.delete();

  // Vertical dilation: merge lines into blocks
  const vKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 15));
  const vDilated = new cv.Mat();
  cv.dilate(hDilated, vDilated, vKernel);
  vKernel.delete();

  await sharp(Buffer.from(vDilated.data), { raw: { width, height, channels: 1 } })
    .png().toFile(`.tmp-kyc-test/_${slug}_textdensity.png`);

  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(vDilated, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  const total = contours.size();
  const frameArea = width * height;
  console.log(`Total connected blocks: ${total}`);

  const ranked: Array<{ idx: number; area: number; rect: any; aspect: number }> = [];
  for (let i = 0; i < total; i += 1) {
    const c = contours.get(i);
    const area = cv.contourArea(c);
    if (area < frameArea * 0.01) { c.delete(); continue; }
    const br = cv.boundingRect(c);
    const aspect = Math.max(br.width, br.height) / Math.max(1, Math.min(br.width, br.height));
    ranked.push({ idx: i, area, rect: br, aspect });
    c.delete();
  }
  ranked.sort((a, b) => b.area - a.area);
  console.log(`Significant blocks (>1% frame): ${ranked.length}`);
  for (const r of ranked.slice(0, 10)) {
    const inAspect = Math.abs(r.aspect - ID_ASPECT) / ID_ASPECT < 0.20;
    console.log(`  area=${Math.round(r.area)} (${(r.area / frameArea * 100).toFixed(1)}%) | bbox ${r.rect.width}×${r.rect.height} @ (${r.rect.x},${r.rect.y}) aspect=${r.aspect.toFixed(2)} ${inAspect ? "✓ aspect" : "✗ aspect"}`);
  }

  // Annotate
  const annotated = src.clone();
  for (let i = 0; i < Math.min(5, ranked.length); i += 1) {
    const r = ranked[i];
    const color = i === 0 ? new cv.Scalar(0, 255, 0, 255)
              : i === 1 ? new cv.Scalar(255, 255, 0, 255)
              : new cv.Scalar(255, 100, 100, 255);
    cv.rectangle(annotated, { x: r.rect.x, y: r.rect.y }, { x: r.rect.x + r.rect.width, y: r.rect.y + r.rect.height }, color, 6);
  }
  await sharp(Buffer.from(annotated.data), { raw: { width, height, channels: 4 } })
    .png().toFile(`.tmp-kyc-test/_${slug}_textdensity_annotated.png`);
  console.log(`Saved → .tmp-kyc-test/_${slug}_textdensity_annotated.png`);

  annotated.delete();
  src.delete();
  gray.delete();
  blurred.delete();
  edges.delete();
  hDilated.delete();
  vDilated.delete();
  contours.delete();
  hierarchy.delete();
}

main().catch((e) => { console.error(e); process.exit(1); });
