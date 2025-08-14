import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaQrcode, FaShareAlt } from 'react-icons/fa';
import ShareMenu from './ShareMenu';
import QRCodeModal from './../../modals/QRCodeModal';
import { VCard } from '../../services/vcard'; 

interface FloatingButtonsProps {
  qrCodeUrl?: string | null;
  isShareEnabled: boolean;
  onCopy: () => void;
  onShare: (platform: string) => void;
  onDownloadVcf: () => void;
  vcard: Pick<VCard, 'name' | 'url'>; 
}

const FloatingButtons: React.FC<FloatingButtonsProps> = ({ 
  isShareEnabled,
  onCopy,
  onShare,
  onDownloadVcf,
  vcard
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 flex space-x-3 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowQRModal(true)}
          className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
          title="Show QR Code"
          aria-label="Show QR Code"
        >
          <FaQrcode className="text-gray-700" size={20} />
        </motion.button>

        {isShareEnabled && (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
              title="Share"
              aria-label="Share options"
              aria-expanded={showShareMenu}
            >
              <FaShareAlt className="text-gray-700" size={20} />
            </motion.button>
            
            <ShareMenu
              isOpen={showShareMenu}
              onClose={() => setShowShareMenu(false)}
              onCopy={onCopy}
              onShare={onShare}
              onDownloadVcf={onDownloadVcf}
            />
          </div>
        )}
      </div>

      {showQRModal && (
        <QRCodeModal 
          vcard={vcard} 
          isOpen={showQRModal} 
          onClose={() => setShowQRModal(false)} 
        />
      )}
    </>
  );
};

export default FloatingButtons;