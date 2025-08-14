import React from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanName: string;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  isOpen, 
  onClose, 
  currentPlanName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Subscription Exists
        </h3>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          You already have an active subscription to the <span className="font-semibold">{currentPlanName}</span> plan.
          You need to cancel your current subscription before subscribing to a new plan.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
          >
            Close
          </button>
        
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;