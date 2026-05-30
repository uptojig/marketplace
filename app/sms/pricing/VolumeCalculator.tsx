'use client';

import { useState } from 'react';
import { TrendingDown } from 'lucide-react';
import { calcVolumePrice } from '@/lib/sms-mock';

export function VolumeCalculator() {
  const [volume, setVolume] = useState(10_000);
  const { total, rate, saving } = calcVolumePrice(volume);

  return (
    <div
      className="rounded-3xl p-10 lg:p-14 grid lg:grid-cols-2 gap-12 items-center text-white relative overflow-hidden"
      style={{ background: 'var(--sms-ink)' }}
    >
      <span
        aria-hidden
        className="absolute -right-24 -top-24 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.3), transparent 70%)' }}
      />
      <div className="relative">
        <h3
          className="font-black text-3xl tracking-[-0.02em] mb-3"
          style={{ fontFamily: 'Inter, "Noto Sans Thai Looped", sans-serif' }}
        >
          คำนวณราคาตามปริมาณ
        </h3>
        <p className="opacity-70 mb-6">ปรับจำนวน SMS เพื่อดูราคาต่อข้อความและส่วนลด ราคาคำนวณตาม tier ที่เลือก</p>

        <div className="flex bg-white/10 border border-white/15 rounded-lg overflow-hidden mb-3">
          <input
            type="number"
            value={volume}
            onChange={(e) => setVolume(Math.max(100, parseInt(e.target.value, 10) || 0))}
            min={100}
            step={1000}
            className="bg-transparent border-0 outline-none text-white font-mono text-2xl font-bold px-5 py-3.5 flex-1 w-0"
            aria-label="จำนวน SMS ต่อเดือน"
          />
          <span className="px-5 inline-flex items-center bg-white/5 text-sm font-semibold opacity-70 whitespace-nowrap">
            SMS / เดือน
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[1_000, 5_000, 10_000, 50_000, 100_000].map((v) => (
            <button
              key={v}
              onClick={() => setVolume(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition-colors ${volume === v ? 'bg-white text-[var(--sms-ink)] border-white' : 'border-white/20 hover:bg-white/10'}`}
            >
              {v.toLocaleString('th-TH')}
            </button>
          ))}
        </div>

        <p className="text-xs opacity-50 mt-4">
          💡 สูงกว่า 50,000 SMS/เดือน ปรับเป็น Enterprise tier ราคาดีกว่า — ติดต่อทีมขาย
        </p>
      </div>

      <div className="relative bg-white/5 rounded-2xl p-8 text-center">
        <div className="font-mono text-xs uppercase tracking-[0.1em] opacity-60 mb-2">ราคาประมาณ / เดือน</div>
        <div
          className="font-black text-[3.4rem] tracking-[-0.04em] leading-none"
          style={{ color: 'var(--sms-brand)', fontFamily: 'Inter, sans-serif' }}
        >
          <span className="text-xl opacity-60 align-top">฿</span>
          {total.toLocaleString('th-TH')}
        </div>
        <div className="text-sm opacity-60 mt-2">ราคา ฿{rate.toFixed(2)} / SMS · ยังไม่รวม VAT 7%</div>
        {saving > 0 && (
          <span
            className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-xs font-bold text-white"
            style={{ background: 'var(--sms-good)' }}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            ประหยัด {saving}% vs ราคา Starter
          </span>
        )}
      </div>
    </div>
  );
}
