/**
 * /stores/{slug}/returns — Returns / refund policy.
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
      ทางร้านยินดีรับคืนหรือเปลี่ยนสินค้าหากสินค้ามีปัญหาจากร้าน
      ตามเงื่อนไขด้านล่าง โปรดอ่านก่อนทำคำขอเพื่อให้กระบวนการรวดเร็ว
    </p>

    <h2 className={SECTION_TITLE}>เงื่อนไขการรับคืน / เปลี่ยนสินค้า</h2>
    <ul className={LIST}>
      <li>สินค้าชำรุดเสียหายจากการขนส่ง — แจ้งภายใน 24 ชั่วโมงพร้อมรูปถ่าย</li>
      <li>สินค้าไม่ตรงตามคำสั่งซื้อ (ผิดสี ผิดขนาด ผิดรุ่น)</li>
      <li>สินค้าใช้งานไม่ได้ตั้งแต่แกะกล่อง — แจ้งภายใน 7 วัน</li>
      <li>สินค้าไม่ได้รับภายใน 14 วันหลังชำระเงิน</li>
    </ul>

    <h2 className={SECTION_TITLE}>กรณีที่ไม่รับคืน</h2>
    <ul className={LIST}>
      <li>เปลี่ยนใจหลังสั่งซื้อ (ไม่มีความเสียหาย)</li>
      <li>สินค้าถูกใช้งานเกินสภาพปกติหรือเสียหายจากการใช้งานผิดวิธี</li>
      <li>สินค้าหมดอายุการรับคืนแล้ว (เกิน 7 วันนับจากวันที่รับสินค้า)</li>
      <li>สินค้าประเภท digital / serial key ที่ส่งมอบแล้ว</li>
    </ul>

    <h2 className={SECTION_TITLE}>ขั้นตอนการขอคืน / เปลี่ยน</h2>
    <ol className="list-decimal list-inside space-y-1.5 mb-3">
      <li>
        ติดต่อร้านที่หน้า{" "}
        <span className="font-medium" style={{ color: "var(--shop-primary)" }}>
          ติดต่อร้าน
        </span>{" "}
        พร้อมแจ้งเลขคำสั่งซื้อ + เหตุผล + รูปถ่าย/วิดีโอประกอบ
      </li>
      <li>ทีมงานตอบกลับภายใน 24–48 ชั่วโมงทำการ</li>
      <li>หากได้รับอนุมัติ — ส่งสินค้ากลับตามที่อยู่ที่แจ้ง</li>
      <li>ทางร้านตรวจรับ และคืนเงิน / ส่งสินค้าใหม่ภายใน 3–7 วันทำการ</li>
    </ol>

    <h2 className={SECTION_TITLE}>ค่าใช้จ่ายในการส่งคืน</h2>
    <ul className={LIST}>
      <li>
        <span className="font-medium">กรณีร้านผิด</span> (ส่งผิด/ชำรุด): ร้านรับผิดชอบค่าส่งคืน
      </li>
      <li>
        <span className="font-medium">กรณีลูกค้าเปลี่ยนใจ:</span> ลูกค้ารับผิดชอบค่าส่งทั้งสองทาง
      </li>
    </ul>

    <h2 className={SECTION_TITLE}>ระยะเวลาคืนเงิน</h2>
    <ul className={LIST}>
      <li>ตรวจสอบคำขอ: 1–3 วันทำการ</li>
      <li>คืนผ่านบัตรเครดิต: 7–14 วันทำการ (ขึ้นกับธนาคารผู้ออกบัตร)</li>
      <li>คืนผ่านบัญชีธนาคาร / PromptPay: 3–7 วันทำการ</li>
    </ul>

    <p
      className="mt-6 rounded-lg border p-4 text-sm"
      style={{
        background: "var(--shop-muted)",
        borderColor: "var(--shop-border)",
        color: "var(--shop-ink-muted)",
      }}
    >
      หมายเหตุ: นโยบายข้างต้นเป็นแนวทางพื้นฐานของร้าน เงื่อนไขเพิ่มเติม
      สามารถสอบถามทีมงานก่อนทำการสั่งซื้อได้
    </p>
  </div>
);

export default async function ReturnsPage({
  params,
}: {
  params: { slug: string };
}) {
  return renderSchemaPage({
    storeSlug: params.slug,
    pageSlug: "returns",
    fallbackTitle: "นโยบายการคืนสินค้า",
    fallbackBody,
  });
}
