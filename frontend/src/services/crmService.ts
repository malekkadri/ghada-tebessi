import axios from 'axios';
import { getToken } from './tokenService';
import type { VCard } from './vcard';

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

export interface Tag {
  id: string;
  name: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  notes?: string;
  Tags?: Tag[];
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'prospect' | 'lost';
  notes?: string;
  vcardId?: string;
  Vcard?: Pick<VCard, 'id' | 'name'>;
  Tags?: Tag[];
}

export interface Interaction {
  id: string;
  type: string;
  date?: string;
  notes?: string;
  customerId?: string;
  leadId?: string;
  createdAt?: string;
}

export const crmService = {
  getLeads: (params?: {
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    tags?: string[];
  }) =>
    api
      .get<Lead[]>('/leads', {
        params: { ...params, tags: params?.tags?.join(',') },
      })
      .then(res => res.data),
  createLead: (data: Partial<Lead>) => api.post('/leads', data).then(res => res.data),
  updateLead: (id: string, data: Partial<Lead>) => api.put(`/leads/${id}`, data).then(res => res.data),
  deleteLead: (id: string) => api.delete(`/leads/${id}`),
  convertLead: (id: string, data?: { vcardId?: string }) =>
    api.post(`/leads/${id}/convert`, data).then(res => res.data),

  getCustomers: (params?: {
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    tags?: string[];
  }) =>
    api
      .get<Customer[]>('/customers', {
        params: { ...params, tags: params?.tags?.join(',') },
      })
      .then(res => res.data),
  createCustomer: (data: Partial<Customer>) => api.post('/customers', data).then(res => res.data),
  updateCustomer: (id: string, data: Partial<Customer>) =>
    api.put(`/customers/${id}`, data).then(res => res.data),
  deleteCustomer: (id: string) => api.delete(`/customers/${id}`),

  createTag: (data: { name: string }) => api.post<Tag>('/tags', data).then(res => res.data),
  getTags: () => api.get<Tag[]>('/tags').then(res => res.data),
  updateTag: (id: string, data: { name: string }) =>
    api.put<Tag>(`/tags/${id}`, data).then(res => res.data),
  deleteTag: (id: string) => api.delete(`/tags/${id}`),
  assignTagToCustomer: (customerId: string, tagId: string) =>
    api.post(`/customers/${customerId}/tags/${tagId}`),
  unassignTagFromCustomer: (customerId: string, tagId: string) =>
    api.delete(`/customers/${customerId}/tags/${tagId}`),
  assignTagToLead: (leadId: string, tagId: string) =>
    api.post(`/leads/${leadId}/tags/${tagId}`),
  unassignTagFromLead: (leadId: string, tagId: string) =>
    api.delete(`/leads/${leadId}/tags/${tagId}`),

  getInteractions: (
    entity: 'customers' | 'leads',
    id: string
  ) => api
    .get<Interaction[]>(`/${entity}/${id}/interactions`)
    .then(res => res.data),
  createInteraction: (
    entity: 'customers' | 'leads',
    id: string,
    data: { type: string; date?: string; notes?: string }
  ) => api.post(`/${entity}/${id}/interactions`, data).then(res => res.data),
  updateInteraction: (
    id: string,
    data: { type?: string; date?: string; notes?: string }
  ) => api.put(`/interactions/${id}`, data).then(res => res.data),
  deleteInteraction: (id: string) => api.delete(`/interactions/${id}`),
};

export default crmService;
