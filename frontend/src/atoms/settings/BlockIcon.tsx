import React from "react";
import {
  FaLink,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
  FaTiktok,
  FaTelegram,
  FaSpotify,
  FaPinterest,
  FaLinkedin,
  FaSnapchat,
  FaTwitch,
  FaDiscord,
  FaComment,
  FaReddit,
} from "react-icons/fa";
import { BlockType } from "./../../pages/Blocks/types";

const blockIcons = {
  Link: <FaLink className="text-blue-500" />,
  Email: <FaEnvelope className="text-red-500" />,
  Address: <FaMapMarkerAlt className="text-green-500" />,
  Phone: <FaPhone className="text-purple-500" />,
  Facebook: <FaFacebook className="text-blue-600" />,
  Twitter: <FaTwitter className="text-blue-400" />,
  Instagram: <FaInstagram className="text-pink-500" />,
  Youtube: <FaYoutube className="text-red-600" />,
  Whatsapp: <FaWhatsapp className="text-green-500" />,
  Tiktok: <FaTiktok className="text-black" />,
  Telegram: <FaTelegram className="text-blue-400" />,
  Spotify: <FaSpotify className="text-green-500" />,
  Pinterest: <FaPinterest className="text-red-600" />,
  Linkedin: <FaLinkedin className="text-blue-700" />,
  Snapchat: <FaSnapchat className="text-yellow-400" />,
  Twitch: <FaTwitch className="text-purple-600" />,
  Discord: <FaDiscord className="text-indigo-500" />,
  Messenger: <FaComment className="text-blue-500" />,
  Reddit: <FaReddit className="text-orange-500" />,
};

const BlockIcon: React.FC<{ typeBlock: BlockType }> = ({ typeBlock }) => {
  const isValidType = Object.keys(blockIcons).includes(typeBlock);
  const icon = isValidType 
    ? blockIcons[typeBlock as keyof typeof blockIcons] 
    : blockIcons.Link;

  return <div className="text-2xl">{icon}</div>;
};

export default BlockIcon;