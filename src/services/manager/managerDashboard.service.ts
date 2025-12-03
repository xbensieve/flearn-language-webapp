import axiosInstance from "@/lib/axiosInstance";
import type {
  ApiResponse,
  DashboardOverviewResponse,
  EngagementResponse,
  ContentEffectivenessResponse,
} from "@/types/dashboard";

// Types for Cancellation Requests
export interface CancellationRequest {
  cancellationRequestId: string;
  classId: string;
  className: string;
  classStartDateTime: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  reason: string;
  status: string;
}

export interface CancellationRequestsResponse {
  success: boolean;
  data: CancellationRequest[];
  count: number;
}

export const managerDashboardService = {
  getOverview: async (startDate?: string, endDate?: string) => {
    const params = startDate && endDate ? { startDate, endDate } : {};

    const response = await axiosInstance.get<
      ApiResponse<DashboardOverviewResponse>
    >("/manager/dashboard/overview", { params });

    return response.data.data;
  },

  getEngagement: async (startDate?: string, endDate?: string) => {
    const params = startDate && endDate ? { startDate, endDate } : {};

    const response = await axiosInstance.get<ApiResponse<EngagementResponse>>(
      "/manager/dashboard/engagement",
      { params }
    );

    return response.data.data;
  },

  getContentEffectiveness: async (top: number = 5) => {
    const response = await axiosInstance.get<
      ApiResponse<ContentEffectivenessResponse[]>
    >("/manager/dashboard/content-effectiveness", {
      params: { top },
    });

    return response.data.data;
  },

  // Cancellation Request APIs
  getPendingCancellationRequests: async () => {
    const response = await axiosInstance.get<CancellationRequestsResponse>(
      "/manager/dashboard/pending"
    );
    return response.data;
  },

  getCancellationRequestDetail: async (requestId: string) => {
    const response = await axiosInstance.get<ApiResponse<CancellationRequest>>(
      `/manager/dashboard/${requestId}`
    );
    return response.data;
  },

  approveCancellationRequest: async (requestId: string, note?: string) => {
    const response = await axiosInstance.post(
      `/manager/dashboard/${requestId}/approve`,
      { note }
    );
    return response.data;
  },

  rejectCancellationRequest: async (requestId: string, reason: string) => {
    const response = await axiosInstance.post(
      `/manager/dashboard/${requestId}/reject`,
      { reason }
    );
    return response.data;
  },
};
