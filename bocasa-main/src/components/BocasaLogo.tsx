import React from 'react';

interface BocasaLogoProps {
  variant?: 'full' | 'symbol';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isDark?: boolean;
  className?: string;
  showBadge?: boolean;
  badgeText?: string;
  onClick?: () => void;
}

const SIZE_MAP = {
  xs: {
    fullHeight: 'h-5',
    symbolSize: 'w-5 h-5',
    textClass: 'text-xs',
  },
  sm: {
    fullHeight: 'h-6 sm:h-7',
    symbolSize: 'w-7 h-7',
    textClass: 'text-sm',
  },
  md: {
    fullHeight: 'h-7 sm:h-8',
    symbolSize: 'w-8 h-8',
    textClass: 'text-base',
  },
  lg: {
    fullHeight: 'h-9 sm:h-10',
    symbolSize: 'w-10 h-10',
    textClass: 'text-xl',
  },
  xl: {
    fullHeight: 'h-12 sm:h-14',
    symbolSize: 'w-14 h-14',
    textClass: 'text-2xl',
  },
};

export const BocasaLogo: React.FC<BocasaLogoProps> = ({
  variant = 'full',
  size = 'md',
  isDark = false,
  className = '',
  showBadge = false,
  badgeText = 'AI REPRICER',
  onClick,
}) => {
  const currentSize = SIZE_MAP[size] || SIZE_MAP.md;

  if (variant === 'symbol') {
    return (
      <div 
        onClick={onClick}
        className={`relative inline-flex items-center justify-center shrink-0 select-none ${onClick ? 'cursor-pointer transition-transform hover:scale-105 active:scale-95' : ''} ${className}`}
        title="BOCASA"
      >
        <img
          src={isDark ? '/bocasa-symbol-white.png' : '/bocasa-symbol.png'}
          alt="BOCASA"
          className={`${currentSize.symbolSize} object-contain transition-opacity duration-200`}
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center space-x-2 shrink-0 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      title="BOCASA — Autonomous Decision Intelligence"
    >
      <div className="relative flex items-center">
        {/* Light theme logo */}
        <img
          src="/bocasa-logo.png"
          alt="BOCASA"
          className={`${currentSize.fullHeight} w-auto object-contain transition-all duration-300 dark:hidden ${onClick ? 'group-hover:brightness-110' : ''}`}
          loading="eager"
        />
        {/* Dark theme logo */}
        <img
          src="/bocasa-logo-white.png"
          alt="BOCASA"
          className={`${currentSize.fullHeight} w-auto object-contain transition-all duration-300 hidden dark:block ${onClick ? 'group-hover:brightness-125' : ''}`}
          loading="eager"
        />
      </div>

      {showBadge && (
        <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-slate-700">
          {badgeText}
        </span>
      )}
    </div>
  );
};
