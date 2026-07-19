"use client";

import React, { useRef, useState, MouseEvent, CSSProperties } from "react";

type ReflectiveCardProps = {
  children?: React.ReactNode;
  overlayColor?: string;
  blurStrength?: number;
  glassDistortion?: number;
  metalness?: number;
  roughness?: number;
  displacementStrength?: number;
  noiseScale?: number;
  specularConstant?: number;
  grayscale?: number;
  color?: string;
  className?: string;
};

export default function ReflectiveCard({
  children,
  overlayColor = "rgba(255, 255, 255, 0.1)",
  blurStrength = 12,
  glassDistortion = 30, // Unused in simplistic version, but kept for signature compatibility
  metalness = 1,
  roughness = 0.75,
  displacementStrength = 20,
  noiseScale = 1,
  specularConstant = 5,
  grayscale = 0.15,
  color = "#ffffff",
  className = "",
}: ReflectiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden isolate ${className}`}
      style={{
        background: overlayColor,
        backdropFilter: `blur(${blurStrength}px)`,
        WebkitBackdropFilter: `blur(${blurStrength}px)`,
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.05)",
      } as CSSProperties}
    >
      {/* Dynamic Interactive Spotlight / Reflection */}
      <div
        className="absolute inset-0 z-10 transition-opacity duration-500 pointer-events-none mix-blend-overlay"
        style={{
          opacity: isHovered ? metalness : metalness * 0.3,
          background: `radial-gradient(circle 600px at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.4), transparent 40%)`,
        }}
      />
      
      {/* Secondary colored reflection sheen based on cursor */}
      <div
        className="absolute inset-0 z-10 transition-opacity duration-300 pointer-events-none mix-blend-color-dodge"
        style={{
          opacity: isHovered ? roughness : 0,
          background: `radial-gradient(circle 400px at ${mousePos.x}% ${mousePos.y}%, ${color}20, transparent 60%)`,
        }}
      />

      {/* Surface Noise Texture */}
      {noiseScale > 0 && (
        <svg
          className="absolute inset-0 z-0 h-full w-full pointer-events-none mix-blend-overlay"
          style={{ opacity: 0.15 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="reflective-card-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={noiseScale * 0.8}
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values={grayscale.toString()} />
          </filter>
          <rect width="100%" height="100%" filter="url(#reflective-card-noise)" />
        </svg>
      )}

      {/* Main Content */}
      <div className="relative z-20 h-full w-full">
        {children}
      </div>
    </div>
  );
}
