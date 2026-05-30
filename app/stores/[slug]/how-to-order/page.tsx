import { renderSchemaPage } from "../_lib/render-schema-page";

export const dynamic = "force-dynamic";

const SECTION_TITLE = "text-xl font-semibold mt-8 mb-3";
const PARAGRAPH = "text-base leading-relaxed mb-3";
const LIST = "list-disc list-inside space-y-1.5 mb-3";

const fallbackBody = (
  <div style={{ color: "var(--shop-ink)" }}>
    <p className={PARAGRAPH} style={{ color: "var(--shop-ink-muted)" }}>
      คุณสามารถสั่งซื้อสินค้าได้อย่างง่ายดายผ่านเว็บไซต์ของเรา โดยทำตามขั้นตอนดังนี้
    </p>

    <h2 className={SECTION_TITLE}>ขั้นตอนการสั่งซื้อ</h2>
    <ol className="list-decimal list-inside space-y-1.5 mb-3">
      <li>เลือกสินค้าที่ต้องการ แล้วกดปุ่ม <strong>เพิ่มลงตะกร้า</strong> หรือ <strong>ซื้อเลย</strong></li>
      <li>เข้าไปที่ตะกร้าสินค้า ตรวจสอบรายการและจำนวนสินค้าให้ถูกต้อง</li>
      <li>กดปุ่ม <strong>ดำเนินการสั่งซื้อ</strong> หรือ <strong>ชำระเงิน</strong></li>
      <li>กรอกข้อมูลการจัดส่งและข้อมูลสำหรับติดต่อให้ครบถ้วน</li>
      <li>ดำเนินการชำระเงินผ่าน <strong>ออนไลน์</strong></li>
      <li>เมื่อทำรายการเสร็จสิ้น คุณจะได้รับอีเมลยืนยันคำสั่งซื้อ</li>
    </ol>

    <h2 className={SECTION_TITLE}>การชำระเงิน</h2>
    <p className={PARAGRAPH}>
      ระบบของเรารองรับการชำระเงินอย่างปลอดภัย
    </p>

    <h2 className={SECTION_TITLE}>การตรวจสอบสถานะคำสั่งซื้อ</h2>
    <p className={PARAGRAPH}>
      หลังจากสั่งซื้อเสร็จสิ้น คุณสามารถตรวจสอบสถานะคำสั่งซื้อและรับเลขพัสดุสำหรับติดตามการจัดส่งได้ที่หน้า <strong>บัญชีของฉัน</strong> หรือทางอีเมลที่เราส่งให้
    </p>

    <p
      className="mt-6 rounded-lg border p-4 text-sm"
      style={{
        background: "var(--shop-muted)",
        borderColor: "var(--shop-border)",
        color: "var(--shop-ink-muted)",
      }}
    >
      หากพบปัญหาหรือมีข้อสงสัยในการสั่งซื้อ สามารถติดต่อสอบถามทีมงานได้ตลอดเวลา
    </p>
  </div>
);

export default async function HowToOrderPage({
  params,
}: {
  params: { slug: string };
}) {
  return renderSchemaPage({
    storeSlug: params.slug,
    pageSlug: "how-to-order",
    fallbackTitle: "วิธีการสั่งซื้อ",
    fallbackBody,
  });
}
