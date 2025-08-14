import React from 'react';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';

interface QRCodeModalProps {
  vcard: {
    name: string;
    url: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ vcard, isOpen, onClose }) => {
  if (!isOpen) return null;

  const vcardUrl = `${window.location.origin}/vcard/${vcard.url.split('/').pop()}`;

  const handleDownloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(img, 0, 0);
      
      try {
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${vcard.name.replace(/\s+/g, '_')}_qrcode.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      } catch (error) {
        console.error('Error generating PNG:', error);
      }
    };

    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700 z-50"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Share Contact</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100 mb-5">
              <QRCode
                id="qr-code-svg"
                value={vcardUrl}
                size={180}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {vcard.name}'s Contact
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-xs">
              Scan this QR code to save my contact information directly to your phone
            </p>
            
            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleDownloadQRCode}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-md"
              >
                Download QR
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The QR code links to your digital vCard
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default QRCodeModal;