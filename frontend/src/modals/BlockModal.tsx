import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { BlockType } from "../pages/Blocks/types";
import { toast, ToastContainer } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import { FiUser, FiLink2, FiMail, FiPhone, FiMapPin, FiMessageSquare } from "react-icons/fi";
import { 
  FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaWhatsapp, 
  FaTiktok, FaTelegram, FaSpotify, FaPinterest, FaLinkedin, 
  FaSnapchat, FaTwitch, FaDiscord, FaReddit, FaGithub
} from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { blockService } from "./../services/api";
import { useNavigate } from "react-router-dom";

interface BlockModalProps {
  blockType: BlockType;
  onClose: () => void;
  vcardId: string;
  mode?: 'create' | 'edit';
  blockData?: {
    id?: string;
    name: string;
    description: string;
  };
  onSuccess?: () => void;
}

interface BlockFormData {
  name: string;
  value: string;
}

interface BlockFieldConfig {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  prefix?: string;
  inputType?: string;
  isPhone?: boolean;
}

const BlockModal: React.FC<BlockModalProps> = ({ 
  blockType, 
  onClose, 
  vcardId, 
  mode = 'create', 
  blockData,
  onSuccess
}) => {
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset
  } = useForm<BlockFormData>();
  const navigate = useNavigate();
  useEffect(() => {
    if (mode === 'edit' && blockData) {
      const fieldConfig = getFieldConfig();
      let value = blockData.description;
      
      if (fieldConfig.prefix && value.startsWith(fieldConfig.prefix)) {
        value = value.replace(fieldConfig.prefix, '');
      }

      reset({
        name: blockData.name,
        value: value
      });
    }
  }, [mode, blockData, reset]);

  const onSubmit = async (data: BlockFormData) => {
    try {
      const fieldConfig = getFieldConfig();
      let fullValue = data.value;

      if (fieldConfig.prefix && !fieldConfig.isPhone) {
        fullValue = fieldConfig.prefix + data.value;
      }

      const payload = {
        type_block: blockType,
        name: data.name,
        description: fullValue,
        status: true,
        vcardId: parseInt(vcardId),
      };

      if (mode === 'edit' && blockData?.id) {
        await blockService.update(blockData.id, payload);
        toast.success("Block updated successfully!");
        navigate(`/admin/vcard/edit-vcard/${vcardId}/blocks`)
      } else {
        await blockService.create(payload);
        toast.success("Block added successfully!");
        navigate(`/admin/vcard/edit-vcard/${vcardId}/blocks`)
      }

      onSuccess?.();
      onClose();
      
    } catch (error) {
      console.error('Error saving block:', error);
      toast.error(`Failed to ${mode === 'edit' ? 'update' : 'add'} block`);
    }
  };

  const getFieldConfig = (): BlockFieldConfig => {
    const configs: Record<BlockType, BlockFieldConfig> = {
      Link: {
        label: "URL",
        placeholder: "example.com",
        prefix: "https://",
        icon: <FiLink2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Email: {
        label: "Email Address",
        placeholder: "example@email.com",
        inputType: "email",
        icon: <FiMail className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Phone: {
        label: "Phone Number",
        placeholder: "Enter phone number",
        isPhone: true,
        icon: <FiPhone className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Address: {
        label: "Full Address",
        placeholder: "123 Main St, City, Country",
        icon: <FiMapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Facebook: {
        label: "Facebook Username",
        placeholder: "username",
        prefix: "https://facebook.com/",
        icon: <FaFacebook className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Twitter: {
        label: "Twitter Username",
        placeholder: "username",
        prefix: "https://twitter.com/",
        icon: <FaTwitter className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Instagram: {
        label: "Instagram Username",
        placeholder: "username",
        prefix: "https://instagram.com/",
        icon: <FaInstagram className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Youtube: {
        label: "YouTube Channel",
        placeholder: "channel",
        prefix: "https://youtube.com/",
        icon: <FaYoutube className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Whatsapp: {
        label: "WhatsApp Number",
        placeholder: "phone number with country code",
        prefix: "https://wa.me/",
        icon: <FaWhatsapp className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Tiktok: {
        label: "TikTok Username",
        placeholder: "username",
        prefix: "https://tiktok.com/@",
        icon: <FaTiktok className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Telegram: {
        label: "Telegram Username",
        placeholder: "username",
        prefix: "https://t.me/",
        icon: <FaTelegram className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Spotify: {
        label: "Spotify Link",
        placeholder: "profile/playlist/track ID",
        prefix: "https://open.spotify.com/",
        icon: <FaSpotify className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Pinterest: {
        label: "Pinterest Username",
        placeholder: "username",
        prefix: "https://pinterest.com/",
        icon: <FaPinterest className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Linkedin: {
        label: "LinkedIn Username",
        placeholder: "username or custom URL",
        prefix: "https://linkedin.com/in/",
        icon: <FaLinkedin className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Snapchat: {
        label: "Snapchat Username",
        placeholder: "username",
        prefix: "https://snapchat.com/add/",
        icon: <FaSnapchat className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Twitch: {
        label: "Twitch Username",
        placeholder: "username",
        prefix: "https://twitch.tv/",
        icon: <FaTwitch className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Discord: {
        label: "Discord Invite",
        placeholder: "invite code",
        prefix: "https://discord.gg/",
        icon: <FaDiscord className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Messenger: {
        label: "Messenger Username",
        placeholder: "username",
        prefix: "https://m.me/",
        icon: <FiMessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      Reddit: {
        label: "Reddit Username",
        placeholder: "username",
        prefix: "https://reddit.com/user/",
        icon: <FaReddit className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
      GitHub: {  
        label: "GitHub Username",
        placeholder: "username",
        prefix: "https://github.com/",
        icon: <FaGithub className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
      },
    };

    return configs[blockType] || configs.Link;
  };

  const fieldConfig = getFieldConfig();

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden dark:bg-gray-800 border border-primary">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {mode === 'edit' ? 'Edit' : 'Add'} {blockType} Block
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Block Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <Controller
                  name="name"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Block name is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter the Name"
                      disabled={isSubmitting}
                    />
                  )}
                />
              </div>
              {errors.name && (
                <small className="text-red-500 text-sm">{errors.name.message}</small>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {fieldConfig.label}
              </label>
              {fieldConfig.isPhone ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    {fieldConfig.icon}
                  </div>
                  <Controller
                    name="value"
                    control={control}
                    defaultValue=""
                    rules={{ required: "This field is required" }}
                    render={({ field: { onChange, value } }) => (
                      <PhoneInput
                        country={'fr'}
                        value={value}
                        onChange={onChange}
                        inputClass="!w-full !pl-10 !py-2.5 !h-auto !rounded-lg !border-gray-300 dark:!border-gray-600 !bg-gray-50 dark:!bg-gray-700 focus:!outline-none focus:!ring-2 focus:!ring-primary focus:!border-transparent"
                        containerClass="!w-full"
                        dropdownClass="phone-dropdown"
                        buttonClass="!bg-gray-100 dark:!bg-gray-700 !border-gray-300 dark:!border-gray-600 !rounded-l-lg"
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>
              ) : fieldConfig.prefix ? (
                <div className="flex">
                  <div className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                    {fieldConfig.prefix}
                  </div>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      {fieldConfig.icon}
                    </div>
                    <Controller
                      name="value"
                      control={control}
                      defaultValue=""
                      rules={{ required: "This field is required" }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type={fieldConfig.inputType || "text"}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder={fieldConfig.placeholder}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    {fieldConfig.icon}
                  </div>
                  <Controller
                    name="value"
                    control={control}
                    defaultValue=""
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type={fieldConfig.inputType || "text"}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder={fieldConfig.placeholder}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>
              )}
              {errors.value && (
                <small className="text-red-500 text-sm">{errors.value.message}</small>
              )}
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-transparent rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'edit' ? 'Updating...' : 'Saving...'}
                </>
              ) : mode === 'edit' ? 'Update Block' : 'Save Block'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlockModal;