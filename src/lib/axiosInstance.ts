/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from "axios";
import { refreshTokenService } from "@/services/auth";

const api = axios.create({
  baseURL: "https://f-learn.app/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

let isRefreshing = false;
let isRedirecting = false;
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

const haltAndRedirect = () => {
  if (isRedirecting) {
    return new Promise(() => {});
  }
  isRedirecting = true;

  localStorage.removeItem("FLEARN_ACCESS_TOKEN");
  localStorage.removeItem("FLEARN_REFRESH_TOKEN");
  localStorage.removeItem("FLEARN_USER_ROLES");

  window.location.href = "/login";

  return new Promise(() => {});
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("FLEARN_ACCESS_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    const skipUrls = ["/login", "/auth/login", "/auth/refresh"];
    if (skipUrls.some((url) => originalRequest?.url?.includes(url))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      if (originalRequest._retry) {
        return haltAndRedirect();
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch(() => haltAndRedirect());
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("FLEARN_REFRESH_TOKEN");
        if (!refreshToken) {
          return haltAndRedirect();
        }

        const res = await refreshTokenService(refreshToken);
        const responseData = res.data;
        const newToken = responseData?.accessToken;
        const newRefreshToken = responseData?.refreshToken;

        if (!newToken) {
          return haltAndRedirect();
        }

        localStorage.setItem("FLEARN_ACCESS_TOKEN", newToken);
        if (newRefreshToken) {
          localStorage.setItem("FLEARN_REFRESH_TOKEN", newRefreshToken);
        }
        if (responseData?.roles) {
          localStorage.setItem(
            "FLEARN_USER_ROLES",
            JSON.stringify(responseData.roles)
          );
        }

        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return haltAndRedirect();
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
