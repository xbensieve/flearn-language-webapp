import api from '../../config/axios';
import type { AuthResponse, IFLEARN_REFRESH_TOKEN, ProfileResponse } from './types';

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

export const FLEARN_REFRESH_TOKENService = async (FLEARN_REFRESH_TOKEN: string) => {
  const res = await api.post<API.Response<IFLEARN_REFRESH_TOKEN>>('/auth/refresh', {
    FLEARN_REFRESH_TOKEN,
  });
  return res.data;
};
