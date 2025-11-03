import api from "../../config/axios";
import type { CreateLevelPayload, Level, PaginatedLevelResponse, UpdateLevelPayload } from "./type";

export const getLevelsByProgram = async (
programId: string,
page = 1,
pageSize = 10,
search?: string
): Promise<PaginatedLevelResponse> => {
const params: { page?: number; pageSize?: number; search?: string } = { page, pageSize };
if (search) params.search = search;
const { data } = await api.get(`/admin/program/${programId}/levels`, { params });
return data;
};


export const createLevel = async (payload: CreateLevelPayload): Promise<Level> => {
const { data } = await api.post("/admin/level", payload);
return data;
};


export const updateLevel = async (
id: string,
payload: UpdateLevelPayload
): Promise<Level> => {
const { data } = await api.put(`/admin/level/${id}`, payload);
return data;
};


export const deleteLevel = async (id: string): Promise<void> => {
await api.delete(`/admin/level/${id}`);
};


export const toggleLevelStatus = async (
id: string,
status: boolean
): Promise<Level> => {
const { data } = await api.patch(`/admin/levels/${id}/status`, { status });
return data;
};