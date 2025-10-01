import api from '../../config/axios';
import type { Goal } from './type';

// Get all goals
export const getGoalsService = async () => {
  const res = await api.get<API.Response<Goal[]>>('/goals');
  return res.data;
};

// Get goal by id
export const getGoalByIdService = async (id: number) => {
  const res = await api.get<Goal>(`/goals/${id}`);
  return res.data;
};

// Create goal
export const createGoalService = async (payload: Omit<Goal, 'id'>) => {
  const res = await api.post<Goal>('/goals', payload);
  return res.data;
};

// Update goal
export const updateGoalService = async (id: number, payload: Omit<Goal, 'id'>) => {
  const res = await api.put<Goal>(`/goals/${id}`, payload);
  return res.data;
};

// Delete goal
export const deleteGoalService = async (id: number) => {
  const res = await api.delete(`/goals/${id}`);
  return res.data;
};
