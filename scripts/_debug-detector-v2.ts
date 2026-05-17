// V2 — try minAreaRect on the largest contour + aggressive dilation to
// close partial occlusion gaps. Also save annotated outputs.
import sharp from "sharp";
import cv from "@techstark/opencv-js";
import { readFile, writeFile, mkdir } from "node:fs/promises";

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
  await mkdir(".tmp-kyc-test", { recursive: true });

  const path = process.argv[2] ?? "C:/Users/riwki/Downloads/Archive/Test1/FACE_AND_ID.jpg";
  const slug = process.argv[3] ?? "user1";
  const buf = await readFile(path);
  const { mat: src, width, height } = await loadMat(buf);
  console.log(`Image: ${width}×${height}, area=${width * height}`);

  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const edges = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
  cv.Canny(blurred, edges, 50, 150);

  // Aggressive close: 15×15 kernel to bridge thumb/finger occlusions.
  const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(15, 15));
  cv.morphologyEx(edges, edges, cv.MORPH_CLOSE, kernel);
  kernel.delete();

  // Save dilated edges for visual check
  await sharp(Buffer.from(edges.data), { raw: { width, height, channels: 1 } })
    .png().toFile(`.tmp-kyc-test/_${slug}_edges_dilated.png`);

  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  const total = contours.size();
  const frameArea = width * height;
  console.log(`Total contours: ${total}`);

  const ranked: Array<{ idx: number; area: number; aspect: number; rect: any; angle: number; size: any }> = [];
  for (let i = 0; i < total; i += 1) {
    const c = contours.get(i);
    const area = cv.contourArea(c);
    if (area < frameArea * 0.02) { c.delete(); continue; }
    const rect = cv.minAreaRect(c);
    const w = rect.size.width;
    const h = rect.size.height;
    const aspect = Math.max(w, h) / Math.max(1, Math.min(w, h));
    ranked.push({ idx: i, area, aspect, rect, angle: rect.angle, size: rect.size });
    c.delete();
  }
  ranked.sort((a, b) => b.area - a.area);
  console.log(`Significant contours (>2% frame): ${ranked.length}`);
  for (const r of ranked.slice(0, 10)) {
    const inAspect = Math.abs(r.aspect - ID_ASPECT) / ID_ASPECT < 0.20;
    console.log(`  idx=${r.idx} area=${Math.round(r.area)} (${(r.area / frameArea * 100).toFixed(1)}%) | minRect ${r.size.width.toFixed(0)}×${r.size.height.toFixed(0)} aspect=${r.aspect.toFixed(2)} angle=${r.angle.toFixed(0)}° ${inAspect ? "✓ aspect" : "✗ aspect"}`);
  }

  // Annotate the top candidates on the source image and save
  const annotated = src.clone();
  for (let i = 0; i < Math.min(5, ranked.length); i += 1) {
    const r = ranked[i];
    const box = cv.RotatedRect.points(r.rect);
    const color = i === 0 ? new cv.Scalar(0, 255, 0, 255)  // green = best
              : i === 1 ? new cv.Scalar(255, 255, 0, 255) // yellow
              : new cv.Scalar(255, 100, 100, 255);
    for (let p = 0; p < 4; p += 1) {
      cv.line(annotated, box[p], box[(p + 1) % 4], color, 6);
    }
  }
  await sharp(Buffer.from(annotated.data), { raw: { width, height, channels: 4 } })
    .png().toFile(`.tmp-kyc-test/_${slug}_annotated.png`);
  console.log(`Saved annotated → .tmp-kyc-test/_${slug}_annotated.png`);

  annotated.delete();
  src.delete();
  gray.delete();
  blurred.delete();
  edges.delete();
  contours.delete();
  hierarchy.delete();
}

main().catch((e) => { console.error(e); process.exit(1); });
