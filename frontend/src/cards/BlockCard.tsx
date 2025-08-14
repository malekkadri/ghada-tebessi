import React from "react";
import { BlockType } from "../pages/Blocks/types";
import { 
  FaLink, FaEnvelope, FaMapMarkerAlt, FaPhone, 
  FaFacebook, FaTwitter, FaInstagram, FaYoutube,
  FaWhatsapp, FaTiktok, FaTelegram, FaSpotify,
  FaPinterest, FaLinkedin, FaSnapchat, FaTwitch,
  FaDiscord, FaFacebookMessenger, FaReddit, FaGithub 
} from "react-icons/fa";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

interface IconInfo {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  shadow: string;
}

const blockIcons: Record<BlockType, IconInfo> = {
  Link: { 
    icon: FaLink, 
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/20"
  },
  Email: { 
    icon: FaEnvelope, 
    gradient: "from-red-500 to-red-600",
    shadow: "shadow-red-500/20"
  },
  Address: { 
    icon: FaMapMarkerAlt, 
    gradient: "from-green-500 to-green-600",
    shadow: "shadow-green-500/20"
  },
  Phone: { 
    icon: FaPhone, 
    gradient: "from-purple-500 to-purple-600",
    shadow: "shadow-purple-500/20"
  },
  Facebook: { 
    icon: FaFacebook, 
    gradient: "from-blue-600 to-blue-700",
    shadow: "shadow-blue-600/20"
  },
  Twitter: { 
    icon: FaTwitter, 
    gradient: "from-blue-400 to-blue-500",
    shadow: "shadow-blue-400/20"
  },
  Instagram: { 
    icon: FaInstagram, 
    gradient: "from-pink-500 via-red-500 to-yellow-500",
    shadow: "shadow-pink-500/20"
  },
  Youtube: { 
    icon: FaYoutube, 
    gradient: "from-red-600 to-red-700",
    shadow: "shadow-red-600/20"
  },
  Whatsapp: { 
    icon: FaWhatsapp, 
    gradient: "from-green-500 to-green-600",
    shadow: "shadow-green-500/20"
  },
  Tiktok: { 
    icon: FaTiktok, 
    gradient: "from-gray-900 via-gray-800 to-gray-700",
    shadow: "shadow-gray-900/20"
  },
  Telegram: { 
    icon: FaTelegram, 
    gradient: "from-blue-400 to-blue-500",
    shadow: "shadow-blue-400/20"
  },
  Spotify: { 
    icon: FaSpotify, 
    gradient: "from-green-500 to-green-600",
    shadow: "shadow-green-500/20"
  },
  Pinterest: { 
    icon: FaPinterest, 
    gradient: "from-red-600 to-red-700",
    shadow: "shadow-red-600/20"
  },
  Linkedin: { 
    icon: FaLinkedin, 
    gradient: "from-blue-700 to-blue-800",
    shadow: "shadow-blue-700/20"
  },
  Snapchat: { 
    icon: FaSnapchat, 
    gradient: "from-yellow-400 to-yellow-500",
    shadow: "shadow-yellow-400/20"
  },
  Twitch: { 
    icon: FaTwitch, 
    gradient: "from-purple-600 to-purple-700",
    shadow: "shadow-purple-600/20"
  },
  Discord: { 
    icon: FaDiscord, 
    gradient: "from-indigo-500 to-indigo-600",
    shadow: "shadow-indigo-500/20"
  },
  Messenger: { 
    icon: FaFacebookMessenger, 
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/20"
  },
  Reddit: { 
    icon: FaReddit, 
    gradient: "from-orange-500 to-orange-600",
    shadow: "shadow-orange-500/20"
  },
  GitHub: { 
    icon: FaGithub,
    gradient: "from-gray-700 to-gray-800",
    shadow: "shadow-gray-700/20"
  },
};

interface BlockCardProps {
  blockType: BlockType;
  onClick: () => void;
  isAdded?: boolean;
}

const BlockCard: React.FC<BlockCardProps> = ({ blockType, onClick, isAdded = false }) => {
  const { icon: Icon, gradient, shadow } = blockIcons[blockType];

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
      className={`relative overflow-hidden group rounded-xl p-6 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 ${shadow} ${
        isAdded ? "ring-2 ring-green-500" : ""
      }`}
      onClick={onClick}
    >
      {isAdded && (
        <div className="absolute top-2 right-2 z-20 bg-green-500 text-white p-1 rounded-full">
          <FiCheck className="w-3 h-3" />
        </div>
      )}
      
      <div className={`absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${gradient}`}></div>
      
      <div className={`relative z-10 flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${gradient} ${shadow}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      
      <h3 className="relative z-10 text-center text-lg font-semibold text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
        {blockType}
      </h3>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-opacity"></div>
    </motion.div>
  );
};

export default BlockCard;