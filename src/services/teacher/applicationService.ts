import axiosInstance from "@/lib/axiosInstance";
import type { AxiosResponse } from "axios";

interface Certificate {
  id: string;
  certificateImageUrl: string;
  certificateName: string;
}

// Interface Reviewer
interface Reviewer {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
}

interface TeacherApplication {
  applicationID: string;
  language: string;
  fullName: string;
  dateOfBirth: string;
  bio: string;
  avatar: string;
  email: string;
  phoneNumber: string;
  teachingExperience: string;
  proficiencyCode: string;
  meetingUrl: string;
  rejectionReason: string | null;
  status: "Pending" | "Approved" | "Rejected";
  submittedAt: string;
  reviewedAt: string;
  certificates: Certificate[];
  submitter: {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  reviewer?: Reviewer;
}

interface MetaData {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Response List
interface ApiResponse {
  meta: MetaData;
  status: string;
  code: number;
  message: string;
  data: TeacherApplication[];
}

// Response Detail
interface ApiDetailResponse {
  meta: null;
  status: string;
  code: number;
  message: string;
  data: TeacherApplication;
  errors: null;
}

interface ApplicationQueryParams {
  Page: number;
  PageSize: number;
  status?: string;
}

export const applicationService = {
  getApplications: async (
    params: ApplicationQueryParams
  ): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await axiosInstance.get(
        "/applications",
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("API call failed in getApplications:", error);
      throw new Error("Failed to fetch teacher applications.");
    }
  },

  getApplicationById: async (id: string): Promise<TeacherApplication> => {
    try {
      const response: AxiosResponse<ApiDetailResponse> =
        await axiosInstance.get(`/applications/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(
        `API call failed in getApplicationById for id ${id}:`,
        error
      );
      throw new Error("Failed to fetch application details.");
    }
  },

  // --- New Methods ---

  approveApplication: async (id: string): Promise<void> => {
    try {
      await axiosInstance.post(`/applications/${id}/approve`);
    } catch (error) {
      console.error(`Failed to approve application ${id}:`, error);
      throw error;
    }
  },

  rejectApplication: async (id: string, reason: string): Promise<void> => {
    try {
      await axiosInstance.patch(`/applications/${id}/reject`, { reason });
    } catch (error) {
      console.error(`Failed to reject application ${id}:`, error);
      throw error;
    }
  },
};

export type { TeacherApplication, MetaData, ApplicationQueryParams };
