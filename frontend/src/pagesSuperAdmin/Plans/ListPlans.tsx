import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PlanCardAdmin from '../../cards/PlanCardAdmin';
import { planService } from '../../services/api';
import { Plan } from '../../services/Plan';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import PlanStatsCards from '../../cards/PlanStatsCards';
import DeleteConfirmationModal from '../../modals/DeleteConfirmationModal';
import PlanFormModal from '../../modals/PlanFormModal'; 

const ListPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<number | null>(null);
  const [deletingPlanName, setDeletingPlanName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    free: 0,
    default: 0
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await planService.getAllPlans();
        
        if (response.data) {
          setPlans(response.data);
          console.log(response.data);
        } else {
          setPlans([]);
          toast.error('No plan data received from server');
        }
      } catch (error) {
        console.error('Failed to fetch plans', error);
        toast.error('Failed to load plans. Please try again.');
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    if (plans.length > 0) {
      const total = plans.length;
      const active = plans.filter(plan => plan.is_active).length;
      const free = plans.filter(plan => Number(plan.price) === 0).length;
      const defaultPlans = plans.filter(plan => plan.is_default).length;

      setStats({ total, active, free, default: defaultPlans });
    } else {
      setStats({ total: 0, active: 0, free: 0, default: 0 });
    }
  }, [plans]);

  const handleCreatePlan = async (newPlan: Plan) => {
    try {
      setPlans(prev => [newPlan, ...prev]);
      
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        active: prev.active + (newPlan.is_active ? 1 : 0),
        free: prev.free + (Number(newPlan.price) === 0 ? 1 : 0),
        default: prev.default + (newPlan.is_default ? 1 : 0)
      }));
    } catch (error: any) {
      console.error('Failed to create plan:', error);
    }
  };

  const handleUpdatePlan = (updatedPlan: Plan) => {
    setPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.id === updatedPlan.id ? updatedPlan : plan
      )
    );
  };

  const togglePlanStatus = async (planId: number, isActive: boolean) => {
    try {
      setPlans(prevPlans =>
        prevPlans.map(plan =>
          plan.id === planId ? { ...plan, is_active: isActive } : plan
        )
      );

      await planService.togglePlanStatus(planId.toString());
      toast.success(`Plan ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Failed to toggle plan status', error);
      toast.error('Failed to update plan status');

      setPlans(prevPlans =>
        prevPlans.map(plan =>
          plan.id === planId ? { ...plan, is_active: !isActive } : plan
        )
      );
    }
  };

  const openDeleteModal = (planId: number, planName: string) => {
    setPlanToDelete(planId);
    setDeletingPlanName(planName);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPlanToDelete(null);
    setDeletingPlanName('');
    setIsDeleting(false);
  };

  const handleDeletePlan = async () => {
    if (planToDelete === null) return;
    
    setIsDeleting(true);
    try {
      const deletedPlan = plans.find(p => p.id === planToDelete);
      if (!deletedPlan) return;

      await planService.deletePlan(planToDelete.toString());
      
      setPlans(prev => prev.filter(plan => plan.id !== planToDelete));
      toast.success('Plan deleted successfully');
      
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        active: prev.active - (deletedPlan.is_active ? 1 : 0),
        free: prev.free - (Number(deletedPlan.price) === 0 ? 1 : 0),
        default: prev.default - (deletedPlan.is_default ? 1 : 0)
      }));
    } catch (error) {
      console.error('Failed to delete plan', error);
      toast.error('Failed to delete plan');
    } finally {
      closeDeleteModal();
    }
  };

  const setDefaultPlan = async (planId: number) => {
    try {
      const updatedPlans = plans.map(plan => ({
        ...plan,
        is_default: plan.id === planId
      }));
      
      setPlans(updatedPlans);
      
      await planService.updatePlan(planId.toString(), { is_default: true });
      
      const previousDefault = plans.find(p => p.is_default && p.id !== planId);
      if (previousDefault) {
        await planService.updatePlan(previousDefault.id.toString(), { is_default: false });
      }
      
      toast.success('Default plan updated successfully');
    } catch (error) {
      console.error('Failed to set default plan', error);
      toast.error('Failed to update default plan');
      setPlans(plans);
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setShowEditPlanModal(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="lg:p-2 xl:p-2 sm:p-6 sm:py-2 lg:px-8 xl:px-14 lg:py-4 xl:py-4 w-full max-w-[90rem] mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <PlanFormModal 
        isOpen={showAddPlanModal}
        onClose={() => setShowAddPlanModal(false)}
        onCreate={handleCreatePlan}
      />

      <PlanFormModal 
        isOpen={showEditPlanModal}
        onClose={() => {
          setShowEditPlanModal(false);
          setEditingPlan(null);
        }}
        onUpdate={handleUpdatePlan}
        planToEdit={editingPlan}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeletePlan}
        isLoading={isDeleting}
        itemName={deletingPlanName}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-xl sm:text-2xl pt-4 font-bold text-gray-800 dark:text-white">Plan Management</h1>
          <p className="text-primary mt-1 sm:mt-2 text-xs sm:text-sm">
            View and manage all subscription plans
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddPlanModal(true)}
            className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg transition-colors h-10 sm:h-12 text-sm sm:text-base"
          >
            <FaPlus className="mr-2" />
            <span>Add Plan</span>
          </button>
        </div>
      </div>

      <div className="mobile-stats-reduce">
        <PlanStatsCards
          stats={{
            total: stats.total,
            active: stats.active,
            free: stats.free,
            default: stats.default
          }}
        />
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-xl max-w-2xl mx-auto">
            <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">No plans yet</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Get started by creating your first subscription plan.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddPlanModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-600 focus:outline-none"
              >
                <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                Add Plan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan: Plan) => (
            <PlanCardAdmin
              key={plan.id}
              plan={plan}
              isCurrent={false}
              onEdit={() => handleEditPlan(plan)}
              onDelete={() => openDeleteModal(plan.id!, plan.name)}
              onToggleStatus={() => togglePlanStatus(plan.id!, !plan.is_active)}
              onSetDefault={() => setDefaultPlan(plan.id!)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListPlans;