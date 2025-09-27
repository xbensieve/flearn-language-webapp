/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios';
import { refreshTokenService } from '../../services/auth';

const api = axios.create({
  baseURL: 'http://flearn.runasp.net/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach access token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('FLEARN_ACCESS_TOKEN');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Flag to avoid multiple refresh calls at once
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('FLEARN_REFRESH_TOKEN');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await refreshTokenService(refreshToken);

        const newToken = res.data?.accessToken;
        localStorage.setItem('FLEARN_ACCESS_TOKEN', newToken);
        localStorage.setItem('FLEARN_REFRESH_TOKEN', res.data?.refreshToken);

        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('FLEARN_ACCESS_TOKEN');
        localStorage.removeItem('FLEARN_REFRESH_TOKEN');
        window.location.href = '/login'; // redirect to login
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
