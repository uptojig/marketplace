import sharp from "sharp";
import { iapp } from "./iapp-client";
import type { OcrDocumentLayoutComponent } from "./types";

export interface BBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface RedactionMatch {
  bbox: BBox;
  text: string;
  component_type: string;
  reason: string;
}

export interface RedactionResult {
  buffer: Buffer;
  regions: RedactionMatch[];
  anchorCount: number;
  candidateCount: number;
  blurredChanged: boolean;
  ic: number;
  ms: number;
}

// DGA Digital ID account-info page: the label is the ground truth (DGA
// controls it, never changes). The value can be ANY format the user picked —
// citizen-id-as-username (13 digits), lowercase handle (sorasit.bo22), etc.
// We locate the row by its label anchor and derive the value region from
// geometry — never from matching the value's text shape.
const USERNAME_ANCHOR_PATTERN = /(?:\(\s*username\s*\)|username|บัญชีผู้ใช้งาน|ชื่อผู้ใช้งาน)/i;

// iApp Layout occasionally returns the whole account-info card as ONE Figure
// component (esp. on the production DGA layout — fixture layouts split per
// row). We treat any anchor-bearing component taller than this as "mega" and
// trigger a second OCR pass on a crop to recover per-row bboxes.
const MEGA_COMPONENT_HEIGHT_PX = 200;

// Vertical crop height used for the row-1 re-OCR pass. Big enough to keep
// some context above/below row 1 (helps iApp segment) but small enough that
// iApp splits per-row instead of returning another mega-Figure.
const ROW_ONE_CROP_HEIGHT_PX = 400;

function isUsernameAnchor(text: string): boolean {
  return USERNAME_ANCHOR_PATTERN.test(text.trim());
}

function bboxArea(box: BBox): number {
  return Math.max(0, box.right - box.left) * Math.max(0, box.bottom - box.top);
}

function bboxCenterY(box: BBox): number {
  return box.top + (box.bottom - box.top) / 2;
}

function componentBox(component: OcrDocumentLayoutComponent): BBox {
  return {
    left: Math.floor(component.bb_left),
    top: Math.floor(component.bb_top),
    right: Math.ceil(component.bb_right),
    bottom: Math.ceil(component.bb_bottom),
  };
}

function bboxOverlapRatio(a: BBox, b: BBox): number {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.right, b.right);
  const bottom = Math.min(a.bottom, b.bottom);
  if (right <= left || bottom <= top) return 0;
  const overlap = (right - left) * (bottom - top);
  const smaller = Math.min(bboxArea(a), bboxArea(b)) || 1;
  return overlap / smaller;
}

// Merge bboxes that overlap heavily — iApp sometimes returns the same value
// twice with slightly different type (e.g. "UpperLeft" + "Logo"), so we union
// them so the final blurred region covers both.
function mergeOverlapping(matches: RedactionMatch[]): RedactionMatch[] {
  const result: RedactionMatch[] = [];
  for (const candidate of matches) {
    const existingIdx = result.findIndex(
      (existing) => bboxOverlapRatio(existing.bbox, candidate.bbox) > 0.4,
    );
    if (existingIdx >= 0) {
      const existing = result[existingIdx];
      result[existingIdx] = {
        ...existing,
        bbox: {
          left: Math.min(existing.bbox.left, candidate.bbox.left),
          top: Math.min(existing.bbox.top, candidate.bbox.top),
          right: Math.max(existing.bbox.right, candidate.bbox.right),
          bottom: Math.max(existing.bbox.bottom, candidate.bbox.bottom),
        },
      };
    } else {
      result.push(candidate);
    }
  }
  return result;
}

function componentToMatch(component: OcrDocumentLayoutComponent, reason: string): RedactionMatch {
  return {
    bbox: componentBox(component),
    text: component.text,
    component_type: component.type,
    reason,
  };
}

// Geometric scoring: nearest component to the right of `anchor` in the same
// horizontal band wins. Returns Infinity for components above/below/left so
// they're never picked as the value.
function valueProximityScore(anchor: OcrDocumentLayoutComponent, candidate: OcrDocumentLayoutComponent): number {
  const anchorBox = componentBox(anchor);
  const candidateBox = componentBox(candidate);
  const centerDistance = Math.abs(bboxCenterY(anchorBox) - bboxCenterY(candidateBox));
  const rightDistance = candidateBox.left >= anchorBox.right
    ? candidateBox.left - anchorBox.right
    : Math.abs(candidateBox.left - anchorBox.left) + 180;
  const aboveOrBelowGap = candidateBox.bottom < anchorBox.top
    ? anchorBox.top - candidateBox.bottom
    : candidateBox.top > anchorBox.bottom
      ? candidateBox.top - anchorBox.bottom
      : 0;

  if (centerDistance > 140 && aboveOrBelowGap > 90) return Number.POSITIVE_INFINITY;
  if (candidateBox.right < anchorBox.left) return Number.POSITIVE_INFINITY;

  return rightDistance + centerDistance * 1.2 + aboveOrBelowGap;
}

// For each anchor with its own real bbox (not a mega container), find the
// nearest component to its right and treat that as the value to blur — no
// matter what text the value contains. Mega anchors (the whole card-as-one-
// Figure) are skipped here; they're handled by the crop+re-OCR fallback.
function findValueSiblings(
  anchors: OcrDocumentLayoutComponent[],
  candidates: OcrDocumentLayoutComponent[],
): RedactionMatch[] {
  const matches: RedactionMatch[] = [];
  for (const anchor of anchors) {
    const anchorBox = componentBox(anchor);
    if (anchorBox.bottom - anchorBox.top > MEGA_COMPONENT_HEIGHT_PX) continue;
    const nearest = candidates
      .map((candidate) => ({ candidate, score: valueProximityScore(anchor, candidate) }))
      .filter((item) => Number.isFinite(item.score))
      .sort((left, right) => left.score - right.score)[0];
    if (nearest && nearest.score < 500) {
      matches.push(componentToMatch(nearest.candidate, "anchor_sibling"));
    }
  }
  return matches;
}

// Fallback strategy for when the anchor is buried inside a mega-Figure (DGA
// account-info card returned as one blob with no per-row bboxes). We crop
// the top portion of that Figure and re-OCR it; with much less content in
// frame, iApp typically splits each row into its own component, giving us a
// tight bbox for the username value. Returned bboxes are translated back to
// the original image's coordinate space.
async function locateInsideMegaFigure(args: {
  buffer: Buffer;
  megaFigure: OcrDocumentLayoutComponent;
  imageWidth: number;
  imageHeight: number;
}): Promise<{ matches: RedactionMatch[]; ic: number; ms: number }> {
  const figureBox = componentBox(args.megaFigure);
  const cropLeft = Math.max(0, figureBox.left - 20);
  const cropTop = Math.max(0, figureBox.top - 20);
  const cropWidth = Math.max(1, Math.min(args.imageWidth - cropLeft, args.imageWidth));
  const cropHeight = Math.max(1, Math.min(ROW_ONE_CROP_HEIGHT_PX, args.imageHeight - cropTop));

  const cropBuffer = await sharp(args.buffer)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .toBuffer();

  const cropLayout = await iapp.ocrDocumentLayout(cropBuffer);
  const cropComponents = (cropLayout.data?.pages ?? []).flatMap((p) => p.components ?? []);

  const cropAnchors = cropComponents.filter((c) => isUsernameAnchor(c.text ?? ""));
  const cropCandidates = cropComponents.filter((c) => !isUsernameAnchor(c.text ?? ""));
  const cropMatches = findValueSiblings(cropAnchors, cropCandidates);

  // iApp Layout on the crop sometimes returns the anchor as its own small
  // component but skips the value cell entirely (the digits are still in
  // ocrDocument plain text, just not as a Layout component). When that
  // happens, synthesize a value bbox geometrically — blur everything to the
  // right of the anchor in its row band. Over-redacts the right portion of
  // the row, never misses the value.
  if (cropMatches.length === 0) {
    for (const anchor of cropAnchors) {
      const anchorBox = componentBox(anchor);
      if (anchorBox.bottom - anchorBox.top > MEGA_COMPONENT_HEIGHT_PX) continue;
      cropMatches.push({
        bbox: {
          left: Math.min(cropWidth - 1, anchorBox.right + 8),
          top: anchorBox.top,
          right: cropWidth,
          bottom: anchorBox.bottom,
        },
        text: "",
        component_type: anchor.type,
        reason: "anchor_geometric_extend",
      });
    }
  }

  const translated: RedactionMatch[] = cropMatches.map((m) => ({
    bbox: {
      left: m.bbox.left + cropLeft,
      top: m.bbox.top + cropTop,
      right: m.bbox.right + cropLeft,
      bottom: m.bbox.bottom + cropTop,
    },
    text: m.text,
    component_type: m.component_type,
    reason: `${m.reason}_after_crop`,
  }));

  return { matches: translated, ic: cropLayout.ic, ms: cropLayout.ms };
}

// Apply a heavy gaussian blur to each region. Padding (4 px) prevents hard
// edges around the bbox that would still leak text via halo.
async function blurRegions(buffer: Buffer, regions: BBox[]): Promise<Buffer> {
  if (regions.length === 0) return buffer;
  const meta = await sharp(buffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) return buffer;

  const PADDING = 4;
  const overlays: sharp.OverlayOptions[] = [];
  for (const region of regions) {
    const left = Math.max(0, region.left - PADDING);
    const top = Math.max(0, region.top - PADDING);
    const right = Math.min(width, region.right + PADDING);
    const bottom = Math.min(height, region.bottom + PADDING);
    const w = right - left;
    const h = bottom - top;
    if (w <= 0 || h <= 0) continue;

    // Pixelate-then-blur: downscale 1/16, upscale to original, then heavy
    // gaussian. Pure gaussian blur leaves digit silhouettes readable on
    // high-contrast text; pixelation destroys the underlying glyph shapes
    // before the smoothing pass.
    const patch = await sharp(buffer)
      .extract({ left, top, width: w, height: h })
      .resize(Math.max(1, Math.floor(w / 16)), Math.max(1, Math.floor(h / 16)), { kernel: "nearest" })
      .resize(w, h, { kernel: "nearest" })
      .blur(20)
      .toBuffer();
    overlays.push({ input: patch, left, top });
  }

  if (overlays.length === 0) return buffer;
  return sharp(buffer).composite(overlays).toBuffer();
}

// Run iApp Layout OCR on the image, find the Username row's value region
// (anchor-driven + geometric, never value-pattern matched), and blur ONLY
// that region on the original image. Returns the original buffer at full
// fidelity with just the value rectangle blurred — no cropping or content
// loss. If iApp returned the card as a single mega-Figure with no per-row
// bboxes, performs a second OCR pass on a crop of the row-1 area to recover
// a tight bbox.
export async function redactDgaSensitiveRegions(buffer: Buffer): Promise<RedactionResult> {
  const layout = await iapp.ocrDocumentLayout(buffer);
  const components = (layout.data?.pages ?? []).flatMap((page) => page.components ?? []);

  const anchors = components.filter((c) => isUsernameAnchor(c.text ?? ""));
  const nonAnchors = components.filter((c) => !isUsernameAnchor(c.text ?? ""));

  let matches = findValueSiblings(anchors, nonAnchors);
  let extraIc = 0;
  let extraMs = 0;

  if (matches.length === 0 && anchors.length > 0) {
    const megaFigure = anchors.find((c) => {
      const box = componentBox(c);
      return box.bottom - box.top > MEGA_COMPONENT_HEIGHT_PX;
    });
    if (megaFigure) {
      const meta = await sharp(buffer).metadata();
      const result = await locateInsideMegaFigure({
        buffer,
        megaFigure,
        imageWidth: meta.width ?? 0,
        imageHeight: meta.height ?? 0,
      });
      matches = result.matches;
      extraIc = result.ic;
      extraMs = result.ms;
    }
  }

  const merged = mergeOverlapping(matches);
  const blurred = await blurRegions(buffer, merged.map((m) => m.bbox));

  return {
    buffer: blurred,
    regions: merged,
    anchorCount: anchors.length,
    candidateCount: matches.length,
    blurredChanged: merged.length > 0 && !blurred.equals(buffer),
    ic: layout.ic + extraIc,
    ms: layout.ms + extraMs,
  };
}
