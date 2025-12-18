import api from "../../config/axios";
import type { Class, CreateClassRequest, ClassEnrollmentResponse } from "./type";
import type { ProgramAssignment, APIResponse } from "@/types/createCourse";

export const updateClassService = async (classId: string, data: Partial<Class>) => {
  // Chỉ gửi các trường cần update, API yêu cầu đúng schema
  const res = await api.put(`teacher/classes/${classId}`, data);
  return res.data;
};

export const getClassAssignmentsService = async (): Promise<APIResponse<ProgramAssignment[]>> => {
  const res = await api.get<APIResponse<ProgramAssignment[]>>("teacher/classes/assignments");
  return res.data;
};

export const getClassesService = async (params: {
  page?: number;
  pageSize?: number;
  status?: string;
}) => {
  const res = await api.get<API.Response<Class[]>>("teacher/classes", {
    params,
  });
  return res.data;
};

export const getClassByIdService = async (id: string) => {
  const res = await api.get<API.Response<Class>>(`teacher/classes/${id}`);
  return res.data;
};

export const publishClassService = async (id: string) => {
  const res = await api.post(`teacher/classes/${id}/publish`);
  return res.data;
};

export const createClassService = async (data: CreateClassRequest) => {
  const res = await api.post("teacher/classes", data);
  return res.data;
};

export const requestCancelClassService = async (classId: string, reason: string) => {
  const res = await api.post(`teacher/classes/${classId}/request-cancel`, {
    reason,
  });
  return res.data;
};

export const deleteClassService = async (classId: string, reason: string) => {
  const res = await api.delete(`teacher/classes/${classId}`, {
    data: { reason },
  });
  return res.data;
};

export const getClassEnrollmentsService = async (classId: string) => {
  const res = await api.get<ClassEnrollmentResponse>(`teacher/classes/${classId}/enrollments`);
  return res.data;
};
