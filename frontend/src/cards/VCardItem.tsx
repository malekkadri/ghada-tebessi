import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FaEye, 
  FaEyeSlash, 
  FaShare, 
  FaDownload, 
  FaEllipsisV, 
  FaEdit,
  FaTrash,
  FaLock,
  FaIdCard,
  FaTh,
  FaChartLine
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { vcardService } from '../services/api';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from './../modals/DeleteConfirmationModal';
import { VCard } from "./../services/vcard";

interface VCardItemProps {
  vcard: VCard;
  onDeleteSuccess?: () => void;
}

const VCardItem: React.FC<VCardItemProps> = ({ vcard, onDeleteSuccess }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBackgroundStyle = () => {
    switch (vcard.background_type) {
      case 'color':
        return { backgroundColor: vcard.background_value };
      case 'custom-image':
        return { 
          backgroundImage: `url(${vcard.background_value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      case 'gradient':
      case 'gradient-preset':
        return { 
          background: vcard.background_value,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      default:
        return {};
    }
  };

  const handleDoubleClick = () => {
    if (vcard.url) {
      navigate(`/vcard/${vcard.url}`);
    }
  };

  const handleEditClick = () => {
    navigate(`/admin/vcard/edit-vcard/${vcard.id}`);
  };

  const handleViewVCard = () => {
    if (vcard.url) {
      window.open(`/vcard/${vcard.url}`, '_blank');
    }
  };

  const handleBlocksClick = () => {
    navigate(`/admin/vcard/edit-vcard/${vcard.id}/blocks`);
  };

  const handleStatsClick = () => {
    navigate(`/admin/vcard/stats/${vcard.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
    setShowDropdown(false);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await vcardService.delete(vcard.id);
      toast.success(`VCard "${vcard.name}" deleted successfully`);
      onDeleteSuccess?.();
    } catch (error) {
      console.error('Error deleting VCard:', error);
      toast.error(`Failed to delete VCard "${vcard.name}"`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer w-full h-80"
        style={getBackgroundStyle()}
        onDoubleClick={handleDoubleClick}
      >
        {vcard.isDisabled && ( 
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg z-10">
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

        {vcard.background_type === 'custom-image' && (
          <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
        )}

        {vcard.favicon && vcard.favicon !== 'default' && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full overflow-hidden border-2 border-white/80 bg-white shadow-sm">
            <img 
              src={vcard.favicon} 
              alt="Favicon" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="relative h-full flex flex-col p-6">
          <div className="flex justify-center mb-4">
            {vcard.logo ? (
              <img
                src={vcard.logo}
                alt={`${vcard.name} logo`}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center border-2 border-white shadow-lg">
                <span className="text-xl font-bold text-white">
                  {vcard.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center text-center">
            <h2 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-900 dark:text-white leading-tight">
              {vcard.name}
            </h2>
            {vcard.description && (
              <p className="text-sm mb-4 line-clamp-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                {vcard.description}
              </p>
            )}
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                    vcard.is_active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {vcard.is_active ? (
                    <>
                      <FaEye className="mr-1 text-xs" /> Active
                    </>
                  ) : (
                    <>
                      <FaEyeSlash className="mr-1 text-xs" /> Inactive
                    </>
                  )}
                </span>
                
                <span className="px-2 py-1 rounded-full text-xs font-medium flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <FaEye className="mr-1 text-xs" />
                  {vcard.views ?? 0}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                {vcard.is_share && (
                  <button 
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaShare size={14} className="text-gray-600 dark:text-gray-400" />
                  </button>
                )}
                {vcard.is_downloaded && (
                  <button 
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaDownload size={14} className="text-gray-600 dark:text-gray-400" />
                  </button>
                )}

                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={toggleDropdown}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={isDeleting}
                  >
                    <FaEllipsisV size={14} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                    >
                      <button
                        onClick={handleViewVCard}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FaIdCard className="mr-3 text-blue-500" />
                        View VCard
                      </button>
                      <button
                        onClick={handleBlocksClick}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FaTh className="mr-3 text-green-500" />
                        VCard Blocks
                      </button>
                      <button
                        onClick={handleStatsClick}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FaChartLine className="mr-3 text-purple-500" />
                        Stats
                      </button>
                      <button
                        onClick={handleEditClick}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FaEdit className="mr-3 text-blue-500" />
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      >
                        <FaTrash className="mr-3" />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        itemName={vcard.name}
      />
    </>
  );
};

export default VCardItem;