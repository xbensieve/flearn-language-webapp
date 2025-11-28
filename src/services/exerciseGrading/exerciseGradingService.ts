import axiosInstance from "@/lib/axiosInstance";
import type {
  APIListResponse,
  APIFilterResponse,
  Assignment,
  AssignmentQueryParams,
  FilterOptions,
  EligibleTeacher,
  GradingStatusResponse,
} from "@/types/exerciseGrading";

export const exerciseGradingService = {
  /**
   * Fetch the list of assignments with pagination and server-side filters
   */
  getAssignments: async (
    params: AssignmentQueryParams
  ): Promise<APIListResponse<Assignment[]>> => {
    const queryParams: Record<string, unknown> = { ...params };
    Object.keys(queryParams).forEach((key) => {
      if (queryParams[key] === undefined || queryParams[key] === "") {
        delete queryParams[key];
      }
    });

    try {
      const response = await axiosInstance.get<APIListResponse<Assignment[]>>(
        "/exercise-grading/manager/assignments",
        { params: queryParams }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch assignments", error);
      throw error;
    }
  },
  getTeacherAssignments: async (
    params: AssignmentQueryParams
  ): Promise<APIListResponse<Assignment[]>> => {
    const queryParams: Record<string, unknown> = { ...params };
    // Clean up empty params
    Object.keys(queryParams).forEach((key) => {
      if (queryParams[key] === undefined || queryParams[key] === "") {
        delete queryParams[key];
      }
    });

    try {
      const response = await axiosInstance.get<APIListResponse<Assignment[]>>(
        "/exercise-grading/teacher/assignments",
        { params: queryParams }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch teacher assignments", error);
      throw error;
    }
  },

  /**
   * Fetch available filter options (Courses, Exercises, Statuses)
   */
  getFilters: async (): Promise<FilterOptions> => {
    try {
      const response = await axiosInstance.get<APIFilterResponse>(
        "/exercise-grading/filters"
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch filters", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách giáo viên phù hợp để assign lại
   */
  getEligibleTeachers: async (
    submissionId: string,
    searchTerm: string = "",
    page: number = 1,
    pageSize: number = 10
  ): Promise<APIListResponse<EligibleTeacher[]>> => {
    try {
      const response = await axiosInstance.get<
        APIListResponse<EligibleTeacher[]>
      >("/exercise-grading/manager/eligible-teachers", {
        params: {
          ExerciseSubmissionId: submissionId,
          SearchTerm: searchTerm,
          Page: page,
          PageSize: pageSize,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch eligible teachers", error);
      throw error;
    }
  },
  /**
   * Thực hiện assign giáo viên mới cho bài tập
   */
  assignTeacher: async (
    submissionId: string,
    teacherId: string
  ): Promise<boolean> => {
    try {
      const response = await axiosInstance.post(
        "/exercise-grading/manager/assignments",
        {
          exerciseSubmissionId: submissionId,
          teacherId: teacherId,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to assign teacher", error);
      throw error;
    }
  },
  retryAIGrading: async (submissionId: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.post(
        `/exercise-grading/retry-ai-grading/${submissionId}`
      );
      return response.data.isSuccess;
    } catch (error) {
      console.error("Failed to retry AI grading", error);
      throw error;
    }
  },
  getGradingStatus: async (
    submissionId: string
  ): Promise<GradingStatusResponse> => {
    try {
      const response = await axiosInstance.get(
        `/exercise-grading/status/${submissionId}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to get grading status", error);
      throw error;
    }
  },
  submitGrade: async (
    submissionId: string,
    data: { score: number; feedback: string }
  ): Promise<boolean> => {
    try {
      const response = await axiosInstance.post(
        `/exercise-grading/teacher/submissions/${submissionId}/grade`,
        data
      );
      return response.data.status === "success" || response.status === 200;
    } catch (error) {
      console.error("Failed to submit grade", error);
      throw error;
    }
  },
};
