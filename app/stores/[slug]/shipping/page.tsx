/**
 * /stores/{slug}/shipping — Shipping policy.
 * Required by payment-gateway merchant approval.
 */
import { renderSchemaPage } from "../_lib/render-schema-page";

export const dynamic = "force-dynamic";

const SECTION_TITLE = "text-xl font-semibold mt-8 mb-3";
const PARAGRAPH = "text-base leading-relaxed mb-3";
const LIST = "list-disc list-inside space-y-1.5 mb-3";

const fallbackBody = (
  <div style={{ color: "var(--shop-ink)" }}>
    <p className={PARAGRAPH} style={{ color: "var(--shop-ink-muted)" }}>
      ทางร้านจัดส่งสินค้าภายในประเทศไทยทุกวันทำการ ขอให้ลูกค้าตรวจสอบที่อยู่
      ปลายทางก่อนยืนยันคำสั่งซื้อเพื่อให้กระบวนการรวดเร็วและไม่เสียค่าส่งซ้ำ
    </p>

    <h2 className={SECTION_TITLE}>ระยะเวลาจัดส่ง</h2>
    <ul className={LIST}>
      <li>กรุงเทพ และปริมณฑล: 1–2 วันทำการ</li>
      <li>ต่างจังหวัด (ในเมือง): 2–4 วันทำการ</li>
      <li>ต่างจังหวัด (ห่างไกล / เกาะ): 3–7 วันทำการ</li>
      <li>ทางร้านเตรียมสินค้าและส่งภายใน 1 วันทำการหลังชำระเงินสำเร็จ</li>
    </ul>

    <h2 className={SECTION_TITLE}>ค่าจัดส่ง</h2>
    <ul className={LIST}>
      <li>คำสั่งซื้อต่ำกว่า 990 บาท: ค่าส่ง 50 บาท (Kerry / Flash / J&T)</li>
      <li>คำสั่งซื้อตั้งแต่ 990 บาทขึ้นไป: ส่งฟรีทั่วประเทศ</li>
      <li>EMS / Express: คิดตามอัตราของไปรษณีย์ไทย (โปรดติดต่อร้านก่อน)</li>
    </ul>

    <h2 className={SECTION_TITLE}>ผู้ให้บริการขนส่ง</h2>
    <ul className={LIST}>
      <li>Kerry Express</li>
      <li>Flash Express</li>
      <li>J&amp;T Express</li>
      <li>ไปรษณีย์ไทย (ลงทะเบียน / EMS)</li>
    </ul>

    <h2 className={SECTION_TITLE}>การติดตามพัสดุ</h2>
    <p className={PARAGRAPH}>
      หลังจัดส่ง ทางร้านจะส่งเลขพัสดุไปทางอีเมลและดูได้ที่หน้า{" "}
      <span className="font-medium" style={{ color: "var(--shop-primary)" }}>
        คำสั่งซื้อของฉัน
      </span>{" "}
      ลูกค้าใช้เลขพัสดุไปติดตามที่เว็บของผู้ให้บริการขนส่งได้โดยตรง
    </p>

    <h2 className={SECTION_TITLE}>กรณีพัสดุล่าช้า / สูญหาย</h2>
    <ul className={LIST}>
      <li>ล่าช้าเกิน 7 วันทำการจากกำหนด: ติดต่อร้านพร้อมเลขพัสดุ</li>
      <li>พัสดุสูญหาย: ทางร้านดำเนินเรื่องเคลมกับขนส่งให้ภายใน 24–48 ชั่วโมง</li>
      <li>หากผู้รับไม่อยู่และพัสดุตีกลับ: ลูกค้ารับผิดชอบค่าส่งรอบใหม่</li>
    </ul>

    <h2 className={SECTION_TITLE}>การจัดส่งต่างประเทศ</h2>
    <p className={PARAGRAPH}>
      ปัจจุบันรองรับเฉพาะการจัดส่งภายในประเทศไทย — สำหรับลูกค้าต่างประเทศ
      โปรดติดต่อร้านโดยตรงเพื่อรับใบเสนอค่าจัดส่งล่วงหน้า
    </p>

    <p
      className="mt-6 rounded-lg border p-4 text-sm"
      style={{
        background: "var(--shop-muted)",
        borderColor: "var(--shop-border)",
        color: "var(--shop-ink-muted)",
      }}
    >
      หมายเหตุ: นโยบายข้างต้นเป็นแนวทางพื้นฐานของร้าน ค่าจัดส่งและระยะเวลา
      จริงอาจปรับตามขนาดและน้ำหนักสินค้า ระบบจะแสดงยอดสุทธิให้ลูกค้าเห็น
      ก่อนยืนยันคำสั่งซื้อเสมอ
    </p>
  </div>
);

export default async function ShippingPage({
  params,
}: {
  params: { slug: string };
}) {
  return renderSchemaPage({
    storeSlug: params.slug,
    pageSlug: "shipping",
    fallbackTitle: "นโยบายการจัดส่ง",
    fallbackBody,
  });
}
