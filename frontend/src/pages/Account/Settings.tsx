import { motion } from 'framer-motion';
import ChangePassword from './../../cards/ChangePassword';
import TwoFactorAuthentication from './../../cards/TwoFactorAuthentication';
import DeleteAccount from './../../cards/DeleteAccount';

const Settings = () => {
  return (
    <div className="py-6 px-0 sm:px-4 bg-gradient-to-b from-white/50 to-purple-50/20 dark:from-gray-900 dark:to-gray-900">
      <div className="w-full mx-auto max-w-5xl">
        <div className="flex flex-col items-center">
          <div className="w-full">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Security Settings
              </h3>
              <div className="flex justify-center items-center gap-2">
                <span className="text-primary text-sm sm:text-base">
                  Protect and manage your account security
                </span>
              </div>
            </div>

            <div className="w-full space-y-3 sm:space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <ChangePassword />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: 0.1 }}
              >
                <TwoFactorAuthentication />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: 0.2 }}
              >
                <DeleteAccount />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;