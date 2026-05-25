'use client';

/**
 * CaseStudioNewsletter -> Now a Promo Banner
 */

import React from 'react';

interface Props {
  storeSlug: string;
}

export function CaseStudioNewsletter({ storeSlug: _storeSlug }: Props) {
  return (
    <section
      className="px-4 sm:px-6 py-20 text-center"
      style={{
        background:
          'linear-gradient(135deg, #FFE5EC 0%, #FFF5F7 100%)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: '720px' }}>
        <p
          className="font-bold uppercase mb-3.5"
          style={{
            fontSize: '11px',
            letterSpacing: '2.5px',
            color: '#FF3366',
          }}
        >
          Promotion
        </p>
        <h2
          className="mb-3"
          style={{
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 800,
            letterSpacing: '-1px',
            color: '#0A0A0F',
          }}
        >
          ส่งฟรีทั่วประเทศ ไม่มีขั้นต่ำ
        </h2>
        <p
          className="mx-auto"
          style={{
            fontSize: '14px',
            color: '#6B7280',
            maxWidth: '480px',
            lineHeight: 1.6,
          }}
        >
          พิเศษเฉพาะเดือนนี้ สั่งซื้อเคสทุกรุ่นรับสิทธิ์จัดส่งฟรีแบบด่วนพิเศษ พร้อมการรับประกันสินค้าเปลี่ยนคืนได้ฟรีภายใน 7 วัน หากมีปัญหาด้านคุณภาพ
        </p>
      </div>
    </section>
  );
}
