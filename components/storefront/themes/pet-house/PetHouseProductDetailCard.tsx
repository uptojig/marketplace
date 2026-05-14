/**
 * PetHouseProductDetailCard — generic white-rounded-xl shell used by every
 * detail section under the main grid (รายละเอียดสินค้า / สเปคสินค้า /
 * รีวิวจากลูกค้า / FAQ).
 *
 * Server component — pure layout. Renders a green kicker + Georgia serif
 * title + children. Callers decide whether to render the card at all
 * (sections are skipped when the corresponding Prisma data is empty).
 *
 * Matches the mockup `.detail-section` rule:
 *   padding: 32px 40px;
 *   margin: 0 36px 20px;
 *   background: white;
 *   border-radius: 14px;
 */
import type { ReactNode } from 'react';

interface Props {
  /** Small green uppercase tracking-[3px] eyebrow ("Product Detail", "Specifications", …). */
  kicker: string;
  /** Georgia serif h2 title in brown ink. */
  title: string;
  children: ReactNode;
}

export function PetHouseProductDetailCard({ kicker, title, children }: Props) {
  return (
    <section
      style={{
        background: 'white',
        borderRadius: '14px',
        padding: '24px 20px',
      }}
      className="sm:p-8 mb-5"
    >
      <p
        className="font-semibold uppercase mb-2"
        style={{
          fontSize: '11px',
          letterSpacing: '3px',
          color: '#5BA033',
        }}
      >
        {kicker}
      </p>
      <h2
        className="mb-5"
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '22px',
          color: '#3B2F1F',
          fontWeight: 500,
          lineHeight: 1.25,
          letterSpacing: '-0.3px',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
