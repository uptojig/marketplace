/**
 * Convert CJ-style HTML descriptions into plain text suitable for rendering
 * with `whitespace-pre-line`. CJ returns markup like:
 *
 *   <p><b>Product information:</b><br/>Color: ...<br/></p>
 *   <b>Packing list:</b><br/>1*Sheet<br/>
 *   <b>Product Image:</b><br/>           ← trailing block with no actual images
 *
 * Rendered as-is, users see literal `<b>` and `<br/>` tags. Strip the markup,
 * keep meaningful line breaks, drop the empty "Product Image:" trailer.
 */
export function cleanDescription(input: string | null | undefined): string {
  if (!input) return "";
  let s = input;

  s = s.replace(/<b>\s*Product\s*Image[^<]*<\/b>[\s\S]*$/i, "");
  s = s.replace(/Product\s*Image\s*:?\s*$/i, "");

  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/(p|li|div|h[1-6])>/gi, "\n");
  s = s.replace(/<li[^>]*>/gi, "• ");

  s = s.replace(/<[^>]+>/g, "");

  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  s = s
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return s;
}
