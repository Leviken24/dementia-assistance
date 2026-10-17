import React from 'react';

export function DieFace({ value = 1, size = 96, className = '' }) {
  const clamped = Math.max(1, Math.min(6, Number(value) || 1));

  // Precomputed dot centers for a 100x100 box
  const dotCoords = {
    1: [[50, 50]],
    2: [[30, 30], [70, 70]],
    3: [[30, 30], [50, 50], [70, 70]],
    4: [[30, 30], [70, 30], [30, 70], [70, 70]],
    5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
    6: [[30, 28], [70, 28], [30, 50], [70, 50], [30, 72], [70, 72]]
  };

  const dots = dotCoords[clamped] || dotCoords[1];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-label={`Die face showing ${clamped} dot${clamped > 1 ? 's' : ''}`}
      role="img"
      className={className}
      style={{
        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.12))',
        borderRadius: '20px'
      }}
    >
      {/* Die Body */}
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="20"
        fill="var(--bg-surface)"
        stroke="var(--border-color)"
        strokeWidth="6"
      />

      {/* Dots */}
      {dots.map(([cx, cy], idx) => (
        <circle
          key={idx}
          cx={cx}
          cy={cy}
          r="9"
          fill="var(--accent-color)"
        />
      ))}
    </svg>
  );
}
