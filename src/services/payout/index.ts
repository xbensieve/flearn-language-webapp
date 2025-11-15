import api from "../../config/axios";
import type { AdminPayout } from "./type";

interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
}

export const getAdminPayoutsService = async (): Promise<AdminPayout[]> => {
  const { data } = await api.get<ApiResponse<AdminPayout[]>>(
    "/admin/payout/all"
  );
  return data.data ?? [];
};

export const getAdminPendingPayoutsService = async (): Promise<
  AdminPayout[]
> => {
  const { data } = await api.get<ApiResponse<AdminPayout[]>>(
    "/admin/payout/pending"
  );
  return data.data ?? [];
};

export interface ProcessPayoutPayload {
  action: string;
  adminNote?: string;
  transactionReference?: string;
}

export const processPayoutService = async (
  payoutRequestId: string,
  payload: ProcessPayoutPayload
): Promise<void> => {
  await api.post(`/admin/payout/${payoutRequestId}/process`, payload);
};
