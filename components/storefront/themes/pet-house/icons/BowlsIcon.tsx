/**
 * BowlsIcon — ของใช้สัตว์เลี้ยง
 *
 * ชามอาหาร (kibble) + ชามน้ำ (water with ripples) + หัวใจเขียว + sparkles
 * Brand: Fluffy House
 */

type IconProps = {
  className?: string;
  size?: number | string;
  'aria-label'?: string;
};

export const BowlsIcon = ({
  className,
  size,
  'aria-label': ariaLabel = 'ของใช้สัตว์เลี้ยง',
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
    {/* ground shadow */}
    <ellipse cx="100" cy="170" rx="78" ry="6" fill="#5C3D1F" opacity="0.12" />

    {/* LEFT BOWL — food */}
    <g transform="translate(62, 130)">
      <path d="M-32 -2 Q-30 22 -18 30 L18 30 Q30 22 32 -2" fill="#9E9890" stroke="#5C3D1F" strokeWidth="2" />
      <ellipse cx="0" cy="-2" rx="32" ry="9" fill="#C9C4BC" stroke="#5C3D1F" strokeWidth="2" />
      <ellipse cx="0" cy="-4" rx="28" ry="6" fill="#E8E4DD" />
      {/* kibble */}
      <ellipse cx="-11" cy="-5" rx="4.5" ry="3.2" fill="#A87F4E" />
      <ellipse cx="0" cy="-6" rx="4.5" ry="3.2" fill="#A87F4E" />
      <ellipse cx="10" cy="-5" rx="4.5" ry="3.2" fill="#A87F4E" />
      <ellipse cx="-5" cy="-8" rx="3.5" ry="2.5" fill="#8B6F3F" />
      <ellipse cx="5" cy="-8" rx="3.5" ry="2.5" fill="#8B6F3F" />
      <ellipse cx="-14" cy="-7" rx="3" ry="2" fill="#8B6F3F" />
      <ellipse cx="13" cy="-7" rx="3" ry="2" fill="#8B6F3F" />
    </g>

    {/* RIGHT BOWL — water */}
    <g transform="translate(138, 130)">
      <path d="M-32 -2 Q-30 22 -18 30 L18 30 Q30 22 32 -2" fill="#9E9890" stroke="#5C3D1F" strokeWidth="2" />
      <ellipse cx="0" cy="-2" rx="32" ry="9" fill="#C9C4BC" stroke="#5C3D1F" strokeWidth="2" />
      <ellipse cx="0" cy="-4" rx="28" ry="6" fill="#A8C5E5" />
      {/* ripples */}
      <path d="M-18 -5 Q-12 -8 -6 -5" stroke="#7CA8D0" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M6 -5 Q12 -8 18 -5" stroke="#7CA8D0" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M-10 -8 Q-5 -10 0 -8" stroke="#7CA8D0" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </g>

    {/* heart between bowls */}
    <text x="100" y="78" textAnchor="middle" fontSize="22" fill="#5BA033" opacity="0.7">
      ♥
    </text>

    {/* sparkles */}
    <text x="40" y="45" fontSize="12" fill="#FAC775">
      ✦
    </text>
    <text x="160" y="50" fontSize="9" fill="#FAC775">
      ✦
    </text>
  </svg>
);
