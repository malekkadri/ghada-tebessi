import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import { storeToken, deleteToken, getToken, hasValidToken } from '../services/tokenService';
import { User} from './../services/user'

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      if (!hasValidToken()) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
        return false;
      }
      const response = await authService.getCurrentUser();

      if (!response.data) {
        throw new Error('User data not found');
      }
      
      setState({
        user: response.data,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      deleteToken();
      return false;
    }
  }, []);

  const loadUserSession = useCallback(async () => {
    try {
      await checkAuth();
    } catch (error) {
      console.error('Failed to load user session:', error);
    }
  }, [checkAuth]);

  const login = async (email: string, password: string, rememberMe: boolean): Promise<{
    user: User;
    tempToken?: string;
    requires2FA?: boolean;
  }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await authService.signIn({ email, password, rememberMe });
      const { token, user, tempToken, requires2FA } = response.data;
      
      if (!user || !token) {
        throw new Error('Invalid response from server');
      }
      
      // Si c'est 2FA, ne pas mettre à jour l'état d'authentification maintenant
      if (requires2FA && tempToken) {
        setState(prev => ({ ...prev, isLoading: false }));
        return { user, tempToken, requires2FA };
      }
      
      // Stocker le token et mettre à jour l'état
      storeToken(token, rememberMe);
      
      // Mettre à jour l'état d'authentification de manière synchrone
      setState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      
      // Attendre un peu pour s'assurer que l'état est propagé
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { user };
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const token = getToken();
      if (token) {
        await authService.logout();
      }
    } finally {
      deleteToken();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const handleGoogleAuth = async (token: string, userData: User) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      if (!token || !userData) {
        throw new Error('Invalid token or user data');
      }
      
      storeToken(token, true);
      
      // Mettre à jour l'état d'authentification de manière synchrone
      setState({
        user: userData,
        isAuthenticated: true,
        isLoading: false
      });
      
      // Attendre un peu pour s'assurer que l'état est propagé
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return userData;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      deleteToken();
      throw error;
    }
  };

  useEffect(() => {
    loadUserSession();
  }, [loadUserSession]);

  return {
    ...state,
    login,
    logout,
    checkAuth,
    handleGoogleAuth
  };
};
