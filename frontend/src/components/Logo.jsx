import React, { useId } from 'react';

export default function Logo({
  className = 'h-10 w-10',
  glow = true,
  variant = 'icon',
  title = 'SkyIntel AI Logo'
}) {
  const rawId = useId();
  // sanitize id for SVG spec compliance (remove colons)
  const uid = rawId.replace(/:/g, '_');

  const skyGradId = `sky-grad-${uid}`;
  const goldGradId = `gold-grad-${uid}`;
  const accentGradId = `accent-grad-${uid}`;
  const glowFilterId = `glow-filter-${uid}`;

  return (
    <svg
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      viewBox="0 0 48 48"
      fill="none"
      aria-label={title}
      role="img"
    >
      <defs>
        {/* Futuristic Sky Blue -> Violet Linear Gradient */}
        <linearGradient id={skyGradId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="0.5" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>

        {/* Executive Amber/Gold Rain Drop Gradient */}
        <linearGradient id={goldGradId} x1="16" y1="10" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef08a" />
          <stop offset="0.4" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>

        {/* Crisp Cyan Highlight */}
        <linearGradient id={accentGradId} x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>

        {/* Subtle Ambient Glow Filter */}
        {glow && (
          <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {/* Background Glow Layer */}
      {glow && (
        <path
          d="M24 4 L38 12 L38 28 L24 44 L10 28 L10 12 Z"
          fill={`url(#${skyGradId})`}
          opacity="0.2"
          className="animate-pulse"
        />
      )}

      {/* Hexagonal Atmospheric Shield Outline */}
      <path
        d="M24 4 L38 12 L38 28 L24 44 L10 28 L10 12 Z"
        fill={`url(#${skyGradId})`}
        fillOpacity="0.12"
        stroke={`url(#${skyGradId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={glow ? `url(#${glowFilterId})` : undefined}
      />

      {/* Inner Cloud / Atmospheric Arc Curves */}
      <path
        d="M15 24 C18 17, 28 17, 33 24"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M18 29 C21 24, 27 24, 30 29"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* Central Teardrop Hydrological Core */}
      <path
        d="M24 13 C24 13, 17 21.5, 17 25.5 C17 29.3, 20.1 32, 24 32 C27.9 32, 31 29.3, 31 25.5 C31 21.5, 24 13, 24 13 Z"
        fill={`url(#${goldGradId})`}
        className="drop-shadow-md"
      />

      {/* Cardinal Telemetry Crosshair Ticks */}
      <line x1="24" y1="7" x2="24" y2="9.5" stroke={`url(#${accentGradId})`} strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="38.5" x2="24" y2="41" stroke={`url(#${accentGradId})`} strokeWidth="2" strokeLinecap="round" />
      <line x1="7" y1="24" x2="9.5" y2="24" stroke={`url(#${accentGradId})`} strokeWidth="2" strokeLinecap="round" />
      <line x1="38.5" y1="24" x2="41" y2="24" stroke={`url(#${accentGradId})`} strokeWidth="2" strokeLinecap="round" />

      {/* High-tech Inner Signal Dot */}
      <circle cx="24" cy="24" r="1.8" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}
