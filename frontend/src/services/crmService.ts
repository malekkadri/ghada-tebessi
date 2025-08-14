import axios from 'axios';
import { getToken } from './tokenService';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/crm`,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
});

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Lead {
  id: string;
  name: string;
  email?: string;
  stage?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
}

export interface Interaction {
  id: string;
  customerId: string;
  note: string;
  createdAt?: string;
}

export const crmService = {
  getLeads: () => api.get<Lead[]>('/leads').then(res => res.data),
  getCustomers: () => api.get<Customer[]>('/customers').then(res => res.data),
  getInteractions: (customerId: string) =>
    api.get<Interaction[]>(`/customers/${customerId}/interactions`).then(res => res.data),
  createInteraction: (customerId: string, data: { note: string }) =>
    api.post(`/customers/${customerId}/interactions`, data).then(res => res.data),
};

export default crmService;
