'use client';

import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

export function NotionMartPolicyShell({ title, children }: Props) {
  return (
    <div className="bg-white text-[#1A1A1A] font-[family:var(--font-prompt)] min-h-[60vh]">
      <section className="border-b border-[#E5E5E5] bg-[#F7F6F3] px-4 sm:px-8 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] tracking-[0.16em] uppercase text-[#6B6B6B] font-[family:var(--font-kanit)] font-medium mb-3">
            เอกสารร้าน
          </p>
          <h1 className="font-[family:var(--font-kanit)] font-bold text-3xl sm:text-4xl text-[#1A1A1A] leading-tight">
            {title}
          </h1>
          <p className="mt-2 text-[13px] text-[#6B6B6B]">
            หน้าเอกสารทางการ · อัปเดตล่าสุดโดยทีมงาน
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-8 py-10 sm:py-14">
        <article className="max-w-3xl mx-auto space-y-4 text-[14.5px] leading-[1.75] text-[#1A1A1A]">
          {children}
        </article>
      </section>
    </div>
  );
}

export { NotionMartPolicyShell as PolicyShell };
