import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionService, planService } from '../services/api';

const AuthHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');
    const auth = searchParams.get('auth');

    if (token && user && auth === 'success') {
      handleAuthentication(token, user);
    } else {
      navigate('/sign-in');
    }
  }, [searchParams]);

  const handleAuthentication = async (token: string, user: string) => {
    try {
      const decodedUser = decodeURIComponent(user);
      const userObj = JSON.parse(decodedUser);

      // Stockez le token et les données utilisateur
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userObj));

      // Récupérez l'abonnement et le plan
      try {
        const userId = Number(userObj.id);
        const subscriptionResponse = await subscriptionService.getCurrentSubscription(userId);

        if (subscriptionResponse) {
          const subscription = subscriptionResponse.data;
          if (subscription) {
            const planResponse = await planService.getPlanById(subscription.plan_id);
            if (planResponse.data) {
              const planData = {
                id: planResponse.data.id,
                name: planResponse.data.name,
                price: planResponse.data.price,
                duration_days: planResponse.data.duration_days,
                features: planResponse.data.features || []
              };
              localStorage.setItem('currentPlan', JSON.stringify(planData));
            }
          }
        } else {
          const freePlan = await planService.getFreePlan();
          localStorage.setItem('currentPlan', JSON.stringify(freePlan));
        }
      } catch (error) {
        console.error('Error fetching subscription or plan:', error);
      }

      // Appelez la fonction d'authentification Google
      await handleGoogleAuth(token, userObj);

      // Redirigez vers le tableau de bord approprié
      if (userObj.role === 'superAdmin') {
        navigate('/super-admin/dashboard');
      } else if (userObj.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      navigate('/sign-in');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">
          Authentification en cours...
        </p>
      </div>
    </div>
  );
};

export default AuthHandler;