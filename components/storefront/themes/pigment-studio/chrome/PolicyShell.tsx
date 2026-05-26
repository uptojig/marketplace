import Link from 'next/link';
import type { ReactNode } from 'react';
import { PawPrint, Sparkles } from 'lucide-react';

export interface PigmentStudioPolicyShellProps {
  slug: string;
  title: string;
  eyebrow?: string;
  children: ReactNode;
}

export function PigmentStudioPolicyShell({
  slug,
  title,
  eyebrow = 'นโยบายร้านค้า',
  children,
}: PigmentStudioPolicyShellProps) {
  return (
    <div style={{ background: '#fffaf4', minHeight: '100vh' }}>
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20 lg:px-8">
        <article
          className="rounded-[2rem] border-2 bg-white p-8 shadow-sm sm:p-12 relative overflow-hidden"
          style={{ borderColor: '#fed7aa' }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316] opacity-10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#facc15] opacity-10 rounded-full blur-3xl transform -translate-x-10 translate-y-10"></div>

          <header className="mt-2 text-center relative z-10">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#facc15]/20 text-[#7c2d12] font-[family:var(--font-prompt)] font-medium text-sm mb-4 border border-[#facc15]/30">
              <Sparkles className="w-4 h-4 mr-2 text-[#f97316]" />
              {eyebrow}
            </div>
            <h1
              className="text-4xl sm:text-5xl font-bold font-[family:var(--font-kanit)] text-[#7c2d12]"
            >
              {title}
            </h1>
            <div
              aria-hidden
              className="mx-auto mt-6 h-[3px] w-16 rounded-full"
              style={{ background: '#f97316' }}
            />
          </header>

          <div
            data-pigment-policy="true"
            className="mt-10 leading-relaxed font-[family:var(--font-prompt)] relative z-10"
            style={{ color: '#5c3e2b' }}
          >
            <style>{`
              [data-pigment-policy="true"] h2 {
                font-family: var(--font-kanit);
                font-weight: 700;
                font-size: 1.5rem;
                line-height: 1.2;
                color: #7c2d12;
                margin-top: 2.5rem;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
              }
              [data-pigment-policy="true"] h2::before {
                content: '';
                display: inline-block;
                width: 24px;
                height: 24px;
                background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M17 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M18 15v1a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-1"/><path d="M18.8 6.5a1.5 1.5 0 0 0 2.2-2 1.5 1.5 0 0 0-2.2 2Z"/><path d="M14.5 4.5a1.5 1.5 0 0 0 2.2-2 1.5 1.5 0 0 0-2.2 2Z"/><path d="M9.5 4.5a1.5 1.5 0 0 0 2.2-2 1.5 1.5 0 0 0-2.2 2Z"/><path d="M5.2 6.5a1.5 1.5 0 0 0 2.2-2 1.5 1.5 0 0 0-2.2 2Z"/></svg>');
                background-size: contain;
                background-repeat: no-repeat;
              }
              [data-pigment-policy="true"] h3 {
                font-family: var(--font-kanit);
                font-weight: 600;
                font-size: 1.25rem;
                color: #7c2d12;
                margin-top: 2rem;
                margin-bottom: 0.75rem;
              }
              [data-pigment-policy="true"] p,
              [data-pigment-policy="true"] li {
                color: #5c3e2b;
                opacity: 0.9;
              }
              [data-pigment-policy="true"] a {
                color: #e67e22;
                text-decoration: underline;
                text-underline-offset: 3px;
                font-weight: 500;
              }
              [data-pigment-policy="true"] ul,
              [data-pigment-policy="true"] ol {
                padding-left: 1.5rem;
                margin-bottom: 1.5rem;
                background: #fff7ed;
                padding: 1.5rem 1.5rem 1.5rem 3rem;
                border-radius: 1rem;
                border: 1px dashed #fed7aa;
              }
              [data-pigment-policy="true"] ul {
                list-style: none;
                position: relative;
              }
              [data-pigment-policy="true"] ul li {
                position: relative;
                margin-bottom: 0.5rem;
              }
              [data-pigment-policy="true"] ul li::before {
                content: '•';
                color: #f97316;
                position: absolute;
                left: -1.25rem;
                font-size: 1.5rem;
                line-height: 1rem;
                top: 0.25rem;
              }
              [data-pigment-policy="true"] ol {
                list-style: decimal;
              }
              [data-pigment-policy="true"] .caption,
              [data-pigment-policy="true"] .note,
              [data-pigment-policy="true"] figcaption {
                color: #f97316;
                font-size: 0.875rem;
                background: #fff7ed;
                padding: 1rem;
                border-radius: 0.5rem;
                display: inline-block;
              }
            `}</style>
            {children}
          </div>
        </article>

        <div className="mt-10 text-center">
          <Link
            href={`/stores/${slug}`}
            className="inline-flex items-center gap-2 font-[family:var(--font-prompt)] font-bold text-[#e67e22] hover:text-[#d35400] bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all border border-[#fed7aa]/50"
          >
            <PawPrint className="w-4 h-4" />
            กลับหน้าหลัก
          </Link>
        </div>
      </main>
    </div>
  );
}

export function pigmentStudioPolicyHeading(
  pageSlug: string,
  fallbackTitle: string,
): { eyebrow: string; title: string } {
  switch (pageSlug) {
    case 'shipping':
      return { eyebrow: 'ข้อมูลการจัดส่ง', title: 'รอบส่งและการจัดส่ง' };
    case 'returns':
      return { eyebrow: 'นโยบายการคืนสินค้า', title: 'การคืนสินค้าและเปลี่ยนสินค้า' };
    case 'faq':
      return { eyebrow: 'ข้อสงสัยที่พบบ่อย', title: 'คำถามที่พบบ่อย' };
    case 'privacy':
      return { eyebrow: 'ความปลอดภัย', title: 'นโยบายความเป็นส่วนตัว' };
    case 'terms':
      return { eyebrow: 'เงื่อนไขของร้าน', title: 'ข้อตกลงและเงื่อนไข' };
    case 'about':
      return { eyebrow: 'เกี่ยวกับเรา', title: 'เรื่องราวของร้าน' };
    case 'help':
      return { eyebrow: 'ต้องการความช่วยเหลือ?', title: 'ศูนย์ช่วยเหลือ' };
    default:
      return { eyebrow: 'ข้อมูลร้านค้า', title: fallbackTitle };
  }
}
