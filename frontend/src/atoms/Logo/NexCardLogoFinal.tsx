import React from 'react';

interface NexCardLogoFinalProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const NexCardLogoFinal: React.FC<NexCardLogoFinalProps> = ({ 
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
      <div className={`${sizes[size].logo} relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 52 52"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="nexcard-final-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06A3DA" />
              <stop offset="40%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            
            <radialGradient id="nexcard-neon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06A3DA" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#06A3DA" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06A3DA" stopOpacity="0" />
            </radialGradient>
            
            <filter id="nexcard-modern-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="crystal-effect">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
              <feColorMatrix type="saturate" values="1.2"/>
            </filter>
          </defs>
          
          <circle
            cx="26"
            cy="26"
            r="24"
            fill="url(#nexcard-neon)"
            className="animate-pulse"
          />
          
          <g transform="translate(26, 26)">
            <path
              d="M -15 -8 L 0 -18 L 15 -8 L 20 0 L 15 8 L 0 18 L -15 8 L -20 0 Z"
              fill="url(#nexcard-final-gradient)"
              filter="url(#nexcard-modern-glow)"
              className="drop-shadow-2xl"
            />
            
            <path
              d="M -10 -5 L 0 -12 L 10 -5 L 0 0 Z"
              fill="white"
              fillOpacity="0.15"
            />
            <path
              d="M -10 5 L 0 12 L 10 5 L 0 0 Z"
              fill="#06A3DA"
              fillOpacity="0.3"
            />
            
            <g>
              <rect
                x="-8"
                y="-5"
                width="16"
                height="10"
                rx="2"
                fill="white"
                fillOpacity="0.95"
                filter="url(#crystal-effect)"
                className="drop-shadow-lg"
              />
              
              <linearGradient id="holo-strip" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06A3DA" stopOpacity="0" />
                <stop offset="30%" stopColor="#06A3DA" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#06A3DA" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#06A3DA" stopOpacity="0" />
              </linearGradient>
              
              <rect
                x="-8"
                y="-5"
                width="16"
                height="2"
                fill="url(#holo-strip)"
                rx="2"
                className="animate-pulse"
              />
              
              <rect x="-6" y="-2" width="7" height="1" rx="0.5" fill="#06A3DA" fillOpacity="0.9" />
              <rect x="-6" y="0" width="10" height="0.8" rx="0.4" fill="#06A3DA" fillOpacity="0.7" />
              <rect x="-6" y="2" width="6" height="0.8" rx="0.4" fill="#06A3DA" fillOpacity="0.5" />
              
              <g transform="translate(5, -2)">
                <rect x="0" y="0" width="2.5" height="2" rx="0.3" fill="#06A3DA" fillOpacity="0.8" />
                <circle cx="1.25" cy="1" r="0.4" fill="white" />
                <path d="M 0.9 0.7 Q 1.25 0.5 1.6 0.7" stroke="white" strokeWidth="0.15" fill="none" />
                <path d="M 0.9 1.3 Q 1.25 1.5 1.6 1.3" stroke="white" strokeWidth="0.15" fill="none" />
              </g>
            </g>
            
            <g className="animate-pulse">
              <circle cx="-12" cy="-6" r="1" fill="#06A3DA" fillOpacity="0.6" />
              <circle cx="12" cy="-6" r="1" fill="#06A3DA" fillOpacity="0.6" />
              <circle cx="12" cy="6" r="1" fill="#06A3DA" fillOpacity="0.6" />
              <circle cx="-12" cy="6" r="1" fill="#06A3DA" fillOpacity="0.6" />
            </g>
            
            <g stroke="#06A3DA" strokeWidth="0.8" fill="none" strokeOpacity="0.4">
              <path d="M -12 -6 Q -6 -10 0 -6" strokeDasharray="1,1" className="animate-pulse" />
              <path d="M 0 -6 Q 6 -10 12 -6" strokeDasharray="1,1" className="animate-pulse" />
              <path d="M 12 6 Q 6 10 0 6" strokeDasharray="1,1" className="animate-pulse" />
              <path d="M 0 6 Q -6 10 -12 6" strokeDasharray="1,1" className="animate-pulse" />
            </g>
          </g>
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-black ${sizes[size].text} bg-gradient-to-r from-[#06A3DA] via-[#0ea5e9] to-[#0284c7] bg-clip-text text-transparent tracking-tight`}>
            NexCard
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1 font-medium tracking-wide opacity-70">
            DIGITAL EVOLUTION
          </span>
        </div>
      )}
    </div>
  );
};

export default NexCardLogoFinal;
