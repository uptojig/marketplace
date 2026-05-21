import { HelpSearch } from './help-search';

export const metadata = {
  title: 'ศูนย์ช่วยเหลือ (Help Center) — Basketplace',
  description: 'ค้นหาคำแนะนำการสั่งซื้อ วิธีการชำระเงิน การจัดส่งสินค้า การยกเลิก การคืนสินค้า และตอบข้อสงสัยคำถามพบบ่อย',
};

export default function HelpIndex() {
  return <HelpSearch />;
}
