import React from 'react';
import { Plan } from '../services/Plan';

interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
  onSelect: (plan: Plan) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isCurrent, onSelect }) => {
  const features = Array.isArray(plan.features)
    ? plan.features
    : typeof plan.features === 'string'
      ? [plan.features]
      : [];

  return (
    <div className="rounded-lg transition-all duration-300 h-full flex flex-col">
      <div className={`
        flex-1 rounded-lg transition-all duration-300 flex flex-col
        ${isCurrent
          ? 'bg-white dark:bg-gray-800 shadow-xl ring-2 ring-primary-500 dark:ring-primary-400'
          : 'bg-white dark:bg-gray-700 shadow-md hover:shadow-xl dark:shadow-gray-900/30'
        }
      `}>
        <div className="flex flex-col md:min-h-[160px]"> 
          <div className="py-4 px-4 flex-1">
            <h3 className="text-primary mb-1 font-semibold text-xl sm:text-2xl">
              {plan.name || "Plan Name"}
            </h3>

            <div className="mb-2 flex-1">
              <small className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                {plan.description || "Plan Description"}
              </small>
            </div>

            <div className="mt-2">
              {isCurrent && (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2.5 py-1 rounded-md shadow-sm">
                  Current Plan
                </span>
              )}
            </div>
          </div>

          <div className="hidden md:block border-b border-gray-200 dark:border-gray-600 mt-auto"></div>
        </div>

        <div className="p-4 pt-4 flex flex-col flex-grow">
          <div className="mb-4">
            <h1 className="text-gray-900 dark:text-white font-bold text-2xl sm:text-3xl">
              <span className="text-lg align-top text-primary-600 dark:text-primary-400">$</span>
              {plan.price || 0}
              <span className="text-gray-600 dark:text-gray-300 text-base font-normal ml-1">
                / {plan.duration_days || 30} Days
              </span>
            </h1>
          </div>

          <div className="overflow-y-auto md:overflow-y-visible mb-6 flex-grow">
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
                  <span className="text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4">
            {plan.price !== "0.00" && (
              <button
                onClick={() => onSelect(plan)}
                className="w-full py-3 px-6 rounded-lg font-medium text-center
                  relative overflow-hidden group
                  bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700
                  text-primary shadow-md hover:shadow-lg
                  transition-all duration-300 hover:scale-[1.02]
                  border border-primary dark:border-primary-800"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <span>Order Plan</span>
                  <svg className="w-5 h-5 ml-2 transform transition-transform duration-300 group-hover:translate-x-1"
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24">
                    <path strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </span>
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600
                  transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 z-0"/>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;