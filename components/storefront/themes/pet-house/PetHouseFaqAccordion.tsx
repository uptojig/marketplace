'use client';

/**
 * PetHouseFaqAccordion — generic store-level FAQ rendered as a shadcn
 * Accordion under the PDP detail stack.
 *
 * Why a static FAQ list?
 *   The mockup shows product-specific Qs ("ประกอบยากไหม?") which would
 *   require a `Product.faqs Json?` column. That's deferred — for now
 *   we ship a generic 5-question shop FAQ pulled from
 *   `lib/helpPages.ts` (the same FAQ shown on /stores/<slug>/faq).
 *
 * Open state: first item open by default to match the mockup's
 * `.faq-item.open` styling. The pet-house palette overrides the
 * default shadcn primitive colors via inline styles + tailwind classes.
 *
 * Marked `'use client'` because base-ui's Accordion uses client-side
 * state for the open/closed transitions.
 */
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

interface FaqEntry {
  q: string;
  a: string;
}

// Generic shop-level FAQ. Mirrors the Qs surfaced on /stores/<slug>/faq
// (sourced from lib/helpPages.ts → slug "faq") in a shortened
// rephrased form that fits the PDP card. Tracked separately because
// the helpPages markdown is laid out for the dedicated FAQ page.
const FAQS: FaqEntry[] = [
  {
    q: 'ใช้เวลาจัดส่งกี่วัน?',
    a: '3-7 วันทำการสำหรับการจัดส่งภายในประเทศ ขึ้นอยู่กับพื้นที่และผู้ให้บริการขนส่ง · กรุงเทพฯ ปริมณฑลภายใน 1-2 วัน',
  },
  {
    q: 'ค่าจัดส่งคิดยังไง?',
    a: 'ค่าจัดส่งคำนวณอัตโนมัติตามน้ำหนักและปลายทาง · แสดงในหน้าตะกร้าก่อนชำระเงิน · มีโปรส่งฟรีเมื่อสั่งครบตามที่ระบุ',
  },
  {
    q: 'สามารถยกเลิกหรือเปลี่ยนคำสั่งซื้อได้ไหม?',
    a: 'ยกเลิก/เปลี่ยนได้ภายใน 1 ชั่วโมงหลังจากชำระเงิน ก่อนสินค้าเข้าสู่กระบวนการเตรียมจัดส่ง · ติดต่อร้านผ่านช่องทางในส่วน "ติดต่อเรา"',
  },
  {
    q: 'คืนสินค้าได้กี่วัน?',
    a: 'รับเปลี่ยน/คืนสินค้าภายใน 7 วันหลังได้รับสินค้า · สินค้าต้องอยู่ในสภาพเดิม ไม่ผ่านการใช้งานหนัก · ทางร้านรับผิดชอบค่าส่งคืนกรณีร้านผิด',
  },
  {
    q: 'ติดต่อร้านได้ทางไหนบ้าง?',
    a: 'ทักผ่าน LINE / Facebook ที่ระบุในส่วน "ติดต่อเรา" · เวลาทำการ 9:00-21:00 ตอบเร็วทุกวัน · หรือกรอกฟอร์มติดต่อในหน้าเว็บ',
  },
];

export function PetHouseFaqAccordion() {
  return (
    <Accordion
      defaultValue={['faq-0']}
      className="flex flex-col gap-2.5"
    >
      {FAQS.map((item, i) => (
        <AccordionItem
          key={item.q}
          value={`faq-${i}`}
          // base-ui's Accordion.Item exposes `data-open` on the open panel.
          // We use it to swap the card to the mint highlight in the mockup.
          className="rounded-[10px] not-last:border-b-0 data-[open]:bg-[#F0F7E5] data-[open]:border-[#5BA033]"
          style={{
            border: '0.5px solid #EDE5DF',
            background: 'white',
            padding: '14px 18px',
          }}
        >
          <AccordionTrigger
            className="py-0 hover:no-underline border-0"
            style={{
              fontSize: '13px',
              color: '#3B2F1F',
              fontWeight: 600,
            }}
          >
            <span className="text-left flex-1 pr-4">{item.q}</span>
          </AccordionTrigger>
          <AccordionContent>
            <p
              style={{
                fontSize: '12px',
                lineHeight: 1.7,
                color: '#5C3D1F',
                marginTop: '10px',
              }}
            >
              {item.a}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
