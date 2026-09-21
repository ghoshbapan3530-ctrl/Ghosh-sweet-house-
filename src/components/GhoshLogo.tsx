import React from 'react';

interface GhoshLogoProps {
  variant?: 'full' | 'compact' | 'horizontal';
  className?: string;
  theme?: 'dark' | 'bright';
}

export const GhoshLogo: React.FC<GhoshLogoProps> = ({
  variant = 'full',
  className = '',
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#2A1810';
  const goldColor = '#D4AF37';
  const goldLight = '#F7E7A9';
  const goldDark = '#AA7C11';

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        {/* Chef Hat + G Crest */}
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-900/30 border border-amber-500/40 shadow-inner">
          <svg viewBox="0 0 100 100" className="w-7 h-7 drop-shadow-sm">
            {/* Chef Hat */}
            <path
              d="M30 46 C22 46, 18 36, 26 28 C24 16, 42 12, 50 20 C58 12, 76 16, 74 28 C82 36, 78 46, 70 46 Z"
              fill="none"
              stroke="#FBFBFB"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* Hat Band */}
            <path
              d="M28 46 Q50 49 72 46 L70 54 Q50 57 30 54 Z"
              fill={goldColor}
            />
            {/* Elegant G */}
            <path
              d="M62 65 C58 60 52 58 44 60 C34 62 26 72 28 82 C30 91 39 96 52 94 C65 92 70 82 70 74 L48 76"
              fill="none"
              stroke={goldLight}
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="flex flex-col leading-none">
          <span className="font-royal text-base tracking-wide font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
            GHOSH
          </span>
          <span className={`text-[10px] tracking-widest font-semibold ${isDark ? 'text-amber-200/80' : 'text-amber-900/80'}`}>
            SWEET HOUSE
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Emblem */}
      <div className="relative flex-shrink-0">
        <svg
          viewBox="0 0 280 120"
          className="h-12 sm:h-14 md:h-16 w-auto overflow-visible"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(212,175,55,0.15))' }}
        >
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF3C4" />
              <stop offset="35%" stopColor="#E2B755" />
              <stop offset="70%" stopColor="#C6942C" />
              <stop offset="100%" stopColor="#FFF2B2" />
            </linearGradient>
            <linearGradient id="goldShine" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#FFF7D6" />
              <stop offset="100%" stopColor="#C59A27" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Chef Hat Top */}
          <g transform="translate(18, 2) scale(0.65)">
            <path
              d="M20 48 C10 46, 6 32, 18 22 C14 8, 38 4, 48 14 C58 4, 82 8, 78 22 C90 32, 86 46, 76 48 Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Hat Creases */}
            <path d="M34 16 Q36 30 33 45" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            <path d="M48 14 Q48 30 48 45" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            <path d="M62 16 Q60 30 63 45" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            {/* Hat Brim / Band */}
            <path
              d="M17 48 Q48 53 79 48 L76 56 Q48 61 20 56 Z"
              fill="url(#goldGradient)"
            />
          </g>

          {/* Cursive & Elegant "Ghosh" */}
          <text
            x="48"
            y="70"
            fontFamily="'Playfair Display', serif"
            fontSize="54"
            fontStyle="italic"
            fontWeight="700"
            fill="url(#goldGradient)"
            letterSpacing="-0.5"
          >
            Ghosh
          </text>

          {/* "SWEET HOUSE" in Gold Serif */}
          <text
            x="78"
            y="94"
            fontFamily="'Cinzel', serif"
            fontSize="18"
            fontWeight="700"
            letterSpacing="5.5"
            fill="url(#goldShine)"
          >
            SWEET HOUSE
          </text>

          {/* Three-leaf gold flourish ornament */}
          <g transform="translate(140, 103) scale(0.55)">
            <path
              d="M0 -3 C-4 -9, -9 -6, -5 -1 C-2 3, 0 5, 0 5 C0 5, 2 3, 5 -1 C9 -6, 4 -9, 0 -3 Z"
              fill="url(#goldGradient)"
            />
            <circle cx="-14" cy="0" r="1.5" fill="#D4AF37" />
            <circle cx="14" cy="0" r="1.5" fill="#D4AF37" />
            <line x1="-36" y1="0" x2="-18" y2="0" stroke="url(#goldGradient)" strokeWidth="1" opacity="0.7" />
            <line x1="18" y1="0" x2="36" y2="0" stroke="url(#goldGradient)" strokeWidth="1" opacity="0.7" />
          </g>

          {/* Tagline: Pure Sweets • Fresh Joy */}
          <text
            x="140"
            y="115"
            fontFamily="'Playfair Display', Georgia, serif"
            fontSize="10"
            fontStyle="italic"
            fontWeight="500"
            textAnchor="middle"
            fill={isDark ? '#F5E6BE' : '#8B5A2B'}
            letterSpacing="1.2"
          >
            Pure Sweets • Fresh Joy
          </text>
        </svg>
      </div>

      {/* Bengali Sub Brand Text */}
      <div className="hidden lg:flex flex-col border-l border-amber-500/30 pl-3">
        <span className="font-bengali text-sm font-semibold tracking-wide text-amber-400">
          ঘোষ মিষ্টান্ন ভাণ্ডার
        </span>
        <span className={`text-[10px] ${isDark ? 'text-amber-200/70' : 'text-amber-900/70'} tracking-wider font-bengali`}>
          দুইসাটাবিঘি, মালদা
        </span>
      </div>
    </div>
  );
};
