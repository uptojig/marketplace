// Pre-parser filter that strips browser-chrome OCR artifacts from a
// mobile screenshot before the identity parser sees them.
//
// Why: iApp's `ocrDocument` reads the FULL screen image, including
// system overlays like the iPhone Safari URL bar at the bottom
// (`connect.egov.go.th`) or the iOS status bar at the top (time,
// battery %, 5G/LTE indicator). The DGA profile parser then slices
// "everything between label X and label Y" — so these overlays bleed
// into adjacent field values. In production we saw the email field
// captured as `connect.egov.go.thuptojig@gmail.com` instead of
// `uptojig@gmail.com`.
//
// Approach: strict whole-line pattern strip on the plain-text OCR
// output. We only drop a line if it matches a known chrome pattern
// in its entirety — never partial — so real content is never removed.
// When chrome text appears inline with content (rare; OCR usually puts
// chrome on its own line), the secondary email sanitizer in
// identity-extract catches the leakage.
//
// We deliberately do NOT use bbox position thresholds here because
// ocrDocument's plain-text output doesn't carry coordinates. Layout
// position checks could be added later via the layout response, but
// the pattern-only approach already covers the observed cases without
// risk of false-positive deletion.

const URL_ONLY = /^(?:https?:\/\/)?[a-z0-9][a-z0-9.-]*\.(?:com|th|net|org|io|co|info|biz|gov|edu)(?:\/\S*)?$/i;
const STATUS_BAR_TIME = /^\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?$/i;
const STATUS_BAR_BATTERY = /^\d{1,3}\s*%$/;
const STATUS_BAR_CARRIER = /^(?:5G|LTE|4G|3G|WiFi|wifi)$/i;
const NAV_ARROWS_ONLY = /^[<>‹›◀▶◁▷⟨⟩\s]+$/;

export type ChromeReason = "url_only" | "status_time" | "status_battery" | "status_carrier" | "nav_arrow";

export function classifyChromeLine(line: string): ChromeReason | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (!trimmed.includes("@") && URL_ONLY.test(trimmed)) return "url_only";
  if (STATUS_BAR_TIME.test(trimmed)) return "status_time";
  if (STATUS_BAR_BATTERY.test(trimmed)) return "status_battery";
  if (STATUS_BAR_CARRIER.test(trimmed)) return "status_carrier";
  if (NAV_ARROWS_ONLY.test(trimmed) && trimmed.length <= 4) return "nav_arrow";
  return null;
}

export interface ChromeStripResult {
  pages: string[];
  excluded: Array<{ line: string; reason: ChromeReason }>;
}

/**
 * Strip whole-line browser-chrome artifacts from each page of an
 * `ocrDocument` text response. Returns the cleaned pages plus the list
 * of removed lines (with reason) for audit logging.
 *
 * Pages are joined back with `\n` so the parser sees a contiguous text
 * blob without blank gaps where the chrome lines used to be.
 */
export function stripBrowserChromeFromPages(textPages: string[]): ChromeStripResult {
  const excluded: ChromeStripResult["excluded"] = [];
  const pages = textPages.map((pageText) => {
    const lines = pageText.split("\n");
    const kept: string[] = [];
    for (const line of lines) {
      const reason = classifyChromeLine(line);
      if (reason) {
        excluded.push({ line: line.trim(), reason });
      } else {
        kept.push(line);
      }
    }
    return kept.join("\n");
  });
  return { pages, excluded };
}
