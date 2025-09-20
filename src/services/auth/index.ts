import api from '../../config/axios';
import type { AuthResponse, IRefreshToken, ProfileResponse } from './types';

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
