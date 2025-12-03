import type {
  APIResponse,
  CourseDetail,
  CourseSubmission,
  CourseQueryParams,
  LessonDetail,
  Exercise,
  ExerciseQueryParams,
} from "@/types/course";
import axiosInstance from "@/lib/axiosInstance";
import type { CourseTemplate, CreateCourseRequest } from "@/types/createCourse";
import type { Course } from "./type";

export const courseService = {
  getSubmissions: async (
    params: CourseQueryParams
  ): Promise<APIResponse<CourseSubmission[]>> => {
    const query: Record<string, unknown> = {};

    if (params.Page) query.Page = params.Page;
    if (params.PageSize) query.PageSize = params.PageSize;
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
  getExercisesByLesson: async ({
    lessonId,
    Page = 1,
    PageSize = 10,
  }: ExerciseQueryParams): Promise<APIResponse<Exercise[]>> => {
    try {
      const response = await axiosInstance.get<APIResponse<Exercise[]>>(
        `/lessons/${lessonId}/exercises`,
        {
          params: { Page, PageSize },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch exercises", error);
      throw error;
    }
  },
  getCourseTemplate: async (
    params: CourseQueryParams
  ): Promise<APIResponse<CourseTemplate[]>> => {
    const query: Record<string, unknown> = {};
    if (params.Page) query.Page = params.Page;
    if (params.PageSize) query.PageSize = params.PageSize;

    try {
      const response = await axiosInstance.get<APIResponse<CourseTemplate[]>>(
        "/templates",
        { params: query }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch course templates", error);
      throw error;
    }
  },

  createCourse: async (
    data: CreateCourseRequest
  ): Promise<APIResponse<Course>> => {
    const formData = new FormData();

    // Mapping đúng với key trong CourseRequest.cs của Backend
    formData.append("Title", data.Title);
    formData.append("Description", data.Description);
    formData.append("LevelId", data.LevelId);
    formData.append("LearningOutcome", data.LearningOutcome);
    formData.append("DurationDays", data.DurationDays.toString());
    formData.append("Price", data.Price.toString());
    formData.append("CourseType", data.CourseType.toString());
    formData.append("GradingType", data.GradingType.toString());

    if (data.TopicIds) {
      // Backend nhận string "id1,id2", logic mapping đã làm ở CreateCoursePage
      formData.append("TopicIds", data.TopicIds);
    }

    if (data.TemplateId) {
      formData.append("TemplateId", data.TemplateId);
    }

    if (data.Image) {
      formData.append("Image", data.Image);
    }

    try {
      const response = await axiosInstance.post<APIResponse<Course>>(
        "/courses",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create course", error);
      throw error;
    }
  },
};
