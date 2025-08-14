import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { planService, subscriptionService } from '../../services/api';
import PlanCard from '../../cards/PlanCard';
import { Plan } from '../../services/Plan';
import { Subscription } from '../../services/Subscription';
import { User } from '../../services/user';
import SubscriptionModal from '../../modals/SubscriptionModal';
import ConfirmCancelModal from '../../modals/ConfirmCancelSubModal';
import SubscriptionHistoryTable from './SubscriptionHistoryTable';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { toast, ToastContainer } from "react-toastify";
import StripePaymentForm from './StripePaymentForm';

interface UserWithSubscription extends User {
  subscription?: Subscription;
}

interface SubscriptionWithPlan extends Subscription {
  plan?: Plan;
}

const normalizeFeatures = (plan: any): Plan => {
  if (!plan) return plan;

  let normalizedFeatures: string[] = [];

  if (Array.isArray(plan.features)) {
    normalizedFeatures = plan.features.map((feature: any) => {
      if (typeof feature !== 'string') return String(feature);
      return feature.trim();
    });
  } else if (typeof plan.features === 'string') {
    if (plan.features.startsWith('[') && plan.features.endsWith(']')) {
      try {
        const parsed = JSON.parse(plan.features);
        normalizedFeatures = parsed.map((item: any) =>
          typeof item === 'string' ? item.trim() : String(item)
        );
      } catch (e) {
        normalizedFeatures = plan.features.split(',').map((f: string) => f.trim());
      }
    } else {
      normalizedFeatures = plan.features.split(',').map((f: string) => f.trim());
    }
  }

  return {
    ...plan,
    price: plan.price,
    features: normalizedFeatures
  };
};

const AccountPlans: React.FC = () => {
  const { user } = useAuth() as { user: UserWithSubscription | null };
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [currentView, setCurrentView] = useState<'plans' | 'payment' | 'history'>('plans');
  const paymentFormRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [currentView, scrollToTop]);

  useEffect(() => {
    if (currentView === 'payment' && selectedPlan) {
      setTimeout(() => {
        window.scrollTo(0, 0);
        if (paymentFormRef.current) {
          paymentFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [currentView, selectedPlan]);

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelStatus, setCancelStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
    endDate?: string;
  }>({ loading: false, error: null, success: false });
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionWithPlan[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = user?.id || JSON.parse(localStorage.getItem('user') || '{}').id;
      if (!userId) return;

      const [plansResponse, subscriptionResponse, historyResponse] = await Promise.all([
        planService.getAllPlans(),
        subscriptionService.getCurrentSubscription(userId),
        subscriptionService.getUserSubscriptions(userId)
      ]);

      const processedPlans = (plansResponse.data || []).map(normalizeFeatures);
      setAvailablePlans(processedPlans);

      if (subscriptionResponse.data) {
        const planResponse = await planService.getPlanById(subscriptionResponse.data.plan_id);
        if (planResponse.data) {
          setCurrentPlan(normalizeFeatures(planResponse.data));
          setCurrentSubscription(subscriptionResponse.data);
        }
      } else {
        const freePlan = processedPlans.find(plan => plan.price === "0.00");
        if (freePlan) setCurrentPlan(freePlan);
      }

      if (historyResponse.data && Array.isArray(historyResponse.data)) {
        const subscriptionsWithPlans = await Promise.all(
          historyResponse.data.map(async (sub: Subscription) => {
            const plan = await planService.getPlanById(sub.plan_id);
            return {
              ...sub,
              plan: plan.data ? normalizeFeatures(plan.data) : undefined
            };
          })
        );
        setSubscriptionHistory(subscriptionsWithPlans);
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleRenewClick = useCallback(() => {
    if (!currentPlan || !currentSubscription) return;

    setSelectedPlan(currentPlan);
    setCurrentView('payment');
    window.scrollTo(0, 0);
  }, [currentPlan, currentSubscription]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handlePlanSelect = useCallback((plan: Plan) => {
    setSelectedPlan(plan);

    if (currentSubscription && currentPlan?.price !== "0.00") {
      setShowSubscriptionModal(true);
    } else {
      setCurrentView('payment');
      window.scrollTo(0, 0);
    }
  }, [currentPlan, currentSubscription]);

  const handleCancelClick = () => {
    setShowCancelModal(true);
    setCancelStatus({ loading: false, error: null, success: false });
  };

  const handleConfirmCancel = async () => {
    try {
      if (!user) return;

      setCancelStatus({ loading: true, error: null, success: false });
      await subscriptionService.cancelSubscription(user.id);
      toast.success("Subscription is canceled!");

      setCancelStatus({
        loading: false,
        error: null,
        success: true,
      });

      await fetchUserData();

      setTimeout(() => setShowCancelModal(false), 2000);
    } catch (err: any) {
      setCancelStatus({
        loading: false,
        error: err.message,
        success: false
      });
    }
  };

  const handlePaymentSuccess = useCallback(() => {
    setCurrentView('plans');
    if (selectedPlan) {
      setCurrentPlan(selectedPlan);
    }
    fetchUserData();
  }, [selectedPlan, fetchUserData]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewHistory = () => {
    setCurrentView('history');
    setCurrentPage(1);
    window.scrollTo(0, 0);
  };

  const handleBackToPlans = () => {
    setCurrentView('plans');
    window.scrollTo(0, 0);
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mx-4 sm:mx-6 my-4">
      {error}
    </div>
  );

  const filteredAvailablePlans = availablePlans.filter(plan =>
    currentPlan ? plan.id !== currentPlan.id : true
  );

  if (currentView === 'payment' && selectedPlan) {
    return (
      <div className="w-full max-w-full overflow-x-hidden" ref={paymentFormRef}>
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold pb-6 text-center text-gray-900 dark:text-gray-100">
            Complete Your Subscription
          </h3>
          <StripePaymentForm
            plan={selectedPlan}
            onSuccess={handlePaymentSuccess}
            onCancel={() => {
              setCurrentView('plans');
              scrollToTop();
            }}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'history') {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = subscriptionHistory.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(subscriptionHistory.length / itemsPerPage);

    return (
      <div className="w-full py-8">
        <ToastContainer position="top-right" autoClose={5000} />
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Subscription History
            </h3>
            <button
              onClick={handleBackToPlans}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto"
            >
              Back to Plans
            </button>
          </div>

          <div className="relative mobile:overflow-x-visible">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <SubscriptionHistoryTable subscriptions={currentItems} />
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 ${
                    currentPage === 1
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FaAngleLeft className="h-4 w-4" />
                </button>

                <div className="hidden sm:flex">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-2 border-t border-b border-gray-300 dark:border-gray-600 ${
                        currentPage === number
                          ? 'bg-purple-500 text-white border-purple-500'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 ${
                    currentPage === totalPages
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FaAngleRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full py-8">
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        currentPlanName={currentPlan?.name || 'current'}
      />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold mb-2 dark:text-white">Subscription</h3>
          <p className="text-primary max-w-2xl mx-auto">
            View the details of your active subscription and manage your plan settings.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold dark:text-white pl-2">Your Current Plan</h2>
            {subscriptionHistory.length > 0 && (
              <button
                onClick={handleViewHistory}
                className="text-purple-500 hover:underline whitespace-nowrap"
              >
                View History
              </button>
            )}
          </div>

          {currentPlan ? (
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-8 ${
              currentPlan.price === "0.00" ? 'border-2 border-primary' : 'border-2 border-primary-500'
            }`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h3 className="text-xl sm:text-2xl font-semibold text-primary">{currentPlan.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  currentPlan.price === "0.00"
                    ? 'bg-blue-100 dark:bg-purple-500 text-purple-500 dark:text-blue-200'
                    : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                }`}>
                  {currentPlan.price === "0.00" ? 'Free Plan' : 'Active'}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-300">{currentPlan.description}</p>
                <p className="text-2xl sm:text-3xl font-bold mt-2 text-gray-800 dark:text-white">
                  ${currentPlan.price}
                  <span className="text-gray-500 dark:text-gray-300 text-lg ml-1">
                    / {currentPlan.duration_days} days
                  </span>
                </p>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-3 dark:text-gray-200">Features:</h4>
                <ul className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-2 border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">No active plan found.</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 dark:text-white">Available Plans</h2>
          {filteredAvailablePlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredAvailablePlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={currentPlan?.id === plan.id}
                  onSelect={handlePlanSelect}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              No other plans available at this time.
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Billing Information</h3>
          {currentPlan?.price !== "0.00" ? (
            <>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Next Billing Date:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {formatDate(currentSubscription?.end_date)}
                  </span>
                </div>
                
                {currentSubscription?.status === 'active' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Days Remaining:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {Math.ceil(
                        (new Date(currentSubscription.end_date).getTime() - Date.now()) / 
                        (1000 * 60 * 60 * 24)
                      )} days
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                {(currentSubscription?.status === 'active' || currentSubscription?.status === 'expired') && (
                  <button
                    onClick={handleRenewClick}
                    className="btn py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded disabled:opacity-50"
                  >
                    {currentSubscription?.status === 'expired' 
                      ? 'Reactivate Subscription' 
                      : 'Renew Subscription'}
                  </button>
                )}

                {currentSubscription?.status === 'active' && (
                  <button
                    onClick={handleCancelClick}
                    className="btn py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded disabled:opacity-50"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>

              <ConfirmCancelModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleConfirmCancel}
                planName={currentPlan?.name || 'current'}
                endDate={cancelStatus.endDate}
              />
            </>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              You are currently on the free plan. Upgrade to access premium features.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPlans;