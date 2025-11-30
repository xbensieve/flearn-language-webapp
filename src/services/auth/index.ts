import api from '../../config/axios';
import type {
  AuthResponse,
  IRefreshToken,
  ProfileResponse,
  ResetPasswordPayload,
  TeacherProfile,
} from './type';

export const loginLearner = async (payload: {
  usernameOrEmail: string;
  password: string;
  rememberMe: boolean;
}) => {
  const res = await api.post<API.Response<AuthResponse>>('/auth/login/learner', payload);
  return res.data;
};

export const loginDashboard = async (payload: {
  usernameOrEmail: string;
  password: string;
  rememberMe: boolean;
}) => {
  const res = await api.post<API.Response<AuthResponse>>('/auth/login/system', payload);
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get<API.Response<ProfileResponse>>('/auth/me');
  return res.data;
};

export const getProfileTeacher = async () => {
  const res = await api.get<API.Response<TeacherProfile>>('/teachers/profile');
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

// === Forgot Password ===
export const forgotPassword = async (payload: { emailOrUsername: string }) => {
  const { data } = await api.post('auth/forgot-password', payload);
  return data;
};

// === Reset Password ===
export const resetPassword = async (payload: ResetPasswordPayload) => {
  const { data } = await api.post('auth/reset-password', payload);
  return data;
};
