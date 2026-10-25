import React from 'react';
import Logo from './Logo';

export default function Brand({
  size = 'md',
  showTagline = true,
  light = false,
  className = ''
}) {
  const logoSizes = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11'
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <Logo className={logoSizes[size] || logoSizes.md} />
      <div>
        <h1 className={`font-heading font-extrabold tracking-tight leading-none ${titleSizes[size] || titleSizes.md} ${
          light ? 'text-white' : 'text-slate-900'
        }`}>
          SkyIntel <span className="text-sky-500">AI</span>
        </h1>
        {showTagline && (
          <p className={`font-semibold uppercase tracking-wider mt-0.5 ${taglineSizes[size] || taglineSizes.md} ${
            light ? 'text-sky-200/80' : 'text-slate-500'
          }`}>
            Weather Intelligence
          </p>
        )}
      </div>
    </div>
  );
}
