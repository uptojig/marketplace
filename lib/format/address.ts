export interface StoreAddressFields {
  companyName?: string | null;
  taxId?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  subdistrict?: string | null;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

/**
 * Returns the address as ordered, non-empty lines so the caller can
 * render with `<br/>` or `\n`. Empty or missing parts are dropped.
 */
export function formatStoreAddressLines(s: StoreAddressFields): string[] {
  const lines: string[] = [];
  if (s.companyName) lines.push(s.companyName);
  if (s.taxId) lines.push(`เลขประจำตัวผู้เสียภาษี ${s.taxId}`);
  const street = [s.addressLine1, s.addressLine2].filter(Boolean).join(" ");
  if (street) lines.push(street);

  const localityParts: string[] = [];
  if (s.subdistrict) localityParts.push(`แขวง${s.subdistrict}`);
  if (s.district) localityParts.push(`เขต${s.district}`);
  if (s.province) localityParts.push(s.province);
  if (localityParts.length > 0) lines.push(localityParts.join(", "));

  const tail: string[] = [];
  if (s.country) tail.push(s.country === "TH" ? "Thailand" : s.country);
  if (s.postalCode) tail.push(s.postalCode);
  if (tail.length > 0) lines.push(tail.join(" "));

  return lines;
}
