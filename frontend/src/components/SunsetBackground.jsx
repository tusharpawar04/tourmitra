import React, { memo } from 'react';

const SunsetBackground = memo(() => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      willChange: 'auto',
      contain: 'strict',
    }}>
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky gradient */}
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A0D2E" />
            <stop offset="15%" stopColor="#2D1B4E" />
            <stop offset="35%" stopColor="#6B2C5A" />
            <stop offset="50%" stopColor="#C0446A" />
            <stop offset="65%" stopColor="#D4613C" />
            <stop offset="78%" stopColor="#E8622A" />
            <stop offset="88%" stopColor="#F5A623" />
            <stop offset="95%" stopColor="#FCC74B" />
            <stop offset="100%" stopColor="#F5D98A" />
          </linearGradient>

          {/* Sun glow */}
          <radialGradient id="sunGlow" cx="50%" cy="72%" r="20%">
            <stop offset="0%" stopColor="#FFF7E0" stopOpacity="1" />
            <stop offset="25%" stopColor="#FCC74B" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#F5A623" stopOpacity="0.5" />
            <stop offset="75%" stopColor="#E8622A" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#E8622A" stopOpacity="0" />
          </radialGradient>

          {/* Bloom */}
          <radialGradient id="sunBloom" cx="50%" cy="72%" r="35%">
            <stop offset="0%" stopColor="#FCC74B" stopOpacity="0.3" />
            <stop offset="40%" stopColor="#F5A623" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#E8622A" stopOpacity="0" />
          </radialGradient>

          {/* Water reflection */}
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5A623" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#E8622A" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1A0D2E" stopOpacity="0.8" />
          </linearGradient>

          {/* Cloud filter — reduced deviation for performance */}
          <filter id="cloudBlur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Sky */}
        <rect width="1440" height="900" fill="url(#skyGrad)" />

        {/* Sun bloom (outer) — static, no animation for perf */}
        <circle cx="720" cy="648" r="270" fill="url(#sunBloom)" opacity="0.85" />

        {/* Sun glow */}
        <circle cx="720" cy="648" r="185" fill="url(#sunGlow)" />

        {/* Sun orb */}
        <circle cx="720" cy="648" r="52" fill="#FFF7E0" opacity="0.95" />
        <circle cx="720" cy="648" r="45" fill="#FFFFFF" opacity="0.7" />

        {/* Light rays — reduced to 5 */}
        {[...Array(5)].map((_, i) => {
          const angle = (i * 36) - 90;
          const rad = (angle * Math.PI) / 180;
          const x2 = 720 + Math.cos(rad) * 500;
          const y2 = 648 + Math.sin(rad) * 500;
          return (
            <line key={`ray-${i}`} x1="720" y1="648" x2={x2} y2={y2}
              stroke="#FCC74B" strokeWidth="1.5" opacity="0.08"
              strokeLinecap="round">
              <animate attributeName="opacity" values="0.05;0.12;0.05"
                dur={`${5 + i}s`} repeatCount="indefinite" />
            </line>
          );
        })}

        {/* Cloud Layer 1 (far, slow) */}
        <g filter="url(#cloudBlur)" opacity="0.15">
          <path d="M-200,280 Q-100,250 0,270 Q100,290 200,260 Q300,230 400,265 Q500,300 600,270 Q700,240 800,275 L800,310 Q700,290 600,310 Q500,330 400,300 Q300,270 200,300 Q100,330 0,310 Q-100,290 -200,310 Z" fill="white">
            <animateTransform attributeName="transform" type="translate" values="0,0;1600,0" dur="120s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Cloud Layer 2 */}
        <g filter="url(#cloudBlur)" opacity="0.12">
          <path d="M-300,320 Q-200,290 -100,310 Q0,330 100,300 Q200,270 300,305 Q400,340 500,310 Q600,280 700,315 Q800,350 900,320 L900,360 Q800,380 700,360 Q600,340 500,365 Q400,390 300,360 Q200,330 100,355 Q0,380 -100,360 Q-200,340 -300,360 Z" fill="white">
            <animateTransform attributeName="transform" type="translate" values="0,0;1800,0" dur="90s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Cloud Layer 3 (near, faster) */}
        <g filter="url(#cloudBlur)" opacity="0.18">
          <path d="M-400,380 Q-300,355 -200,370 Q-100,390 0,365 Q100,340 200,372 Q300,400 400,370 Q500,345 600,380 L600,410 Q500,395 400,415 Q300,435 200,410 Q100,390 0,415 Q-100,440 -200,415 Q-300,395 -400,415 Z" fill="white">
            <animateTransform attributeName="transform" type="translate" values="0,0;2000,0" dur="70s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Mountain silhouette layer (back) */}
        <path d="M0,750 L0,680 Q80,620 160,660 Q240,700 320,640 Q400,580 480,630 Q560,680 640,620 Q720,560 800,610 Q880,660 960,600 Q1040,540 1120,590 Q1200,640 1280,600 Q1360,560 1440,610 L1440,750 Z"
          fill="#1A0D2E" opacity="0.6" />

        {/* Mountain silhouette (front) */}
        <path d="M0,750 L0,710 Q60,680 120,700 Q200,730 280,690 Q360,650 440,685 Q520,720 600,670 Q680,620 760,660 Q840,700 920,660 Q1000,620 1080,665 Q1160,710 1240,680 Q1320,650 1440,690 L1440,750 Z"
          fill="#1A0D2E" opacity="0.85" />

        {/* Ground/water strip */}
        <rect x="0" y="750" width="1440" height="150" fill="url(#waterGrad)" />

        {/* Water shimmer lines — reduced to 3 */}
        {[...Array(3)].map((_, i) => (
          <line key={`shimmer-${i}`}
            x1={560 + i * 120} y1={770 + i * 15}
            x2={640 + i * 120} y2={770 + i * 15}
            stroke="#FCC74B" strokeWidth="1" opacity="0.2"
            strokeLinecap="round">
            <animate attributeName="opacity" values="0.1;0.3;0.1"
              dur={`${3 + i * 0.8}s`} repeatCount="indefinite" />
          </line>
        ))}

        {/* Floating particles — reduced to 8 */}
        {[...Array(8)].map((_, i) => {
          const cx = 250 + (i * 150) % 1000;
          const startY = 650 - (i * 60) % 350;
          const size = 1.2 + (i % 3) * 0.6;
          const dur = 12 + (i * 4) % 12;
          const delay = (i * 2) % 8;
          return (
            <circle key={`particle-${i}`} cx={cx} cy={startY} r={size}
              fill="#FCC74B" opacity="0.3">
              <animate attributeName="cy" values={`${startY};${startY - 250};${startY}`}
                dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.35;0.15;0"
                dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
            </circle>
          );
        })}
      </svg>
    </div>
  );
});

SunsetBackground.displayName = 'SunsetBackground';

export default SunsetBackground;
