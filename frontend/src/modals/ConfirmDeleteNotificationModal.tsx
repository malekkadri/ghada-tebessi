import React from 'react';

interface ConfirmDeleteNotificationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: (e: React.MouseEvent) => void;
  notificationSubject?: string;
}

const ConfirmDeleteNotificationModal: React.FC<ConfirmDeleteNotificationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  notificationSubject
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Delete Notification
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {notificationSubject ? (
            <>Are you sure that you want to delete the notification <span className="font-medium">"{notificationSubject}"</span>?</>
          ) : (
            <>Are you sure that you want to delete this notification?</>
          )}
        </p>
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteNotificationModal;