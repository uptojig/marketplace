'use client';

import React from 'react';
import {
  IconArrowRight,
  IconRulerMeasure,
  IconRecycle,
  IconHeart,
  IconStar,
  IconSparkles,
  IconWorld,
} from '@tabler/icons-react';
import type { StoreInfo } from './Homepage';

// ============ Types ============
export interface Stat {
  num: string;
  label: string;
}

export interface ValueBlock {
  icon?: React.ReactNode;
  title: string;
  body: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  emoji?: string;
  bg?: string;
}

export interface SustainabilityInfo {
  intro?: string;
  metrics?: Stat[];
}

export interface HowItWorksStep {
  num: string;
  title: string;
  body: string;
}

export interface AboutProps {
  store?: StoreInfo;
  stats?: Stat[];
  values?: ValueBlock[];
  teamMembers?: TeamMember[];
  sustainability?: SustainabilityInfo;
  howItWorks?: HowItWorksStep[];
  // URL prop: shop / catalog landing page
  shopUrl: string;
  // URL prop: lookbook editorial page
  lookbookUrl: string;
}

// ============ Defaults ============
const DEFAULT_STATS: Stat[] = [
  { num: '2566', label: 'ก่อตั้ง · 3 ปี' },
  { num: '50K+', label: 'ลูกค้าทั่วประเทศ' },
  { num: '4.9★', label: 'จาก 12K+ รีวิว' },
  { num: '200+', label: 'สไตล์ในคอลเลคชั่น' },
];

const DEFAULT_VALUES: ValueBlock[] = [
  { icon: <IconRulerMeasure size={28} />, title: 'Size Inclusive', body: 'ออกแบบสำหรับสรีระเอเชีย XS-3XL · ทุก body shape · มี size guide ละเอียดและรีวิวจริงในทุกไซส์' },
  { icon: <IconRecycle size={28} />, title: 'Eco Conscious', body: 'ผ้ารีไซเคิล 70%+ · ไนลอนจากขวดพลาสติกในทะเล · บรรจุภัณฑ์ย่อยสลายได้ · ลดขยะให้โลก' },
  { icon: <IconHeart size={28} />, title: 'Body Positive', body: 'เราเชื่อว่าทุก body สวยในแบบของตัวเอง · ดีไซน์เพื่อเสริมความมั่นใจ ไม่ใช่บีบให้พอดี' },
];

const DEFAULT_TEAM: TeamMember[] = [
  { id: 't1', name: 'มาริสา ส.', role: 'Founder & Creative Director', emoji: '👩‍💼', bg: 'linear-gradient(135deg, #FCE7F3, #F472B6)' },
  { id: 't2', name: 'จันทรา พ.', role: 'Head of Design', emoji: '🎨', bg: 'linear-gradient(135deg, #E0F2FE, #38BDF8)' },
  { id: 't3', name: 'อรอุมา ก.', role: 'Production Lead', emoji: '✂️', bg: 'linear-gradient(135deg, #FEF3C7, #FACC15)' },
  { id: 't4', name: 'เปรมิกา จ.', role: 'Sustainability', emoji: '🌱', bg: 'linear-gradient(135deg, #DCFCE7, #10B981)' },
];

const DEFAULT_HOW: HowItWorksStep[] = [
  { num: '01', title: 'Browse', body: 'เลือกสไตล์ที่ใช่จาก 200+ ดีไซน์ · มี Size Guide ละเอียดในทุกสินค้า · รีวิวจริงจากลูกค้าจริง' },
  { num: '02', title: 'Order', body: 'เลือกขนาด สี และจำนวน · ใส่ที่อยู่ · ชำระเงินผ่านช่องทางที่สะดวก · ทุกการชำระปลอดภัย 100%' },
  { num: '03', title: 'Receive', body: 'เราจัดส่งภายใน 24 ชม. · ห่อแบบ discreet packaging · ติดตามสถานะ real-time · ถึงมือคุณใน 1-4 วัน' },
  { num: '04', title: 'Enjoy', body: 'ลองใส่ที่บ้าน · ไม่พอใจเปลี่ยนไซส์ฟรี 14 วัน · เก็บ Hygiene seal · ติดต่อ LINE 24 ชม.' },
];

const DEFAULT_SUSTAIN: SustainabilityInfo = {
  intro: 'เราออกแบบเสื้อผ้าทุกชิ้นโดยคิดถึงโลก ใช้ผ้ารีไซเคิลจากขวดพลาสติกในทะเล ลดขยะ และดูแลคนทำงานในซัพพลายเชนทุกระดับ',
  metrics: [
    { num: '70%', label: 'ผ้ารีไซเคิล' },
    { num: '12K+', label: 'ขวดพลาสติกถูกใช้ใหม่' },
    { num: '0', label: 'ขยะถุงพลาสติก' },
    { num: '100%', label: 'แพคเกจรีไซเคิล' },
  ],
};

// ============ Component ============
export function About({
  store = { name: 'BIKINI551', tagline: 'Body Positive · Eco Friendly · Made for Asian Women' },
  stats = DEFAULT_STATS,
  values = DEFAULT_VALUES,
  teamMembers = DEFAULT_TEAM,
  sustainability = DEFAULT_SUSTAIN,
  howItWorks = DEFAULT_HOW,
  shopUrl,
  lookbookUrl,
}: AboutProps) {
  return (
    <main>
      {/* HERO */}
      <section className="bk-about-hero">
        <div className="bk-container">
          <span className="bk-kicker" style={{ marginBottom: 20 }}>★ Our Story</span>
          <h1>
            <span className="bk-grad-sky">Summer</span>,<br />
            <span className="bk-grad-coral">Made for Everyone</span>
          </h1>
          <p style={{ maxWidth: 640, margin: '20px auto 0', fontSize: 17, color: 'var(--bikini-text-2)', fontWeight: 600 }}>
            {store.tagline}
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="bk-section">
        <div className="bk-container">
          <div className="bk-stats">
            {stats.map((s, i) => (
              <div key={i} className="bk-stat">
                <div className="num">{s.num}</div>
                <div style={{ fontSize: 12, color: 'var(--bikini-muted)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="bk-section bk-section-sand">
        <div className="bk-container">
          <div className="bk-story">
            <div className="bk-story-visual">
              <svg viewBox="0 0 300 380" width="100%" aria-hidden="true">
                <path d="M70 100 Q100 80 140 100 L150 160 Q120 180 80 170 Q60 160 60 130 Z" fill="#F472B6" stroke="#1E40AF" strokeWidth={2.5} />
                <path d="M160 100 Q190 80 230 100 L240 130 Q240 160 220 170 Q180 180 150 160 Z" fill="#F472B6" stroke="#1E40AF" strokeWidth={2.5} />
                <circle cx={85} cy={130} r={4} fill="white" />
                <circle cx={125} cy={125} r={4} fill="white" />
                <circle cx={200} cy={125} r={4} fill="white" />
                <path d="M80 230 Q150 215 220 230 L210 320 Q200 335 180 330 Q150 325 120 330 Q100 335 90 320 Z" fill="#F472B6" stroke="#1E40AF" strokeWidth={2.5} />
                <circle cx={150} cy={260} r={4} fill="white" />
                <circle cx={155} cy={310} r={4} fill="white" />
                <text x={35} y={50} fontSize={28} fill="#F97316">★</text>
                <text x={255} y={350} fontSize={24} fill="#FACC15">✦</text>
              </svg>
            </div>
            <div>
              <span className="bk-kicker">★ The Journey</span>
              <h2>เริ่มต้นจาก<br /><em className="bk-grad-coral" style={{ fontStyle: 'normal' }}>ความหงุดหงิด</em>ของผู้ก่อตั้ง</h2>
              <p style={{ marginTop: 20, marginBottom: 14 }}>
                "ไปเที่ยวทะเลทีไร หาบีกีนี่ที่ใส่แล้วฟิตทรงเอเชียยากมาก ส่วนใหญ่ขนาดยุโรปและกระเป๋าก็แบน" — มาริสา, ผู้ก่อตั้ง BIKINI551
              </p>
              <p style={{ marginBottom: 14 }}>
                ในปี 2566 มาริสาตัดสินใจสร้างแบรนด์บีกีนี่ของตัวเองที่ออกแบบสำหรับสรีระเอเชียจริงๆ จับมือกับ designer และโรงงานในกรุงเทพ ใช้ผ้ารีไซเคิลคุณภาพสูง · เริ่มจาก 8 ดีไซน์ ตอนนี้มี 200+ ดีไซน์ และลูกค้ากว่า 50,000 คน
              </p>
              <p>
                BIKINI551 ไม่ใช่แค่บีกีนี่ · เราคือ <b style={{ color: 'var(--shop-ink)' }}>community ของสาวๆ ที่รักทะเล รักร่างกายตัวเอง</b> และอยากแต่งตัวสนุกในวันหยุด
              </p>
              <a href={lookbookUrl} className="bk-btn bk-btn-primary" style={{ marginTop: 20 }}>ดู Lookbook 2026 <IconArrowRight size={16} /></a>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bk-section">
        <div className="bk-container">
          <div className="bk-section-head center">
            <div>
              <span className="bk-kicker">★ Our Values</span>
              <h2>เราเชื่อใน <em className="bk-grad-coral" style={{ fontStyle: 'normal' }}>3 สิ่งนี้</em></h2>
            </div>
          </div>
          <div className="bk-values">
            {values.map((v, i) => (
              <article key={i} className="bk-value">
                <div className="ic-big" aria-hidden="true">{v.icon}</div>
                <h3 style={{ marginBottom: 12 }}>{v.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7 }}>{v.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bk-section bk-section-sky">
        <div className="bk-container">
          <div className="bk-section-head">
            <div>
              <span className="bk-kicker">★ How It Works</span>
              <h2>ช้อปง่าย <em className="bk-grad-coral" style={{ fontStyle: 'normal' }}>ใน 4 ขั้นตอน</em></h2>
            </div>
          </div>
          <div className="bk-features">
            {howItWorks.map((s) => (
              <article key={s.num} className="bk-feature" style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 40, fontWeight: 900, background: 'var(--bikini-grad-summer)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-2px', marginBottom: 14 }}>{s.num}</div>
                <h4 style={{ marginBottom: 8 }}>{s.title}</h4>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="bk-section">
        <div className="bk-container">
          <div className="bk-section-head center">
            <div>
              <span className="bk-kicker">★ Meet the Team</span>
              <h2>คนเล็กๆ ที่ <em className="bk-grad-coral" style={{ fontStyle: 'normal' }}>ทำให้มันเกิดขึ้น</em></h2>
            </div>
          </div>
          <div className="bk-team">
            {teamMembers.map((m) => (
              <article key={m.id} className="bk-team-card">
                <div className="bk-team-photo" style={m.bg ? { background: m.bg } : undefined} aria-hidden="true">{m.emoji}</div>
                <div style={{ padding: 22, textAlign: 'center' }}>
                  <h4 style={{ marginBottom: 4 }}>{m.name}</h4>
                  <div style={{ fontSize: 11, color: 'var(--bikini-muted)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>{m.role}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SUSTAINABILITY */}
      <section className="bk-section bk-section-coral" id="sustainability">
        <div className="bk-container">
          <div className="bk-section-head center">
            <div>
              <span className="bk-kicker">★ Our Impact</span>
              <h2>เราใส่ใจ <em className="bk-grad-sky" style={{ fontStyle: 'normal' }}>โลกของเรา</em> 🌍</h2>
              {sustainability.intro && <p style={{ marginTop: 16, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto', fontSize: 15 }}>{sustainability.intro}</p>}
            </div>
          </div>
          {sustainability.metrics && (
            <div className="bk-stats">
              {sustainability.metrics.map((m, i) => (
                <div key={i} className="bk-stat">
                  <div className="num">{m.num}</div>
                  <div style={{ fontSize: 12, color: 'var(--bikini-muted)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>{m.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bk-section">
        <div className="bk-container">
          <div className="bk-newsletter">
            <span style={{ fontSize: 36, marginBottom: 8, display: 'block' }} aria-hidden="true">🌟</span>
            <h2>Ready to find your perfect fit?</h2>
            <p>200+ ดีไซน์ · XS-3XL · ส่งฟรี ฿890+ · เปลี่ยนไซส์ฟรี 14 วัน</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
              <a className="bk-btn bk-btn-dark bk-btn-lg" href={shopUrl}>ช้อปคอลเลคชั่น <IconArrowRight size={16} /></a>
              <a className="bk-btn bk-btn-secondary bk-btn-lg" href={lookbookUrl}>ดู Lookbook</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;
