import React, { useState, useEffect } from 'react';
import { FaUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { User } from './../../services/user';

interface AccountProfileProps {
  userData: User;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onAvatarChange: (file: File | null) => void;
}

const AccountProfile: React.FC<AccountProfileProps> = ({
  userData,
  onInputChange,
  onSubmit,
  onAvatarChange
}) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [localUserData, setLocalUserData] = useState<User>(userData);

  useEffect(() => {
    setLocalUserData(userData);
    if (userData.avatar) {
      setAvatarPreview(`http://localhost:3000${userData.avatar}`);
    }
  }, [userData]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should not exceed 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
        onAvatarChange(file);
        toast.success('Avatar uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalUserData(prev => ({
      ...prev,
      [name]: value
    }));
    onInputChange(e);
  };

  return (
    <div className="py-4 px-2 sm:px-4">
      <div className="w-full mx-auto max-w-4xl">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Account Settings
              </h3>
              <div className="flex justify-center items-center gap-2">
                <span className="text-primary text-sm sm:text-base">
                  Manage your account information
                </span>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="flex flex-col items-center mb-5 sm:mb-6">
                  <div className="relative group">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-gray-400 dark:border-gray-600 shadow-sm">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-2xl sm:text-3xl text-gray-500 dark:text-gray-300">
                            {localUserData.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-purple-500 text-white p-1 sm:p-1.5 rounded-full cursor-pointer hover:bg-purple-600 transition-colors">
                      <FaUpload className="text-xs sm:text-sm" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                  <p className="mt-1.5 sm:mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Click to upload avatar (JPG, PNG max 2MB)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        className="input-vcard text-sm"
                        placeholder="Enter your name"
                        name="name"
                        value={localUserData.name || ''}
                        onChange={handleLocalInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        className="input-vcard"
                        placeholder="Enter your email"
                        name="email"
                        value={localUserData.email || ''}
                        onChange={handleLocalInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 w-full">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-50 hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;