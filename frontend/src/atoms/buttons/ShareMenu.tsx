import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaFacebook, FaTwitter, FaWhatsapp, FaLinkedin,
  FaTelegram, FaPinterest, FaReddit, FaEnvelope,
  FaLink, FaDownload
} from 'react-icons/fa';

interface ShareMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: () => void;
  onShare: (platform: string) => void;
  onDownloadVcf: () => void;
}

const ShareMenu: React.FC<ShareMenuProps> = ({ 
  isOpen, 
  onClose, 
  onCopy, 
  onShare, 
  onDownloadVcf 
}) => {
  const shareOptions = [
    { 
      name: 'Facebook', 
      icon: FaFacebook, 
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => onShare('facebook')
    },
    { 
      name: 'Twitter', 
      icon: FaTwitter, 
      color: 'bg-blue-400 hover:bg-blue-500',
      action: () => onShare('twitter')
    },
    { 
      name: 'WhatsApp', 
      icon: FaWhatsapp, 
      color: 'bg-green-500 hover:bg-green-600',
      action: () => onShare('whatsapp')
    },
    { 
      name: 'LinkedIn', 
      icon: FaLinkedin, 
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () => onShare('linkedin')
    },
    { 
      name: 'Telegram', 
      icon: FaTelegram, 
      color: 'bg-blue-400 hover:bg-blue-500',
      action: () => onShare('telegram')
    },
    { 
      name: 'Pinterest', 
      icon: FaPinterest, 
      color: 'bg-red-600 hover:bg-red-700',
      action: () => onShare('pinterest')
    },
    { 
      name: 'Reddit', 
      icon: FaReddit, 
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => onShare('reddit')
    },
    { 
      name: 'Email', 
      icon: FaEnvelope, 
      color: 'bg-red-500 hover:bg-red-600',
      action: () => onShare('email')
    },
    { 
      name: 'Copy Link', 
      icon: FaLink, 
      color: 'bg-gray-500 hover:bg-gray-600',
      action: onCopy
    },
    { 
      name: 'Download VCF', 
      icon: FaDownload, 
      color: 'bg-purple-500 hover:bg-purple-600',
      action: onDownloadVcf
    }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', damping: 25 }}
      className="absolute right-0 bottom-16 mb-2 w-64 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200"
    >
      <div className="p-2 grid grid-cols-2 gap-2">
        {shareOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.name}
              onClick={() => {
                option.action();
                onClose();
              }}
              className={`${option.color} text-white p-3 rounded-lg flex flex-col items-center justify-center transition-colors`}
              aria-label={`Share on ${option.name}`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{option.name}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ShareMenu;