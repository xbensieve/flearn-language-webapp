import type {
  APIResponse,
  CourseDetail,
  CourseSubmission,
  CourseQueryParams,
  LessonDetail,
} from "@/types/course";
import axiosInstance from "@/lib/axiosInstance";

export const courseService = {
  getSubmissions: async (
    params: CourseQueryParams
  ): Promise<APIResponse<CourseSubmission[]>> => {
    const query: Record<string, unknown> = {};

    if (params.Page) query.Page = params.Page;
    if (params.PageSize) query.PageSize = params.PageSize;
    if (params.SearchTerm) query.SearchTerm = params.SearchTerm;
    if (params.SortBy) query.SortBy = params.SortBy;
    if (params.status) query.status = params.status;

    try {
      const response = await axiosInstance.get<APIResponse<CourseSubmission[]>>(
        "/courses/submissions/by-manager",
        { params: query }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch courses", error);
      throw error;
    }
  },

  getCourseDetail: async (id: string): Promise<CourseDetail | null> => {
    try {
      const response = await axiosInstance.get<APIResponse<CourseDetail>>(
        `/courses/${id}/details`
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch course details", error);
      throw error;
    }
  },
  getCourseContent: async (id: string): Promise<CourseDetail> => {
    try {
      const response = await axiosInstance.get<APIResponse<CourseDetail>>(
        `/courses/${id}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch course content", error);
      throw error;
    }
  },
  getLessonDetail: async (lessonId: string): Promise<LessonDetail> => {
    try {
      const response = await axiosInstance.get<APIResponse<LessonDetail>>(
        `/lessons/${lessonId}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch lesson detail", error);
      throw error;
    }
  },
  /**
   * Phê duyệt khóa học. API: PUT /courses/submissions/{submissionId}/approve
   * @param course submission ID khóa học cần phê duyệt
   */
  approveCourse: async (submissionId: string): Promise<void> => {
    try {
      await axiosInstance.put(`/courses/submissions/${submissionId}/approve`);
      // console.log(`Course ${courseId} approved successfully.`);
    } catch (error) {
      console.error(`Failed to approve course ${submissionId}`, error);
      throw error;
    }
  },

  /**
   * Từ chối khóa học. API: PUT /courses/submissions/{submissionId}/reject
   * @param course submission ID khóa học cần từ chối
   * @param reason Lý do từ chối
   */
  rejectCourse: async (submissionId: string, reason: string): Promise<void> => {
    try {
      await axiosInstance.put(`/courses/submissions/${submissionId}/reject`, {
        reason,
      });
    } catch (error) {
      console.error(`Failed to reject course ${submissionId}`, error);
      throw error;
    }
  },
};
