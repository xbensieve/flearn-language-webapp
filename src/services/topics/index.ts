import api from '../../config/axios';
import type { Topic } from './type';

export const getTopicsService = async () => {
  const res = await api.get<API.Response<Topic[]>>('/topics');
  return res.data;
};

export const getTopicByIdService = async (id: string) => {
  const res = await api.get<Topic>(`/topics/${id}`);
  return res.data;
};

export const createTopicService = async (payload: FormData) => {
  const res = await api.post<Topic>('/topics', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateTopicService = async (id: string, payload: FormData) => {
  const res = await api.put<Topic>(`/topics/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteTopicService = async (id: string) => {
  const res = await api.delete(`/topics/${id}`);
  return res.data;
};
