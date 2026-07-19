"use client";

import React, { CSSProperties, PropsWithChildren } from "react";

type ElectricBorderProps = PropsWithChildren<{
  color?: string;
  speed?: number;
  chaos?: number;
  thickness?: number;
  style?: CSSProperties;
  className?: string;
}>;

const ElectricBorder: React.FC<ElectricBorderProps> = ({
  children,
  color = "#3B82F6",
  speed = 1,
  chaos = 0.12,
  thickness = 2,
  style,
  className = "",
}) => {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ padding: thickness, ...style }}
    >
      {/* Background spin gradient */}
      <div
        className="absolute inset-[-150%] z-0 animate-[spin_linear_infinite]"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, transparent 0%, transparent 60%, ${color} 100%)`,
          animationDuration: `${3 / speed}s`,
        }}
      />
      {/* SVG Turbulence overlay */}
      {chaos > 0 && (
        <svg
          className="absolute inset-0 z-0 h-full w-full opacity-60 mix-blend-overlay pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id={`electric-noise-${chaos}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency={chaos}
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="3" />
            </feComponentTransfer>
          </filter>
          <rect width="100%" height="100%" filter={`url(#electric-noise-${chaos})`} />
        </svg>
      )}
      <div className="relative z-10 h-full w-full bg-white rounded-[inherit]">
        {children}
      </div>
    </div>
  );
};

export default ElectricBorder;
