import React from 'react';
import { Plan } from '../services/Plan';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

interface PlanCardAdminProps {
  plan: Plan;
  isCurrent: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onSetDefault: () => void;
}

const PlanCardAdmin: React.FC<PlanCardAdminProps> = ({
  plan,
  isCurrent,
  onEdit,
  onDelete,
  onToggleStatus,
  onSetDefault
}) => {
  const features = Array.isArray(plan.features)
    ? plan.features
    : typeof plan.features === 'string'
      ? [plan.features]
      : [];

  return (
    <div className={`
      rounded-lg transition-all duration-300 flex flex-col shadow-md hover:shadow-lg w-full
      ${isCurrent || plan.is_default
        ? 'ring-2 ring-primary-500 dark:ring-primary-400'
        : 'border border-gray-200 dark:border-gray-700'
      }
    `}>
      <div className={`
        rounded-lg transition-all duration-300 flex flex-col h-full
        bg-white dark:bg-gray-700
      `}>
        <div className="flex flex-col"> 
          <div className="py-4 px-4">
            <div className="flex justify-between items-start">
              <div className="w-3/4">
                <h3 className="text-primary mb-1 font-semibold text-xl sm:text-2xl truncate">
                  {plan.name || "Plan Name"}
                </h3>
                
                <div className="mb-2">
                  <small className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                    {plan.description || "Plan Description"}
                  </small>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={onEdit}
                  className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  aria-label="Edit plan"
                >
                  <FaEdit size={18} />
                </button>
                <button 
                  onClick={onDelete} // Déjà connecté à la prop onDelete
                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  aria-label="Delete plan"
                >
                  <FaTrash size={18} />
                </button>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2 justify-between items-center">
              <div className="flex flex-wrap gap-2">
                {isCurrent && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2.5 py-1 rounded-md shadow-sm">
                    Current Plan
                  </span>
                )}
                {plan.is_default && (
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-1 rounded-md shadow-sm">
                    Default
                  </span>
                )}
              </div>

              {!plan.is_default && (
                <button
                  onClick={onSetDefault}
                  className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium px-2.5 py-1 rounded-md shadow-sm hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Set Default
                </button>
              )}
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-600 mx-4"></div>
        </div>

        <div className="p-4 flex flex-col">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h1 className="text-gray-900 dark:text-white font-bold text-2xl sm:text-3xl">
                <span className="text-lg align-top text-primary-600 dark:text-primary-400">$</span>
                {plan.price || 0}
                <span className="text-gray-600 dark:text-gray-300 text-base font-normal ml-1">
                  / {plan.duration_days || 30} days
                </span>
              </h1>
            </div>
            
            <button
              onClick={onToggleStatus}
              className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                plan.is_active
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
              }`}
            >
              {plan.is_active 
                ? <FaToggleOn className="mr-1 text-lg" /> 
                : <FaToggleOff className="mr-1 text-lg" />}
              {plan.is_active ? 'Active' : 'Inactive'}
            </button>
          </div>

          <div className="mb-4">
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-4 h-4 mr-2 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24">
                    <path strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"/>
                  </svg>
                  <span className="text-gray-800 dark:text-gray-200 text-sm sm:text-base break-words">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCardAdmin;