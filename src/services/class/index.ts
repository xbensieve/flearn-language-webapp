import api from "../../config/axios";
import type { Class, CreateClassRequest } from "./type";

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
