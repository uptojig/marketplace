/**
 * Reusable payment-method logo strip — one row of inline SVG logos for
 * every channel AnyPay routes (Visa, Mastercard, JCB, UnionPay, Rabbit
 * LINE Pay, Alipay+, SABUY Money, ShopeePay, TrueMoney, Atome, Thai QR
 * PromptPay). Theme footers should drop this in instead of rolling
 * their own logo strip.
 *
 * Usage:
 *   import { PaymentLogos } from '@/components/storefront/payment-logos';
 *   <PaymentLogos />                         // full row
 *   <PaymentLogos compact />                 // tighter spacing
 *   <PaymentLogos only={['visa','mc','jcb']} />  // subset
 *
 * All logos render as <svg> + monochrome <text> chips (no remote assets)
 * so they ship inline + render the same on every theme/palette. Each
 * chip is 56–72px wide × 32–36px tall on a white tile so the wordmark
 * stays legible on dark, light, or gradient footers alike.
 */
import { type SVGProps } from 'react';

export type PaymentMethodKey =
  | 'visa'
  | 'mc'
  | 'jcb'
  | 'unionpay'
  | 'rabbit-linepay'
  | 'alipay'
  | 'sabuy'
  | 'shopeepay'
  | 'truemoney'
  | 'atome'
  | 'promptpay';

interface Props extends SVGProps<SVGSVGElement> {
  /** Subset to render (preserves the order given). */
  only?: PaymentMethodKey[];
  /** Tighter chips + smaller gap. */
  compact?: boolean;
  /** Center-align the strip (default left). */
  centered?: boolean;
  /** Extra wrapper classes. */
  className?: string;
}

const ORDER: PaymentMethodKey[] = [
  'visa',
  'mc',
  'jcb',
  'unionpay',
  'rabbit-linepay',
  'alipay',
  'sabuy',
  'shopeepay',
  'truemoney',
  'atome',
  'promptpay',
];

export function PaymentLogos({
  only,
  compact = false,
  centered = false,
  className = '',
}: Omit<Props, keyof SVGProps<SVGSVGElement>> = {}) {
  const items = (only && only.length > 0 ? only : ORDER).filter((k) =>
    ORDER.includes(k),
  );
  const w = compact ? 'h-7' : 'h-8';
  const gap = compact ? 'gap-1.5' : 'gap-2';
  const align = centered ? 'justify-center' : '';
  return (
    <ul
      className={`flex flex-wrap items-center ${gap} ${align} ${className}`.trim()}
      aria-label="ช่องทางการชำระเงิน"
    >
      {items.map((k) => (
        <li
          key={k}
          className={`inline-flex items-center justify-center ${w} rounded-md bg-white border border-zinc-200 px-2 py-1 shadow-sm`}
          title={LOGO_LABEL[k]}
          aria-label={LOGO_LABEL[k]}
        >
          {LOGO_SVG[k]}
        </li>
      ))}
    </ul>
  );
}

const LOGO_LABEL: Record<PaymentMethodKey, string> = {
  visa: 'Visa',
  mc: 'Mastercard',
  jcb: 'JCB',
  unionpay: 'UnionPay',
  'rabbit-linepay': 'Rabbit LINE Pay',
  alipay: 'Alipay / Alipay+',
  sabuy: 'SABUY Money',
  shopeepay: 'ShopeePay',
  truemoney: 'TrueMoney',
  atome: 'Atome',
  promptpay: 'Thai QR · PromptPay',
};

// All logos are typographic wordmarks rendered as inline <svg><text>
// (single color per brand). Keeps the strip 100% self-contained — no
// remote images, no licensed PNGs to manage.
const LOGO_SVG: Record<PaymentMethodKey, JSX.Element> = {
  visa: (
    <svg viewBox="0 0 56 18" className="h-full w-auto" aria-hidden>
      <text
        x="0"
        y="14"
        fontFamily="Arial, sans-serif"
        fontWeight={900}
        fontStyle="italic"
        fontSize="15"
        fill="#1A1F71"
      >
        VISA
      </text>
    </svg>
  ),
  mc: (
    <svg viewBox="0 0 30 18" className="h-full w-auto" aria-hidden>
      <circle cx="11" cy="9" r="8" fill="#EB001B" />
      <circle cx="19" cy="9" r="8" fill="#F79E1B" />
      <path
        d="M15 3.5a8 8 0 0 1 0 11 8 8 0 0 1 0-11Z"
        fill="#FF5F00"
      />
    </svg>
  ),
  jcb: (
    <svg viewBox="0 0 36 18" className="h-full w-auto" aria-hidden>
      <rect x="0" y="2" width="11" height="14" rx="2" fill="#0E4C9A" />
      <rect x="12" y="2" width="11" height="14" rx="2" fill="#D7182A" />
      <rect x="24" y="2" width="11" height="14" rx="2" fill="#0F9A6B" />
      <text
        x="18"
        y="13"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight={900}
        fontSize="9"
        fill="#fff"
      >
        JCB
      </text>
    </svg>
  ),
  unionpay: (
    <svg viewBox="0 0 56 18" className="h-full w-auto" aria-hidden>
      <text
        x="0"
        y="14"
        fontFamily="Arial Black, sans-serif"
        fontWeight={900}
        fontSize="11"
        fill="#003E7E"
      >
        Union
      </text>
      <text
        x="28"
        y="14"
        fontFamily="Arial Black, sans-serif"
        fontWeight={900}
        fontSize="11"
        fill="#E21836"
      >
        Pay
      </text>
    </svg>
  ),
  'rabbit-linepay': (
    <svg viewBox="0 0 80 18" className="h-full w-auto" aria-hidden>
      <rect x="0" y="2" width="32" height="14" rx="3" fill="#E60012" />
      <text
        x="3.5"
        y="13"
        fontFamily="Arial, sans-serif"
        fontWeight={800}
        fontSize="9"
        fill="#fff"
      >
        Rabbit
      </text>
      <rect x="34" y="2" width="44" height="14" rx="3" fill="#06C755" />
      <text
        x="56"
        y="13"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight={800}
        fontSize="9"
        fill="#fff"
      >
        LINE Pay
      </text>
    </svg>
  ),
  alipay: (
    <svg viewBox="0 0 68 18" className="h-full w-auto" aria-hidden>
      <text
        x="0"
        y="14"
        fontFamily="Arial, sans-serif"
        fontWeight={800}
        fontSize="12"
        fill="#1677FF"
      >
        Alipay
      </text>
      <text
        x="40"
        y="14"
        fontFamily="Arial, sans-serif"
        fontWeight={800}
        fontSize="12"
        fill="#1677FF"
      >
        +
      </text>
    </svg>
  ),
  sabuy: (
    <svg viewBox="0 0 56 18" className="h-full w-auto" aria-hidden>
      <text
        x="0"
        y="14"
        fontFamily="Arial, sans-serif"
        fontWeight={900}
        fontSize="11"
        fill="#F47B20"
      >
        SABUY
      </text>
    </svg>
  ),
  shopeepay: (
    <svg viewBox="0 0 76 18" className="h-full w-auto" aria-hidden>
      <text
        x="0"
        y="14"
        fontFamily="Arial, sans-serif"
        fontWeight={900}
        fontSize="11"
        fill="#EE4D2D"
      >
        Shopee
      </text>
      <text
        x="44"
        y="14"
        fontFamily="Arial, sans-serif"
        fontWeight={900}
        fontSize="11"
        fill="#EE4D2D"
      >
        Pay
      </text>
    </svg>
  ),
  truemoney: (
    <svg viewBox="0 0 76 18" className="h-full w-auto" aria-hidden>
      <text
        x="0"
        y="14"
        fontFamily="Arial, sans-serif"
        fontWeight={900}
        fontSize="11"
        fill="#FF7700"
      >
        True
      </text>
      <text
        x="28"
        y="14"
        fontFamily="Arial, sans-serif"
        fontWeight={900}
        fontSize="11"
        fill="#FF7700"
      >
        Money
      </text>
    </svg>
  ),
  atome: (
    <svg viewBox="0 0 56 18" className="h-full w-auto" aria-hidden>
      <text
        x="0"
        y="14"
        fontFamily="Arial, sans-serif"
        fontWeight={900}
        fontSize="12"
        fill="#FF4D5B"
      >
        atome
      </text>
    </svg>
  ),
  promptpay: (
    <svg viewBox="0 0 92 18" className="h-full w-auto" aria-hidden>
      <rect x="0" y="2" width="14" height="14" rx="2" fill="#1A3763" />
      <text
        x="7"
        y="13"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight={900}
        fontSize="9"
        fill="#fff"
      >
        QR
      </text>
      <text
        x="17"
        y="14"
        fontFamily="Arial, sans-serif"
        fontWeight={800}
        fontSize="10"
        fill="#1A3763"
      >
        Prompt
      </text>
      <text
        x="51"
        y="14"
        fontFamily="Arial, sans-serif"
        fontWeight={800}
        fontSize="10"
        fill="#54A69A"
      >
        Pay
      </text>
    </svg>
  ),
};
