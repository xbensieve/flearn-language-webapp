import axiosInstance from "@/lib/axiosInstance";
import type {
  APIListResponse,
  APIFilterResponse,
  Assignment,
  AssignmentQueryParams,
  FilterOptions,
} from "@/types/exerciseGrading";

export const exerciseGradingService = {
  /**
   * Fetch the list of assignments with pagination and server-side filters
   */
  getAssignments: async (
    params: AssignmentQueryParams
  ): Promise<APIListResponse<Assignment[]>> => {
    const queryParams: Record<string, any> = { ...params };
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
   * Reassign an expired/overdue assignment to another teacher
   * (Giả lập logic gọi API)
   */
  reassignTeacher: async (assignmentId: string): Promise<void> => {
    try {
      // Ví dụ API: PUT /exercise-grading/reassign/{id}
      // await axiosInstance.put(`/exercise-grading/reassign/${assignmentId}`);
      console.log("Reassigning teacher for assignment:", assignmentId);
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to reassign teacher", error);
      throw error;
    }
  },
};
