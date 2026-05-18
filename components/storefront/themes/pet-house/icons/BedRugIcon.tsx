/**
 * BedRugIcon — พรมและของใช้ในบ้าน
 *
 * พรมลายดอท + ที่นอนสัตว์เลี้ยง + แมวนอนหลับขดตัว + Zzz
 * Brand: Fluffy House
 */

type IconProps = {
  className?: string;
  size?: number | string;
  'aria-label'?: string;
};

export const BedRugIcon = ({
  className,
  size,
  'aria-label': ariaLabel = 'พรมและของใช้ในบ้าน',
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
    {/* rug shadow */}
    <ellipse cx="100" cy="160" rx="78" ry="8" fill="#5C3D1F" opacity="0.1" />

    {/* RUG */}
    <g transform="translate(100, 140)">
      <ellipse cx="0" cy="0" rx="80" ry="32" fill="#C73E1D" stroke="#5C3D1F" strokeWidth="2" />
      <ellipse cx="0" cy="0" rx="74" ry="26" fill="#E07B3C" />
      {/* pattern dots */}
      <circle cx="-50" cy="-10" r="2.5" fill="#C73E1D" />
      <circle cx="-30" cy="-8" r="2.5" fill="#C73E1D" />
      <circle cx="-10" cy="-10" r="2.5" fill="#C73E1D" />
      <circle cx="10" cy="-10" r="2.5" fill="#C73E1D" />
      <circle cx="30" cy="-8" r="2.5" fill="#C73E1D" />
      <circle cx="50" cy="-10" r="2.5" fill="#C73E1D" />
      <circle cx="-40" cy="6" r="2.5" fill="#C73E1D" />
      <circle cx="-20" cy="8" r="2.5" fill="#C73E1D" />
      <circle cx="0" cy="6" r="2.5" fill="#C73E1D" />
      <circle cx="20" cy="8" r="2.5" fill="#C73E1D" />
      <circle cx="40" cy="6" r="2.5" fill="#C73E1D" />
      {/* center medallion */}
      <ellipse cx="0" cy="-2" rx="14" ry="6" fill="#FAEBA0" opacity="0.7" />
      {/* fringe */}
      <line x1="-80" y1="-8" x2="-86" y2="-10" stroke="#5C3D1F" strokeWidth="1.5" />
      <line x1="-80" y1="0" x2="-87" y2="0" stroke="#5C3D1F" strokeWidth="1.5" />
      <line x1="-80" y1="8" x2="-86" y2="10" stroke="#5C3D1F" strokeWidth="1.5" />
      <line x1="80" y1="-8" x2="86" y2="-10" stroke="#5C3D1F" strokeWidth="1.5" />
      <line x1="80" y1="0" x2="87" y2="0" stroke="#5C3D1F" strokeWidth="1.5" />
      <line x1="80" y1="8" x2="86" y2="10" stroke="#5C3D1F" strokeWidth="1.5" />
    </g>

    {/* PET BED */}
    <g transform="translate(100, 100)">
      <ellipse cx="0" cy="0" rx="42" ry="15" fill="#A87F4E" stroke="#5C3D1F" strokeWidth="2" />
      <ellipse cx="0" cy="-3" rx="36" ry="10" fill="#E8DCC2" />
      <ellipse cx="0" cy="-6" rx="28" ry="6" fill="#FFFFFF" opacity="0.6" />

      {/* SLEEPING CAT */}
      <ellipse cx="0" cy="-8" rx="24" ry="9" fill="#FFF8E1" stroke="#5C3D1F" strokeWidth="1.8" />
      <circle cx="-13" cy="-11" r="8" fill="#FFF8E1" stroke="#5C3D1F" strokeWidth="1.5" />
      {/* ears */}
      <polygon points="-19 -17, -21 -22, -14 -19" fill="#FFF8E1" stroke="#5C3D1F" strokeWidth="1.2" />
      <polygon points="-7 -17, -5 -22, -12 -19" fill="#FFF8E1" stroke="#5C3D1F" strokeWidth="1.2" />
      <polygon points="-18 -19, -19 -21, -16 -19" fill="#F4B8C8" />
      <polygon points="-8 -19, -7 -21, -10 -19" fill="#F4B8C8" />
      {/* closed eyes */}
      <path d="M-15.5 -11 Q-14 -10 -12.5 -11" stroke="#3B2F1F" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M-11.5 -11 Q-10 -10 -8.5 -11" stroke="#3B2F1F" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <polygon points="-12 -9, -13.5 -8, -10.5 -8" fill="#D4537E" />
      {/* tail curl */}
      <path d="M18 -8 Q26 -12 22 -16" stroke="#5C3D1F" strokeWidth="1.5" fill="#FFF8E1" />
    </g>

    {/* Zzz */}
    <text x="135" y="80" fontFamily="Georgia, serif" fontSize="14" fill="#5BA033" opacity="0.75" fontStyle="italic">
      z
    </text>
    <text x="143" y="71" fontFamily="Georgia, serif" fontSize="10" fill="#5BA033" opacity="0.6" fontStyle="italic">
      z
    </text>
    <text x="149" y="64" fontFamily="Georgia, serif" fontSize="8" fill="#5BA033" opacity="0.5" fontStyle="italic">
      z
    </text>
  </svg>
);
