/**
 * Shared help adapter — generic FAQ + contact page used by templates
 * that don't ship a bespoke Help component.
 *
 * IMPORTANT: this module must NOT be `'use client'`. lib/templates/registry.ts
 * CALLS `makeHelpAdapter()` at module top-level while building its `templates`
 * map, and registry is reachable from server modules (e.g. /api/admin/stores
 * → lib/store/template-fields → registry). If the factory lived in a client
 * module the call resolved to a client-reference proxy and threw
 * "TypeError: rS is not a function" while collecting page data — breaking
 * every build (same pattern that broke pdp-adapter; see commit 6122a97).
 * The component renders only static JSX (the `<Accordion>` it embeds is
 * itself `'use client'` and owns its own boundary).
 *
 * Renders a hero, a 6-question Thai FAQ accordion, and a contact CTA
 * block linking back to /faq + /contact (and the store's email/phone
 * if the schema exposes them). Everything reads from CSS vars
 * (`--shop-primary`, `--shop-accent`, `--shop-bg`, `--shop-ink`,
 * `--shop-ink-muted`, `--shop-card`, `--shop-border`) so the family
 * palette of each group cascades in without per-template overrides.
 *
 * Usage in `lib/templates/registry.ts`:
 *
 *   pages: {
 *     help: makeHelpAdapter(),
 *   }
 */

import React from 'react';
import Link from 'next/link';
import { HelpCircle, Mail, Phone, MessageCircle, ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { HelpProps } from '@/lib/templates/types';

interface FAQ {
  question: string;
  answer: string;
}

const DEFAULT_FAQS: FAQ[] = [
  {
    question: 'สั่งซื้อสินค้าอย่างไร?',
    answer:
      'เลือกสินค้าที่ต้องการแล้วกดปุ่ม "เพิ่มลงตะกร้า" จากนั้นไปที่ตะกร้าและกด "สั่งซื้อสินค้า" กรอกข้อมูลจัดส่งและเลือกวิธีชำระเงิน ระบบจะส่งอีเมลยืนยันออเดอร์ทันทีหลังชำระเงิน',
  },
  {
    question: 'ใช้เวลาในการจัดส่งกี่วัน?',
    answer:
      'หลังจากยืนยันการชำระเงิน ทางร้านจะจัดส่งสินค้าภายใน 1-2 วันทำการ และจะถึงมือลูกค้าภายใน 2-5 วันทำการ ขึ้นอยู่กับพื้นที่จัดส่ง สำหรับพื้นที่กรุงเทพและปริมณฑลมักจะถึงเร็วกว่านั้น',
  },
  {
    question: 'จัดส่งฟรีเมื่อสั่งซื้อขั้นต่ำเท่าไหร่?',
    answer:
      'จัดส่งฟรีทั่วประเทศไทยเมื่อสั่งซื้อครบ 990 บาทขึ้นไป สำหรับยอดต่ำกว่าจะมีค่าจัดส่ง 50 บาทแบบเหมาจ่าย ค่าจัดส่งจะแสดงในหน้าสรุปออเดอร์ก่อนชำระเงินทุกครั้ง',
  },
  {
    question: 'หากสินค้ามีปัญหาสามารถคืนเงินได้ไหม?',
    answer:
      'ทางร้านรับประกันความพึงพอใจของลูกค้า หากสินค้ามีปัญหาจากการผลิต ชำรุดเสียหายจากการขนส่ง หรือไม่ตรงตามที่สั่ง สามารถแจ้งคืนสินค้าได้ภายใน 7 วันนับจากวันที่ได้รับสินค้า เรายินดีเปลี่ยนสินค้าใหม่หรือคืนเงินเต็มจำนวน',
  },
  {
    question: 'ติดต่อร้านได้ทางช่องทางไหนบ้าง?',
    answer:
      'ลูกค้าสามารถติดต่อทีมงานได้ผ่านช่องทางที่ระบุไว้ในหน้าติดต่อเรา ทั้งทางอีเมล โทรศัพท์ Line และ Messenger ทีมงานพร้อมตอบกลับภายใน 24 ชั่วโมงในวันทำการ',
  },
  {
    question: 'สินค้ามีรับประกันคุณภาพหรือไม่?',
    answer:
      'สินค้าทุกชิ้นผ่านการตรวจสอบคุณภาพก่อนจัดส่ง และมีการรับประกันคุณภาพตามเงื่อนไขที่ระบุในหน้าสินค้านั้นๆ หากพบปัญหาในการใช้งานปกติสามารถติดต่อทางร้านเพื่อขอเปลี่ยนสินค้าหรือซ่อมแซมได้',
  },
];

export function makeHelpAdapter() {
  return function HelpAdapter(props: HelpProps) {
    const { store } = props;

    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: 'var(--shop-bg, #ffffff)',
          color: 'var(--shop-ink, #18181b)',
        }}
      >
        {/* Hero */}
        <section className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div
              className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                backgroundColor: 'var(--shop-card, #f4f4f5)',
                border: '1px solid var(--shop-border, #e4e4e7)',
              }}
            >
              <HelpCircle className="h-7 w-7" style={{ color: 'var(--shop-primary)' }} />
            </div>
            <h1
              className="mb-4 text-3xl font-bold leading-tight sm:text-4xl"
              style={{ color: 'var(--shop-ink)' }}
            >
              ศูนย์ช่วยเหลือ
            </h1>
            <p
              className="text-base leading-relaxed sm:text-lg"
              style={{ color: 'var(--shop-ink-muted, #71717a)' }}
            >
              คำถามที่พบบ่อยและช่องทางติดต่อสำหรับลูกค้าของ {store.name}
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-3xl">
            <h2
              className="mb-6 text-xl font-semibold sm:text-2xl"
              style={{ color: 'var(--shop-ink)' }}
            >
              คำถามที่พบบ่อย
            </h2>
            <div
              className="rounded-2xl p-2 sm:p-6"
              style={{
                backgroundColor: 'var(--shop-card, #fafafa)',
                border: '1px solid var(--shop-border, #e4e4e7)',
              }}
            >
              <Accordion type="single" collapsible className="w-full">
                {DEFAULT_FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger
                      className="text-left text-base font-medium"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent
                      style={{ color: 'var(--shop-ink-muted, #52525b)' }}
                    >
                      <p className="leading-relaxed">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-3xl">
            <div
              className="rounded-2xl p-8 sm:p-10"
              style={{
                backgroundColor: 'var(--shop-card, #ffffff)',
                border: '1px solid var(--shop-border, #e4e4e7)',
              }}
            >
              <div className="mb-6 text-center">
                <h2
                  className="mb-3 text-2xl font-semibold sm:text-3xl"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  ยังไม่ได้คำตอบที่ต้องการ?
                </h2>
                <p
                  className="text-base"
                  style={{ color: 'var(--shop-ink-muted, #71717a)' }}
                >
                  ทีมงานของเราพร้อมช่วยเหลือคุณ
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link
                  href={`/stores/${store.slug}/contact`}
                  className="flex flex-col items-center gap-2 rounded-xl p-5 text-center transition-colors hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--shop-bg, #f4f4f5)',
                    border: '1px solid var(--shop-border, #e4e4e7)',
                  }}
                >
                  <MessageCircle
                    className="h-6 w-6"
                    style={{ color: 'var(--shop-primary)' }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    ติดต่อเรา
                  </span>
                </Link>

                <Link
                  href={`/stores/${store.slug}/faq`}
                  className="flex flex-col items-center gap-2 rounded-xl p-5 text-center transition-colors hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--shop-bg, #f4f4f5)',
                    border: '1px solid var(--shop-border, #e4e4e7)',
                  }}
                >
                  <HelpCircle
                    className="h-6 w-6"
                    style={{ color: 'var(--shop-accent)' }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    คำถามทั้งหมด
                  </span>
                </Link>

                <Link
                  href={`/stores/${store.slug}/category`}
                  className="flex flex-col items-center gap-2 rounded-xl p-5 text-center transition-colors hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--shop-bg, #f4f4f5)',
                    border: '1px solid var(--shop-border, #e4e4e7)',
                  }}
                >
                  <ArrowRight
                    className="h-6 w-6"
                    style={{ color: 'var(--shop-primary)' }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    เลือกซื้อสินค้า
                  </span>
                </Link>
              </div>

              {/* Quick contact methods if store exposes them */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                <a
                  href="mailto:support@basketplace.co"
                  className="inline-flex items-center gap-2 hover:underline"
                  style={{ color: 'var(--shop-ink-muted, #71717a)' }}
                >
                  <Mail className="h-4 w-4" />
                  <span>อีเมล</span>
                </a>
                <span
                  className="inline-flex items-center gap-2"
                  style={{ color: 'var(--shop-ink-muted, #71717a)' }}
                >
                  <Phone className="h-4 w-4" />
                  <span>ตอบกลับภายใน 24 ชั่วโมง</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };
}
