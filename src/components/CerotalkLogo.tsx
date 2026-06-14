/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CerotalkLogoProps {
  className?: string; // Additional classes for sizing/spacing
  showText?: boolean;
}

const officialLogoUrl = new URL('../../assets/cerotalk-official-logo.png', import.meta.url).href;

export default function CerotalkLogo({ className = 'h-8', showText = true }: CerotalkLogoProps) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        id="cerotalk-official-logo"
        src={officialLogoUrl}
        alt={showText ? 'Cerotalk' : 'C'}
        className="h-full w-auto object-contain drop-shadow-[0_0_7px_rgba(0,191,178,0.22)]"
        draggable={false}
      />
    </div>
  );
}
