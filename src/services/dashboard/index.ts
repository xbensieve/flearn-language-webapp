import api from "../../config/axios";
import type { IDashboard, TeacherDashboardResponse } from "./types";

export const getDashboard = async () => {
  const res = await api.get<API.Response<IDashboard>>(
    `/Admin/dashboard`
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