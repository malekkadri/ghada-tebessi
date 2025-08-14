import axios from 'axios';
import { getToken } from './tokenService';
import { User } from './user';
import { Plan } from './Plan';
import { Subscription } from './Subscription';
import { ActivityLog, ActivityLogType } from './ActivityLog';
import { ApiKey } from './ApiKey';
import { Pixel, PixelEventParams } from './Pixel';
import { CustomDomain, DNSInstructions } from './CustomDomain';
import { Quote, QuoteService as QuoteServiceEnum } from './Quote';
import { VCard } from './vcard';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
interface SignInResponse {
  token: string;
  user: User;
}

interface ApiResponse<T = any> {
  status?: number;
  data?: T;
  error?: string;
  message?: string;
}

interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

interface DeleteAccountResponse {
  success: boolean;
  message?: string;
}

interface ActivityLogResponse {
  data: ActivityLog[];
  total: number;
  limit: number;
  offset: number;
}

interface FailedAttemptsResponse {
  count: number;
  hours: number;
}

interface ApiKeyWithToken extends ApiKey {
  key: string;
}

interface ApiKeyListResponse {
  data: ApiKey[];
  total: number;
}

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    if (error.code === 'ERR_NETWORK' && !config._retry) {
      config._retry = true;

      await new Promise(res => setTimeout(res, 2 ** config._retryCount * 1000 || 1000));
      return api(config);
    }
    return Promise.reject(error);
  }
);

export interface VCardWithUser extends VCard {
  Users: User;
}

export const authService = {
  signIn: (credentials: { email: string; password: string; rememberMe: boolean }) =>
    api.post<{ token: string; user: User; requires2FA?: boolean; tempToken?: string }>('/users/sign-in', credentials),

  logout: () => api.post('/users/logout'),

  getCurrentUser: () => api.get('/users/me').then(res => res.data),

  signUp: (data: { name: string; email: string; password: string; recaptchaToken: string }) =>
    api.post('/users/sign-up', data),

  forgotPassword: (email: string): Promise<ApiResponse<ForgotPasswordResponse>> =>
    api.post('/password/forgot-password', { email }),

  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/password/reset-password', data),

  updateUser: (formData: FormData)=>
    api.put('/users/me', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data),

  authenticateWithGoogle: (): void => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/google`;
  },

  handleGoogleCallback: async (): Promise<ApiResponse<SignInResponse>> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/google/callback`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Google authentication failed');
    }

    return response.json();
  },

  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<ChangePasswordResponse>> =>
    api.post('/users/change-password', data).then(res => res.data),

  getTwoFactorStatus: () =>
    api.get('/users/two-factor/status'),

  generateTwoFactorSecret: () =>
    api.post('/users/two-factor/generate'),

  verifyAndEnableTwoFactor: (data: { token: string }) =>
    api.post('/users/two-factor/verify', data),

  disableTwoFactor: () =>
    api.post('/users/two-factor/disable'),

  verify2FALogin: (data: { token: string, tempToken: string }) =>
    api.post('/users/two-factor/login', data),

  deleteAccount: (data: { password: string }): Promise<ApiResponse<DeleteAccountResponse>> =>
    api.delete('/users/me', { data }).then(res => res.data),

  getAllUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<{
    data: User[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
  }>> =>
    api.get('/users/superadmin/users', { params }).then(res => res.data),

  toggleUserStatus: (id: number, isActive: boolean): Promise<ApiResponse<{ message: string }>> =>
    api.put(`/users/superadmin/users/${id}/status`, { isActive }).then(res => res.data),

  createUser: async (userData: {
    name: string;
    email: string;
    role: string;
    password: string;
  }) => {
    try {
      const response = await api.post('/users/add-user', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },
};

export const vcardService = {
  create: async (data: { name: string; description: string; userId: number }) => {
    try {
      const response = await api.post('/vcard', data);
      return response.data;
    } catch (error) {
      console.error('Error creating vcard:', error);
      throw error;
    }
  },

  getAll: async (userId: string) => {
    try {
      const response = await api.get(`/vcard?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting all vcards:', error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/vcard/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting vcard with id ${id}:`, error);
      throw error;
    }
  },

  getByUrl: async (url: string) => {
    try {
      const response = await api.get(`/vcard/url/${url}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting vcard with url ${url}:`, error);
      throw error;
    }
  },

  update: async (id: string, formData: FormData) => {
    try {
      const response = await api.put(`/vcard/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating vcard with id ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/vcard/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting vcard with id ${id}:`, error);
      throw error;
    }
  },

  registerView: async (id: string) => {
    try {
      const response = await api.post<{
        views: number;
        isNewView: boolean;
        isOwner?: boolean;
      }>(`/vcard/${id}/views`);
      return response.data;
    } catch (error) {
      console.error(`Error registering view for vcard with id ${id}:`, error);
      throw error;
    }
  },

   getAllWithUsers: async (): Promise<ApiResponse<VCardWithUser[]>> => {
    try {
      const response = await api.get('/vcard/admin/vcards-with-users');
      return response.data;
    } catch (error) {
      console.error('Error getting all vcards with users:', error);
      throw error;
    }
  },

  checkLimit: async () => {
    try {
      const response = await api.get<{ current: number; max: number }>('/vcard/limits');
      return response.data;
    } catch (error) {
      console.error('API Limit Check Error:', error);
      return { current: 0, max: 1 };
    }
  },

   toggleStatus: async (id: string): Promise<{ 
    message: string; 
    vcardId: string; 
    newStatus: boolean 
  }> => {
    try {
      const response = await api.put(`/vcard/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling status for vcard with id ${id}:`, error);
      throw error;
    }
  }
};

export const blockService = {
  create: (data: {
    type_block: string;
    name: string;
    description?: string;
    status?: boolean;
    vcardId: number;
  }) => api.post('/block', data),

  getAll: () => api.get('/block'),

  getByVcardIdAdmin: (vcardId: string) =>
    api.get(`/block/admin?vcardId=${vcardId}`),

  getByVcardId: (vcardId: string) =>
    api.get(`/block?vcardId=${vcardId}`),

  getById: (id: string) => api.get(`/block/${id}`),

  update: (id: string, data: {
    type_block?: string;
    name?: string;
    description?: string;
    status?: boolean;
    vcardId?: number;
  }) => api.put(`/block/${id}`, data),

  delete: (id: string) => api.delete(`/block/${id}`),

  searchBlocks: (vcardId: string, query: string) =>
    api.get(`/block/search?vcardId=${vcardId}&q=${encodeURIComponent(query)}`),

  toggleStatus: async (id: string): Promise<{ 
      message: string; 
      blockId: string; 
      newStatus: boolean 
    }> => {
      try {
        const response = await api.put(`/block/${id}/toggle-status`);
        return response.data;
      } catch (error) {
        console.error(`Error toggling status for block with id ${id}:`, error);
        throw error;
      }
    }

};

export const activityLogService = {
  getUserActivities: (params?: {
    limit?: number;
    offset?: number;
    type?: ActivityLogType;
    days?: number;
    deviceType?: string;
    browser?: string;
    userId?: number;
  }): Promise<ApiResponse<ActivityLogResponse>> =>
    api.get('/activity-logs', { params }).then(res => res.data),

  getFailedAttempts: (hours: number = 1): Promise<ApiResponse<FailedAttemptsResponse>> =>
    api.get('/activity-logs/failed-attempts', { params: { hours } }).then(res => res.data),

  getRecentActivities: (limit: number = 5): Promise<ApiResponse<ActivityLog[]>> =>
    api.get('/activity-logs/recent', { params: { limit } }).then(res => res.data),

  getActivityDetails: (id: number): Promise<ApiResponse<ActivityLog>> =>
    api.get(`/activity-logs/${id}`).then(res => res.data),

  exportData: (format: 'csv' | 'json' = 'json'): Promise<Blob> =>
    api.get('/activity-logs/export', {
      params: { format },
      responseType: 'blob'
    }).then(res => res.data),
};

export const ApiKeyService = {
  createApiKey: (data: {
    name: string;
    expiresAt?: string;
    scopes?: string[];
  }): Promise<ApiResponse<ApiKeyWithToken>> =>
    api.post('/apikey', data).then(res => res.data),

  listApiKeys: (): Promise<ApiResponse<ApiKeyListResponse>> =>
    api.get('/apikey').then(res => res.data),

  revokeApiKey: (id: number): Promise<ApiResponse<{ success: boolean }>> =>
    api.delete(`/apikey/${id}`).then(res => res.data),

  listAllApiKeys: async () => {
    try {
      const response = await api.get('/apikey/all');
      return response.data;
    } catch (error) {
      console.error('Error getting apiKeys with user information:', error);
      throw error;
    }
  },

  toggleApiKeyStatus: async (id: number) => {
    try {
      const response = await api.put(`/apikey/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling active status for apiKey ${id}:`, error);
      throw error;
    }
  }
};

export const planService = {
  getAllPlans: (): Promise<ApiResponse<Plan[]>> =>
    api.get('/plans').then(res => res.data),

  searchPlans: (query: string): Promise<ApiResponse<Plan[]>> =>
    api.get('/plans/search', { params: { q: query } }).then(res => res.data),

  getPlanById: (id: number): Promise<ApiResponse<Plan>> =>
    api.get(`/plans/${id}`).then(res => res.data),

  getFreePlan: (): Promise<ApiResponse<Plan>> =>
    api.get('/plans/free').then(res => res.data),

  createPlan: (data: Partial<Plan>): Promise<ApiResponse<Plan>> =>
    api.post('/plans', data).then(res => res.data),

  updatePlan: (id: string, data: Partial<Plan>): Promise<ApiResponse<Plan>> =>
    api.put(`/plans/${id}`, data).then(res => res.data),

  deletePlan: (id: string): Promise<ApiResponse<{ message: string }>> =>
    api.delete(`/plans/${id}`).then(res => res.data),

  togglePlanStatus: (id: string): Promise<ApiResponse<Plan>> =>
    api.patch(`/plans/${id}/toggle-status`).then(res => res.data),
};

export const paymentService = {
  createPaymentIntent: async (planId: number, userId: string, months: number, paymentMethod: string) => {
    try {
      const response = await api.post('/payment/create-payment-intent', {
        planId,
        userId,
        months,
        paymentMethod
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  confirmPayment: async (paymentId: string) => {
    try {
      const response = await api.post('/payment/confirm', { paymentId });
      return response.data;
    } catch (error) {
      console.error(`Error confirming payment ${paymentId}:`, error);
      throw error;
    }
  },

  getPaymentHistory: async () => {
    try {
      const response = await api.get('/payment/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },

  getPaymentDetails: async (paymentId: number) => {
    try {
      const response = await api.get(`/payment/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  }
};

export const subscriptionService = {
  getCurrentSubscription: async (userId: number): Promise<ApiResponse<Subscription>> => {
    try {
      const response = await api.get('/subscription/current', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error(`Error getting current subscription for user ${userId}:`, error);
      throw error;
    }
  },

  cancelSubscription: async (userId: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.post('/subscription/cancel', { userId });
      return response.data;
    } catch (error) {
      console.error(`Error cancelling subscription for user ${userId}:`, error);
      throw error;
    }
  },

  getUserSubscriptions: async (userId: number): Promise<ApiResponse<Subscription>> => {
    try {
      const response = await api.get('/subscription/history', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error(`Error getting subscription history for user ${userId}:`, error);
      throw error;
    }
  },

  getSubscriptionStatus: async (userId: number): Promise<ApiResponse<{
    subscription: Subscription;
    days_left: number;
    should_notify: boolean;
    notification_message?: string;
  }>> => {
    try {
      const response = await api.get('/subscription/status', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error(`Error getting subscription status for user ${userId}:`, error);
      throw error;
    }
  },

  getSubscriptions: async () => {
    try {
      const response = await api.get('/subscription/all');
      return response.data;
    } catch (error) {
      console.error('Error getting subscriptions with user information:', error);
      throw error;
    }
  },

  cancelSubscriptionByAdmin: async (id: number) => {
    try {
      const response = await api.put(`/subscription/${id}/CancelByAdmin`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling blocked status for subscription ${id}:`, error);
      throw error;
    }
  },

   assignPlan: async (
    userId: number, 
    planId: number, 
    duration: string, 
    unit?: 'days' | 'months' | 'years'
  ): Promise<ApiResponse<Subscription>> => {
    try {
      const response = await api.post('/subscription/assign', {
        userId,
        planId,
        duration,
        unit
      });
      return response.data;
    } catch (error) {
      console.error(`Error assigning plan ${planId} to user ${userId}:`, error);
      throw error;
    }
  },
};

export const notificationService = {
  getNotifications: async (params?: {
    userId?: string;
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }) => {
    try {
      const response = await api.get('/notification', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId: number) => {
    try {
      const response = await api.patch(`/notification/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      const response = await api.patch('/notification/mark-all-read', { userId });
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  deleteNotification: async (notificationId: number) => {
    try {
      const response = await api.delete(`/notification/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      throw error;
    }
  },

  checkStatus: async () => {
    try {
      const response = await api.get('/notification/status');
      return response.data;
    } catch (error) {
      console.error('Error checking notification status:', error);
      throw error;
    }
  },
};

export const webhookService = {
  handleStripeWebhook: async (event: any) => {
    try {
      const response = await api.post('/payment/webhook/stripe', event);
      return response.data;
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      throw error;
    }
  },
};

export const projectService = {
  createProject: async (formData: FormData) => {
    try {
      const response = await api.post('/project', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  getUserProjects: async (userId: number) => {
    try {
      const response = await api.get('/project/user', { params: { userId } });
      return response.data;
    } catch (error) {
      console.error(`Error getting projects for user ${userId}:`, error);
      throw error;
    }
  },

  updateProject: async (id: string, formData: FormData) => {
    try {
      const response = await api.put(`/project/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    try {
      const response = await api.delete(`/project/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  },

  getProjectById: async (id: string) => {
    try {
      const response = await api.get(`/project/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting project with id ${id}:`, error);
      throw error;
    }
  },

  getVCardsByProject: async (id: string) => {
    try {
      const response = await api.get(`/project/${id}/vcards`);
      return response.data;
    } catch (error) {
      console.error(`Error getting vCards for project ${id}:`, error);
      throw error;
    }
  },

   getAllProjectsWithUser: async () => {
    try {
      const response = await api.get('/project/projects-with-users');
      return response.data;
    } catch (error) {
      console.error('Error getting projects with user information:', error);
      throw error;
    }
  }, 

  toggleProjectBlocked: async (id: string) => {
    try {
      const response = await api.put(`/project/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling blocked status for project ${id}:`, error);
      throw error;
    }
  }
};


export const pixelService = {
  create: async (data: { vcardId: number; name?: string }) => {
    try {
      const response = await api.post('/pixel', data);
      return response.data;
    } catch (error) {
      console.error('Error creating pixel:', error);
      throw error;
    }
  },

  update: async (pixelId: string, data: { name?: string; vcardId?: number; is_active?: boolean }) => {
    try {
      const response = await api.put(`/pixel/${pixelId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating pixel:', error);
      throw error;
    }
  },

  delete: async (pixelId: string) => {
    try {
      const response = await api.delete(`/pixel/${pixelId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting pixel:', error);
      throw error;
    }
  },

  getUserPixels: async (userId: number) => {
    try {
      const response = await api.get('/pixel/user', { params: { userId } });
      return response.data;
    } catch (error) {
      console.error('Error fetching user pixels:', error);
      throw error;
    }
  },

  getPixelById: async (id: string): Promise<ApiResponse<Pixel>> => {
    try {
      const response = await api.get(`/pixel/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting pixel with id ${id}:`, error);
      throw error;
    }
  },
  
  trackEvent: async (pixelId: string, data: PixelEventParams) => {
    try {
      await api.post(`/pixel/${pixelId}/track`, data);
    } catch (error) {
      console.error('Error tracking pixel event:', error);
    }
  },

  getPixelsByVCard: async (vcardId: string) => {
      try {
        const response = await api.get(`/pixel/vcard/${vcardId}`);
        return response.data.pixels || [];
      } catch (error) {
        console.error('Error fetching pixels for vCard:', error);
        return [];
      }
  },

   getPixels: async () => {
    try {
      const response = await api.get('/pixel/pixels');
      return response.data;
    } catch (error) {
      console.error('Error getting pixels with user information:', error);
      throw error;
    }
  }, 

    togglePixelBlocked: async (id: string) => {
      try {
        const response = await api.put(`/pixel/${id}/toggle-status`);
        return response.data;
      } catch (error) {
        console.error(`Error toggling blocked status for project ${id}:`, error);
        throw error;
      }
    }
};

export const customDomainService = {
  create: async (data: { 
    domain: string; 
    custom_index_url?: string; 
    custom_not_found_url?: string 
  }): Promise<ApiResponse<CustomDomain>> => {
    try {
      const response = await api.post('/custom-domain', data);
      return response.data;
    } catch (error) {
      console.error('Error creating custom domain:', error);
      throw error;
    }
  },

  getUserDomains: async (): Promise<CustomDomain[]> => { 
    try {
      const response = await api.get('/custom-domain');
      return response.data.domains; 
    } catch (error) {
      console.error('Error fetching user domains:', error);
      throw error;
    }
  },

  getDomainById: async (id: number): Promise<ApiResponse<CustomDomain>> => {
    try {
      const response = await api.get(`/custom-domain/${id}`);
      return response.data; 
    } catch (error) {
      console.error(`Error fetching custom domain ${id}:`, error);
      throw error;
    }
  },

   update: async (id: number, data: { 
    domain?: string; 
    custom_index_url?: string; 
    custom_not_found_url?: string;
    vcardId?: number | null; 
  }): Promise<ApiResponse<CustomDomain>> => {
    try {
      const response = await api.put(`/custom-domain/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating custom domain ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.delete(`/custom-domain/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting custom domain ${id}:`, error);
      throw error;
    }
  },

  verify: async (id: number): Promise<ApiResponse<CustomDomain>> => {
    try {
      const response = await api.post(`/custom-domain/${id}/verify`);
      return response.data;
    } catch (error) {
      console.error(`Error verifying custom domain ${id}:`, error);
      throw error;
    }
  },

  getDNSInstructions: async (id: number): Promise<ApiResponse<DNSInstructions>> => {
    try {
      const response = await api.get(`/custom-domains/${id}/dns-instructions`);
      return response.data;
    } catch (error) {
      console.error(`Error getting DNS instructions for domain ${id}:`, error);
      throw error;
    }
  },

  linkToVCard: async (domainId: number, vcardId: number): Promise<ApiResponse<{
    domain: CustomDomain;
    vcard: VCard;
  }>> => {
    try {
      const response = await api.post('/custom-domain/link-to-vcard', {
        domainId,
        vcardId
      });
      return response.data;
    } catch (error) {
      console.error('Error linking domain to vCard:', error);
      throw error;
    }
  },

  unlinkFromVCard: async (domainId: number): Promise<ApiResponse<CustomDomain>> => {
    try {
      const response = await api.post(`/custom-domain/${domainId}/unlink`);
      return response.data;
    } catch (error) {
      console.error('Error unlinking domain from vCard:', error);
      throw error;
    }
  },

  handleDomainRequest: async (domain: string, path: string): Promise<ApiResponse<{ 
    action: 'redirect' | 'display', 
    url?: string 
  }>> => {
    try {
      const response = await api.post('/custom-domain/handle-request', { domain, path });
      return response.data;
    } catch (error) {
      console.error(`Error handling domain request for ${domain}:`, error);
      throw error;
    }
  },
  getDomains: async () => {
    try {
      const response = await api.get('/custom-domain/domains');
      return response.data;
    } catch (error) {
      console.error('Error getting custom domains with user information:', error);
      throw error;
    }
  },

   toggleStatus: async (id: number, status: 'pending' | 'active' | 'failed' | 'blocked'): Promise<ApiResponse<CustomDomain>> => {
    try {
      const response = await api.put(`/custom-domain/${id}/toggle-status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error toggling status for custom domain ${id}:`, error);
      throw error;
    }
  },
};

export const limitService = {
  checkVcardLimit: async () => {
    try {
      const response = await api.get<{ current: number; max: number }>('/limits/vcard');
      return response.data;
    } catch (error) {
      console.error('API Limit Check Error:', error);
      return { current: 0, max: 1 };
    }
  },

  checkBlockLimit: async (vcardId: string) => {
    try {
      const response = await api.get<{ current: number; max: number }>('/limits/blocks', { params: { vcardId } });
      return response.data;
    } catch (error) {
      console.error('API Limit Check Error:', error);
      return { current: 0, max: 10 };
    }
  },

  checkApiKeyLimits: async () => {
    try {
      const response = await api.get<{ current: number; max: number }>('/limits/api-keys');
      return response.data;
    } catch (error) {
      console.error('API Key Limit Check Error:', error);
      return { current: 0, max: 1 };
    }
  },

  get2FAAccess: async () => {
    try {
      return await api.get('/limits/2fa-access');
    } catch (error) {
      console.error('2FA Access Check Error:', error);
      return { data: { has2FA: false } };
    }
  },

  checkProjectLimit: async () => {
    try {
      const response = await api.get<{ current: number; max: number }>('/limits/project');
      return response.data;
    } catch (error) {
      console.error('API Limit Check Error:', error);
      return { current: 0, max: 1 };
    }
  },

checkPixelLimit: async () => {
  try {
    const response = await api.get<{ current: number; max: number }>('/limits/pixel');
    return response.data;
  } catch (error) {
    console.error('API Limit Check Error:', error);
    return { current: 0, max: 0 };
  }
},

checkCustomDomainLimit: async () => {
  try {
    const response = await api.get<{ current: number; max: number }>('/limits/custom-domain');
    return response.data;
  } catch (error) {
    console.error('API Limit Check Error:', error);
    return { current: 0, max: 0 };
  }
},
};

export const QuoteService = {
  add: async (data: { 
    name: string; 
    email: string;
    service: QuoteServiceEnum;
    description: string; 
  }): Promise<Quote> => {
    const response = await api.post('/quotes', data);
    return response.data;
  },
  getAll: async (): Promise<Quote[]> => {
    const response = await api.get('/quotes');
    return response.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/quotes/${id}`);
    return response.data;
  }
};

export const visitorService = {
  trackVisitor: async (data?: { entryTime: string }): Promise<{ visitorId: string }> => {
    try {
      const response = await api.post('/visitor/track', data);
      return response.data;
    } catch (error) {
      console.error('Error tracking visitor:', error);
      throw error;
    }
  },

  trackVisitorExit: async (visitorId: string): Promise<{ success: boolean }> => {
    try {
      const response = await api.post('/visitor/track-exit', { visitorId });
      return response.data;
    } catch (error) {
      console.error('Error tracking visitor exit:', error);
      throw error;
    }
  },

  getAudienceStats: async (): Promise<{
    totalVisitors: number;
    totalVisits: number;
    avgDuration: number;
  }> => {
    try {
      const response = await api.get('/visitor/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting audience stats:', error);
      throw error;
    }
  },
};