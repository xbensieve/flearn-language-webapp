import api from "../../config/axios";
import type { 
  ChangePasswordPayload, 
  IDashboard, 
  Staff, 
  TeacherDashboardResponse, 
  UserListResponse, 
  UserStatisticsResponse,
  TeacherData
} from "./types";


export const getDashboard = async () => {
  const res = await api.get<API.Response<IDashboard>>(`/Admin/dashboard`);
  return res.data;
};


export const getUserStatistics = async (days: number = 30) => {
  const res = await api.get<API.Response<UserStatisticsResponse>>(
    `/Admin/users/statistics/by-registration-date`,
    { params: { days } }
  );
  return res.data;
};


export const getTeacherDashboard = async (
  params?: {
    from?: string;
    to?: string;
    status?: string;
    programId?: string;
  }
): Promise<TeacherDashboardResponse> => {
  const response = await api.get<TeacherDashboardResponse>('/teacher/dashboard', { params });
  return response.data;
};


export const getUsersListService = async (params: { page: number; pageSize: 100; role?: string }) => {
  const res = await api.get<API.Response<UserListResponse>>('/Admin/users', { params });
  return res.data.data;
};


export const getTeachersListService = async () => {
  const res = await api.get<{ status: string; data: TeacherData[] }>('/teachers/all');
  return res.data.data;
};


export const getUserDetailService = async (id: string) => {
  const res = await api.get<API.Response<any>>(`/Admin/users/${id}`);
  return res.data.data;
};


export const getStaffListService = async () => {
  const res = await api.get<{ success: boolean; data: Staff[]; totalStaff: number }>('/Admin/staff');
  return res.data.data; 
};


export const changeStaffPasswordService = async (payload: ChangePasswordPayload) => {
  const res = await api.post('/Admin/staff/change-password', payload);
  return res.data;
};