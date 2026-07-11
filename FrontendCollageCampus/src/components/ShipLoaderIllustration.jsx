/** Shared cruise-ship + graduate illustration for splash & in-app loaders */
export default function ShipLoaderIllustration({ className = "" }) {
  return (
    <svg
      viewBox="0 0 360 210"
      className={`ship-loader__art ${className}`.trim()}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shipHull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#243044" />
          <stop offset="100%" stopColor="#151c28" />
        </linearGradient>
      </defs>

      <circle cx="302" cy="36" r="20" fill="#f5c842" opacity="0.95" />
      <ellipse cx="70" cy="42" rx="34" ry="11" fill="#fff" opacity="0.85" />
      <ellipse cx="92" cy="38" rx="22" ry="8" fill="#fff" opacity="0.7" />
      <ellipse cx="248" cy="52" rx="28" ry="9" fill="#fff" opacity="0.75" />

      <g className="ship-loader__waves">
        <path
          d="M0 178 Q45 168 90 178 T180 178 T270 178 T360 178 V210 H0 Z"
          fill="#7ec8e8"
        />
        <path
          d="M0 186 Q60 176 120 186 T240 186 T360 186 V210 H0 Z"
          fill="#5eb8df"
          opacity="0.85"
        />
      </g>

      <g className="ship-loader__ship">
        <path
          d="M48 168 Q180 182 312 168 L300 132 Q180 118 60 132 Z"
          fill="url(#shipHull)"
        />
        <path
          d="M58 148 H302"
          stroke="#fff"
          strokeWidth="2"
          opacity="0.35"
        />
        {[78, 108, 138, 168, 198, 228, 258, 282].map((x) => (
          <rect
            key={x}
            x={x}
            y="152"
            width="10"
            height="8"
            rx="1"
            fill="#c94c4c"
          />
        ))}

        <rect x="72" y="118" width="216" height="18" rx="2" fill="#f7f9fc" />
        {[88, 118, 148, 178, 208, 238, 268].map((x) => (
          <circle key={`d1-${x}`} cx={x} cy="127" r="3" fill="#94a3b8" />
        ))}

        <rect x="88" y="98" width="184" height="16" rx="2" fill="#fff" />
        {[104, 134, 164, 194, 224, 254].map((x) => (
          <circle key={`d2-${x}`} cx={x} cy="106" r="2.8" fill="#94a3b8" />
        ))}

        <rect x="108" y="82" width="144" height="14" rx="2" fill="#fff" />
        {[124, 154, 184, 214, 244].map((x) => (
          <circle key={`d3-${x}`} cx={x} cy="89" r="2.5" fill="#94a3b8" />
        ))}

        <g className="ship-loader__stacks">
          {[118, 148, 212, 242].map((x, i) => (
            <g key={x}>
              <rect x={x} y="62" width="14" height="28" rx="2" fill="#8B6914" />
              <rect x={x - 1} y="58" width="16" height="6" rx="2" fill="#c94c4c" />
              <path
                className="ship-loader__smoke"
                style={{ animationDelay: `${i * 0.35}s` }}
                d={`M${x + 7} 54 Q${x + 3} 42 ${x + 10} 32 Q${x + 14} 24 ${x + 6} 16`}
                stroke="#b0bec5"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.7"
              />
            </g>
          ))}
        </g>

        {/* Graduate standing on top deck — centered on deck */}
        <g className="ship-loader__graduate" transform="translate(180 76) scale(1.12)">
          <rect x="-14" y="12" width="28" height="3" rx="1" fill="#e2e8f0" />
          <ellipse cx="0" cy="14" rx="12" ry="2.5" fill="rgba(10,38,71,0.14)" />
          <rect x="-7" y="2" width="14" height="12" rx="2" fill="#1a2332" />
          <rect x="-9" y="0" width="18" height="4" rx="1" fill="#1a2332" />
          <circle cx="0" cy="-4" r="5.5" fill="#f4c9a0" />
          <rect x="-8" y="-11" width="16" height="5" rx="1" fill="#1a2332" />
          <polygon points="-8,-11 0,-18 8,-11" fill="#1a2332" />
          <line
            x1="6"
            y1="-14"
            x2="10"
            y2="-8"
            stroke="#c9a227"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <rect
            x="5"
            y="-2"
            width="7"
            height="9"
            rx="1"
            fill="#fff"
            stroke="#cbd5e1"
            strokeWidth="0.8"
          />
          <line
            x1="6.5"
            y1="0"
            x2="10.5"
            y2="0"
            stroke="#c9a227"
            strokeWidth="0.8"
          />
          <line
            x1="6.5"
            y1="2.5"
            x2="10.5"
            y2="2.5"
            stroke="#c9a227"
            strokeWidth="0.8"
          />
        </g>
      </g>
    </svg>
  );
}
