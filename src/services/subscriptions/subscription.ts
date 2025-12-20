import api from "@/lib/axiosInstance";
import type {
  CreateSubscriptionPlanDto,
  SubscriptionResponse,
} from "@/types/subscription";

export const getSubscriptionPlans = async (page = 1, pageSize = 10) => {
  const response = await api.get<SubscriptionResponse>("/subscription-plans", {
    params: { page, pageSize },
  });
  return response.data;
};

export const createSubscriptionPlan = async (
  data: CreateSubscriptionPlanDto
) => {
  const response = await api.post("/subscription-plans", data);
  return response.data;
};

export const updateSubscriptionPlan = async (
  id: number,
  data: CreateSubscriptionPlanDto
) => {
  const response = await api.put(`/subscription-plans/${id}`, data);
  return response.data;
};

export const deleteSubscriptionPlan = async (id: number) => {
  const response = await api.delete(`/subscription-plans/${id}`);
  return response.data;
};
