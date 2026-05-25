import React from 'react';
import { ShieldCheck, Truck, Clock, Headphones } from 'lucide-react';

export interface FooterProps {
  storeName: string; // Store name
  logoUrl?: string | null;
  navColumns: { title: string; links: { label: string; url: string }[] }[]; // Footer navigation columns
  paymentMethods: string[]; // List of payment method names or image URLs
  socialLinks: { platform: string; url: string }[]; // Social media links
}

export function Footer({ storeName, logoUrl, navColumns, paymentMethods, socialLinks }: FooterProps) {
  const guarantees = [
    { icon: <ShieldCheck size={32} />, title: "ช้อปปิ้งปลอดภัย", desc: "รับประกันสินค้าแท้ 100%" },
    { icon: <Truck size={32} />, title: "จัดส่งรวดเร็ว", desc: "ส่งตรงถึงมือคุณทั่วประเทศ" },
    { icon: <Clock size={32} />, title: "คืนสินค้าง่าย", desc: "ภายใน 15 วันตามเงื่อนไข" },
    { icon: <Headphones size={32} />, title: "บริการ 24/7", desc: "พร้อมดูแลคุณทุกช่วงเวลา" }
  ];

  return (
    <footer className="bg-[var(--shop-card)] border-t border-[var(--shop-border)] mt-auto pt-10">
      
      {/* Mega Trust Banner */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 border-b border-[var(--shop-border)] pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {guarantees.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-3 group">
              <div className="text-[var(--shop-primary)] group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-[var(--shop-ink)] text-sm sm:text-base">{item.title}</h4>
                <p className="text-xs text-[var(--shop-ink-muted)] mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="col-span-2 lg:col-span-1">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-10 w-auto object-contain mb-4" />
            ) : (
              <h3 className="font-extrabold text-2xl text-[var(--shop-primary)] tracking-tight mb-4">{storeName}</h3>
            )}
            <p className="text-xs text-[var(--shop-ink-muted)] mb-6 leading-relaxed max-w-xs">
              ศูนย์รวมสินค้าออนไลน์ที่ใหญ่ที่สุด ช้อปสนุก ถูกใจ มั่นใจได้ทุกการสั่งซื้อ พร้อมโปรโมชั่นพิเศษมากมายทุกวัน
            </p>
          </div>

          {/* Links Cols */}
          {navColumns.map((col, idx) => (
            <div key={idx}>
              <h4 className="font-bold text-[var(--shop-ink)] mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a href={link.url} className="text-xs text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)]">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-[var(--shop-border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--shop-ink-muted)]">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--shop-ink-muted)]">วิธีการชำระเงิน:</span>
            <div className="flex gap-2">
              {paymentMethods.map((pm, idx) => (
                <div key={idx} className="bg-[var(--shop-bg)] border border-[var(--shop-border)] px-2 py-1 rounded text-[10px] font-medium text-[var(--shop-ink-muted)]">
                  {pm}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
