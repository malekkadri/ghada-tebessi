import axios from 'axios';
import { getToken } from './tokenService';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/tasks`,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
});

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Task {
  id: string;
  title: string;
  dueDate?: string;
  status?: string;
  customerId?: string;
  leadId?: string;
}

export const taskService = {
  getTasks: (params?: { customerId?: string; leadId?: string; status?: string }) =>
    api.get<Task[]>('/', { params }).then(res => res.data),
  getTask: (id: string) => api.get<Task>(`/${id}`).then(res => res.data),
  createTask: (data: Partial<Task>) => api.post('/', data).then(res => res.data),
  updateTask: (id: string, data: Partial<Task>) =>
    api.put(`/${id}`, data).then(res => res.data),
  deleteTask: (id: string) => api.delete(`/${id}`),
};

export default taskService;
