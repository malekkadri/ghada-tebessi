import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Plan } from '../services/Plan';
import { planService } from '../services/api';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (newPlan: Plan) => void;
  onUpdate?: (updatedPlan: Plan) => void;
  planToEdit?: Plan | null;
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  onUpdate, 
  planToEdit 
}) => {
  const isEditMode = !!planToEdit;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [durationDays, setDurationDays] = useState('30');
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && planToEdit) {
      setName(planToEdit.name);
      setDescription(planToEdit.description || '');
      setPrice(String(planToEdit.price));
      setDurationDays(String(planToEdit.duration_days));
      setIsActive(planToEdit.is_active);
      setIsDefault(planToEdit.is_default);
      setFeatures(
        Array.isArray(planToEdit.features) 
          ? planToEdit.features 
          : typeof planToEdit.features === 'string' 
            ? [planToEdit.features] 
            : []
      );
    } else {
      resetForm();
    }
  }, [isEditMode, planToEdit]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('0');
    setDurationDays('30');
    setIsActive(true);
    setIsDefault(false);
    setFeatures([]);
    setNewFeature('');
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    
    if (features.length === 0) {
      toast.error('Please add at least one feature');
      return;
    }
    
    const planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'> = {
      name,
      description,
      price,
      duration_days: Number(durationDays),
      features,
      is_active: isActive,
      is_default: isDefault
    };

    setLoading(true);
    try {
      if (isEditMode && planToEdit?.id) {
        const response = await planService.updatePlan(
          planToEdit.id.toString(), 
          planData
        );
        
        if (response.data) {
          toast.success('Plan updated successfully!');
          if (onUpdate) onUpdate(response.data as Plan);
          onClose();
        }
      } else {
        const response = await planService.createPlan(planData);
        
        if (response.data) {
          toast.success('Plan created successfully!');
          if (onCreate) onCreate(response.data as Plan);
          resetForm();
          onClose();
        }
      }
    } catch (error: any) {
      console.error('Failed to save plan:', error);
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} plan`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {isEditMode ? "Edit Plan" : "Create New Plan"}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Premium Plan"
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (days) *
                </label>
                <input
                  type="number"
                  id="duration"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="30"
                />
              </div>
              
              <div className="flex flex-col justify-end space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Active Plan
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Default Plan
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe the plan features and benefits..."
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Features *
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">{features.length} added</span>
              </div>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                  className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add a feature"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  disabled={!newFeature.trim()}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              
              {features.length > 0 ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 max-h-40 overflow-y-auto">
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-md">
                        <span className="text-gray-800 dark:text-gray-200">{feature}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FaTimes />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  No features added yet
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim() || features.length === 0}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Plan' : 'Create Plan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlanFormModal;