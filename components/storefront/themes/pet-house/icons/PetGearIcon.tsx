/**
 * PetGearIcon — สัตว์เลี้ยงและอุปกรณ์
 *
 * ภาพปลอกคอหนัง + buckle + D-ring + ป้ายชื่อกระดูก (MAX) + paw prints
 * Brand: Fluffy House
 * Palette: หนัง #A87F4E · เขียวแบรนด์ #5BA033 · เส้น #5C3D1F
 */

type IconProps = {
  className?: string;
  size?: number | string;
  /** Accessible label เป็นภาษาไทยตามคอนเซปต์ของ icon */
  'aria-label'?: string;
};

export const PetGearIcon = ({
  className,
  size,
  'aria-label': ariaLabel = 'อุปกรณ์สัตว์เลี้ยง',
}: IconProps) => (
  <svg
    viewBox="0 0 200 200"
    width={size ?? '100%'}
    height={size ?? '100%'}
    className={className}
    role="img"
    aria-label={ariaLabel}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* collar ring */}
    <ellipse cx="100" cy="78" rx="62" ry="22" fill="#A87F4E" stroke="#5C3D1F" strokeWidth="2.5" />
    <ellipse cx="100" cy="74" rx="58" ry="18" fill="#C9986C" />
    {/* stitching */}
    <ellipse
      cx="100"
      cy="74"
      rx="52"
      ry="14"
      fill="none"
      stroke="#8B6F3F"
      strokeWidth="0.8"
      strokeDasharray="3,2"
    />
    {/* buckle */}
    <rect x="148" y="68" width="16" height="20" rx="3" fill="#FAC775" stroke="#5C3D1F" strokeWidth="1.5" />
    <rect x="151" y="71" width="10" height="14" rx="1" fill="none" stroke="#5C3D1F" strokeWidth="1" />
    {/* studs */}
    <circle cx="76" cy="74" r="1.8" fill="#5C3D1F" />
    <circle cx="88" cy="74" r="1.8" fill="#5C3D1F" />
    <circle cx="112" cy="74" r="1.8" fill="#5C3D1F" />
    <circle cx="124" cy="74" r="1.8" fill="#5C3D1F" />
    {/* D-ring */}
    <circle cx="100" cy="100" r="9" fill="none" stroke="#5C3D1F" strokeWidth="2.8" />
    {/* chain */}
    <line x1="100" y1="108" x2="100" y2="125" stroke="#5C3D1F" strokeWidth="1.5" />
    {/* bone tag */}
    <g transform="translate(100, 145)">
      <path
        d="M-22 0 Q-26 -10 -18 -12 Q-22 -19 -12 -16 Q-6 -19 0 -16 Q6 -19 12 -16 Q22 -19 18 -12 Q26 -10 22 0 Q26 10 18 12 Q22 19 12 16 Q6 19 0 16 Q-6 19 -12 16 Q-22 19 -18 12 Q-26 10 -22 0 Z"
        fill="#5BA033"
        stroke="#5C3D1F"
        strokeWidth="2"
      />
      <text x="0" y="4" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fill="white" fontWeight="700">
        MAX
      </text>
    </g>
    {/* paw prints */}
    <g opacity="0.4">
      <ellipse cx="30" cy="55" rx="3.2" ry="4.2" fill="#5BA033" />
      <ellipse cx="34" cy="49" rx="1.6" ry="2.2" fill="#5BA033" />
      <ellipse cx="26" cy="49" rx="1.6" ry="2.2" fill="#5BA033" />
      <ellipse cx="38" cy="53" rx="1.4" ry="1.8" fill="#5BA033" />
      <ellipse cx="22" cy="53" rx="1.4" ry="1.8" fill="#5BA033" />
    </g>
    <g opacity="0.35">
      <ellipse cx="170" cy="170" rx="3" ry="4" fill="#5BA033" />
      <ellipse cx="173" cy="165" rx="1.4" ry="1.8" fill="#5BA033" />
      <ellipse cx="167" cy="165" rx="1.4" ry="1.8" fill="#5BA033" />
    </g>
  </svg>
);
