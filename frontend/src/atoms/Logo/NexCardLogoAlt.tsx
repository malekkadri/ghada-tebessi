import React from 'react';

interface NexCardLogoAltProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  variant?: 'default' | 'minimal' | 'tech';
}

const NexCardLogoAlt: React.FC<NexCardLogoAltProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  variant = 'default'
}) => {
  const sizes = {
    sm: { logo: 'w-8 h-8', text: 'text-lg' },
    md: { logo: 'w-10 h-10', text: 'text-xl' },
    lg: { logo: 'w-12 h-12', text: 'text-2xl' }
  };

  const renderTechVariant = () => (
    <svg
      viewBox="0 0 50 50"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tech-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06A3DA" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <filter id="tech-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <path
        d="M25 2 L42 10 L45 25 L35 42 L15 42 L5 25 L8 10 Z"
        fill="url(#tech-gradient)"
        filter="url(#tech-glow)"
        className="drop-shadow-2xl"
      />
      
      <g stroke="#ffffff" strokeWidth="0.8" fill="none" opacity="0.4">
        <path d="M15 15 L20 15 L20 20" />
        <path d="M30 15 L35 15 L35 20" />
        <path d="M15 35 L20 35 L20 30" />
        <path d="M30 35 L35 35 L35 30" />
        <circle cx="20" cy="20" r="1" fill="white" />
        <circle cx="30" cy="20" r="1" fill="white" />
        <circle cx="20" cy="30" r="1" fill="white" />
        <circle cx="30" cy="30" r="1" fill="white" />
      </g>
      
      {/* Carte centrale avec effet holographique */}
      <g transform="translate(25, 25)">
        <rect
          x="-8"
          y="-5"
          width="16"
          height="10"
          rx="2"
          fill="white"
          fillOpacity="0.95"
          className="drop-shadow-lg"
        />
        
        {/* Hologram effect */}
        <rect
          x="-8"
          y="-5"
          width="16"
          height="2"
          fill="url(#tech-gradient)"
          fillOpacity="0.6"
          rx="2"
        />
        
        {/* Digital elements */}
        <rect x="-6" y="-2" width="8" height="1" rx="0.5" fill="#06A3DA" fillOpacity="0.8" />
        <rect x="-6" y="0" width="10" height="0.8" rx="0.4" fill="#06A3DA" fillOpacity="0.6" />
        <rect x="-6" y="2" width="6" height="0.8" rx="0.4" fill="#06A3DA" fillOpacity="0.4" />
        
        {/* Data flow indicator */}
        <g className="animate-pulse">
          <circle cx="6" cy="-3" r="0.8" fill="#06A3DA" />
          <circle cx="6" cy="0" r="0.8" fill="#06A3DA" fillOpacity="0.7" />
          <circle cx="6" cy="3" r="0.8" fill="#06A3DA" fillOpacity="0.5" />
        </g>
      </g>
      
      {/* Connection nodes */}
      <circle cx="12" cy="12" r="2" fill="#06A3DA" fillOpacity="0.3" />
      <circle cx="38" cy="12" r="2" fill="#06A3DA" fillOpacity="0.3" />
      <circle cx="38" cy="38" r="2" fill="#06A3DA" fillOpacity="0.3" />
      <circle cx="12" cy="38" r="2" fill="#06A3DA" fillOpacity="0.3" />
      
      {/* Data streams */}
      <path
        d="M14 12 Q20 8 25 12"
        stroke="#06A3DA"
        strokeWidth="1"
        strokeOpacity="0.4"
        fill="none"
        strokeDasharray="2,2"
        className="animate-pulse"
      />
    </svg>
  );

  const renderMinimalVariant = () => (
    <svg
      viewBox="0 0 40 40"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="minimal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06A3DA" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      
      {/* Forme simple et élégante */}
      <rect
        x="5"
        y="5"
        width="30"
        height="30"
        rx="8"
        fill="url(#minimal-gradient)"
        className="drop-shadow-lg"
      />
      
      {/* Icône minimaliste */}
      <g transform="translate(20, 20)">
        <rect
          x="-8"
          y="-5"
          width="16"
          height="10"
          rx="2"
          fill="white"
          fillOpacity="0.9"
        />
        <rect x="-6" y="-2" width="6" height="1" rx="0.5" fill="#06A3DA" />
        <rect x="-6" y="0" width="8" height="0.8" rx="0.4" fill="#06A3DA" fillOpacity="0.7" />
        <rect x="-6" y="2" width="4" height="0.8" rx="0.4" fill="#06A3DA" fillOpacity="0.5" />
      </g>
    </svg>
  );

  const renderDefaultVariant = () => (
    <svg
      viewBox="0 0 48 48"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="default-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06A3DA" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <filter id="default-glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Forme principale */}
      <path
        d="M24 4 L36 12 L36 28 L24 36 L12 28 L12 12 Z"
        fill="url(#default-gradient)"
        className="drop-shadow-xl"
        filter="url(#default-glow)"
      />
      
      <g transform="translate(24, 24)">
        <circle cx="0" cy="0" r="8" fill="white" fillOpacity="0.95" />
        <rect x="-6" y="-4" width="12" height="8" rx="1.5" fill="#06A3DA" fillOpacity="0.8" />
        <rect x="-4" y="-2.5" width="6" height="0.8" rx="0.4" fill="white" fillOpacity="0.9" />
        <rect x="-4" y="-0.5" width="8" height="0.6" rx="0.3" fill="white" fillOpacity="0.7" />
        <rect x="-4" y="1" width="4" height="0.6" rx="0.3" fill="white" fillOpacity="0.7" />
        <path d="M6 -1 L9 0 L6 1 L6.5 0 Z" fill="white" className="animate-pulse" />
      </g>
      
      <circle cx="14" cy="14" r="1.5" fill="#06A3DA" fillOpacity="0.3" />
      <circle cx="34" cy="14" r="1.5" fill="#06A3DA" fillOpacity="0.3" />
      <circle cx="34" cy="34" r="1.5" fill="#06A3DA" fillOpacity="0.3" />
      <circle cx="14" cy="34" r="1.5" fill="#06A3DA" fillOpacity="0.3" />
    </svg>
  );

  const renderLogo = () => {
    switch (variant) {
      case 'tech':
        return renderTechVariant();
      case 'minimal':
        return renderMinimalVariant();
      default:
        return renderDefaultVariant();
    }
  };

  return (
    <div className={`nexcard-logo-container flex items-center space-x-3 ${className}`}>
      <div className={`${sizes[size].logo} relative flex items-center justify-center`}>
        {renderLogo()}
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${sizes[size].text} text-[#06A3DA] font-sans tracking-tight`}>
            NexCard
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1 font-medium">
            {variant === 'tech' ? 'Digital Innovation' : 'Next Gen Business Cards'}
          </span>
        </div>
      )}
    </div>
  );
};

export default NexCardLogoAlt;
