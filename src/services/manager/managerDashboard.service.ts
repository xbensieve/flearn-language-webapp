import axiosInstance from "@/lib/axiosInstance";
import type {
  ApiResponse,
  DashboardOverviewResponse,
  EngagementResponse,
  ContentEffectivenessResponse,
} from "@/types/dashboard";

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
};
