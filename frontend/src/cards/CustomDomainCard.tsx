import React, { useState } from 'react';
import { FaGlobe, FaTrash, FaSync, FaEdit, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from './../atoms/Badge/StatusBadge';
import { CustomDomain } from '../services/CustomDomain';
import { customDomainService } from '../services/api';
import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';

interface CustomDomainCardProps {
  domain: CustomDomain;
  onDelete: (id: number) => void;
  onVerify: (id: number) => void;
  onRefresh: () => void;
}

const CustomDomainCard: React.FC<CustomDomainCardProps> = ({
  domain,
  onVerify,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    if (!domain.isDisabled) {
      navigate(`/admin/custom-domains/edit/${domain.id}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (domain.id) {
        await customDomainService.delete(domain.id);
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting domain:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 relative"
      >
        {domain.isDisabled && (
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

        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                  <FaGlobe className="text-indigo-600 dark:text-indigo-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
                    {domain.domain}
                  </h3>
                  <div className="mt-1">
                    <StatusBadge status={domain.status} />
                  </div>
                </div>
              </div>

              <div className="mt-4 pl-2 border-l-2 border-indigo-200 dark:border-indigo-800">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {domain.custom_index_url && (
                    <a
                      href={domain.custom_index_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Landing Page ↗
                    </a>
                  )}
                </div>

                {domain.vcard ? (
                  <div className="flex items-center gap-2 text-sm bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400">Linked to:</span>
                    <Link
                      to={`/vcard/${domain.vcard.url.split('/').pop()}`}
                      className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                    >
                      {domain.vcard.name}
                    </Link>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    No vCard linked
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {domain.status === 'pending' && !domain.isDisabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  domain.id && onVerify(domain.id);
                }}
                className="flex items-center justify-center px-3 py-2 text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-all border border-blue-500/30"
              >
                <FaSync className="mr-1.5" />
                Verify Domain
              </button>
            )}
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleEdit}
                disabled={domain.isDisabled}
                className={`flex items-center justify-center flex-1 px-3 py-2 text-sm rounded-lg transition-all border ${
                  domain.isDisabled
                    ? 'bg-gray-300/10 text-gray-500 border-gray-500/20 cursor-not-allowed'
                    : 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30'
                }`}
              >
                <FaEdit className="mr-1.5" />
                Edit
              </button>

              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={domain.isDisabled}
                className={`flex items-center justify-center flex-1 px-3 py-2 text-sm rounded-lg transition-all border ${
                  domain.isDisabled
                    ? 'bg-gray-300/10 text-gray-500 border-gray-500/20 cursor-not-allowed'
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
                }`}
              >
                <FaTrash className="mr-1.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        itemName={domain.domain}
      />
    </>
  );
};

export default CustomDomainCard;