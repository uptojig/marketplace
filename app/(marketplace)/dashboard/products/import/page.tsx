/**
 * /dashboard/products/import — kept as a thin wrapper around
 * <UrlPasteImport /> so deep links and the "Paste URLs" CTA on
 * /dashboard still work. Real UI lives in
 * components/dashboard/url-paste-import.tsx and is also embedded
 * as a tab on /dashboard/store/products/new.
 */
import { UrlPasteImport } from "@/components/dashboard/url-paste-import";

export default function BulkImportPage() {
  return <UrlPasteImport />;
}
