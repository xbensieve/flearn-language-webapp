import axiosInstance from "@/lib/axiosInstance";
import type {
  APIListResponse,
  APIFilterResponse,
  Assignment,
  AssignmentQueryParams,
  FilterOptions,
  EligibleTeacher,
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
};
