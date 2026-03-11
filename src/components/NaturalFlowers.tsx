import React from "react";

/**
 * Custom SVG Flowers for a more natural look instead of emojis.
 * Each SVG is designed to be absolute positioned so they can be stacked in a bouquet.
 * Used by the Bouquet component for 3D stackable flower arrangements.
 */

export const NaturalRose = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stem */}
    <path d="M50 60 C50 80 45 100 48 120" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
    <path d="M49 80 C60 75 70 85 75 80" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
    <path d="M60 81 C65 72 75 75 75 80 C70 88 60 85 60 81 Z" fill="#22c55e" />
    <path d="M50 95 C35 100 30 90 25 95" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
    <path d="M38 96 C30 102 20 95 25 95 C35 90 40 100 38 96 Z" fill="#22c55e" />
    
    {/* Rose Petals */}
    <path d="M50 65 C20 65 15 35 30 25 C45 15 55 15 70 25 C85 35 80 65 50 65 Z" fill="#be123c" />
    <path d="M50 60 C30 60 25 40 35 30 C45 20 55 20 65 30 C75 40 70 60 50 60 Z" fill="#e11d48" />
    <path d="M50 55 C35 55 35 45 42 38 C48 32 52 32 58 38 C65 45 65 55 50 55 Z" fill="#f43f5e" />
    <path d="M50 48 C42 48 42 42 46 38 C50 35 50 35 54 38 C58 42 58 48 50 48 Z" fill="#fb7185" />
  </svg>
);

export const NaturalSunflower = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stem */}
    <path d="M50 50 C50 80 52 100 50 120" stroke="#14532d" strokeWidth="4" strokeLinecap="round" />
    <path d="M50 75 C65 70 80 85 85 80 C75 90 55 85 50 75 Z" fill="#4ade80" />
    <path d="M51 90 C35 95 20 85 15 90 C25 100 45 105 51 90 Z" fill="#4ade80" />
    
    {/* Petals layer 1 */}
    <g fill="#eab308">
      {[...Array(12)].map((_, i) => (
        <path key={i} d="M50 50 L56 15 L50 5 L44 15 Z" transform={`rotate(${i * 30} 50 50)`} />
      ))}
    </g>
    {/* Petals layer 2 */}
    <g fill="#fde047">
      {[...Array(12)].map((_, i) => (
        <path key={i} d="M50 50 L54 22 L50 12 L46 22 Z" transform={`rotate(${i * 30 + 15} 50 50)`} />
      ))}
    </g>
    
    {/* Center */}
    <circle cx="50" cy="50" r="18" fill="#422006" />
    <circle cx="50" cy="50" r="14" fill="#713f12" stroke="#422006" strokeWidth="2" strokeDasharray="2 2" />
  </svg>
);

export const NaturalTulip = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stem */}
    <path d="M50 50 C48 80 50 100 48 120" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
    <path d="M49 80 C60 60 75 40 70 30 C60 50 50 70 49 80 Z" fill="#22c55e" />
    <path d="M50 90 C35 70 20 60 25 45 C35 60 45 80 50 90 Z" fill="#22c55e" />
    
    {/* Tulip Head */}
    <path d="M40 55 C25 55 30 20 35 15 C40 30 40 40 45 45 Z" fill="#c026d3" />
    <path d="M60 55 C75 55 70 20 65 15 C60 30 60 40 55 45 Z" fill="#d946ef" />
    <path d="M35 50 C35 15 50 5 50 5 C50 5 65 15 65 50 C65 65 35 65 35 50 Z" fill="#f0abfc" />
    <path d="M45 50 C45 25 50 15 50 15 C50 15 55 25 55 50 C55 60 45 60 45 50 Z" fill="#e879f9" />
  </svg>
);

export const NaturalLily = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stem */}
    <path d="M50 60 C52 80 48 100 50 120" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
    
    {/* Leaves */}
    <path d="M50 85 C70 80 90 70 85 65 C70 75 55 80 50 85 Z" fill="#15803d" />
    <path d="M50 100 C30 95 10 90 15 80 C30 90 45 95 50 100 Z" fill="#15803d" />
    
    {/* Lily Petals (White/Pinkish) */}
    {[...Array(6)].map((_, i) => (
      <path 
        key={i} 
        d="M50 55 C55 35 80 15 85 20 C60 30 55 50 50 55 Z" 
        fill={i % 2 === 0 ? "#ffffff" : "#fdf2f8"} 
        stroke="#fda4af" 
        strokeWidth="0.5"
        transform={`rotate(${i * 60} 50 55)`} 
      />
    ))}
    
    {/* Stamen */}
    {[...Array(5)].map((_, i) => (
      <g key={`stamen-${i}`} transform={`rotate(${i * 72 + 15} 50 55)`}>
        <path d="M50 55 L58 40" stroke="#fef08a" strokeWidth="1" />
        <circle cx="58" cy="40" r="2" fill="#ca8a04" />
      </g>
    ))}
    <circle cx="50" cy="55" r="3" fill="#bef264" />
  </svg>
);
