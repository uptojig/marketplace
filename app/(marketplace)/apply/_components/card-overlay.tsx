const THAI_ID_ASPECT = 85.6 / 53.98;
const CARD_WIDTH = 42;
const CARD_HEIGHT = CARD_WIDTH / THAI_ID_ASPECT;
const CARD_X = (100 - CARD_WIDTH) / 2;
const CARD_Y = 95;
const CARD_RIGHT = CARD_X + CARD_WIDTH;
const CARD_BOTTOM = CARD_Y + CARD_HEIGHT;
const CARD_CENTER_Y = CARD_Y + CARD_HEIGHT / 2;
const DASH = "1.25 1.55";
const SOFT_DASH = "0.85 1.1";

export function CardOverlay() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/25">
      <PoseGuide />
    </div>
  );
}

function PoseGuide() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 178"
      preserveAspectRatio="xMidYMid meet"
      role="presentation"
    >
      <defs>
        <radialGradient id="kyc-subtle-vignette" cx="50%" cy="49%" r="74%">
          <stop offset="0%" stopColor="rgba(0, 0, 0, 0)" />
          <stop offset="76%" stopColor="rgba(0, 0, 0, 0.1)" />
          <stop offset="100%" stopColor="rgba(0, 0, 0, 0.34)" />
        </radialGradient>
        <linearGradient id="scanline" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="22%" stopColor="rgba(255,255,255,0.24)" />
          <stop offset="78%" stopColor="rgba(255,255,255,0.24)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      <rect width="100" height="178" fill="url(#kyc-subtle-vignette)" />

      <text
        x="50"
        y="22"
        fill="rgba(255,255,255,0.95)"
        fontSize="3.45"
        fontWeight="500"
        textAnchor="middle"
      >
        จัดตำแหน่งใบหน้าและบัตรประชาชนให้ตรง
      </text>

      <g
        fill="none"
        stroke="rgba(255,255,255,0.92)"
        strokeDasharray={DASH}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.52"
      >
        <path d="M39 86C39 93 35 97 29 100C18 105 8 113 0 126" />
        <path d="M61 86C61 93 65 97 71 100C82 105 92 113 100 126" />
        <path d="M7 151C8 161 10 170 11 178" />
        <path d="M93 151C92 161 90 170 89 178" />
      </g>

      <g
        fill="none"
        stroke="rgba(255,255,255,0.93)"
        strokeDasharray={DASH}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.54"
      >
        <path d="M29 58C27 44 35 32 50 32C65 32 73 44 71 58" />
        <path d="M34 57C32 69 36 80 42 87C46.5 92 53.5 92 58 87C64 80 68 69 66 57" />
        <path d="M34 60C30.5 60.5 29 64 29.5 68C30 72 32 75 34.5 76" />
        <path d="M66 60C69.5 60.5 71 64 70.5 68C70 72 68 75 65.5 76" />
        <path d="M39 87C39 94 37 98 33.5 101" />
        <path d="M61 87C61 94 63 98 66.5 101" />
      </g>

      <g
        fill="none"
        stroke="rgba(255,255,255,0.7)"
        strokeDasharray={SOFT_DASH}
        strokeLinecap="round"
        strokeWidth="0.32"
      >
        <line x1="50" x2="50" y1="33" y2="91" />
        <line x1="37" x2="63" y1="48" y2="48" />
        <line x1="34" x2="66" y1="60" y2="60" />
        <line x1="36" x2="64" y1="72" y2="72" />
        <line x1="40" x2="60" y1="84" y2="84" />
        <path d="M43 37C40.5 50 40.5 73 44 89" />
        <path d="M57 37C59.5 50 59.5 73 56 89" />
      </g>

      <path
        d="M48 67L50 69L52 67"
        fill="none"
        stroke="rgba(255,255,255,0.76)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.38"
      />

      <g>
        <line x1="0" x2="100" y1="86" y2="86" stroke="url(#scanline)" strokeWidth="0.16" />
        <circle cx="28" cy="86" r="0.55" fill="#fff" opacity="0.85" />
        <circle cx="70" cy="86" r="0.7" fill="#fff" opacity="0.9" />
      </g>

      <g>
        <line x1="0" x2="100" y1="112" y2="112" stroke="url(#scanline)" strokeWidth="0.16" />
        <circle cx="82" cy="112" r="0.5" fill="#fff" opacity="0.82" />
        <circle cx="74" cy="112" r="0.78" fill="#fff" opacity="0.9" />
      </g>

      <g
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeDasharray={DASH}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.46"
      >
        <path d="M0 107C6 101 13 99 19 101C25 103 29 106 31 111" />
        <path d="M7 106C12 103 16 104 18 108C21 113 21 119 18 124" />
        <path d="M17 101C23 100 29 104 32 110" />
        <path d="M0 123C8 118 19 119 28 125" />
        <path d="M22 124C26 128 33 128 36 124" />
      </g>

      <rect
        x={CARD_X}
        y={CARD_Y}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        fill="rgba(15,23,42,0.42)"
        stroke="rgba(255,255,255,0.94)"
        strokeWidth="0.32"
        rx="0.45"
      />

      <g
        fill="none"
        stroke="#ffffff"
        strokeLinecap="square"
        strokeWidth="0.72"
      >
        <path d={`M${CARD_X - 2.2} ${CARD_Y + 5.2}V${CARD_Y - 2.2}H${CARD_X + 5.2}`} />
        <path d={`M${CARD_RIGHT - 5.2} ${CARD_Y - 2.2}H${CARD_RIGHT + 2.2}V${CARD_Y + 5.2}`} />
        <path d={`M${CARD_X - 2.2} ${CARD_BOTTOM - 5.2}V${CARD_BOTTOM + 2.2}H${CARD_X + 5.2}`} />
        <path d={`M${CARD_RIGHT - 5.2} ${CARD_BOTTOM + 2.2}H${CARD_RIGHT + 2.2}V${CARD_BOTTOM - 5.2}`} />
      </g>

      <text
        x="50"
        y={CARD_CENTER_Y - 1.1}
        fill="rgba(255,255,255,0.95)"
        fontSize="3.05"
        fontWeight="400"
        textAnchor="middle"
      >
        <tspan x="50">ถือบัตรประชาชน</tspan>
        <tspan x="50" dy="4.8">ในกรอบนี้</tspan>
      </text>
    </svg>
  );
}
