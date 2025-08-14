import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { authService } from './../services/api';

const DeleteAccount = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const handleAccountDelete = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }

    setIsDeleting(true);
    try {
      await authService.deleteAccount({ password: deletePassword });
      toast.success('Account deleted successfully');
      window.location.href = '/';
    } catch (err: any) {
      let errorMessage = "Failed to delete account. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
  
      toast(errorMessage, { type: "error" });
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800 rounded-2xl p-6 shadow-2xl shadow-red-500/10 dark:shadow-red-900/50 backdrop-blur-lg border border-red-200/50 dark:border-red-900/80 hover:border-red-500/30 transition-all">
      <h4 className="text-lg font-bold text-red-600 dark:text-red-400 mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
          ⚠️
        </div>
        Delete Account
      </h4>
      
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
        Once you delete your account, there is no going back. Please be certain.
      </p>

      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1 sm:space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Enter your password to confirm
          </label>
          <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800 relative">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <svg className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>
            <input
              type={showDeletePassword ? "text" : "password"}
              className="input-vcard pl-8 sm:pl-10 pr-8 sm:pr-10 text-xs sm:text-sm"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => setShowDeletePassword(!showDeletePassword)}
            >
              {showDeletePassword ? <FaEyeSlash size={14} className="sm:w-4" /> : <FaEye size={14} className="sm:w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1 sm:space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Type <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">DELETE</span> to confirm
          </label>
          <input
            type="text"
            className="input-vcard bg-gray-100 dark:bg-gray-800 border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 text-xs sm:text-sm"
            placeholder="Type DELETE to confirm"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
          />
        </div>

        <button
          onClick={handleAccountDelete}
          disabled={isDeleting || deleteConfirmation !== 'DELETE' || !deletePassword}
          className={`flex justify-center items-center py-1.5 sm:py-2 px-3 sm:px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white ${
            isDeleting || deleteConfirmation !== 'DELETE' || !deletePassword
              ? 'bg-red-300 dark:bg-red-900 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:focus:ring-offset-2 focus:ring-red-500'
          } transition-colors w-full`}
        >
          {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
        </button>
      </div>
    </div>
  );
};

export default DeleteAccount;