// Server-side Thai ID card auto-detection + perspective correction.
//
// Stage 1 — YOLO26n-Pose card-corner detector
//   Model: chayuto/thai-id-ocr-yolo26n-card-corner-detector (ONNX, ~9.7 MB)
//   Input: [1, 3, 640, 640] RGB float32, normalized to [0,1], NCHW
//   Output: [1, 300, 14] — top-300 detections, NMS-free
//           each row = [x1, y1, x2, y2, conf, cls, TL_x,TL_y, TR_x,TR_y, BR_x,BR_y, BL_x,BL_y]
//   Class 0 = "thai-id-card"; box mAP50 0.993, pose mAP50-95 0.991
//
// Stage 2 — Perspective correction
//   Uses opencv.js getPerspectiveTransform + warpPerspective on the 4
//   detected corner keypoints, producing a flat 1200×757 (1.586:1, matching
//   Thai ID's ISO 7810 dimensions) JPEG ready for iApp's ocrThaiIdFront.
//
// Original buffer is never mutated. Returns null when no card is detected
// above the confidence threshold so callers can return a clear retake
// error to the user.

import sharp from "sharp";
import cv from "@techstark/opencv-js";
import { join } from "node:path";

const MODEL_PATH = join(process.cwd(), "models", "thai-id-card-detector.onnx");
const MODEL_INPUT_SIZE = 640;
// Empirical threshold from Test1+Archive fixtures: real detections score
// 0.24+ (smallish card) up to 0.80+ (large card), dummy inputs ≈ 1e-5.
// 0.20 sits comfortably above the noise floor while keeping the smaller-
// card detection (User 2 @ 0.242) above the line.
const DEFAULT_CONFIDENCE_THRESHOLD = 0.20;

// Thai national ID (ISO 7810 ID-1): 85.6 × 53.98 mm → ~1.586:1. Render the
// corrected crop at 1200 px wide so iApp's OCR has plenty of pixel density
// to read 13-digit numbers and Thai script.
const ID_ASPECT_RATIO = 85.6 / 53.98;
const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = Math.round(OUTPUT_WIDTH / ID_ASPECT_RATIO);

export interface DetectedQuad {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
}

export interface DetectionResult {
  quad: DetectedQuad | null;
  confidence: number;
  imageWidth: number;
  imageHeight: number;
  // Diagnostics: how many candidates were above the threshold (for audit).
  rawConfidence: number;
  candidateCount: number;
}

let runtimeReady: Promise<void> | null = null;
function ensureOpenCv(): Promise<void> {
  if (runtimeReady) return runtimeReady;
  runtimeReady = new Promise<void>((resolve) => {
    if (typeof cv.Mat === "function") resolve();
    else cv.onRuntimeInitialized = () => resolve();
  });
  return runtimeReady;
}

// Memoize the ONNX session so we pay model-load cost once per process. Cold
// start adds ~100-200ms; subsequent inferences are sub-second on CPU.
let onnxSession: Promise<any> | null = null;
function loadModel(): Promise<any> {
  if (!onnxSession) {
    const ort = require("onnxruntime-node");
    onnxSession = ort.InferenceSession.create(MODEL_PATH, {
      executionProviders: ["cpu"],
      graphOptimizationLevel: "all",
    });
  }
  return onnxSession;
}

// Letterbox resize: scale image while preserving aspect ratio, pad with
// gray (114) to 640×640. Returns the scaled image plus the inverse
// transform parameters needed to map detected coordinates back to original
// image space.
async function letterboxResize(buffer: Buffer): Promise<{
  data: Buffer;
  scale: number;
  padX: number;
  padY: number;
  origWidth: number;
  origHeight: number;
}> {
  const meta = await sharp(buffer).metadata();
  const origWidth = meta.width ?? 0;
  const origHeight = meta.height ?? 0;
  if (!origWidth || !origHeight) {
    throw new Error("Unable to read image dimensions");
  }

  const scale = Math.min(MODEL_INPUT_SIZE / origWidth, MODEL_INPUT_SIZE / origHeight);
  const scaledWidth = Math.round(origWidth * scale);
  const scaledHeight = Math.round(origHeight * scale);
  const padX = Math.floor((MODEL_INPUT_SIZE - scaledWidth) / 2);
  const padY = Math.floor((MODEL_INPUT_SIZE - scaledHeight) / 2);

  const data = await sharp(buffer)
    .resize(scaledWidth, scaledHeight, { fit: "fill" })
    .extend({
      top: padY,
      bottom: MODEL_INPUT_SIZE - scaledHeight - padY,
      left: padX,
      right: MODEL_INPUT_SIZE - scaledWidth - padX,
      background: { r: 114, g: 114, b: 114 },
    })
    .removeAlpha()
    .raw()
    .toBuffer();

  return { data, scale, padX, padY, origWidth, origHeight };
}

// Convert HWC uint8 RGB buffer → CHW float32 normalized [0,1] tensor data.
function imageBufferToTensor(rgb: Buffer): Float32Array {
  const size = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE;
  const out = new Float32Array(3 * size);
  for (let i = 0; i < size; i += 1) {
    out[i] = rgb[i * 3] / 255;                  // R channel
    out[size + i] = rgb[i * 3 + 1] / 255;       // G channel
    out[size * 2 + i] = rgb[i * 3 + 2] / 255;   // B channel
  }
  return out;
}

// Reverse the letterbox: map a (x,y) point in 640×640 model space back to
// the original image's pixel coordinates.
function unletterbox(
  x: number,
  y: number,
  scale: number,
  padX: number,
  padY: number,
): { x: number; y: number } {
  return {
    x: (x - padX) / scale,
    y: (y - padY) / scale,
  };
}

// Reorder corner keypoints into a canonical TL/TR/BR/BL ordering using sum-
// and-diff heuristic. The model returns corners in a fixed order, but
// rotated cards or false detections can flip the labelling — sum/diff is
// rotation-invariant.
function orderQuadPoints(points: Array<{ x: number; y: number }>): DetectedQuad {
  if (points.length !== 4) throw new Error("orderQuadPoints expects 4 points");
  const sums = points.map((p) => p.x + p.y);
  const diffs = points.map((p) => p.y - p.x);
  return {
    topLeft: points[sums.indexOf(Math.min(...sums))],
    bottomRight: points[sums.indexOf(Math.max(...sums))],
    topRight: points[diffs.indexOf(Math.min(...diffs))],
    bottomLeft: points[diffs.indexOf(Math.max(...diffs))],
  };
}

export async function detectIdCardRegion(
  buffer: Buffer,
  options: { confidenceThreshold?: number } = {},
): Promise<DetectionResult> {
  const threshold = options.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;
  const session = await loadModel();

  const { data: rgbBuffer, scale, padX, padY, origWidth, origHeight } = await letterboxResize(buffer);
  const tensorData = imageBufferToTensor(rgbBuffer);
  
  const ort = require("onnxruntime-node");
  const inputTensor = new ort.Tensor("float32", tensorData, [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);

  const result = await session.run({ images: inputTensor });
  const output = result.output0;
  const data = output.data as Float32Array;
  // Output shape [1, 300, 14] → flat array of 300×14 = 4200 floats
  const DET_STRIDE = 14;
  const NUM_DETECTIONS = 300;

  let bestIdx = -1;
  let bestConf = -Infinity;
  let aboveThreshold = 0;
  for (let i = 0; i < NUM_DETECTIONS; i += 1) {
    const conf = data[i * DET_STRIDE + 4];
    if (conf > bestConf) {
      bestConf = conf;
      bestIdx = i;
    }
    if (conf >= threshold) aboveThreshold += 1;
  }

  if (bestIdx < 0 || bestConf < threshold) {
    return {
      quad: null,
      confidence: Math.max(0, bestConf),
      rawConfidence: Math.max(0, bestConf),
      candidateCount: aboveThreshold,
      imageWidth: origWidth,
      imageHeight: origHeight,
    };
  }

  // Extract the 4 corner keypoints (indices 6..13) for the winning row.
  const base = bestIdx * DET_STRIDE;
  const cornersModelSpace = [
    { x: data[base + 6],  y: data[base + 7]  },  // TL
    { x: data[base + 8],  y: data[base + 9]  },  // TR
    { x: data[base + 10], y: data[base + 11] },  // BR
    { x: data[base + 12], y: data[base + 13] },  // BL
  ];
  const cornersOrig = cornersModelSpace.map((p) => unletterbox(p.x, p.y, scale, padX, padY));
  const quad = orderQuadPoints(cornersOrig);

  return {
    quad,
    confidence: bestConf,
    rawConfidence: bestConf,
    candidateCount: aboveThreshold,
    imageWidth: origWidth,
    imageHeight: origHeight,
  };
}

// Warp the detected quadrilateral to a flat, landscape ID rectangle.
export async function correctPerspective(
  buffer: Buffer,
  quad: DetectedQuad,
  outputWidth: number = OUTPUT_WIDTH,
  outputHeight: number = OUTPUT_HEIGHT,
): Promise<Buffer> {
  await ensureOpenCv();
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const srcRgba = cv.matFromImageData({
    data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
    width: info.width,
    height: info.height,
  });

  const src = cv.matFromArray(4, 1, cv.CV_32FC2, [
    quad.topLeft.x, quad.topLeft.y,
    quad.topRight.x, quad.topRight.y,
    quad.bottomRight.x, quad.bottomRight.y,
    quad.bottomLeft.x, quad.bottomLeft.y,
  ]);
  const dst = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0, 0,
    outputWidth, 0,
    outputWidth, outputHeight,
    0, outputHeight,
  ]);
  const transform = cv.getPerspectiveTransform(src, dst);
  const warped = new cv.Mat();
  const rgb = new cv.Mat();

  try {
    cv.warpPerspective(
      srcRgba,
      warped,
      transform,
      new cv.Size(outputWidth, outputHeight),
      cv.INTER_LINEAR,
      cv.BORDER_CONSTANT,
      new cv.Scalar(),
    );
    cv.cvtColor(warped, rgb, cv.COLOR_RGBA2RGB);
    const rawBuffer = Buffer.from(rgb.data);
    return await sharp(rawBuffer, {
      raw: { width: outputWidth, height: outputHeight, channels: 3 },
    })
      .jpeg({ quality: 92 })
      .toBuffer();
  } finally {
    srcRgba.delete();
    src.delete();
    dst.delete();
    transform.delete();
    warped.delete();
    rgb.delete();
  }
}

export async function autoExtractIdCard(
  buffer: Buffer,
  options: { confidenceThreshold?: number } = {},
): Promise<{ buffer: Buffer | null; detection: DetectionResult }> {
  const detection = await detectIdCardRegion(buffer, options);
  if (!detection.quad) return { buffer: null, detection };
  const cropped = await correctPerspective(buffer, detection.quad);
  return { buffer: cropped, detection };
}
