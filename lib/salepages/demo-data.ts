import type { SalepageData } from './types';

/**
 * Demo product used to render every salepage template under /themes
 * preview. The data is intentionally hand-crafted to exercise every
 * section of the contract (long pain-points list, multiple benefits,
 * 3+ testimonials, an FAQ block, etc.) so a template that drops a
 * section is visually obvious.
 */
export const DEMO_SALEPAGE: SalepageData = {
  eyebrow: 'ENTERPRISE EXCEL · MASTERCLASS',
  headline: 'มาสเตอร์ Excel ใน 7 วัน',
  subheadline:
    'สูตรลับและเทมเพลตจริงที่ใช้ในบริษัท Top 100 ของไทย — ใช้แล้วงานเสร็จเร็วขึ้น 4 เท่า รับรองโดยผู้เชี่ยวชาญ',
  heroImageUrl:
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
  heroBadge: '⚡ ขายดีอันดับ 1 · 2,847 คนใช้แล้ว',

  priceTHB: 1490,
  compareAtPriceTHB: 4900,
  ctaPrimary: 'เริ่มเรียนทันที — ฿1,490',
  ctaSecondary: 'ดูตัวอย่างก่อนซื้อ',
  scarcityText: '⏰ โปรเปิดตัว — เหลือเพียง 24 ที่นั่งสุดท้าย',

  painPoints: [
    'ทำรายงานยอดขายรายเดือน 1 วันเต็มทั้งที่ควรเสร็จใน 1 ชั่วโมง',
    'ใช้ VLOOKUP ผิดบ่อย ๆ จนข้อมูลพัง ต้องนั่งไล่แก้ใหม่',
    'Pivot Table ปวดหัว เปิด YouTube หาคำตอบทุกครั้งที่ใช้',
    'เจ้านายขอกราฟใหม่ทุกสัปดาห์ — copy-paste สีจนนิ้วล็อก',
    'รู้สึกว่าตัวเอง "ใช้ Excel เป็น" แต่ทำงานช้ากว่าเพื่อนร่วมงานเสมอ',
  ],

  benefits: [
    {
      icon: '⚡',
      title: 'เร็วขึ้น 4 เท่า',
      body: 'ใช้สูตร + shortcut ที่บริษัทใหญ่ใช้จริง ลดเวลาทำรายงานจาก 8 ชั่วโมงเหลือ 2',
    },
    {
      icon: '🧠',
      title: 'จำได้ตลอดชีวิต',
      body: 'สอนแบบ "ทำตามจริง" ไม่ใช่ท่องสูตร — เรียนครั้งเดียวใช้ได้ตลอดอาชีพ',
    },
    {
      icon: '📊',
      title: '50+ เทมเพลตพร้อมใช้',
      body: 'ดาวน์โหลด .xlsx ไปใช้ทันที — Dashboard, P&L, Cohort, Forecasting',
    },
    {
      icon: '🎯',
      title: 'เน้นใช้งานจริง',
      body: 'ทุกบทเรียนมี case study จากบริษัทไทยจริง ไม่ใช่ข้อมูลปลอม',
    },
    {
      icon: '🔓',
      title: 'อัปเดตฟรีตลอดชีพ',
      body: 'ทุกครั้งที่เพิ่มสูตรใหม่ คุณได้เข้าถึงโดยไม่ต้องจ่ายเพิ่ม',
    },
    {
      icon: '💬',
      title: 'ถามได้ทุกข้อสงสัย',
      body: 'กลุ่ม LINE OpenChat ผู้เรียน — ผู้สอนตอบทุกคำถามภายใน 24 ชม.',
    },
  ],

  modules: [
    {
      title: 'Module 1 — Foundation Reset',
      bullets: [
        'แก้ความเข้าใจผิดที่ทุกคนพลาด',
        '10 shortcut ที่ใช้ทุกวัน',
        'ตั้งค่า Excel ให้เร็วขึ้นทันที',
      ],
    },
    {
      title: 'Module 2 — Power Formulas',
      bullets: [
        'INDEX/MATCH แทน VLOOKUP อย่างถูกต้อง',
        'XLOOKUP, FILTER, UNIQUE — สูตรใหม่ที่เปลี่ยนเกม',
        'Array formula สำหรับงานวิเคราะห์จริง',
      ],
    },
    {
      title: 'Module 3 — Pivot & Dashboard',
      bullets: [
        'Pivot Table จาก zero → hero ใน 90 นาที',
        'สร้าง Dashboard interactive ระดับมืออาชีพ',
        'Slicer + Timeline + Conditional Format',
      ],
    },
    {
      title: 'Module 4 — Power Query & Automation',
      bullets: [
        'รวมไฟล์ 50 ไฟล์เป็น 1 ใน 30 วินาที',
        'ทำความสะอาดข้อมูลโดยไม่ต้องเขียนสูตร',
        'อัตโนมัติงานที่เคยทำซ้ำทุกเดือน',
      ],
    },
  ],

  author: {
    name: 'ดร. ปกรณ์ วรรณะ',
    title: 'Excel MVP · อดีต Financial Analyst ที่ PTT',
    bio: 'สอน Excel ให้กับองค์กรไทยกว่า 80 บริษัทตลอด 10 ปีที่ผ่านมา รวมถึง SCG, Krungsri, AIS และ Thai Beverage. เน้นการสอนที่เอาไปใช้งานจริงได้ตั้งแต่วันแรก',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=400&h=400&q=80',
  },

  testimonials: [
    {
      quote:
        'เรียนจบ Module 2 ก็ลดเวลาทำรายงาน weekly จาก 6 ชม. เหลือ 45 นาที — เจ้านายถึงกับถามว่าทำได้ยังไง',
      author: 'คุณนภัส อมรพันธ์',
      role: 'Senior Financial Analyst, AIS',
      rating: 5,
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
    },
    {
      quote:
        'จากที่กลัว Pivot Table มา 5 ปี ตอนนี้ทำ Dashboard ให้บอร์ดดูทุกสัปดาห์ คุ้มเกินราคา 10 เท่า',
      author: 'คุณธนกฤต พงษ์เพชร',
      role: 'Operations Manager, SCB',
      rating: 5,
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
    },
    {
      quote:
        'เป็นคอร์สเดียวที่สอนแบบ "ทำกับงานคุณจริง ๆ" ไม่ใช่ตัวอย่างปลอม ๆ ผู้สอนตอบคำถามใน LINE ภายในวันเดียวด้วย',
      author: 'คุณรัชนีกร สุขสบาย',
      role: 'Marketing Analyst, Lazada TH',
      rating: 5,
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
    },
  ],

  faqs: [
    {
      q: 'เรียนแล้วจะดูซ้ำได้กี่ครั้ง?',
      a: 'ไม่จำกัด — ซื้อครั้งเดียว เข้าถึงได้ตลอดชีวิต รวมถึงคอนเทนต์ใหม่ ๆ ที่เพิ่มเข้ามา',
    },
    {
      q: 'ใช้ Mac/Windows ต่างกันไหม?',
      a: 'ทั้งสองระบบใช้ได้หมด — สูตรเหมือนกัน 99% shortcut เราจะแสดงทั้ง Cmd และ Ctrl ทุกบท',
    },
    {
      q: 'ต้องใช้ Excel เวอร์ชันไหน?',
      a: 'Excel 2019 ขึ้นไป หรือ Microsoft 365 — XLOOKUP จะใช้ไม่ได้ใน 2016 แต่มีสูตรทดแทนสอนให้',
    },
    {
      q: 'มีใบรับรองให้ไหม?',
      a: 'มีครับ — เรียนจบทุก module + ทำโปรเจคจบ จะได้ใบรับรองดิจิทัล (PDF + LinkedIn badge)',
    },
    {
      q: 'ถ้าเรียนแล้วไม่ชอบ คืนเงินได้ไหม?',
      a: 'ภายใน 14 วันคืนเงิน 100% ไม่ต้องอธิบายเหตุผล — กดปุ่ม "ขอคืนเงิน" ใน /account/orders',
    },
  ],

  brandName: 'Sheetlab',
  brandTagline: 'เทมเพลต Excel ระดับองค์กร · ใช้ได้ทันที',
};
