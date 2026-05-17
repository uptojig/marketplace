// Diagnostic: walk the detection pipeline stage-by-stage so we can see
// where the filter is throwing the real card out.
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
  const buf = await readFile(path);
  const { mat: src, width, height } = await loadMat(buf);
  console.log(`Image: ${width}×${height}, area=${width * height}`);

  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const edges = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

  // Try several Canny threshold pairs.
  const CANNY_VARIANTS = [
    [75, 200],
    [50, 150],
    [30, 100],
    [100, 250],
  ];

  for (const [lo, hi] of CANNY_VARIANTS) {
    cv.Canny(blurred, edges, lo, hi);
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
    cv.morphologyEx(edges, edges, cv.MORPH_CLOSE, kernel);
    kernel.delete();

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    const total = contours.size();
    const areas: number[] = [];
    let quadCount = 0;
    let quadInAspect = 0;
    const quadDetails: any[] = [];

    for (let i = 0; i < total; i += 1) {
      const c = contours.get(i);
      const area = cv.contourArea(c);
      if (area > width * height * 0.005) areas.push(area);
      const perimeter = cv.arcLength(c, true);
      for (const eps of [0.01, 0.02, 0.03, 0.05]) {
        const approx = new cv.Mat();
        cv.approxPolyDP(c, approx, eps * perimeter, true);
        if (approx.rows === 4 && cv.isContourConvex(approx)) {
          quadCount += 1;
          // Compute aspect
          const pts = [];
          for (let r = 0; r < 4; r += 1) pts.push({ x: approx.data32S[r * 2], y: approx.data32S[r * 2 + 1] });
          // Use bounding box for rough aspect
          const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
          const w = Math.max(...xs) - Math.min(...xs);
          const h = Math.max(...ys) - Math.min(...ys);
          const aspect = Math.max(w, h) / Math.max(1, Math.min(w, h));
          if (Math.abs(aspect - ID_ASPECT) / ID_ASPECT < 0.20) {
            quadInAspect += 1;
            quadDetails.push({ eps, area: Math.round(area), aspect: aspect.toFixed(2), bbox: { w, h }, pts });
          }
          approx.delete();
          break;
        }
        approx.delete();
      }
      c.delete();
    }

    const top5 = areas.sort((a, b) => b - a).slice(0, 5).map((a) => Math.round(a));
    console.log(`Canny[${lo},${hi}]: total=${total} | sig(>0.5%)=${areas.length} top5=${JSON.stringify(top5)} | quads(any eps)=${quadCount} | quad+aspect=${quadInAspect}`);
    if (quadDetails.length) {
      for (const q of quadDetails.slice(0, 3)) {
        console.log(`  quad eps=${q.eps} area=${q.area} aspect=${q.aspect} bbox=${q.bbox.w}×${q.bbox.h}`);
      }
    }
    contours.delete();
    hierarchy.delete();
  }

  // Also save the Canny output for visual inspection (default thresholds).
  cv.Canny(blurred, edges, 75, 200);
  const cannyOut = Buffer.from(edges.data);
  await sharp(cannyOut, { raw: { width, height, channels: 1 } }).png().toFile(".tmp-kyc-test/_canny.png");
  console.log("Saved Canny output → .tmp-kyc-test/_canny.png");

  src.delete();
  gray.delete();
  blurred.delete();
  edges.delete();
}

main().catch((e) => { console.error(e); process.exit(1); });
