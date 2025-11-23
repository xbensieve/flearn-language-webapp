import api from '../../config/axios';
import type {
  ChangePasswordPayload,
  IDashboard,
  RecentUser,
  SearchUsersParams,
  TeacherDashboardResponse,
} from './types';

export const getDashboard = async () => {
  const res = await api.get<API.Response<IDashboard>>(`/Admin/dashboard`);
  return res.data;
};

export const getTeacherDashboard = async (params?: {
  from?: string;
  to?: string;
  status?: string;
  programId?: string;
}): Promise<TeacherDashboardResponse> => {
  const response = await api.get<TeacherDashboardResponse>('/teacher/dashboard', { params });
  return response.data;
};

// src/services/admin/index.ts

export const getAllUsers = async (params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: string;
  status?: boolean | null;
}) => {
  const response = await api.get<API.Response<RecentUser[]>>('/Admin/users', { params });
  return response.data.data;
};

// Search users (keyword + role + status)
export const searchUsers = async (
  params: SearchUsersParams
): Promise<API.Response<RecentUser[]>> => {
  const response = await api.get('/Admin/users/search', { params });
  return response.data;
};

// Get user detail by ID
export const getUserById = async (userId: string): Promise<API.Response<RecentUser>> => {
  const response = await api.get(`/Admin/users/${userId}`);
  return response.data;
};

// Change password for any user (Staff/Learner/Teacher)
export const changeStaffPassword = async (
  payload: ChangePasswordPayload
): Promise<API.Response<null>> => {
  const response = await api.post('/Admin/staff/change-password', payload);
  return response.data;
};
