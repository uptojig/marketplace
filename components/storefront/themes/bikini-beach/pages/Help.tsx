'use client';

import React, { useState } from 'react';
import {
  IconBrandLine,
  IconBrandInstagram,
  IconMail,
  IconPhone,
  IconChevronDown,
  IconRulerMeasure,
  IconArrowRight,
} from '@tabler/icons-react';

// ============ Types ============
export interface SizeRow {
  size: string;
  values: (string | number)[];
}

export interface SizeGuideTable {
  /** Table title e.g. "Bikini Sets" */
  title: string;
  /** Column headers (excluding size column) */
  headers: string[];
  rows: SizeRow[];
  /** Optional description */
  note?: string;
}

export interface SizeGuide {
  intro?: string;
  tables: SizeGuideTable[];
  howToMeasure?: { title: string; body: string }[];
}

export interface ContactChannel {
  id: string;
  network: 'line' | 'instagram' | 'email' | 'phone' | string;
  label: string;
  description: string;
  value: string;
  href: string;
  /** Hex bg for icon circle */
  bgHex?: string;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface ContactFormPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface HelpProps {
  sizeGuide?: SizeGuide;
  contactChannels?: ContactChannel[];
  faqs?: FAQ[];
  onSubmitContact?: (payload: ContactFormPayload) => void;
}

// ============ Defaults ============
const DEFAULT_SIZE_GUIDE: SizeGuide = {
  intro: 'ตาราง Size Guide ละเอียดสำหรับทุกสไตล์ของ BIKINI551 · วัดสายวัดที่ตัวเองตอนใส่ชุดในจริงๆ เพื่อความแม่นยำ',
  tables: [
    {
      title: 'Bikini Sets · Two-Piece',
      headers: ['Bust (cm)', 'Underbust (cm)', 'Waist (cm)', 'Hip (cm)'],
      rows: [
        { size: 'XS', values: ['76-80', '60-65', '58-62', '82-86'] },
        { size: 'S', values: ['80-84', '65-70', '62-66', '86-90'] },
        { size: 'M', values: ['84-88', '70-75', '66-70', '90-94'] },
        { size: 'L', values: ['88-92', '75-80', '70-74', '94-98'] },
        { size: 'XL', values: ['92-96', '80-85', '74-78', '98-102'] },
        { size: '2XL', values: ['96-100', '85-90', '78-82', '102-106'] },
        { size: '3XL', values: ['100-104', '90-95', '82-86', '106-110'] },
      ],
      note: '* แนะนำเลือกตาม Bust + Hip เป็นหลัก · ถ้าระหว่างไซส์เลือกใหญ่กว่า',
    },
    {
      title: 'Cover-Up · Resort Wear',
      headers: ['Bust (cm)', 'Waist (cm)', 'Length (cm)'],
      rows: [
        { size: 'XS-S', values: ['80-88', '62-70', '85'] },
        { size: 'M-L', values: ['88-96', '70-78', '90'] },
        { size: 'XL-2XL', values: ['96-104', '78-86', '95'] },
        { size: '3XL', values: ['104-110', '86-92', '95'] },
      ],
      note: '* Cover-Up เป็น Free Size ทรงหลวม · เลือกตามไซส์ปกติได้เลย',
    },
  ],
  howToMeasure: [
    { title: 'รอบอก (Bust)', body: 'วัดรอบส่วนที่ใหญ่ที่สุดของหน้าอก ผ่านจุดยอดของหัวนม สายวัดต้องขนานกับพื้น' },
    { title: 'รอบใต้อก (Underbust)', body: 'วัดรอบลำตัวใต้หน้าอกพอดี ที่จุดที่บราเริ่มรัด · สายวัดต้องแน่นพอเหมาะ ไม่หลวม' },
    { title: 'รอบเอว (Waist)', body: 'วัดที่ส่วนแคบที่สุดของลำตัว ปกติคือเหนือสะดือเล็กน้อย · สายวัดต้องแนบสนิทแต่ไม่บีบ' },
    { title: 'รอบสะโพก (Hip)', body: 'วัดส่วนที่กว้างที่สุดของสะโพก · ปกติอยู่ต่ำกว่าเอวประมาณ 20 cm · ยืนปกติ ไม่เกร็ง' },
  ],
};

const DEFAULT_CHANNELS: ContactChannel[] = [
  { id: 'line', network: 'line', label: 'LINE Official', description: 'ตอบเร็วที่สุด · 24 ชม. · ทุกวัน', value: '@bikini551', href: 'https://line.me/R/ti/p/@bikini551', bgHex: '#06C755' },
  { id: 'ig', network: 'instagram', label: 'Instagram DM', description: 'ถ่ายรูปสินค้าให้ดูเพิ่ม · ขอคำแนะนำสไตล์', value: '@bikini551', href: 'https://instagram.com/bikini551', bgHex: 'linear-gradient(135deg, #F472B6, #BE185D, #F97316)' },
  { id: 'email', network: 'email', label: 'Email', description: 'สำหรับเรื่องที่ซับซ้อน · ตอบใน 24 ชม.', value: 'hello@bikini551.com', href: 'mailto:hello@bikini551.com', bgHex: 'linear-gradient(135deg, #38BDF8, #1E40AF)' },
  { id: 'phone', network: 'phone', label: 'Phone', description: 'จันทร์-เสาร์ · 9:00-18:00 · ภาษาไทยและอังกฤษ', value: '02-456-7890', href: 'tel:0224567890', bgHex: 'linear-gradient(135deg, #FB923C, #EA580C)' },
];

const DEFAULT_FAQS: FAQ[] = [
  { q: 'สั่งของแล้วได้รับเมื่อไหร่?', a: 'สั่งก่อน 14:00 · จัดส่งภายในวันเดียวกัน · กรุงเทพและปริมณฑลถึงใน 1-2 วัน · ต่างจังหวัดถึงใน 2-5 วัน · ทุกออเดอร์มี tracking real-time' },
  { q: 'ส่งฟรีจริงไหม? ขั้นต่ำเท่าไหร่?', a: 'ส่งฟรีจริง 100% สำหรับออเดอร์ ฿890+ ทั่วประเทศ · ออเดอร์ต่ำกว่าค่าส่ง ฿60 (กรุงเทพ) / ฿80 (ตจว.) · ไม่มีค่าธรรมเนียมแฝง' },
  { q: 'ถ้าไซส์ไม่พอดี เปลี่ยนได้ไหม?', a: 'เปลี่ยนไซส์ฟรี ภายใน 14 วันหลังได้รับสินค้า · ส่งคืนฟรีผ่าน Kerry ที่จุดให้บริการใกล้บ้าน · เงื่อนไข: สินค้าต้องไม่ผ่านการใช้งาน + Hygiene seal ยังติดอยู่' },
  { q: 'มีบัตรของขวัญหรือ Gift Card ไหม?', a: 'มี Gift Card ตั้งแต่ ฿500 — ฿5,000 · ส่งผ่านอีเมล หรือพิมพ์เป็นการ์ดสวยๆ ส่งทางไปรษณีย์ก็ได้ · ติดต่อ LINE @bikini551 เพื่อสั่งซื้อ' },
  { q: 'ผ้ารีไซเคิลเป็นยังไง? คุณภาพต่างจากผ้าทั่วไปไหม?', a: 'ใช้ Recycled Nylon ที่ทำจากขยะพลาสติกในทะเล · คุณภาพเทียบเท่าหรือดีกว่าผ้าใหม่ · ยืดหยุ่นสูง แห้งเร็ว ไม่ขึ้นยาน · ผ่านการรับรอง GRS (Global Recycled Standard)' },
  { q: 'มีหน้าร้านที่ไหนไหม?', a: 'มี Showroom 2 สาขา: 1) Asok BTS (ซอยสุขุมวิท 21) · 2) Central World ชั้น 4 · เปิดทุกวัน 11:00-21:00 · สามารถลองใส่ + ปรึกษา personal stylist ฟรี · จองคิวผ่าน LINE @bikini551' },
  { q: 'มี Affiliate Program ไหม?', a: 'มี! BIKINI551 Ambassadors Program · ค่าคอม 15-25% ต่อการขาย · มี kit สำหรับ content + ส่วนลดพิเศษสำหรับ ambassador · สมัครได้ที่ /ambassador หรือ DM Instagram' },
  { q: 'สินค้าหมด/Sold Out จะ Restock ไหม?', a: 'สินค้า Bestseller จะ restock ทุก 2-4 สัปดาห์ · กดปุ่ม "Notify Me" ที่หน้าสินค้าเพื่อรับ email เมื่อมีของ · บางคอลเลคชั่น limited จะไม่ผลิตซ้ำ' },
];

// ============ Component ============
export function Help({
  sizeGuide = DEFAULT_SIZE_GUIDE,
  contactChannels = DEFAULT_CHANNELS,
  faqs = DEFAULT_FAQS,
  onSubmitContact,
}: HelpProps) {
  const [form, setForm] = useState<ContactFormPayload>({ name: '', email: '', subject: '', message: '' });

  const channelIcon: Record<string, React.ReactNode> = {
    line: <IconBrandLine size={24} />,
    instagram: <IconBrandInstagram size={24} />,
    email: <IconMail size={24} />,
    phone: <IconPhone size={24} />,
  };

  return (
    <main>
      {/* HERO */}
      <section className="bk-cat-hero">
        <div className="bk-container">
          <div className="bk-cat-hero-inner">
            <div>
              <span className="bk-kicker" style={{ color: 'rgba(255,255,255,0.85)' }}>★ Help &amp; Support</span>
              <h1>เราพร้อมช่วย 24/7</h1>
              <p className="lead">ขั้นตอนการสั่งซื้อ · Size Guide · FAQ · ติดต่อทีมงาน</p>
            </div>
            <div className="bk-cat-hero-stats">
              <div><div className="num">&lt;1h</div><div className="lbl">Avg Response</div></div>
              <div><div className="num">4.9★</div><div className="lbl">Support Rating</div></div>
              <div><div className="num">24/7</div><div className="lbl">LINE Support</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* SIZE GUIDE */}
      <section className="bk-section" id="size-guide">
        <div className="bk-container">
          <div className="bk-section-head">
            <div>
              <span className="bk-kicker">★ Size Guide</span>
              <h2>ตาราง <em className="bk-grad-coral" style={{ fontStyle: 'normal' }}>Size & Fit</em></h2>
              {sizeGuide.intro && <p style={{ marginTop: 12, maxWidth: 700 }}>{sizeGuide.intro}</p>}
            </div>
            <IconRulerMeasure size={48} color="var(--shop-primary)" />
          </div>

          {/* Tables */}
          <div style={{ display: 'grid', gap: 24 }}>
            {sizeGuide.tables.map((t, i) => (
              <article key={i} style={{ background: 'white', border: '2px solid var(--shop-border)', borderRadius: 24, padding: 28, overflowX: 'auto' }}>
                <h3 style={{ marginBottom: 14 }}>📐 {t.title}</h3>
                <table className="bk-size-table" style={{ minWidth: 480 }}>
                  <thead>
                    <tr>
                      <th>Size</th>
                      {t.headers.map((h) => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {t.rows.map((r) => (
                      <tr key={r.size}>
                        <td><b>{r.size}</b></td>
                        {r.values.map((v, j) => <td key={j}>{v}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {t.note && <p style={{ marginTop: 14, fontSize: 12, color: 'var(--bikini-text-2)', fontWeight: 600 }}>{t.note}</p>}
              </article>
            ))}
          </div>

          {/* How to measure */}
          {sizeGuide.howToMeasure && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{ marginBottom: 18 }}>📏 วิธีวัดตัว</h3>
              <div className="bk-features">
                {sizeGuide.howToMeasure.map((m, i) => (
                  <article key={i} className="bk-feature" style={{ textAlign: 'left' }}>
                    <h4 style={{ marginBottom: 8 }}>{m.title}</h4>
                    <p style={{ fontSize: 13 }}>{m.body}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CONTACT */}
      <section className="bk-section bk-section-sand" id="contact">
        <div className="bk-container">
          <div className="bk-section-head">
            <div>
              <span className="bk-kicker">★ Contact Us</span>
              <h2>ติดต่อ <em className="bk-grad-coral" style={{ fontStyle: 'normal' }}>ทีม BIKINI551</em></h2>
            </div>
          </div>
          <div className="bk-contact-grid">
            {/* Form */}
            <div className="bk-form-wrap">
              <h3 style={{ marginBottom: 8 }}>ส่งข้อความหาเรา</h3>
              <p style={{ fontSize: 13, color: 'var(--bikini-text-2)', marginBottom: 22, fontWeight: 600 }}>กรอกแบบฟอร์ม เราจะตอบกลับใน 24 ชม.</p>
              <form
                className="bk-fields"
                onSubmit={(e) => { e.preventDefault(); onSubmitContact?.(form); }}
              >
                <div className="bk-field">
                  <label htmlFor="cf-name">ชื่อ <span style={{ color: '#EF4444' }}>*</span></label>
                  <input id="cf-name" required value={form.name} onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} />
                </div>
                <div className="bk-field">
                  <label htmlFor="cf-email">อีเมล <span style={{ color: '#EF4444' }}>*</span></label>
                  <input id="cf-email" type="email" required value={form.email} onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))} />
                </div>
                <div className="bk-field full">
                  <label htmlFor="cf-subj">หัวข้อ <span style={{ color: '#EF4444' }}>*</span></label>
                  <select id="cf-subj" required value={form.subject} onChange={(e) => setForm(s => ({ ...s, subject: e.target.value }))}>
                    <option value="">เลือกหัวข้อ</option>
                    <option>สอบถามสินค้า</option>
                    <option>เปลี่ยน/คืนสินค้า</option>
                    <option>ขนาด/ไซส์</option>
                    <option>การจัดส่ง</option>
                    <option>ความร่วมมือ (Wholesale / Affiliate)</option>
                    <option>อื่นๆ</option>
                  </select>
                </div>
                <div className="bk-field full">
                  <label htmlFor="cf-msg">ข้อความ <span style={{ color: '#EF4444' }}>*</span></label>
                  <textarea id="cf-msg" rows={5} required value={form.message} onChange={(e) => setForm(s => ({ ...s, message: e.target.value }))} />
                </div>
                <div className="bk-field full">
                  <button type="submit" className="bk-btn bk-btn-primary bk-btn-lg bk-btn-block">ส่งข้อความ <IconArrowRight size={16} /></button>
                </div>
              </form>
            </div>

            {/* Channels */}
            <div>
              <h3 style={{ marginBottom: 4 }}>ช่องทางติดต่ออื่นๆ</h3>
              <p style={{ fontSize: 13, color: 'var(--bikini-text-2)', marginBottom: 18, fontWeight: 600 }}>เลือกช่องทางที่สะดวกที่สุดสำหรับคุณ</p>
              <div className="bk-channels">
                {contactChannels.map((c) => (
                  <a key={c.id} href={c.href} className="bk-channel">
                    <div className="ic-circle" style={{ background: c.bgHex }}>{channelIcon[c.network] ?? '★'}</div>
                    <div className="info">
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{c.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--bikini-muted)', fontWeight: 600 }}>{c.description}</div>
                      <div style={{ fontSize: 13, color: 'var(--shop-primary)', fontWeight: 800, marginTop: 4 }}>{c.value}</div>
                    </div>
                    <IconArrowRight size={18} color="var(--bikini-muted)" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bk-section" id="faq">
        <div className="bk-container">
          <div className="bk-section-head center">
            <div>
              <span className="bk-kicker">★ Frequently Asked</span>
              <h2>คำถาม <em className="bk-grad-coral" style={{ fontStyle: 'normal' }}>ที่พบบ่อย</em></h2>
            </div>
          </div>
          <div style={{ maxWidth: 800, margin: '0 auto' }} className="bk-acc">
            {faqs.map((f, i) => (
              <details key={i} className="bk-acc-item">
                <summary>
                  <span style={{ flex: 1 }}>{f.q}</span>
                  <IconChevronDown size={18} />
                </summary>
                <div className="bk-acc-body">{f.a}</div>
              </details>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <p style={{ marginBottom: 14 }}>ไม่เจอคำตอบที่ต้องการ?</p>
            <a className="bk-btn bk-btn-primary" href="#contact">ส่งคำถามให้เรา <IconArrowRight size={16} /></a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Help;
