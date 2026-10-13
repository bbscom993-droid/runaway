import React from 'react';

interface ModernGraffitiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tagline?: string;
  showTagline?: boolean;
  className?: string;
  customText?: string;
}

export const ModernGraffitiLogo: React.FC<ModernGraffitiLogoProps> = ({
  size = 'md',
  tagline = 'Jembatan Informasi Nusantara',
  showTagline = true,
  className = '',
  customText,
}) => {
  // Split customText or default into two parts: "ARUN" and "NEWS"
  let firstWord = 'ARUN';
  let secondWord = 'NEWS';

  if (customText) {
    const parts = customText.trim().split(/\s+/);
    if (parts.length >= 2) {
      firstWord = parts[0];
      secondWord = parts.slice(1).join(' ');
    } else if (parts.length === 1 && parts[0]) {
      firstWord = parts[0];
      secondWord = '';
    }
  }

  const sizeClasses = {
    sm: {
      text: 'text-lg sm:text-xl',
      dot: 'w-2 h-2',
      tagline: 'text-[9px] sm:text-[10px]',
      gap: 'gap-1.5',
    },
    md: {
      text: 'text-2xl sm:text-3xl',
      dot: 'w-2.5 h-2.5',
      tagline: 'text-[11px] sm:text-xs',
      gap: 'gap-2',
    },
    lg: {
      text: 'text-3xl sm:text-4xl',
      dot: 'w-3 h-3',
      tagline: 'text-xs sm:text-sm',
      gap: 'gap-2.5',
    },
    xl: {
      text: 'text-4xl sm:text-5xl lg:text-6xl',
      dot: 'w-3.5 h-3.5',
      tagline: 'text-sm sm:text-base',
      gap: 'gap-3',
    },
  }[size];

  return (
    <div className={`flex flex-col select-none ${className}`}>
      <div className={`elegant-3d-wordmark ${sizeClasses.gap} group-hover:scale-102 transition-transform duration-200`}>
        {/* First Word (ARUN) - Elegant 3D Font in Majestic Gold Extrusion */}
        <span 
          className={`font-elegant-3d font-black uppercase inline-block select-none elegant-3d-gold tracking-widest ${sizeClasses.text}`}
          style={{ letterSpacing: '0.08em' }}
        >
          {firstWord}
        </span>

        {/* Second Word (NEWS) - Elegant 3D Font in Crisp Platinum Bevel */}
        {secondWord && (
          <span 
            className={`font-elegant-3d font-black uppercase inline-block select-none elegant-3d-platinum tracking-widest ${sizeClasses.text}`}
            style={{ letterSpacing: '0.09em' }}
          >
            {secondWord}
          </span>
        )}

        {/* Elegant Diamond / Gold Light Accent */}
        <span 
          className={`inline-block ${sizeClasses.dot} rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 animate-pulse shadow-[0_0_12px_#facc15] ml-0.5 border border-yellow-200`} 
          title="Arun News Portal"
        />
      </div>

      {/* Elegant 3D Sub-Tagline */}
      {showTagline && tagline && (
        <div className="hidden sm:flex items-center gap-1.5 mt-0.5 sm:mt-1">
          <span className="h-[2px] w-2.5 sm:w-4 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 rounded-full inline-block shadow-[0_0_6px_#facc15]" />
          <span 
            className={`font-elegant-3d tracking-widest text-yellow-300 dark:text-yellow-400 elegant-3d-tagline uppercase select-none ${sizeClasses.tagline}`}
            style={{ letterSpacing: '0.14em' }}
          >
            {tagline}
          </span>
          <span className="h-[2px] w-2.5 sm:w-4 bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-400 rounded-full inline-block shadow-[0_0_6px_#facc15]" />
        </div>
      )}
    </div>
  );
};

export default ModernGraffitiLogo;
