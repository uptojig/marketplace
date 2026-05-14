/**
 * ToysIcon — ของเล่นสัตว์เลี้ยง
 *
 * ลูกเทนนิส + เชือกถักผูกกลาง + กระดูกของเล่น + sparkles
 * Brand: Fluffy House
 */

type IconProps = {
  className?: string;
  size?: number | string;
  'aria-label'?: string;
};

export const ToysIcon = ({
  className,
  size,
  'aria-label': ariaLabel = 'ของเล่นสัตว์เลี้ยง',
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
    {/* shadow */}
    <ellipse cx="100" cy="175" rx="70" ry="5" fill="#5C3D1F" opacity="0.1" />

    {/* TENNIS BALL (bottom left) */}
    <g transform="translate(50, 145)">
      <circle cx="0" cy="0" r="24" fill="#C8E2A7" stroke="#5C3D1F" strokeWidth="2" />
      <path
        d="M-24 -6 Q-12 -18 0 -10 Q12 -2 24 -10"
        stroke="#5BA033"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M-24 6 Q-12 18 0 10 Q12 2 24 10"
        stroke="#5BA033"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="-8" cy="-8" rx="5" ry="3" fill="white" opacity="0.5" />
    </g>

    {/* ROPE TOY (middle) */}
    <g transform="translate(100, 70)">
      {/* left rope */}
      <path
        d="M-16 0 Q-30 -6 -42 0 Q-55 8 -62 -2"
        stroke="#D4A55C"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M-16 0 Q-30 -6 -42 0 Q-55 8 -62 -2"
        stroke="#5C3D1F"
        strokeWidth="0.6"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="2,3"
      />
      {/* right rope */}
      <path d="M16 0 Q30 6 42 0 Q55 -8 62 2" stroke="#D4A55C" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path
        d="M16 0 Q30 6 42 0 Q55 -8 62 2"
        stroke="#5C3D1F"
        strokeWidth="0.6"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="2,3"
      />
      {/* center knot */}
      <ellipse cx="0" cy="0" rx="16" ry="11" fill="#A87F4E" stroke="#5C3D1F" strokeWidth="2" />
      <path d="M-10 -4 Q0 -8 10 -4" stroke="#5C3D1F" strokeWidth="1.2" fill="none" />
      <path d="M-10 4 Q0 8 10 4" stroke="#5C3D1F" strokeWidth="1.2" fill="none" />
      <path d="M-6 0 L6 0" stroke="#5C3D1F" strokeWidth="1.2" fill="none" />
      {/* frayed ends */}
      <line x1="-62" y1="-2" x2="-66" y2="-4" stroke="#8B6F3F" strokeWidth="1" />
      <line x1="-62" y1="-2" x2="-68" y2="0" stroke="#8B6F3F" strokeWidth="1" />
      <line x1="-62" y1="-2" x2="-66" y2="2" stroke="#8B6F3F" strokeWidth="1" />
      <line x1="62" y1="2" x2="66" y2="0" stroke="#8B6F3F" strokeWidth="1" />
      <line x1="62" y1="2" x2="68" y2="4" stroke="#8B6F3F" strokeWidth="1" />
      <line x1="62" y1="2" x2="66" y2="6" stroke="#8B6F3F" strokeWidth="1" />
    </g>

    {/* SQUEAKY BONE (bottom right) */}
    <g transform="translate(150, 140) rotate(-18)">
      <path
        d="M-28 0 Q-34 -10 -24 -13 Q-28 -22 -16 -19 Q-8 -21 0 -18 Q8 -21 16 -19 Q28 -22 24 -13 Q34 -10 28 0 Q34 10 24 13 Q28 22 16 19 Q8 21 0 18 Q-8 21 -16 19 Q-28 22 -24 13 Q-34 10 -28 0 Z"
        fill="#FFF8E1"
        stroke="#5C3D1F"
        strokeWidth="2"
      />
      <path d="M-20 4 Q-24 8 -18 10" stroke="#D4C5B0" strokeWidth="1.2" fill="none" />
      <path d="M18 4 Q24 8 18 10" stroke="#D4C5B0" strokeWidth="1.2" fill="none" />
    </g>

    {/* sparkles */}
    <text x="28" y="40" fontSize="14" fill="#FAC775" fontWeight="700">
      ★
    </text>
    <text x="170" y="60" fontSize="10" fill="#FAC775" fontWeight="700">
      ★
    </text>
    <text x="180" y="170" fontSize="8" fill="#FAC775" fontWeight="700">
      ★
    </text>
  </svg>
);
