/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CerotalkLogoProps {
  className?: string; // Additional classes for sizing/spacing
  showText?: boolean;
}

export default function CerotalkLogo({ className = 'h-8', showText = true }: CerotalkLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon SVG */}
      <svg 
        id="cerotalk-icon-svg"
        viewBox="0 0 100 100" 
        className="h-full w-auto filter drop-shadow-md"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* The Outer Teal 'C' character */}
        <path 
          d="M75,25 C62,11 38,11 25,25 C10,40 10,64 25,79 C38,92 61,92 73,80 C74.2,78.8 74.5,77 73.8,75.5 C73.1,74 71.5,73 69.8,73 L69.5,73 C67,73 65.5,74.5 64.2,75.8 C54,84.5 38.5,84 28.5,74.5 C17,63.5 17,45.5 28.5,34.5 C38.5,25 54,24.5 64,33 C64.7,33.5 65.5,33.8 66.4,33.8 L74.5,33.8 C76.5,33.8 78,32 77.8,30 C77.5,28.2 76.5,26.5 75,25 Z" 
          fill="#00bfb2" 
        />
        {/* The Inner Orange 'T' character, beautifully stylized nested inside */}
        <path 
          d="M77.5,36.5 C74,38 70,39 65.5,39.2 L65,39.2 C57.5,39.5 50.5,39.2 46,41 C43.5,42 41,45.5 41.5,49 C42.2,52.5 40.8,55 41.5,60 C42,64 42.5,68 42,75 C41.8,78.5 39,81 35.5,81.2 L35.2,81.2 C31.5,81.2 28.5,78.2 28.5,74.5 L29,54 C29,48 31,43.5 33.5,41 C37.5,37 43.5,35.5 49.5,35 L62.5,34.5 C70,34 76.5,31 82.5,23 C83.2,22 84.8,21.8 85.8,22.5 C86.8,23.2 87,24.8 86,25.8 C82.5,30 80,33.5 77.5,36.5 Z" 
          fill="#ff9f1c" 
        />
      </svg>

      {/* Brand Text */}
      {showText && (
        <span id="cerotalk-brand-text" className="font-sans font-bold text-[25px] leading-none tracking-tight flex">
          <span className="text-[#00bfb2]">Cero</span>
          <span className="text-[#ff9f1c]">talk</span>
        </span>
      )}
    </div>
  );
}
