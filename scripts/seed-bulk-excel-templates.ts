/**
 * One-shot seed: bulk-create 59 Excel-template products on the sheetlab
 * store from a directory of cover images.
 *
 *   pnpm tsx scripts/seed-bulk-excel-templates.ts <imageDir>
 *
 * The directory should contain JPEG files (any naming) — the script
 * sorts them by name + maps each to one entry in the curated catalog
 * below. Idempotent on externalProductId, so re-running updates rather
 * than duplicates. Any sheetlab products whose externalProductId is
 * not in the current TEMPLATES list will be deactivated (active=false)
 * to clean up orphans from prior runs that had more entries.
 *
 * Requires env: DATABASE_URL, SPACES_ENDPOINT/REGION/BUCKET/KEY/SECRET.
 * Designed to run inside the marketplace-control docker container on
 * the droplet so it inherits the production env.
 */
import { readdir, readFile } from "node:fs/promises";
import * as path from "node:path";
import { PrismaClient } from "@prisma/client";
import { uploadBuffer, isSpacesConfigured } from "../lib/storage/spaces";

const prisma = new PrismaClient();

const STORE_SLUG = "sheetlab-th";

// 59 curated Thai SME Excel template entries spread across 6 buckets.
// Order matches the alphabetically-sorted image list so each image
// lands on the matching slot. Edit titles here if the cover better
// fits a different topic — the script preserves slot order.
interface TemplateEntry {
  externalProductId: string; // stable key for idempotency
  title: string;
  titleTh: string;
  descriptionTh: string;
  categoryName: string;
  priceTHB: number;
  compareAtPriceTHB?: number;
}

const TEMPLATES: TemplateEntry[] = [
  // ── การเงิน · บัญชี (13) ─────────────────────────────────────
  { externalProductId: "tpl-fin-01", title: "Monthly Income & Expense Tracker", titleTh: "เทมเพลตงบรายรับ-รายจ่ายรายเดือน", descriptionTh: "บันทึกรายรับ-รายจ่ายส่วนตัวหรือธุรกิจขนาดเล็ก สรุปยอดรวม + กราฟแยกประเภทอัตโนมัติ พร้อมใช้ทันที", categoryName: "การเงิน", priceTHB: 99 },
  { externalProductId: "tpl-fin-02", title: "P&L Statement Template", titleTh: "เทมเพลตงบกำไรขาดทุน (P&L)", descriptionTh: "งบกำไรขาดทุนมาตรฐานสำหรับ SME ไทย รายเดือน · รายไตรมาส · รายปี พร้อมสูตรอัตโนมัติทุกบรรทัด", categoryName: "การเงิน", priceTHB: 199 },
  { externalProductId: "tpl-fin-03", title: "Cash Flow Statement", titleTh: "งบกระแสเงินสด Cash Flow Statement", descriptionTh: "ติดตามเงินสดเข้า-ออกจริงรายเดือน แยก operating · investing · financing พร้อมพยากรณ์ 12 เดือนข้างหน้า", categoryName: "การเงิน", priceTHB: 290 },
  { externalProductId: "tpl-fin-04", title: "Personal Income Tax Calculator", titleTh: "เครื่องคำนวณภาษีเงินได้บุคคลธรรมดา (ภงด.90/91)", descriptionTh: "คำนวณภาษีปี 2568 ตามอัตราล่าสุด รวมค่าลดหย่อนทุกประเภท พร้อมจำลองหลายสถานการณ์", categoryName: "การเงิน", priceTHB: 250 },
  { externalProductId: "tpl-fin-05", title: "Withholding Tax Calculator", titleTh: "เครื่องคำนวณภาษีหัก ณ ที่จ่าย (ภงด.3 / ภงด.53)", descriptionTh: "คำนวณภาษีหัก ณ ที่จ่ายอัตโนมัติ พร้อมแบบฟอร์ม ภงด.3 / 53 พิมพ์ส่งสรรพากรได้ทันที", categoryName: "การเงิน", priceTHB: 250 },
  { externalProductId: "tpl-fin-06", title: "Balance Sheet Template", titleTh: "งบดุล (Balance Sheet) มาตรฐานไทย", descriptionTh: "งบแสดงฐานะการเงินตามมาตรฐานบัญชีไทย สินทรัพย์ · หนี้สิน · ส่วนของเจ้าของ รวมสูตรตรวจสมดุลอัตโนมัติ", categoryName: "บัญชี", priceTHB: 199 },
  { externalProductId: "tpl-fin-07", title: "Investment Portfolio Tracker", titleTh: "เทมเพลตติดตามพอร์ตการลงทุน", descriptionTh: "ติดตามหุ้น · กองทุน · คริปโต พร้อมคำนวณ ROI · กราฟแสดง asset allocation อัตโนมัติ", categoryName: "การเงิน", priceTHB: 299 },
  { externalProductId: "tpl-fin-08", title: "Compound Interest Calculator", titleTh: "เครื่องคำนวณดอกเบี้ยทบต้น", descriptionTh: "วางแผนการออม การลงทุนระยะยาว รวมสูตร DCA + กราฟแสดงผลทบต้น 1-30 ปี", categoryName: "การเงิน", priceTHB: 99 },
  { externalProductId: "tpl-fin-09", title: "Home Loan Amortization Schedule", titleTh: "ตารางผ่อนชำระสินเชื่อบ้าน (Amortization)", descriptionTh: "คำนวณเงินงวด ดอกเบี้ย เงินต้น พร้อมตารางผ่อนรายเดือนทุกงวด รองรับการ refinance", categoryName: "การเงิน", priceTHB: 149 },
  { externalProductId: "tpl-fin-10", title: "Quarterly Financial Report", titleTh: "งบการเงินรวมรายไตรมาส (Quarterly P&L)", descriptionTh: "สรุปงบรายไตรมาสพร้อมเปรียบเทียบกับงวดเดิม กราฟแสดง trend yoy · qoq อัตโนมัติ", categoryName: "บัญชี", priceTHB: 290 },
  { externalProductId: "tpl-fin-11", title: "Personal Budget Planner", titleTh: "เทมเพลตวางแผนงบรายจ่ายส่วนตัว", descriptionTh: "แบ่งงบ 50/30/20 พร้อมเตือนเมื่อใช้เกินงบ ติดตามเป้าหมายการออม + หนี้สินรายเดือน", categoryName: "การเงิน", priceTHB: 99 },
  { externalProductId: "tpl-fin-12", title: "Break-Even Point Calculator", titleTh: "เครื่องคำนวณจุดคุ้มทุน (Break-even Point)", descriptionTh: "หา BEP ของธุรกิจคุณจาก fixed cost · variable cost · ราคาขาย พร้อมกราฟ Cost-Volume-Profit", categoryName: "การเงิน", priceTHB: 199 },
  { externalProductId: "tpl-fin-13", title: "ROI / ROAS / CAC Calculator", titleTh: "เครื่องคำนวณ ROI / ROAS / CAC / LTV", descriptionTh: "วัดประสิทธิภาพการลงทุนและการตลาด แดชบอร์ดสรุปอัตโนมัติ พร้อม benchmark อุตสาหกรรม", categoryName: "การเงิน", priceTHB: 299 },

  // ── การตลาด · ขาย (10) ───────────────────────────────────────
  { externalProductId: "tpl-mkt-01", title: "Multi-Platform Ad ROAS Tracker", titleTh: "เครื่องคำนวณ ROAS โฆษณา Meta + Google + TikTok", descriptionTh: "รวมยอดโฆษณาทุกแพลตฟอร์มในที่เดียว แดชบอร์ดเปรียบเทียบ ROAS · CPM · CPC อัตโนมัติ", categoryName: "การตลาด", priceTHB: 290 },
  { externalProductId: "tpl-mkt-02", title: "Monthly Content Calendar", titleTh: "ตาราง Content Calendar รายเดือน (IG · FB · TikTok)", descriptionTh: "วางแผนคอนเทนต์ 30 วันล่วงหน้า รองรับทุกแพลตฟอร์ม พร้อม template caption + hashtag bank", categoryName: "การตลาด", priceTHB: 149 },
  { externalProductId: "tpl-mkt-03", title: "Ad Performance Dashboard", titleTh: "Dashboard ติดตาม Performance โฆษณา", descriptionTh: "สรุปแคมเปญทั้งหมดในที่เดียว KPI · spend · revenue · ROAS แสดงเป็นกราฟ pivot ปรับได้", categoryName: "การตลาด", priceTHB: 390 },
  { externalProductId: "tpl-mkt-04", title: "CPC / CPM / CPA Calculator", titleTh: "เครื่องคำนวณค่า CPC / CPM / CPA / CTR", descriptionTh: "คำนวณเมตริกโฆษณาแบบ reverse engineering — หา ROAS เป้าหมายเพื่อกำหนด bid ที่เหมาะสม", categoryName: "การตลาด", priceTHB: 99 },
  { externalProductId: "tpl-mkt-05", title: "Email Marketing Planner", titleTh: "ตารางวางแผน Email Marketing", descriptionTh: "วางลำดับ email sequence + tracking open rate · CTR · conversion พร้อม A/B test template", categoryName: "การตลาด", priceTHB: 199 },
  { externalProductId: "tpl-mkt-06", title: "Influencer Campaign Tracker", titleTh: "เทมเพลตติดตามแคมเปญ Influencer / KOL", descriptionTh: "บันทึกค่าใช้จ่าย · engagement · sales conversion ของ KOL แต่ละราย พร้อมจัดอันดับ ROI", categoryName: "การตลาด", priceTHB: 290 },
  { externalProductId: "tpl-mkt-07", title: "Customer Acquisition Cost Calculator", titleTh: "เครื่องคำนวณต้นทุนการได้ลูกค้า (CAC) + LTV", descriptionTh: "หา CAC · LTV · CAC payback period ของธุรกิจคุณ พร้อม cohort analysis รายเดือน", categoryName: "การตลาด", priceTHB: 299 },
  { externalProductId: "tpl-mkt-08", title: "A/B Test Results Analyzer", titleTh: "ตาราง A/B Test Results Analysis", descriptionTh: "วิเคราะห์ผล A/B test ทางสถิติ คำนวณ confidence level · sample size อัตโนมัติ", categoryName: "การตลาด", priceTHB: 199 },
  { externalProductId: "tpl-mkt-09", title: "Marketing Funnel Tracker", titleTh: "เทมเพลต Marketing Funnel Tracker", descriptionTh: "ติดตามลูกค้าตั้งแต่ awareness → conversion เห็น drop-off แต่ละขั้น พร้อม conversion rate", categoryName: "การตลาด", priceTHB: 199 },
  { externalProductId: "tpl-mkt-10", title: "Social Media Analytics Dashboard", titleTh: "Dashboard Social Media Analytics รวมทุกแพลตฟอร์ม", descriptionTh: "ติดตาม follower growth · engagement · reach · top posts สรุปรายสัปดาห์อัตโนมัติ", categoryName: "การตลาด", priceTHB: 390 },

  // ── HR · เงินเดือน (8) ───────────────────────────────────────
  { externalProductId: "tpl-hr-01", title: "Payroll & Social Security Calculator", titleTh: "เทมเพลตคิดเงินเดือน + ประกันสังคม (สปส.1-10)", descriptionTh: "คำนวณเงินเดือน · OT · ภาษีหัก ณ ที่จ่าย · ประกันสังคมอัตโนมัติ พร้อมแบบ สปส.1-10", categoryName: "HR", priceTHB: 490 },
  { externalProductId: "tpl-hr-02", title: "Leave Management Tracker", titleTh: "ตารางจัดการการลางาน (Leave Tracker)", descriptionTh: "ติดตามการลาพักร้อน · ลาป่วย · ลากิจของพนักงานทั้งบริษัท แสดงปฏิทินภาพรวมทีม", categoryName: "HR", priceTHB: 199 },
  { externalProductId: "tpl-hr-03", title: "KPI Evaluation Template", titleTh: "เทมเพลตประเมินผลพนักงาน KPI", descriptionTh: "แบบประเมินผลแบบ KPI + 360° feedback พร้อมสรุปเป็นคะแนนรวม + กราฟ radar", categoryName: "HR", priceTHB: 290 },
  { externalProductId: "tpl-hr-04", title: "OT Calculator", titleTh: "ตารางคำนวณ OT + เงินเพิ่มพิเศษ", descriptionTh: "คำนวณ OT 1x · 1.5x · 3x ตามกฎหมายแรงงานไทย แยกวันทำงาน-วันหยุดอัตโนมัติ", categoryName: "HR", priceTHB: 149 },
  { externalProductId: "tpl-hr-05", title: "Recruitment Pipeline Tracker", titleTh: "เทมเพลตติดตามการสรรหา (Recruitment Pipeline)", descriptionTh: "ติดตามผู้สมัครตั้งแต่ application → offer แสดงเป็น kanban พร้อมเวลาเฉลี่ยแต่ละขั้น", categoryName: "HR", priceTHB: 199 },
  { externalProductId: "tpl-hr-06", title: "Employee Onboarding Checklist", titleTh: "เทมเพลต Checklist พนักงานใหม่ (Onboarding)", descriptionTh: "รายการตรวจสอบ 30 · 60 · 90 วันแรก พร้อม survey feedback + culture fit assessment", categoryName: "HR", priceTHB: 99 },
  { externalProductId: "tpl-hr-07", title: "Hourly Wage Calculator", titleTh: "ตารางคำนวณค่าจ้างรายชั่วโมง / รายวัน", descriptionTh: "คำนวณค่าจ้างพาร์ทไทม์ · รายชั่วโมง · ฟรีแลนซ์ พร้อมหัก SSO · ภาษีอัตโนมัติ", categoryName: "HR", priceTHB: 149 },
  { externalProductId: "tpl-hr-08", title: "Total Employee Cost Estimator", titleTh: "เทมเพลตประมาณการต้นทุนพนักงาน (Total Employee Cost)", descriptionTh: "คำนวณต้นทุนรวมต่อพนักงาน — เงินเดือน · สวัสดิการ · OT · training · overhead", categoryName: "HR", priceTHB: 290 },

  // ── คลังสินค้า · Inventory (8) ───────────────────────────────
  { externalProductId: "tpl-inv-01", title: "FIFO/LIFO Inventory Tracker", titleTh: "Inventory Tracker FIFO / LIFO + ต้นทุน", descriptionTh: "ติดตามสต็อกแบบ FIFO หรือ LIFO คำนวณต้นทุนสินค้าคงเหลือ · COGS อัตโนมัติ", categoryName: "คลังสินค้า", priceTHB: 390 },
  { externalProductId: "tpl-inv-02", title: "Stock Reorder Point Calculator", titleTh: "เทมเพลตคำนวณจุดสั่งซื้อใหม่ (Reorder Point)", descriptionTh: "หา reorder point · safety stock · EOQ ของแต่ละ SKU พร้อมเตือนเมื่อใกล้จุดสั่งซื้อ", categoryName: "คลังสินค้า", priceTHB: 199 },
  { externalProductId: "tpl-inv-03", title: "Monthly Stocktake Sheet", titleTh: "ตารางตรวจนับสต็อกรายเดือน", descriptionTh: "แบบฟอร์มนับสต็อกแบบมืออาชีพ — เปรียบเทียบ book vs actual หา variance อัตโนมัติ", categoryName: "คลังสินค้า", priceTHB: 149 },
  { externalProductId: "tpl-inv-04", title: "Warehouse Capacity Planner", titleTh: "เทมเพลตวางแผนพื้นที่คลังสินค้า", descriptionTh: "วาง layout คลัง · คำนวณ utilization rate · suggest reorganization ตามความถี่ pick", categoryName: "คลังสินค้า", priceTHB: 290 },
  { externalProductId: "tpl-inv-05", title: "Supplier Comparison Tool", titleTh: "เทมเพลตเปรียบเทียบ Supplier", descriptionTh: "เปรียบเทียบ supplier 5-10 ราย แบบ weighted scoring — ราคา · MOQ · lead time · quality", categoryName: "คลังสินค้า", priceTHB: 199 },
  { externalProductId: "tpl-inv-06", title: "Purchase Order Tracker", titleTh: "เทมเพลตจัดการใบสั่งซื้อ (Purchase Order)", descriptionTh: "ออก PO · ติดตามสถานะรับของ · จับคู่ invoice พร้อม 3-way matching อัตโนมัติ", categoryName: "คลังสินค้า", priceTHB: 199 },
  { externalProductId: "tpl-inv-07", title: "ABC Inventory Analysis", titleTh: "เทมเพลตวิเคราะห์สต็อก ABC Analysis", descriptionTh: "แบ่งสินค้าเป็น A/B/C ตาม revenue contribution หา top 20% ที่ทำรายได้ 80%", categoryName: "คลังสินค้า", priceTHB: 290 },
  { externalProductId: "tpl-inv-08", title: "Inventory Turnover Calculator", titleTh: "เทมเพลตคำนวณ Inventory Turnover Ratio", descriptionTh: "หา turnover ratio · days inventory outstanding ของแต่ละ SKU เพื่อหา slow-mover", categoryName: "คลังสินค้า", priceTHB: 199 },

  // ── E-commerce · ขายของออนไลน์ (10) ──────────────────────────
  { externalProductId: "tpl-ec-01", title: "Marketplace Sales Dashboard", titleTh: "Dashboard ติดตามยอดขาย Shopee · Lazada · TikTok Shop", descriptionTh: "รวมยอดขายจากทุกแพลตฟอร์มในที่เดียว แสดง revenue · units · top SKU พร้อม trend", categoryName: "E-commerce", priceTHB: 590 },
  { externalProductId: "tpl-ec-02", title: "Online Store P&L", titleTh: "เทมเพลต P&L ร้านค้าออนไลน์", descriptionTh: "งบกำไรขาดทุนเฉพาะร้าน Shopee/Lazada — หักค่า commission · ads · shipping อัตโนมัติ", categoryName: "E-commerce", priceTHB: 290 },
  { externalProductId: "tpl-ec-03", title: "Order Fulfillment Tracker", titleTh: "เทมเพลตติดตามการจัดส่ง (Order Fulfillment)", descriptionTh: "ติดตามสถานะออเดอร์ตั้งแต่ pack · ship · delivered พร้อม SLA fulfillment time", categoryName: "E-commerce", priceTHB: 199 },
  { externalProductId: "tpl-ec-04", title: "Marketplace Fee Calculator", titleTh: "เทมเพลตคำนวณค่าธรรมเนียม Marketplace", descriptionTh: "คำนวณ commission · transaction fee · shipping fee ของแต่ละแพลตฟอร์ม หา net profit จริง", categoryName: "E-commerce", priceTHB: 149 },
  { externalProductId: "tpl-ec-05", title: "Customer Lifetime Value Analysis", titleTh: "ตารางวิเคราะห์ Customer Lifetime Value (LTV)", descriptionTh: "หา LTV ต่อ cohort + AOV · purchase frequency · churn rate พร้อม retention curve", categoryName: "E-commerce", priceTHB: 290 },
  { externalProductId: "tpl-ec-06", title: "Refund & Return Tracker", titleTh: "เทมเพลตติดตาม Refund / Return", descriptionTh: "บันทึก return rate · เหตุผลคืนสินค้า · refund amount หา top-return SKU เพื่อแก้ไข", categoryName: "E-commerce", priceTHB: 149 },
  { externalProductId: "tpl-ec-07", title: "Conversion Funnel Analysis", titleTh: "เทมเพลตวิเคราะห์ Conversion Funnel", descriptionTh: "หา conversion rate แต่ละขั้น — view → cart → checkout → paid พร้อม drop-off heatmap", categoryName: "E-commerce", priceTHB: 199 },
  { externalProductId: "tpl-ec-08", title: "Best-Seller Top 10 Dashboard", titleTh: "Dashboard ติดตามสินค้าขายดี Top 10 รายวัน", descriptionTh: "อัพเดทสินค้าขายดี top 10 ทุกวัน · สัปดาห์ · เดือน แสดง trend movement up/down", categoryName: "E-commerce", priceTHB: 290 },
  { externalProductId: "tpl-ec-09", title: "Retail Pricing Calculator", titleTh: "เทมเพลตคำนวณราคาขายสินค้า (Markup + Margin)", descriptionTh: "ตั้งราคาขายจาก cost + target margin คำนวณ markup · margin · break-even pricing", categoryName: "E-commerce", priceTHB: 149 },
  { externalProductId: "tpl-ec-10", title: "Cart Abandonment Analyzer", titleTh: "เทมเพลตวิเคราะห์ Cart Abandonment", descriptionTh: "หาสาเหตุ cart abandonment · recovery rate ของ remarketing campaign", categoryName: "E-commerce", priceTHB: 199 },

  // ── Dashboard · BI (10) ──────────────────────────────────────
  { externalProductId: "tpl-dsb-01", title: "SME KPI Dashboard", titleTh: "KPI Dashboard สำหรับ SME (ครบทุกฝ่าย)", descriptionTh: "แดชบอร์ดรวม KPI sales · finance · ops · HR ในหน้าเดียว update อัตโนมัติจาก data sheet", categoryName: "แดชบอร์ด", priceTHB: 490 },
  { externalProductId: "tpl-dsb-02", title: "Sales Dashboard with Charts", titleTh: "Sales Dashboard พร้อมกราฟ interactive", descriptionTh: "แดชบอร์ดยอดขายเชิงลึก — by product · region · sales rep · channel พร้อม drill-down", categoryName: "แดชบอร์ด", priceTHB: 390 },
  { externalProductId: "tpl-dsb-03", title: "Operations Dashboard", titleTh: "Operations Dashboard ฝ่ายปฏิบัติการ", descriptionTh: "ติดตามตัวชี้วัด operation — productivity · downtime · OEE · throughput รายวัน", categoryName: "แดชบอร์ด", priceTHB: 390 },
  { externalProductId: "tpl-dsb-04", title: "Financial Health Dashboard", titleTh: "Financial Health Dashboard สำหรับเจ้าของธุรกิจ", descriptionTh: "ตรวจสุขภาพการเงินรายเดือน — liquidity · profitability · efficiency · solvency ratios", categoryName: "แดชบอร์ด", priceTHB: 490 },
  { externalProductId: "tpl-dsb-05", title: "Project Management Dashboard", titleTh: "Project Management Dashboard (Gantt + Kanban)", descriptionTh: "บริหารหลายโปรเจกต์พร้อมกัน — Gantt chart · Kanban · burn-down · resource allocation", categoryName: "แดชบอร์ด", priceTHB: 390 },
  { externalProductId: "tpl-dsb-06", title: "Customer Support Dashboard", titleTh: "Customer Support Dashboard (CS KPI)", descriptionTh: "ติดตาม ticket volume · response time · CSAT · NPS รายวัน-รายสัปดาห์", categoryName: "แดชบอร์ด", priceTHB: 290 },
  { externalProductId: "tpl-dsb-07", title: "Production Line Dashboard", titleTh: "Production Line Dashboard (โรงงาน · OEE)", descriptionTh: "ติดตาม OEE · availability · performance · quality รายเครื่องจักร พร้อม downtime log", categoryName: "แดชบอร์ด", priceTHB: 490 },
  { externalProductId: "tpl-dsb-08", title: "Quality Control Dashboard", titleTh: "Quality Control Dashboard (QC · Defect tracking)", descriptionTh: "ติดตาม defect rate · top defect type · supplier quality พร้อม Pareto chart", categoryName: "แดชบอร์ด", priceTHB: 290 },
  { externalProductId: "tpl-dsb-09", title: "Executive Summary Dashboard", titleTh: "Executive Summary Dashboard สำหรับผู้บริหาร", descriptionTh: "สรุปผลประกอบการรายไตรมาส 1 หน้า — revenue · profit · headcount · cash · key risks", categoryName: "แดชบอร์ด", priceTHB: 590 },
  { externalProductId: "tpl-dsb-10", title: "Weekly Business Review Dashboard", titleTh: "Weekly Business Review Dashboard", descriptionTh: "แดชบอร์ดสำหรับประชุม WBR รายสัปดาห์ — KPI variance · top risk · weekly highlights", categoryName: "แดชบอร์ด", priceTHB: 290 },
];

if (TEMPLATES.length !== 59) {
  console.error(`Template count is ${TEMPLATES.length}, expected 59`);
  process.exit(1);
}

async function main() {
  const imageDir = process.argv[2];
  if (!imageDir) {
    console.error("Usage: tsx scripts/seed-bulk-excel-templates.ts <imageDir>");
    process.exit(1);
  }
  if (!isSpacesConfigured()) {
    console.error("SPACES_ENDPOINT / SPACES_BUCKET / SPACES_KEY / SPACES_SECRET must be set");
    process.exit(1);
  }

  const store = await prisma.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { id: true, slug: true },
  });
  if (!store) {
    console.error(`Store "${STORE_SLUG}" not found`);
    process.exit(1);
  }
  console.log(`Store: ${store.slug} (${store.id})`);

  const files = (await readdir(imageDir))
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort((a, b) => {
      // Natural numeric sort — Cove_1, Cove_2, ..., Cove_10
      const numA = parseInt(a.match(/(\d+)/)?.[1] ?? "0", 10);
      const numB = parseInt(b.match(/(\d+)/)?.[1] ?? "0", 10);
      return numA - numB || a.localeCompare(b);
    });

  console.log(`Found ${files.length} images in ${imageDir}`);
  if (files.length < TEMPLATES.length) {
    console.error(`Need ${TEMPLATES.length} images, found ${files.length}`);
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  let imageUploaded = 0;

  for (let i = 0; i < TEMPLATES.length; i++) {
    const tpl = TEMPLATES[i];
    const file = files[i];
    const filePath = path.join(imageDir, file);

    // Upload image to Spaces — idempotent via fixedKey so re-runs reuse
    // the same public URL.
    const ext = path.extname(file).toLowerCase().replace(".", "") || "jpeg";
    const buffer = await readFile(filePath);
    const { publicUrl } = await uploadBuffer({
      prefix: `products/${STORE_SLUG}`,
      filename: `${tpl.externalProductId}.${ext}`,
      contentType: ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg",
      body: buffer,
      fixedKey: `products/${STORE_SLUG}/${tpl.externalProductId}.${ext}`,
    });
    imageUploaded++;

    const existing = await prisma.product.findFirst({
      where: { storeId: store.id, externalProductId: tpl.externalProductId },
      select: { id: true },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          title: tpl.title,
          titleTh: tpl.titleTh,
          descriptionTh: tpl.descriptionTh,
          priceTHB: tpl.priceTHB,
          compareAtPriceTHB: tpl.compareAtPriceTHB ?? null,
          imageUrl: publicUrl,
          categoryName: tpl.categoryName,
          productType: "DIGITAL",
          digitalKind: "EXCEL",
          active: true,
        },
      });
      updated++;
    } else {
      await prisma.product.create({
        data: {
          storeId: store.id,
          supplier: "MOCK",
          externalProductId: tpl.externalProductId,
          title: tpl.title,
          titleTh: tpl.titleTh,
          descriptionTh: tpl.descriptionTh,
          priceTHB: tpl.priceTHB,
          compareAtPriceTHB: tpl.compareAtPriceTHB ?? null,
          imageUrl: publicUrl,
          categoryName: tpl.categoryName,
          productType: "DIGITAL",
          digitalKind: "EXCEL",
          active: true,
        },
      });
      created++;
    }

    if ((i + 1) % 10 === 0 || i === TEMPLATES.length - 1) {
      console.log(`  ${i + 1}/${TEMPLATES.length} — ${created} created, ${updated} updated, ${imageUploaded} images uploaded`);
    }
  }

  // Deactivate orphan bulk-template products — only those with the `tpl-`
  // prefix (this script's own namespace) so we never touch the curated
  // SHEETLAB-* products from seed-sheetlab-formula-store.ts. Drops the
  // 10 entries removed from this run: tpl-fin-14/15, tpl-mkt-11/12,
  // tpl-hr-09/10, tpl-inv-09/10, tpl-ec-11/12.
  const keepIds = TEMPLATES.map((t) => t.externalProductId);
  const orphans = await prisma.product.updateMany({
    where: {
      storeId: store.id,
      active: true,
      externalProductId: { startsWith: "tpl-", notIn: keepIds },
    },
    data: { active: false },
  });

  console.log(`\nDone: ${created} created, ${updated} updated, ${imageUploaded} images uploaded`);
  console.log(`Deactivated ${orphans.count} orphan products no longer in TEMPLATES`);
  console.log(`Visit https://basketplace.co/stores/${STORE_SLUG}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
