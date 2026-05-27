/**
 * /themes — public salepage template catalog. ThemeForest-style grid:
 * thumbnail, name, category, accent stripe, "Live Preview" → fullscreen
 * iframe at /themes/[id]/preview, "Details" → marketing detail page.
 *
 * This server entrypoint owns `metadata`; the interactive grid lives
 * in `./_components/catalog-grid.tsx` (client) because the "Details"
 * CTA for coming-soon templates uses an onClick handler and event
 * handlers cannot be passed through a Server Component boundary.
 */
import type { Metadata } from 'next';
import { SALEPAGE_TEMPLATES } from '@/lib/salepages/registry';
import { ThemesCatalogGrid } from './_components/catalog-grid';

export const metadata: Metadata = {
  title: 'Salepage Templates · Basketplace',
  description:
    'เทมเพลตหน้าขายสินค้าออกแบบมาสำหรับ digital product, course, และ ebook — preview สด ก่อนใช้',
};

export default function ThemesCatalogPage() {
  return <ThemesCatalogGrid templates={SALEPAGE_TEMPLATES} />;
}
