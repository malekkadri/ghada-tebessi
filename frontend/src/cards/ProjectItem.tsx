import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaLock,
  FaAddressCard
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/api';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from './../modals/DeleteConfirmationModal';
import { Project } from "../services/Project";

interface ProjectItemProps {
  project: Project;
  onDeleteSuccess?: () => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, onDeleteSuccess }) => {
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

  const handleDoubleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleEditClick = () => {
    navigate(`/admin/project/edit/${project.id}`);
  };

  const handleVCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/admin/project/${project.id}/vcards`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
    setShowDropdown(false);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await projectService.deleteProject(project.id);
      toast.success(`Project "${project.name}" deleted successfully`);
      onDeleteSuccess?.();
    } catch (error) {
      console.error('Error deleting Project:', error);
      toast.error(`Failed to delete Project "${project.name}"`);
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
    e.preventDefault();
    setShowDropdown(!showDropdown);
  };

  const getStatusBadgeStyle = () => {
    switch (project.status) {
      case 'active': return 'bg-green-500/90 text-white shadow-lg';
      case 'archived': return 'bg-gray-500/90 text-white shadow-lg';
      case 'pending': return 'bg-yellow-500/90 text-white shadow-lg';
      default: return 'bg-gray-500/90 text-white shadow-lg';
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer w-full h-80 overflow-hidden border border-gray-100 dark:border-gray-700"
        onDoubleClick={handleDoubleClick}
      >
        {project.isDisabled && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl z-10">
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

        <div className="relative h-full">
          <div 
            className="h-20 absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4"
            style={{
              background: `linear-gradient(135deg, ${project.color || '#4f46e5'}, ${project.color || '#4f46e5'}dd)`
            }}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full bg-white/80 shadow-sm"
              />
              <span className="text-white text-sm font-medium opacity-90">
                Project
              </span>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/30 ${getStatusBadgeStyle()}`}
            >
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
          </div>

*          <div className="absolute top-12 left-0 right-0 flex justify-center z-10">
            {project.logo ? (
              <div className="relative">
                <img
                  src={project.logo}
                  alt={`${project.name} logo`}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                />
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-20 blur-sm"></div>
              </div>
            ) : (
              <div className="relative">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg text-white font-bold text-xl"
                  style={{ backgroundColor: project.color || '#4f46e5' }}
                >
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-20 blur-sm"></div>
              </div>
            )}
          </div>

          <div className="absolute top-28 left-0 right-0 bottom-20 px-6 flex flex-col items-center justify-center text-center">
            <h2 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-900 dark:text-white leading-tight">
              {project.name}
            </h2>
            {project.description && (
              <p 
                className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '1.4em',
                  maxHeight: '2.8em' // 2 lignes × 1.4em
                }}
              >
                {project.description}
              </p>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-20 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-6">
            <div className="flex justify-between items-center h-full">
              <button
                onClick={handleVCardClick}
                className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/40 dark:hover:to-purple-700/40 transition-all duration-200 text-sm font-medium text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-600/30"
                title="View associated vCards"
              >
                <FaAddressCard className="mr-2 text-purple-600 dark:text-purple-400" size={14} />
                VCards
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                  disabled={isDeleting}
                >
                  <FaEllipsisV size={14} className="text-gray-500 dark:text-gray-400" />
                </button>

                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden backdrop-blur-sm"
                  >
                    <div className="py-1">
                      <button
                        onClick={handleEditClick}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-200"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                          <FaEdit className="text-blue-600 dark:text-blue-400" size={12} />
                        </div>
                        <span className="font-medium">Edit Project</span>
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all duration-200 disabled:opacity-50"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                          <FaTrash className="text-red-600 dark:text-red-400" size={12} />
                        </div>
                        <span className="font-medium">Delete</span>
                      </button>
                    </div>
                  </motion.div>
                )}
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
        itemName={project.name}
      />
    </>
  );
};

// Export par défaut explicite
const ProjectItemComponent = ProjectItem;
export default ProjectItemComponent;