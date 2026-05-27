'use client';
import React from 'react';
import { Download, ShieldCheck, BookOpen, MessageCircle } from 'lucide-react';

export interface FooterProps {
  store: {
    name: string;
    slug: string;
  };
  categories: string[];
}

/**
 * EduClassroom footer — notebook-page beige, classroom-blue accents.
 * Two trust pillars: ดาวน์โหลดทันที + แก้ไขได้ใน Google Slides.
 */
export function Footer({ store, categories }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FAFAF9] text-[#0F172A] border-t border-[#E2E8F0] font-[family:var(--font-prompt)]">
      {/* Pre-footer trust strip — notebook band */}
      <div className="bg-[#FEF3C7] border-y border-[#F59E0B]/30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <Download size={20} className="text-[#2563EB]" />
            <span className="text-xs font-[family:var(--font-kanit)] font-bold text-[#0F172A]">ดาวน์โหลดทันที</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <BookOpen size={20} className="text-[#2563EB]" />
            <span className="text-xs font-[family:var(--font-kanit)] font-bold text-[#0F172A]">แก้ไขใน Slides ได้</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck size={20} className="text-[#16A34A]" />
            <span className="text-xs font-[family:var(--font-kanit)] font-bold text-[#0F172A]">รับประกันคุณภาพ</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MessageCircle size={20} className="text-[#F59E0B]" />
            <span className="text-xs font-[family:var(--font-kanit)] font-bold text-[#0F172A]">ครูช่วยตอบ 24 ชม.</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand block */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-[#2563EB] text-white w-9 h-9 rounded-lg flex items-center justify-center shadow-sm">
                <BookOpen size={18} />
              </div>
              <span className="font-[family:var(--font-kanit)] font-bold text-lg text-[#0F172A]">
                {store.name}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#475569]">
              เทมเพลตใบงาน สไลด์การสอน และข้อสอบสำหรับครูประถม–มัธยมต้น ใช้สอนได้ทันที แก้ไขได้อิสระ
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-[family:var(--font-kanit)] font-bold text-[#B45309] bg-[#FEF3C7] border border-[#F59E0B]/40 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              ครูแชร์ครู · ไม่หวงวิชา
            </div>
          </div>

          {/* Category links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#2563EB] font-bold mb-4 font-[family:var(--font-kanit)]">
              หมวดสื่อการสอน
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 5).map((category) => (
                <li key={category}>
                  <a
                    href={`/stores/${store.slug}/category?cat=${encodeURIComponent(category)}`}
                    className="text-[#475569] hover:text-[#2563EB] transition-colors"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Why us */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#2563EB] font-bold mb-4 font-[family:var(--font-kanit)]">
              ทำไมต้องเลือกเรา
            </h4>
            <ul className="space-y-2 text-xs text-[#475569]">
              <li>• ออกแบบโดยครูประจำการ</li>
              <li>• สอดคล้องกับหลักสูตรแกนกลาง</li>
              <li>• ไฟล์ Google Slides แก้ไขได้</li>
              <li>• อัปเดตฟรีตลอดอายุการใช้งาน</li>
            </ul>
          </div>

          {/* Contact / help */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#2563EB] font-bold mb-4 font-[family:var(--font-kanit)]">
              ช่วยเหลือคุณครู
            </h4>
            <p className="text-xs leading-relaxed text-[#475569] mb-3">
              ติดปัญหาในการดาวน์โหลด หรืออยากสั่งสื่อปรับแต่งพิเศษ ทักหาเราได้ทันที
            </p>
            <a
              href={`/stores/${store.slug}/help`}
              className="inline-flex items-center gap-1.5 text-xs font-[family:var(--font-kanit)] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
            >
              <MessageCircle size={14} />
              ติดต่อทีมงาน
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#E2E8F0] text-xs text-[#475569] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {currentYear} {store.name}. ครูเพื่อครู · จัดทำในประเทศไทย</p>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-[family:var(--font-kanit)] font-semibold">ดาวน์โหลด PDF / PPTX / DOCX</span>
            <span className="text-[#CBD5E1]">·</span>
            <span className="font-[family:var(--font-kanit)] font-semibold">ใช้กับ Google Classroom ได้</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
