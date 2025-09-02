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
  stage?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
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
  attachmentPath?: string;
  createdAt?: string;
}

export interface CRMStats {
  leadCount: number;
  customerCount: number;
  conversionRate: number;
  weeklyLeadCreation: { week: string; count: number }[];
  interactionsPerCustomer: { customerId: number; name: string | null; count: number }[];
  stageCounts: Record<string, number>;
  stageConversionRates: Record<string, number>;
}

export const crmService = {
  getStats: () => api.get<CRMStats>('/stats').then(res => res.data),
  getLeads: (params?: {
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    tags?: string[];
    stage?: string;
  }) =>
    api
      .get<Lead[]>('/leads', {
        params: { ...params, tags: params?.tags?.join(',') },
      })
      .then(res => res.data),
  createLead: (data: Partial<Lead>) => api.post('/leads', data).then(res => res.data),
  updateLead: (id: string, data: Partial<Lead>) => api.put(`/leads/${id}`, data).then(res => res.data),
  deleteLead: (id: string) => api.delete(`/leads/${id}`),
  importLeads: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/leads/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  exportLeads: () => api.get('/leads/export', { responseType: 'blob' }).then(res => res.data),
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
  convertCustomer: (id: string, data: { name?: string; email?: string; role?: string }) =>
    api.post<{ password: string }>(`/customers/${id}/convert`, data).then(res => res.data),
  importCustomers: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/customers/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  exportCustomers: () =>
    api.get('/customers/export', { responseType: 'blob' }).then(res => res.data),

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
    data: { type: string; date?: string; notes?: string; file?: File }
  ) => {
    const form = new FormData();
    form.append('type', data.type);
    if (data.date) form.append('date', data.date);
    if (data.notes) form.append('notes', data.notes);
    if (data.file) form.append('file', data.file);
    return api
      .post(`/${entity}/${id}/interactions`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(res => res.data);
  },
  updateInteraction: (
    id: string,
    data: { type?: string; date?: string; notes?: string; file?: File }
  ) => {
    const form = new FormData();
    if (data.type) form.append('type', data.type);
    if (data.date) form.append('date', data.date);
    if (data.notes) form.append('notes', data.notes);
    if (data.file) form.append('file', data.file);
    return api
      .put(`/interactions/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(res => res.data);
  },
  deleteInteraction: (id: string) => api.delete(`/interactions/${id}`),
};

export default crmService;
