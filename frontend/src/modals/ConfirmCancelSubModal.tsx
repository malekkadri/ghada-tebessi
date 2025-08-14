import React from 'react';

interface ConfirmCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planName: string;
  endDate?: string;
}

const ConfirmCancelModal: React.FC<ConfirmCancelModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  planName,
  endDate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Confirm Subscription Cancellation
        </h3>
        
        <div className="mb-4 space-y-2">
          <p className="text-gray-600 dark:text-gray-300">
            You are about to cancel your <span className="font-semibold">{planName}</span> subscription.
          </p>
          
          {endDate && (
            <p className="text-gray-600 dark:text-gray-300">
              Your access will continue until <span className="font-semibold">{new Date(endDate).toLocaleDateString()}</span>.
            </p>
          )}
          
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Are you sure you want to proceed?
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
          >
            Keep Subscription
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCancelModal;