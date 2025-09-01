import axios from 'axios';
import { getToken } from './tokenService';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/assistant`,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
});

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const assistantService = {
  chat: async (message: string): Promise<string> => {
    const response = await api.post('/chat', { message });
    return response.data.reply as string;
  },
};
