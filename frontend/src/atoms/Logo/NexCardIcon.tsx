import React from 'react';

interface NexCardIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const NexCardIcon: React.FC<NexCardIconProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`${sizes[size]} relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 48 48"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="nexcard-icon-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06A3DA" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <filter id="icon-glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <path
          d="M24 4 L36 12 L36 28 L24 36 L12 28 L12 12 Z"
          fill="url(#nexcard-icon-primary)"
          className="drop-shadow-xl"
          filter="url(#icon-glow)"
        />
        
        <g transform="translate(24, 24)">
          <circle
            cx="0"
            cy="0"
            r="8"
            fill="white"
            fillOpacity="0.95"
          />
          
          <rect
            x="-6"
            y="-4"
            width="12"
            height="8"
            rx="1.5"
            fill="#06A3DA"
            fillOpacity="0.8"
          />
          
          <rect x="-4" y="-2.5" width="6" height="0.8" rx="0.4" fill="white" fillOpacity="0.9" />
          <rect x="-4" y="-0.5" width="8" height="0.6" rx="0.3" fill="white" fillOpacity="0.7" />
          <rect x="-4" y="1" width="4" height="0.6" rx="0.3" fill="white" fillOpacity="0.7" />
          
          <path
            d="M6 -1 L9 0 L6 1 L6.5 0 Z"
            fill="white"
            className="animate-pulse"
          />
        </g>
        
        <circle cx="14" cy="14" r="1.5" fill="#06A3DA" fillOpacity="0.3" />
        <circle cx="34" cy="14" r="1.5" fill="#06A3DA" fillOpacity="0.3" />
        <circle cx="34" cy="34" r="1.5" fill="#06A3DA" fillOpacity="0.3" />
        <circle cx="14" cy="34" r="1.5" fill="#06A3DA" fillOpacity="0.3" />
        
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
  );
};

export default NexCardIcon;
