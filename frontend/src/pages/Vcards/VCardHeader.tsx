import React from 'react';
import { motion } from 'framer-motion';
import { VCard } from './../../services/vcard';

interface VCardHeaderProps {
  vcard: VCard;
}

const VCardHeader: React.FC<VCardHeaderProps> = ({ vcard }) => {
  return (
    <div className="text-center mb-12">
      {vcard.logo && (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="relative mx-auto mb-6"
        >
          <img
            src={vcard.logo}
            alt={`${vcard.name} logo`}
            className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white shadow-md"
          />
        </motion.div>
      )}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-3"
      >
        {vcard.name}
      </motion.h1>
      {vcard.description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 max-w-2xl mx-auto"
        >
          {vcard.description}
        </motion.p>
      )}
    </div>
  );
};

export default VCardHeader;