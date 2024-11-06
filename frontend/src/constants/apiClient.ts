import axios from 'axios';
import { LocalStorageTokenEnum } from './tokens';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem(LocalStorageTokenEnum.accessToken);
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default apiClient;
