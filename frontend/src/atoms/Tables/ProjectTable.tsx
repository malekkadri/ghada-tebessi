import React from 'react';
import { FaFolder, FaFolderOpen, FaFolderMinus, FaBan, FaCheck, FaAddressCard } from 'react-icons/fa';
import EmptyState from '../../cards/EmptyState';
import { Project } from '../../services/Project';
import { API_BASE_URL } from '../../config/constants';

interface ProjectTableProps {
  projects: Project[];
  hasActiveFilters: boolean;
  onToggleBlocked: (projectId: string, isBlocked: boolean) => void;
  onShowVcards: (projectId: string) => void; 
}

const renderStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-0.5 lg:px-1 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full text-xs sm:text-xs lg:text-[10px] xl:text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <FaFolderOpen className="mr-1 text-[10px] sm:text-xs lg:text-[10px] xl:text-xs" /> Active
        </span>
      );
    case 'archived':
      return (
        <span className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-0.5 lg:px-1 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full text-xs sm:text-xs lg:text-[10px] xl:text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <FaFolderMinus className="mr-1 text-[10px] sm:text-xs lg:text-[10px] xl:text-xs" /> Archived
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-0.5 lg:px-1 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full text-xs sm:text-xs lg:text-[10px] xl:text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <FaFolder className="mr-1 text-[10px] sm:text-xs lg:text-[10px] xl:text-xs" /> Pending
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-0.5 lg:px-1 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full text-xs sm:text-xs lg:text-[10px] xl:text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          <FaFolder className="mr-1 text-[10px] sm:text-xs lg:text-[10px] xl:text-xs" /> Unknown
        </span>
      );
  }
};

const renderBlockedBadge = (isBlocked: boolean) => {
  return isBlocked ? (
    <span className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-0.5 lg:px-1 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full text-xs sm:text-xs lg:text-[10px] xl:text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
      Blocked
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-0.5 lg:px-1 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full text-xs sm:text-xs lg:text-[10px] xl:text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
      Allowed
    </span>
  );
};

const ProjectRow: React.FC<{ 
  project: Project; 
  onToggleBlocked: (projectId: string, isBlocked: boolean) => void;
  onShowVcards: (projectId: string) => void;
}> = ({ project, onToggleBlocked, onShowVcards }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
    <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-8 lg:w-8 xl:h-10 xl:w-10">
          {project.logo ? (
            <img 
              className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-8 lg:w-8 xl:h-10 xl:w-10 rounded-full object-cover border border-gray-200" 
              src={`${API_BASE_URL}${project.logo}`} 
              alt={project.name} 
            />
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-full w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-8 lg:h-8 xl:w-10 xl:h-10 flex items-center justify-center text-gray-400">
              <FaFolder className="text-xs sm:text-sm lg:text-xs xl:text-sm" />
            </div>
          )}
        </div>
        <div className="ml-2 sm:ml-3 md:ml-4 lg:ml-2 xl:ml-4 min-w-0 flex-1">
          <div className="text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm font-medium text-gray-900 dark:text-white">
            <div className="break-words max-w-[120px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[120px] xl:max-w-[200px]">
              {project.name}
            </div>
          </div>
          <div className="text-[10px] sm:text-xs md:text-sm lg:text-[10px] xl:text-sm text-gray-500 dark:text-gray-400 mt-1">
            <div className="break-words whitespace-normal max-w-[120px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[120px] xl:max-w-[200px]">
              {project.description || 'No description'}
            </div>
          </div>
        </div>
      </div>
    </td>
    <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap">
      <div className="flex flex-col">
        <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm">
          <div className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-[90px] xl:max-w-[150px]">
            {project.Users?.name || 'N/A'}
          </div>
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs">
          <div className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-[90px] xl:max-w-[150px]">
            {project.Users?.email || 'N/A'}
          </div>
        </span>
      </div>
    </td>
    <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap">
      {renderStatusBadge(project.status)}
    </td>
    <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap">
      {renderBlockedBadge(project.is_blocked)}
    </td>
    <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm text-gray-500 dark:text-gray-400">
      {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
    </td>
    <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap text-right text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm font-medium">
      <div className="flex justify-end space-x-0.5 sm:space-x-1 lg:space-x-0.5 xl:space-x-1">
        <button
          onClick={() => onShowVcards(project.id)}
          className="p-0.5 sm:p-1 lg:p-0.5 xl:p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-blue-600 hover:text-blue-900 dark:text-blue-400"
          title="View vCards"
        >
          <FaAddressCard className="text-xs sm:text-sm lg:text-xs xl:text-sm" />
        </button>
        
        <button
          onClick={() => onToggleBlocked(project.id, !project.is_blocked)}
          className={`p-0.5 sm:p-1 lg:p-0.5 xl:p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
            project.is_blocked 
              ? 'text-green-600 hover:text-green-900 dark:text-green-400' 
              : 'text-red-600 hover:text-red-900 dark:text-red-400'
          }`}
          title={project.is_blocked ? "Unblock" : "Block"}
        >
          {project.is_blocked ? <FaCheck className="text-xs sm:text-sm lg:text-xs xl:text-sm" /> : <FaBan className="text-xs sm:text-sm lg:text-xs xl:text-sm" />}
        </button>
      </div>
    </td>
  </tr>
);

const MobileProjectItem: React.FC<{ 
  project: Project; 
  onToggleBlocked: (projectId: string, isBlocked: boolean) => void;
  onShowVcards: (projectId: string) => void;
}> = ({ project, onToggleBlocked, onShowVcards }) => (
  <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 projects-mobile-item-reduced mobile-card-content-reduced min-w-0 w-full" style={{maxWidth: '100%', overflow: 'hidden'}}>
    <div className="flex items-start w-full projects-small-screen-fix mobile-card-header-reduced min-w-0" style={{maxWidth: '100%'}}>
      <div className="flex-shrink-0 mobile-card-logo-reduced mr-2 sm:mr-3 min-w-0">
        {project.logo ? (
          <img 
            src={`${API_BASE_URL}${project.logo}`} 
            alt={`${project.name} logo`}
            className="mobile-card-logo-reduced rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="flex-shrink-0 mobile-card-logo-reduced rounded-full bg-gray-200 border border-dashed flex items-center justify-center text-gray-400">
            <FaFolder className="text-sm sm:text-base" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 projects-small-screen-fix" style={{maxWidth: 'calc(100% - 4rem)'}}>
        <div className="flex items-start justify-between w-full projects-small-screen-fix min-w-0">
          <div className="flex-1 min-w-0 mr-2 sm:mr-3 projects-mobile-header-section">
            <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1 break-words overflow-hidden" style={{wordBreak: 'break-word', lineHeight: '1.3', maxWidth: '100%'}}>
              {project.name}
            </p>
            <div className="flex flex-col space-y-0.5 min-w-0">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words overflow-hidden" style={{wordBreak: 'break-word', maxWidth: '100%'}}>
                {project.Users?.name || 'N/A'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-words overflow-hidden" style={{wordBreak: 'break-word', maxWidth: '100%'}}>
                {project.Users?.email || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-1 sm:space-y-1.5 projects-mobile-badges-section min-w-0 flex-shrink-0">
            {renderStatusBadge(project.status)}
            {renderBlockedBadge(project.is_blocked)}
          </div>
        </div>
      </div>
    </div>

    <div className="mt-3 sm:mt-4 w-full projects-small-screen-fix min-w-0">
      <div className="flex flex-col space-y-3 w-full projects-small-screen-fix min-w-0">
        <div className="projects-mobile-description-full min-w-0 w-full">
          <span className="font-medium text-sm sm:text-base text-gray-500 dark:text-gray-400">Description:</span>
          <p className="projects-mobile-card-description text-sm sm:text-base text-gray-600 dark:text-gray-400 break-words overflow-hidden mt-1" style={{wordBreak: 'break-word', whiteSpace: 'normal', maxWidth: '100%'}}>
            {project.description || 'No description'}
          </p>
        </div>
        
        <div className="w-full min-w-0">
          <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400 break-words" style={{wordBreak: 'break-word'}}>
            <span className="font-medium">Created:</span> {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
        
        <div className="flex justify-end w-full mobile-card-actions-reduced">
          <div className="flex space-x-2 sm:space-x-3 flex-shrink-0">
            <button
              onClick={() => onShowVcards(project.id)}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mobile-action-btn-reduced rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
              title="View vCards"
            >
              <FaAddressCard className="text-sm sm:text-base" />
            </button>
            <button
              onClick={() => onToggleBlocked(project.id, !project.is_blocked)}
              className={`mobile-action-btn-reduced rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0 ${
                project.is_blocked 
                  ? 'text-green-600 hover:text-green-900 dark:text-green-400' 
                  : 'text-red-600 hover:text-red-900 dark:text-red-400'
              }`}
              title={project.is_blocked ? "Unblock" : "Block"}
            >
              {project.is_blocked ? <FaCheck className="text-sm sm:text-base" /> : <FaBan className="text-sm sm:text-base" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  hasActiveFilters,
  onToggleBlocked,
  onShowVcards 
}) => {
  if (projects.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg shadow w-full">
        <div className="w-full bg-white dark:bg-gray-800 py-8 text-center rounded-lg">
          <EmptyState
            title={hasActiveFilters ? "No projects match your filters" : "No projects found"}
            description={hasActiveFilters
              ? "Try adjusting your search or filters"
              : "Create your first project to get started"}
            actionText="Add Project"
            icon={<span className="text-4xl mx-auto text-gray-400 mb-4">📂</span>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full m-0 p-0 projects-mobile-container projects-no-overflow projects-small-screen-fix">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow w-full">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 projects-table-medium">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Project
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Blocked
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-right text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {projects.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onToggleBlocked={onToggleBlocked}
                onShowVcards={onShowVcards} 
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden w-full projects-force-no-margin projects-mobile-container-reduced projects-no-overflow projects-small-screen-fix">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden projects-mobile-narrow projects-small-screen-fix">
          {projects.map((project) => (
            <MobileProjectItem
              key={project.id}
              project={project}
              onToggleBlocked={onToggleBlocked}
              onShowVcards={onShowVcards}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectTable;