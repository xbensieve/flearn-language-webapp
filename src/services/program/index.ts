import api from "../../config/axios";
import type {
  Program,
  CreateProgramPayload,
  UpdateProgramPayload,
  ProgramQueryParams,
  ProgramList,
} from "./type";

const BASE = "/Admin/program";
export const getProgramsService = async (params?: ProgramQueryParams) => {
  const res = await api.get<ProgramList>(`Admin/language/${params?.languageId}/programs`, { params });
  return res.data.data;
};

export const getProgramByIdService = async (id: string) => {
  const res = await api.get<API.Response<Program>>(`${BASE}/${id}`);
  return res.data;
};

export const createProgramService = async (payload: CreateProgramPayload) => {
  const res = await api.post<API.Response<Program>>(BASE, payload);
  return res.data;
};

export const updateProgramService = async (id: string, payload: UpdateProgramPayload) => {
  const res = await api.put<API.Response<Program>>(`${BASE}/${id}`, payload);
  return res.data;
};

export const deleteProgramService = async (id: string) => {
  const res = await api.delete<API.Response<null>>(`${BASE}/${id}`);
  return res.data;
};
