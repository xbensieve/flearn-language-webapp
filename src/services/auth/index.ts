import api from '../../config/axios';
import type { AuthResponse, IRefreshToken, ProfileResponse } from './type';

export const login = async (payload: {
  usernameOrEmail: string;
  password: string;
  rememberMe: boolean;
}) => {
  const res = await api.post<API.Response<AuthResponse>>('/auth/login', payload);
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get<API.Response<ProfileResponse>>('/auth/me');
  return res.data;
};

export const refreshTokenService = async (refreshToken: string) => {
  const res = await api.post<API.Response<IRefreshToken>>('/auth/refresh', {
    refreshToken,
  });
  return res.data;
};

export const logoutService = async (refreshToken: string) => {
  const res = await api.post<API.Response<IRefreshToken>>('/auth/logout', {
    refreshToken,
  });
  return res.data;
};

export const register = async (payload: {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const res = await api.post<API.Response<AuthResponse>>('/auth/register', payload);
  return res.data;
};

// New verifyOtp function
export const verifyOtp = async (payload: { email: string; otpCode: string }) => {
  const { data } = await api.post('/Auth/verify-otp', payload);
  return data;
};

export const resendOtp = async (payload: { email: string }) => {
  const { data } = await api.post('Auth/resend-otp', payload);
  return data;
};

export const loginWithGoogle = async (idToken: string) => {
  const { data } = await api.post('/Auth/google', { idToken });
  return data;
};
