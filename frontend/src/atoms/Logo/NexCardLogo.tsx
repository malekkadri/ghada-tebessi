import React from 'react';

interface NexCardLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const NexCardLogo: React.FC<NexCardLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizes = {
    sm: { logo: 'w-8 h-8', text: 'text-lg' },
    md: { logo: 'w-10 h-10', text: 'text-xl' },
    lg: { logo: 'w-12 h-12', text: 'text-2xl' }
  };

  return (
    <div className={`nexcard-logo-container flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizes[size].logo} relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 48 48"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Définition des gradients */}
          <defs>
            <linearGradient id="nexcard-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06A3DA" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <linearGradient id="nexcard-accent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06A3DA" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Forme principale - Hexagone moderne */}
          <path
            d="M24 4 L36 12 L36 28 L24 36 L12 28 L12 12 Z"
            fill="url(#nexcard-primary)"
            className="drop-shadow-xl"
            filter="url(#glow)"
          />
          
          {/* Éléments géométriques internes */}
          <g transform="translate(24, 24)">
            {/* Cercle central */}
            <circle
              cx="0"
              cy="0"
              r="8"
              fill="white"
              fillOpacity="0.95"
            />
            
            {/* Icône de carte stylisée */}
            <rect
              x="-6"
              y="-4"
              width="12"
              height="8"
              rx="1.5"
              fill="#06A3DA"
              fillOpacity="0.8"
            />
            
            {/* Détails de la carte */}
            <rect x="-4" y="-2.5" width="6" height="0.8" rx="0.4" fill="white" fillOpacity="0.9" />
            <rect x="-4" y="-0.5" width="8" height="0.6" rx="0.3" fill="white" fillOpacity="0.7" />
            <rect x="-4" y="1" width="4" height="0.6" rx="0.3" fill="white" fillOpacity="0.7" />
            
            {/* Indicateur "Next" - Flèche innovante */}
            <path
              d="M6 -1 L9 0 L6 1 L6.5 0 Z"
              fill="white"
              className="animate-pulse"
            />
          </g>
          
          {/* Éléments décoratifs - Points connectés */}
          <circle cx="14" cy="14" r="1.5" fill="#06A3DA" fillOpacity="0.3" />
          <circle cx="34" cy="14" r="1.5" fill="#06A3DA" fillOpacity="0.3" />
          <circle cx="34" cy="34" r="1.5" fill="#06A3DA" fillOpacity="0.3" />
          <circle cx="14" cy="34" r="1.5" fill="#06A3DA" fillOpacity="0.3" />
          
          {/* Lignes de connexion subtiles */}
          <path
            d="M15 14 Q20 10 24 12"
            stroke="#06A3DA"
            strokeWidth="0.5"
            strokeOpacity="0.2"
            fill="none"
          />
          <path
            d="M33 15 Q28 20 24 18"
            stroke="#06A3DA"
            strokeWidth="0.5"
            strokeOpacity="0.2"
            fill="none"
          />
        </svg>
      </div>
      
      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${sizes[size].text} text-[#06A3DA] font-sans tracking-tight`}>
            NexCard
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1 font-medium">
            Next Gen Business Cards
          </span>
        </div>
      )}
    </div>
  );
};

export default NexCardLogo;
