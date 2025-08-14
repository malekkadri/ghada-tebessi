import React, { useState } from "react";
import { BlockType } from "../pages/Blocks/types";
import { 
  FaLink, FaEnvelope, FaMapMarkerAlt, FaPhone,
  FaFacebook, FaTwitter, FaInstagram, FaYoutube,
  FaWhatsapp, FaTiktok, FaTelegram, FaSpotify,
  FaPinterest, FaLinkedin, FaSnapchat, FaTwitch,
  FaDiscord, FaFacebookMessenger, FaReddit, FaGithub, 
  FaEdit, FaTrash,
  FaLock
} from "react-icons/fa";
import { motion } from "framer-motion";
import DeleteConfirmationModal from './../modals/DeleteConfirmationModal';
import { useNavigate } from "react-router-dom";

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

interface BlockCardListProps {
  id: string;
  name: string;
  typeBlock: BlockType;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string) => void;
  description?: string;
  vcardId: string;
  isDisabled?: boolean;
}

const BlockCardList: React.FC<BlockCardListProps> = ({ 
  id, 
  name, 
  typeBlock, 
  onDelete,
  onEdit,
  description, 
  isDisabled 
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { icon: Icon, gradient, shadow } = blockIcons[typeBlock];
  const navigate = useNavigate();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(id);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="group relative flex items-center p-5 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:border-primary/30 mb-3 cursor-pointer"
      >
        {isDisabled && (
          <div className="absolute inset-0 bg-black/30 dark:bg-gray-900/50 flex items-center justify-center rounded-xl z-10">
            <div className="text-center p-4">
              <FaLock className="text-white text-2xl mb-2 mx-auto" />
              <div className="text-white text-sm font-medium mb-2">
                Upgrade plan to activate
              </div>
              <button
                onClick={() => navigate('/admin/account/plan')}
                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}
        <div className="mr-4 flex-shrink-0">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient} ${shadow}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="name text-lg font-semibold text-gray-800 dark:text-white truncate">
            {name}
          </h3>
          {description && (
            <p className="name text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {description}
            </p>
          )}
          <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-br ${gradient} bg-opacity-10 text-white`}>
            {typeBlock}
          </span>
        </div>

        <div className="flex items-center space-x-3 pl-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEditClick}
            className="p-2 text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200"
            aria-label="Edit"
          >
            <FaEdit className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDeleteClick}
            className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
            aria-label="Delete"
          >
            <FaTrash className="w-4 h-4" />
          </motion.button>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient.replace('bg-gradient-to-br', '')}`}></div>
      </motion.div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        itemName={name}
      />
    </>
  );
};

export default BlockCardList;