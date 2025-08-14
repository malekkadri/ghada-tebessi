import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

interface AssignPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignPlan: (duration: string, unit?: 'days' | 'months' | 'years') => void;
  planName: string;
}

const AssignPlanModal: React.FC<AssignPlanModalProps> = ({ 
  isOpen, 
  onClose, 
  onAssignPlan,
  planName 
}) => {
  const [duration, setDuration] = useState('1');
  const [unit, setUnit] = useState<'days' | 'months' | 'years'>('months');
  const [isUnlimited, setIsUnlimited] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (isUnlimited) {
      onAssignPlan('unlimited');
    } else {
      onAssignPlan(duration, unit);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Assign {planName} Plan
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-4">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isUnlimited}
                    onChange={(e) => setIsUnlimited(e.target.checked)}
                  />
                  <div className={`block w-14 h-7 rounded-full transition ${isUnlimited ? 'bg-purple-600' : 'bg-gray-400'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition transform ${isUnlimited ? 'translate-x-7' : ''}`}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unlimited Duration
                </span>
              </label>
            </div>

            {!isUnlimited && (
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label 
                    htmlFor="duration"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Duration
                  </label>
                  <input
                    type="number"
                    id="duration"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="unit"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Unit
                  </label>
                  <select
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
            >
              Assign Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignPlanModal;