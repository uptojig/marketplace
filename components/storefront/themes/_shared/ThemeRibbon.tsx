/**
 * Tiny theme-banner pickers — used by the 4 slim themes (everyday /
 * taobao / packaging / community) to add a colored ribbon at the top
 * of the Category / OrderSuccess / Checkout / Policy routes without
 * forcing a fully bespoke <ThemePage /> component per route.
 *
 * Each picker accepts the same set of theme flags and renders the
 * matching ribbon, or returns null if no theme matches.
 */

import { Flame, ShoppingCart, Sparkles, Video, ShieldCheck, PartyPopper, FileText } from 'lucide-react';
import { TAOBAO_TOKENS } from '@/lib/landing/taobao';
import { PACKAGING_TOKENS } from '@/lib/landing/packaging';
import { COMMUNITY_TOKENS } from '@/lib/landing/community';

type ThemeFlags = {
  isEveryday?: boolean;
  isTaobao?: boolean;
  isPackaging?: boolean;
  isCommunity?: boolean;
};

type Variant = 'category' | 'order-success' | 'checkout' | 'policy';

const COPY: Record<Variant, Record<'everyday' | 'taobao' | 'packaging' | 'community', { icon: React.ReactNode; text: string }>> = {
  category: {
    everyday: { icon: <ShoppingCart className="h-4 w-4" />, text: 'ดูสินค้าทุกหมวด · ลดสูงสุด 30%' },
    taobao: { icon: <Flame className="h-4 w-4" />, text: 'แคตตาล็อกทั้งหมด · ดีลทุกชั่วโมง' },
    packaging: { icon: <Sparkles className="h-4 w-4" />, text: 'แคตตาล็อกสินค้าครบครัน · ส่งฟรี ฿590+' },
    community: { icon: <Video className="h-4 w-4" />, text: 'สินค้าที่ KOL พรีวิว · ราคาไลฟ์เท่านั้น' },
  },
  'order-success': {
    everyday: { icon: <PartyPopper className="h-4 w-4" />, text: 'สั่งซื้อสำเร็จ · ขอบคุณที่ช้อปกับเรา' },
    taobao: { icon: <PartyPopper className="h-4 w-4" />, text: 'ออเดอร์เข้าระบบแล้ว · ส่งทันทีพรุ่งนี้' },
    packaging: { icon: <PartyPopper className="h-4 w-4" />, text: 'ขอบคุณค่ะ · เตรียมแพ็คให้ทันที' },
    community: { icon: <PartyPopper className="h-4 w-4" />, text: 'ยินดีด้วย! ออเดอร์จากไลฟ์ได้ลด 15% แล้ว' },
  },
  checkout: {
    everyday: { icon: <ShieldCheck className="h-4 w-4" />, text: 'ชำระเงินปลอดภัย · SSL · ผ่อน 0% ได้' },
    taobao: { icon: <ShieldCheck className="h-4 w-4" />, text: 'เช็คเอาท์ปลอดภัย · COD / โอน / บัตรเครดิต' },
    packaging: { icon: <ShieldCheck className="h-4 w-4" />, text: 'ชำระปลอดภัย · ส่งฟรี ฿590+ · ใบกำกับภาษีให้ทุกออเดอร์' },
    community: { icon: <ShieldCheck className="h-4 w-4" />, text: 'เช็คเอาท์ราคาไลฟ์ · ได้ลด 15% อัตโนมัติ' },
  },
  policy: {
    everyday: { icon: <FileText className="h-4 w-4" />, text: 'ข้อมูลและนโยบายร้าน' },
    taobao: { icon: <FileText className="h-4 w-4" />, text: 'นโยบายร้าน · เคลม / คืน / รับประกัน' },
    packaging: { icon: <FileText className="h-4 w-4" />, text: 'นโยบายร้าน · เคลม / คืน / ภาษี' },
    community: { icon: <FileText className="h-4 w-4" />, text: 'นโยบายร้าน · เคลม / คืน / รับประกัน' },
  },
};

export function ThemeRibbon({
  variant,
  isEveryday,
  isTaobao,
  isPackaging,
  isCommunity,
}: ThemeFlags & { variant: Variant }) {
  if (!isEveryday && !isTaobao && !isPackaging && !isCommunity) return null;

  const key = isEveryday
    ? 'everyday'
    : isTaobao
      ? 'taobao'
      : isPackaging
        ? 'packaging'
        : 'community';
  const copy = COPY[variant][key];

  const bg = isEveryday
    ? '#DC2626'
    : isTaobao
      ? TAOBAO_TOKENS.primaryGradient
      : isPackaging
        ? PACKAGING_TOKENS.primary
        : COMMUNITY_TOKENS.primaryGradient;

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 text-sm font-bold text-white"
      style={{ background: bg }}
    >
      {isCommunity && variant !== 'policy' && (
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
        </span>
      )}
      {copy.icon}
      <span className="uppercase tracking-[0.04em]">{copy.text}</span>
    </div>
  );
}
