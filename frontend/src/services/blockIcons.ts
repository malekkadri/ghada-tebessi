import { 
  FaLink, FaEnvelope, FaMapMarkerAlt, FaPhone,
  FaFacebook, FaTwitter, FaInstagram, FaYoutube,
  FaWhatsapp, FaTiktok, FaTelegram, FaSpotify,
  FaPinterest, FaLinkedin, FaSnapchat, FaTwitch,
  FaDiscord, FaFacebookMessenger, FaReddit, FaGithub
} from "react-icons/fa";

export type BlockType = 
  | "Link"
  | "Email"
  | "Address"
  | "Phone"
  | "Facebook"
  | "Twitter"
  | "Instagram"
  | "Youtube"
  | "Whatsapp"
  | "Tiktok"
  | "Telegram"
  | "Spotify"
  | "Pinterest"
  | "Linkedin"
  | "Snapchat"
  | "Twitch"
  | "Discord"
  | "Messenger"
  | "Reddit"
  | "GitHub";

interface IconInfo {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  shadow: string;
}

export const blockIcons: Record<BlockType, IconInfo> = {
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

export const getBlockIcon = (type: string): IconInfo => {
  const blockType = type as BlockType;
  return blockIcons[blockType] || { 
    icon: FaLink, 
    gradient: "from-gray-500 to-gray-600",
    shadow: "shadow-gray-500/20"
  };
};