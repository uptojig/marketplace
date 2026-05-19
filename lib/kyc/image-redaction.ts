import sharp from "sharp";
import { iapp } from "./iapp-client";
import type { OcrDocumentLayoutComponent } from "./types";

export interface BBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export type DgaRedactionStatus = "blurred" | "not_found" | "fallback_geometric" | "failed";

export interface RedactionMatch {
  bbox: BBox;
  component_type: string;
  reason: string;
}

export interface RedactionResult {
  buffer: Buffer;
  regions: RedactionMatch[];
  anchorCount: number;
  candidateCount: number;
  blurredChanged: boolean;
  redactionRequired: boolean;
  redactionStatus: DgaRedactionStatus;
  ic: number;
  ms: number;
}

export interface UsernameTextRedactionResult {
  pages: string[];
  redactionRequired: boolean;
  redactedCount: number;
}

const TH_USERNAME_LABEL =
  "(?:\\u0e1a\\u0e31\\u0e0d\\u0e0a\\u0e35\\u0e1c\\u0e39\\u0e49\\u0e43\\u0e0a\\u0e49\\u0e07\\u0e32\\u0e19|\\u0e0a\\u0e37\\u0e48\\u0e2d\\u0e1c\\u0e39\\u0e49\\u0e43\\u0e0a\\u0e49\\u0e07\\u0e32\\u0e19|\\u0e0a\\u0e35\\u0e1c\\u0e39\\u0e49\\u0e43\\u0e0a\\u0e49\\u0e07\\u0e32\\u0e19)";
const EN_USERNAME_LABEL = "(?:\\(\\s*username\\s*\\)|\\busername\\b)";
const USERNAME_TEXT_ANCHOR_PATTERN = new RegExp(`${TH_USERNAME_LABEL}|${EN_USERNAME_LABEL}`, "iu");
const USERNAME_IMAGE_ANCHOR_PATTERN = new RegExp(
  `(?:${TH_USERNAME_LABEL}\\s*(?:\\(\\s*username\\s*\\))?|\\(\\s*username\\s*\\))`,
  "iu",
);
const INLINE_USERNAME_VALUE_PATTERN = new RegExp(
  `(${TH_USERNAME_LABEL}\\s*(?:\\(\\s*username\\s*\\))?|${EN_USERNAME_LABEL})\\s*[:\\uFF1A-]?\\s*(.+)$`,
  "iu",
);
const STRONG_EN_USERNAME_MARKER_PATTERN = /\(\s*username\s*\)/iu;
const IMAGE_ANCHOR_DISQUALIFIER_PATTERN = new RegExp(
  "(?:\\bthaid\\b|thaiid|\\u0e0a\\u0e48\\u0e2d\\u0e07\\u0e17\\u0e32\\u0e07\\u0e40\\u0e02\\u0e49\\u0e32\\u0e2a\\u0e39\\u0e48\\u0e23\\u0e30\\u0e1a\\u0e1a|\\u0e23\\u0e30\\u0e14\\u0e31\\u0e1a\\u0e04\\u0e27\\u0e32\\u0e21\\u0e19\\u0e48\\u0e32\\u0e40\\u0e0a\\u0e37\\u0e48\\u0e2d\\u0e16\\u0e37\\u0e2d|\\u0e40\\u0e02\\u0e49\\u0e32\\u0e2a\\u0e39\\u0e48\\u0e23\\u0e30\\u0e1a\\u0e1a|\\bial\\b|\\bdigital\\s*id\\b|\\u0e1a\\u0e38\\u0e04\\u0e04\\u0e25\\u0e18\\u0e23\\u0e23\\u0e21\\u0e14\\u0e32)",
  "iu",
);
const INVALID_USERNAME_VALUE_CONTEXT_PATTERN = new RegExp(
  "(?:\\bthaid\\b|thaiid|\\u0e1a\\u0e38\\u0e04\\u0e04\\u0e25\\u0e18\\u0e23\\u0e23\\u0e21\\u0e14\\u0e32|\\u0e40\\u0e02\\u0e49\\u0e32\\u0e2a\\u0e39\\u0e48\\u0e23\\u0e30\\u0e1a\\u0e1a|\\bial\\b|\\bdigital\\s*id\\b)",
  "iu",
);

// iApp layout can return the entire card as one mega component. We use crop
// + re-OCR to recover row-level boxes in that case.
const MEGA_COMPONENT_HEIGHT_PX = 200;
const ROW_ONE_CROP_HEIGHT_PX = 400;
const FOCUSED_CROP_TOP_RATIOS = [0.35, 0.45, 0.55] as const;

function normalizeLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isUsernameTextAnchor(text: string): boolean {
  return USERNAME_TEXT_ANCHOR_PATTERN.test(normalizeLine(text));
}

function isImageAnchorDisqualified(text: string): boolean {
  const normalized = normalizeLine(text);
  if (!normalized) return true;
  const hasStrongMarker = STRONG_EN_USERNAME_MARKER_PATTERN.test(normalized);
  if (normalized.length > 220 && !hasStrongMarker) return true;
  if (!IMAGE_ANCHOR_DISQUALIFIER_PATTERN.test(normalized)) return false;

  const inlineValue = stripUsernameLabel(normalized);
  if (
    hasStrongMarker &&
    inlineValue &&
    looksLikeUsernameValue(inlineValue) &&
    !INVALID_USERNAME_VALUE_CONTEXT_PATTERN.test(inlineValue)
  ) {
    return false;
  }
  return true;
}

function isUsernameImageAnchor(text: string): boolean {
  const normalized = normalizeLine(text);
  if (!USERNAME_IMAGE_ANCHOR_PATTERN.test(normalized)) return false;
  return !isImageAnchorDisqualified(normalized);
}

function isValidUsernameCandidate(text: string): boolean {
  const normalized = normalizeLine(text);
  if (!normalized) return false;
  if (normalized.length > 80) return false;
  if (IMAGE_ANCHOR_DISQUALIFIER_PATTERN.test(normalized)) return false;
  if (isUsernameTextAnchor(normalized)) return false;
  return looksLikeUsernameValue(normalized);
}

function looksLikeUsernameValue(value: string): boolean {
  const compact = value.replace(/\s+/g, "");
  if (!compact) return false;
  if (compact.length < 4 || compact.length > 64) return false;
  if (/^\d{8,20}$/.test(compact)) return true;
  if (/^[A-Za-z0-9._-]{4,64}$/.test(compact)) return true;
  if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(compact)) return true;
  return false;
}

function stripUsernameLabel(line: string): string {
  const matched = line.match(INLINE_USERNAME_VALUE_PATTERN);
  if (!matched) return "";
  return normalizeLine(matched[2] ?? "");
}

function redactInlineUsernameValue(line: string): { line: string; changed: boolean } {
  const matched = line.match(INLINE_USERNAME_VALUE_PATTERN);
  if (!matched) return { line, changed: false };
  const valuePart = normalizeLine(matched[2] ?? "");
  if (!valuePart) return { line, changed: false };
  return {
    line: line.replace(INLINE_USERNAME_VALUE_PATTERN, `${matched[1]} [REDACTED_USERNAME]`),
    changed: true,
  };
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
        reason: existing.reason.includes("geometric") ? existing.reason : candidate.reason,
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

function expandUsernameRegion(args: {
  bbox: BBox;
  reason: string;
  imageWidth: number;
  imageHeight: number;
}): BBox {
  const width = Math.max(1, args.bbox.right - args.bbox.left);
  const height = Math.max(1, args.bbox.bottom - args.bbox.top);

  const isInline = args.reason.includes("inline_geometric");
  const isGeometric = args.reason.includes("geometric");
  const leftPad = isInline ? Math.max(18, Math.floor(width * 0.35)) : Math.max(8, Math.floor(width * 0.08));
  const rightPad = isInline ? Math.max(28, Math.floor(width * 0.65)) : Math.max(16, Math.floor(width * 0.2));
  const topPad = Math.max(3, Math.floor(height * 0.2));
  const bottomPad = Math.max(3, Math.floor(height * 0.2));

  const left = Math.max(0, args.bbox.left - leftPad);
  let right = Math.min(args.imageWidth, args.bbox.right + rightPad);
  if (isInline || isGeometric) {
    right = Math.min(args.imageWidth, Math.max(right, args.bbox.right + Math.floor(width * 0.75)));
  }

  const top = Math.max(0, args.bbox.top - topPad);
  const bottom = Math.min(args.imageHeight, args.bbox.bottom + bottomPad);
  return { left, top, right, bottom };
}

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

function findValueSiblings(
  anchors: OcrDocumentLayoutComponent[],
  candidates: OcrDocumentLayoutComponent[],
): RedactionMatch[] {
  const matches: RedactionMatch[] = [];
  for (const anchor of anchors) {
    if (!isUsernameImageAnchor(anchor.text ?? "")) continue;
    const anchorBox = componentBox(anchor);
    if (anchorBox.bottom - anchorBox.top > MEGA_COMPONENT_HEIGHT_PX) continue;
    const nearest = candidates
      .map((candidate) => ({ candidate, score: valueProximityScore(anchor, candidate) }))
      .filter((item) => Number.isFinite(item.score))
      .sort((left, right) => left.score - right.score)[0];
    if (nearest && nearest.score < 500 && isValidUsernameCandidate(nearest.candidate.text ?? "")) {
      matches.push({
        bbox: componentBox(nearest.candidate),
        component_type: nearest.candidate.type,
        reason: "anchor_sibling",
      });
    }
  }
  return matches;
}

function buildInlineGeometricBox(anchor: OcrDocumentLayoutComponent): BBox | null {
  const box = componentBox(anchor);
  const width = box.right - box.left;
  if (width <= 20) return null;

  // Keep label area readable; blur only right side where value typically is.
  const estimatedStart = box.left + Math.floor(width * 0.55);
  const left = Math.min(box.right - 1, Math.max(box.left + 8, estimatedStart));
  if (left >= box.right) return null;

  return {
    left,
    top: box.top,
    right: box.right,
    bottom: box.bottom,
  };
}

function buildRowRightSideBox(args: {
  anchor: OcrDocumentLayoutComponent;
  candidates: OcrDocumentLayoutComponent[];
  canvasWidth?: number;
}): BBox | null {
  const anchorBox = componentBox(args.anchor);
  const left = anchorBox.right + 8;
  if (left >= anchorBox.right + 1) {
    const rowCandidates = args.candidates
      .map((component) => componentBox(component))
      .filter((box) => {
        const centerDistance = Math.abs(bboxCenterY(box) - bboxCenterY(anchorBox));
        const overlapsVertically = box.bottom >= anchorBox.top && box.top <= anchorBox.bottom;
        return (overlapsVertically || centerDistance <= 90) && box.right > anchorBox.right;
      });

    const rightFromCandidates = rowCandidates.reduce(
      (maxRight, box) => Math.max(maxRight, box.right),
      left + Math.max(140, Math.floor((anchorBox.right - anchorBox.left) * 2.6)),
    );
    const rightLimitedByCanvas = args.canvasWidth
      ? Math.min(args.canvasWidth, rightFromCandidates)
      : rightFromCandidates;
    const right = Math.max(left + 60, rightLimitedByCanvas);
    if (right <= left) return null;
    return {
      left,
      top: anchorBox.top,
      right,
      bottom: anchorBox.bottom,
    };
  }
  return null;
}

function findInlineValueRegions(anchors: OcrDocumentLayoutComponent[]): RedactionMatch[] {
  const matches: RedactionMatch[] = [];
  for (const anchor of anchors) {
    if (!isUsernameImageAnchor(anchor.text ?? "")) continue;
    const anchorBox = componentBox(anchor);
    if (anchorBox.bottom - anchorBox.top > MEGA_COMPONENT_HEIGHT_PX) continue;
    const inlineValue = stripUsernameLabel(anchor.text ?? "");
    if (!inlineValue || !looksLikeUsernameValue(inlineValue)) continue;
    if (INVALID_USERNAME_VALUE_CONTEXT_PATTERN.test(inlineValue)) continue;
    const bbox = buildInlineGeometricBox(anchor);
    if (!bbox) continue;
    matches.push({
      bbox,
      component_type: anchor.type,
      reason: "anchor_inline_geometric",
    });
  }
  return matches;
}

function synthesizeRowRightSideRegions(args: {
  anchors: OcrDocumentLayoutComponent[];
  candidates: OcrDocumentLayoutComponent[];
  canvasWidth?: number;
}): RedactionMatch[] {
  const matches: RedactionMatch[] = [];
  for (const anchor of args.anchors) {
    if (!isUsernameImageAnchor(anchor.text ?? "")) continue;
    const anchorBox = componentBox(anchor);
    if (anchorBox.bottom - anchorBox.top > MEGA_COMPONENT_HEIGHT_PX) continue;
    const bbox = buildRowRightSideBox({
      anchor,
      candidates: args.candidates,
      canvasWidth: args.canvasWidth,
    });
    if (!bbox) continue;
    matches.push({
      bbox,
      component_type: anchor.type,
      reason: "anchor_geometric_extend",
    });
  }
  return matches;
}

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
  const cropComponents = (cropLayout.data?.pages ?? []).flatMap((page) => page.components ?? []);
  const cropAnchors = cropComponents.filter((component) => isUsernameTextAnchor(component.text ?? ""));
  const cropCandidates = cropComponents.filter((component) => !isUsernameTextAnchor(component.text ?? ""));

  let cropMatches = findValueSiblings(cropAnchors, cropCandidates);
  if (cropMatches.length === 0) {
    cropMatches = findInlineValueRegions(cropAnchors);
  }
  if (cropMatches.length === 0) {
    cropMatches = synthesizeRowRightSideRegions({
      anchors: cropAnchors,
      candidates: cropCandidates,
      canvasWidth: cropWidth,
    }).map((item) => ({
      ...item,
      reason: "anchor_geometric_extend",
    }));
  }

  const translated = cropMatches.map((match) => ({
    bbox: {
      left: match.bbox.left + cropLeft,
      top: match.bbox.top + cropTop,
      right: match.bbox.right + cropLeft,
      bottom: match.bbox.bottom + cropTop,
    },
    component_type: match.component_type,
    reason: `${match.reason}_after_crop`,
  }));

  return { matches: translated, ic: cropLayout.ic, ms: cropLayout.ms };
}

async function locateInFocusedCrop(args: {
  buffer: Buffer;
  imageWidth: number;
  imageHeight: number;
  topRatio: number;
}): Promise<{ matches: RedactionMatch[]; anchorCount: number; ic: number; ms: number }> {
  const cropTop = Math.max(0, Math.floor(args.imageHeight * args.topRatio));
  const cropHeight = Math.max(1, args.imageHeight - cropTop);
  const cropWidth = Math.max(1, args.imageWidth);

  const cropBuffer = await sharp(args.buffer)
    .extract({ left: 0, top: cropTop, width: cropWidth, height: cropHeight })
    .toBuffer();

  const cropLayout = await iapp.ocrDocumentLayout(cropBuffer);
  const cropComponents = (cropLayout.data?.pages ?? []).flatMap((page) => page.components ?? []);
  const cropAnchors = cropComponents.filter((component) => isUsernameTextAnchor(component.text ?? ""));
  const cropCandidates = cropComponents.filter((component) => !isUsernameTextAnchor(component.text ?? ""));

  let matches = findValueSiblings(cropAnchors, cropCandidates);
  if (matches.length === 0) matches = findInlineValueRegions(cropAnchors);
  let extraIc = 0;
  let extraMs = 0;
  if (matches.length === 0 && cropAnchors.length > 0) {
    const megaFigure = cropAnchors.find((component) => {
      const box = componentBox(component);
      return box.bottom - box.top > MEGA_COMPONENT_HEIGHT_PX;
    });
    if (megaFigure) {
      const nested = await locateInsideMegaFigure({
        buffer: cropBuffer,
        megaFigure,
        imageWidth: cropWidth,
        imageHeight: cropHeight,
      });
      matches = nested.matches;
      extraIc += nested.ic;
      extraMs += nested.ms;
    }
  }
  if (matches.length === 0) {
    matches = synthesizeRowRightSideRegions({
      anchors: cropAnchors,
      candidates: cropCandidates,
      canvasWidth: cropWidth,
    });
  }

  const translated = matches.map((match) => ({
    bbox: {
      left: match.bbox.left,
      top: match.bbox.top + cropTop,
      right: match.bbox.right,
      bottom: match.bbox.bottom + cropTop,
    },
    component_type: match.component_type,
    reason: `${match.reason}_focused_crop`,
  }));

  return {
    matches: translated,
    anchorCount: cropAnchors.length,
    ic: cropLayout.ic + extraIc,
    ms: cropLayout.ms + extraMs,
  };
}

async function blurRegions(buffer: Buffer, regions: BBox[]): Promise<Buffer> {
  if (regions.length === 0) return buffer;

  const meta = await sharp(buffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) return buffer;

  const overlays: sharp.OverlayOptions[] = [];
  const PADDING = 4;

  for (const region of regions) {
    const left = Math.max(0, region.left - PADDING);
    const top = Math.max(0, region.top - PADDING);
    const right = Math.min(width, region.right + PADDING);
    const bottom = Math.min(height, region.bottom + PADDING);
    const patchWidth = right - left;
    const patchHeight = bottom - top;
    if (patchWidth <= 0 || patchHeight <= 0) continue;

    const patch = await sharp(buffer)
      .extract({ left, top, width: patchWidth, height: patchHeight })
      .resize(
        Math.max(1, Math.floor(patchWidth / 16)),
        Math.max(1, Math.floor(patchHeight / 16)),
        { kernel: "nearest" },
      )
      .resize(patchWidth, patchHeight, { kernel: "nearest" })
      .blur(20)
      .toBuffer();

    overlays.push({ input: patch, left, top });
  }

  if (overlays.length === 0) return buffer;
  return sharp(buffer).composite(overlays).toBuffer();
}

function computeStatus(args: {
  redactionRequired: boolean;
  blurredChanged: boolean;
  regions: RedactionMatch[];
}): DgaRedactionStatus {
  if (!args.redactionRequired) return "not_found";
  if (!args.blurredChanged || args.regions.length === 0) return "failed";
  const usedFallback = args.regions.some((region) => region.reason.includes("geometric"));
  return usedFallback ? "fallback_geometric" : "blurred";
}

// Redact username value from OCR plain-text pages. This protects raw OCR data
// from leaking DGA username values while preserving other fields.
export function redactDgaUsernameText(pages: string[]): UsernameTextRedactionResult {
  let redactionRequired = false;
  let redactedCount = 0;

  const sanitizedPages = pages.map((pageText) => {
    const lines = pageText.split(/\r?\n/);
    let pendingUsernameValueLines = 0;

    for (let index = 0; index < lines.length; index += 1) {
      const originalLine = lines[index] ?? "";
      const trimmedLine = normalizeLine(originalLine);
      if (!trimmedLine) continue;

      const hasAnchor = isUsernameTextAnchor(trimmedLine);
      if (hasAnchor) redactionRequired = true;

      if (hasAnchor) {
        const inline = redactInlineUsernameValue(originalLine);
        if (inline.changed) {
          lines[index] = inline.line;
          redactedCount += 1;
          pendingUsernameValueLines = 0;
          continue;
        }
        pendingUsernameValueLines = 2;
        continue;
      }

      if (pendingUsernameValueLines > 0) {
        if (looksLikeUsernameValue(trimmedLine)) {
          lines[index] = "[REDACTED_USERNAME]";
          redactedCount += 1;
          pendingUsernameValueLines = 0;
          continue;
        }
        pendingUsernameValueLines -= 1;
      }
    }

    return lines.join("\n");
  });

  return {
    pages: sanitizedPages,
    redactionRequired,
    redactedCount,
  };
}

export async function redactDgaSensitiveRegions(buffer: Buffer): Promise<RedactionResult> {
  const layout = await iapp.ocrDocumentLayout(buffer);
  const components = (layout.data?.pages ?? []).flatMap((page) => page.components ?? []);
  const anchors = components.filter((component) => isUsernameTextAnchor(component.text ?? ""));
  const nonAnchors = components.filter((component) => !isUsernameTextAnchor(component.text ?? ""));
  let anchorCount = anchors.length;
  let redactionRequired = anchors.length > 0;

  let matches = findValueSiblings(anchors, nonAnchors);
  let extraIc = 0;
  let extraMs = 0;
  const meta = await sharp(buffer).metadata();
  const imageWidth = meta.width ?? 0;
  const imageHeight = meta.height ?? 0;

  if (matches.length === 0) {
    matches = findInlineValueRegions(anchors);
  }

  if (matches.length === 0 && anchors.length > 0) {
    const megaFigure = anchors.find((component) => {
      const box = componentBox(component);
      return box.bottom - box.top > MEGA_COMPONENT_HEIGHT_PX;
    });
    if (megaFigure) {
      const result = await locateInsideMegaFigure({
        buffer,
        megaFigure,
        imageWidth,
        imageHeight,
      });
      matches = result.matches;
      extraIc = result.ic;
      extraMs = result.ms;
    }
  }

  if (matches.length === 0 && anchors.length === 0 && imageWidth > 0 && imageHeight > 0) {
    for (const ratio of FOCUSED_CROP_TOP_RATIOS) {
      const focused = await locateInFocusedCrop({
        buffer,
        imageWidth,
        imageHeight,
        topRatio: ratio,
      });
      anchorCount += focused.anchorCount;
      redactionRequired = redactionRequired || focused.anchorCount > 0;
      extraIc += focused.ic;
      extraMs += focused.ms;
      if (focused.matches.length > 0) {
        matches = focused.matches;
        break;
      }
    }
  }

  if (matches.length === 0 && anchors.length > 0) {
    matches = synthesizeRowRightSideRegions({
      anchors,
      candidates: nonAnchors,
      canvasWidth: imageWidth,
    });
  }

  const candidateCount = matches.length;
  const merged = mergeOverlapping(matches);
  const expandedMerged = merged.map((match) => ({
    ...match,
    bbox: expandUsernameRegion({
      bbox: match.bbox,
      reason: match.reason,
      imageWidth,
      imageHeight,
    }),
  }));
  const blurred = await blurRegions(buffer, expandedMerged.map((match) => match.bbox));
  const blurredChanged = merged.length > 0 && !blurred.equals(buffer);
  const redactionStatus = computeStatus({
    redactionRequired,
    blurredChanged,
    regions: expandedMerged,
  });

  return {
    buffer: blurred,
    regions: expandedMerged,
    anchorCount,
    candidateCount,
    blurredChanged,
    redactionRequired,
    redactionStatus,
    ic: layout.ic + extraIc,
    ms: layout.ms + extraMs,
  };
}
