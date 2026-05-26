/**
 * /terms/credit — Terms of Service for the credit-wallet feature.
 *
 * This is the document the buyer accepts via checkbox before each
 * top-up. The version slug is hard-coded in
 * `app/api/credit/topup/route.ts` (CURRENT_CREDIT_TOS_VERSION); bump
 * both together when the language below changes so old acceptances
 * are not back-stamped onto the new wording.
 *
 * Kept deliberately plain — no client-side interactivity, no theme
 * variables. Reads cleanly on print + screen readers + email
 * back-references.
 */
import Link from "next/link";

export const dynamic = "force-static";

export const CREDIT_TOS_VERSION = "credit-2026-05-26";

export default function CreditTermsPage() {
  return (
    <main className="bg-white min-h-screen">
      <article className="mx-auto max-w-3xl px-6 py-12 sm:py-16 text-zinc-800 leading-relaxed">
        <header className="mb-10 pb-6 border-b border-zinc-200">
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-zinc-500 mb-2">
            Terms of Service
          </p>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            เงื่อนไขการเติมเครดิต (Credit Top-up)
          </h1>
          <p className="text-sm text-zinc-500">
            เวอร์ชัน:{" "}
            <span className="font-mono">{CREDIT_TOS_VERSION}</span>
          </p>
        </header>

        <section className="space-y-4 text-[15px]">
          <p>
            เอกสารฉบับนี้เป็นเงื่อนไขการให้บริการระบบเครดิตของ basketplace.co
            ผู้ใช้งานต้องยอมรับเงื่อนไขเหล่านี้ทุกครั้งก่อนทำรายการเติมเครดิต
            การกดปุ่ม "ยอมรับและดำเนินการต่อ" ถือเป็นการแสดงเจตนายอมรับเงื่อนไขทั้งหมด
            ที่ระบุไว้ในเอกสารฉบับนี้
          </p>

          <h2 className="text-lg font-bold text-zinc-900 pt-6">1. นิยาม</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>เครดิต</strong> หมายถึง หน่วยมูลค่าที่บันทึกไว้ในบัญชีของผู้ใช้
              สำหรับใช้ชำระค่าสินค้า/บริการ ภายในร้านค้าที่ผู้ใช้เติมเครดิตเข้า
              (per-store wallet)
            </li>
            <li>
              <strong>การเติมเครดิต</strong> หมายถึง การแลกเงินบาทเป็นเครดิตในอัตรา
              1 บาท = 1 บาทของเครดิต (ไม่มีโบนัสและไม่มีค่าธรรมเนียม)
            </li>
            <li>
              <strong>การชำระ</strong> เครดิตทุกบาททำผ่านผู้ให้บริการ AnyPay
              (Promptpay / บัตรเครดิต / BNPL) เท่านั้น
            </li>
          </ul>

          <h2 className="text-lg font-bold text-zinc-900 pt-6">
            2. นโยบายการคืนเงิน / การคืนเครดิต — สำคัญ
          </h2>
          <p>
            <strong>เครดิตที่เติมเข้าสู่ระบบแล้วไม่สามารถแลกเปลี่ยน
            หรือขอคืนเป็นเงินสดได้ไม่ว่ากรณีใด ๆ</strong> ผู้ใช้สามารถใช้
            เครดิตที่เหลือเพื่อชำระค่าสินค้าหรือบริการในร้านเดิมเท่านั้น
          </p>
          <p>
            กรณีเกิดข้อพิพาท (chargeback) จากบัตรเครดิตหรือผู้ให้บริการการชำระเงิน
            ทาง basketplace.co ขอสงวนสิทธิ์ในการระงับยอดเครดิตคงเหลือทันที
            จนกว่าข้อพิพาทจะได้รับการพิจารณาเสร็จสิ้น
          </p>

          <h2 className="text-lg font-bold text-zinc-900 pt-6">
            3. ขอบเขตการใช้งานเครดิต
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>เครดิตใช้ได้เฉพาะภายในร้านค้าที่ผู้ใช้เติม</li>
            <li>เครดิตไม่สามารถโอน/ขายต่อให้ผู้ใช้รายอื่น</li>
            <li>
              ระบบจะบันทึกการใช้เครดิตทุกครั้งใน Credit Ledger
              ที่ผู้ใช้สามารถเปิดดูได้ที่หน้า /account/credit
            </li>
          </ul>

          <h2 className="text-lg font-bold text-zinc-900 pt-6">
            4. หลักฐานการทำรายการ
          </h2>
          <p>
            เมื่อผู้ใช้เติมเครดิตสำเร็จ ระบบจะออกใบเสร็จ (Receipt)
            พร้อมหมายเลขอ้างอิงรูปแบบ <code>TOP-YYYYMMDD-XXXXXX</code>{" "}
            ส่งไปยังอีเมลของผู้ใช้ และเก็บบันทึก ได้แก่:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>วันที่และเวลาในการทำรายการ (UTC)</li>
            <li>หมายเลขธุรกรรมจากผู้ให้บริการ AnyPay</li>
            <li>IP Address และ User-Agent ของผู้ใช้ ณ ขณะทำรายการ</li>
            <li>เวอร์ชันของเงื่อนไขการให้บริการที่ผู้ใช้ยอมรับ</li>
          </ul>

          <h2 className="text-lg font-bold text-zinc-900 pt-6">
            5. การระงับและเพิกถอนสิทธิ์
          </h2>
          <p>
            basketplace.co ขอสงวนสิทธิ์ในการระงับหรือเพิกถอนยอดเครดิตคงเหลือ
            กรณีพบการใช้งานในลักษณะทุจริต ฟอกเงิน หรือผิดเงื่อนไขใด ๆ ในเอกสารฉบับนี้
            โดยไม่ต้องแจ้งให้ทราบล่วงหน้า
          </p>

          <h2 className="text-lg font-bold text-zinc-900 pt-6">
            6. การติดต่อ
          </h2>
          <p>
            หากมีคำถามหรือต้องการความช่วยเหลือ โปรดติดต่อทางอีเมลของร้านค้าที่ระบุไว้
            ในหน้าติดต่อของแต่ละร้าน หรือทางช่องทางที่ทาง basketplace.co
            กำหนดในอนาคต
          </p>
        </section>

        <footer className="mt-12 pt-6 border-t border-zinc-200 text-xs text-zinc-500">
          <p>
            อ่านนโยบายความเป็นส่วนตัวได้ที่{" "}
            <Link href="/privacy" className="underline hover:text-zinc-900">
              /privacy
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
