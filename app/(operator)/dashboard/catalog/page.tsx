/**
 * /dashboard/catalog — kept as a thin wrapper around <CatalogPicker />
 * so deep links and the legacy "Browse catalog" CTA on /dashboard
 * still work. The picker UI itself lives in
 * components/dashboard/catalog-picker.tsx and is also embedded as
 * a tab on /dashboard/store/products/new.
 */
import { CatalogPicker } from "@/components/dashboard/catalog-picker";

export default function CatalogPage() {
  return <CatalogPicker />;
}
