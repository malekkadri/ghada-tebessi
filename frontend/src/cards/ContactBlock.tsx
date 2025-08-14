import React from 'react';
import { motion } from 'framer-motion';
import { Block, BlockIconConfig } from './../services/vcard';

interface ContactBlockProps {
  block: Block;
  iconConfig: BlockIconConfig;
  onClick: () => void;
}

const ContactBlock: React.FC<ContactBlockProps> = ({ block, iconConfig, onClick }) => {
  const { icon: Icon, gradient, shadow } = iconConfig;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8,
        scale: 1.05,
        boxShadow: `0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color)`
      }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 15
      }}
      onClick={onClick}
      className={`relative overflow-hidden group rounded-xl p-6 bg-white shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 ${shadow}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${gradient}`}></div>
      
      <div className={`relative z-10 flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${gradient} ${shadow}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      
      <h3 className="relative z-10 text-center text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
        {block.name}
      </h3>
      
      <p className="relative z-10 text-center text-gray-600 mt-2 text-sm">
        {block.description}
      </p>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-opacity"></div>
    </motion.div>
  );
};

export default ContactBlock;