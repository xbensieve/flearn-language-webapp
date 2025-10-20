import api from '../../config/axios';
import type {
  Course,
  CourseDetail,
  CourseTemplate,
  CourseTemplateQuery,
  CourseTemplateResponse,
  CourseUnitsRequest,
  CreateCourseRequest,
  Exercise,
  ExerciseData,
  ExercisePayload,
  ICourseDataStaff,
  Lesson,
} from './type';

export const getCourseTemplateByIdService = async (id: string) => {
  const res = await api.get<API.Response<CourseTemplate>>(`/coursetemplates/${id}`);
  return res.data;
};

export const createCourseTemplateService = async (payload: Omit<CourseTemplate, 'id'>) => {
  const res = await api.post<CourseTemplate>('/coursetemplates', payload);
  return res.data;
};

export const updateCourseTemplateService = async (
  id: string,
  payload: Omit<CourseTemplate, 'id'>
) => {
  const res = await api.put<CourseTemplate>(`/coursetemplates/${id}`, payload);
  return res.data;
};

export const deleteCourseTemplateService = async (id: string) => {
  const res = await api.delete(`/coursetemplates/${id}`);
  return res.data;
};

export const getCoursesService = async () => {
  const res = await api.get<API.Response<Course[]>>('/courses');
  return res.data;
};

export const getMyCoursesService = async (params: {
  page?: number;
  pageSize?: number;
  status?: string;
}) => {
  const res = await api.get<API.Response<Course[]>>('courses/by-teacher', {
    params,
  });
  return res.data;
};

export const getCoursesSubmitedService = async (params: {
  page?: number;
  pageSize?: number;
  status?: string;
}) => {
  const res = await api.get<API.Response<ICourseDataStaff[]>>('/courses/submissions/by-staff', {
    params,
  });
  return res.data;
};

export const getCourseByIdService = async (id: string) => {
  const res = await api.get<API.Response<Course>>(`/courses/${id}`);
  return res.data;
};

export const getCourseByIdStaffService = async (id: string) => {
  const res = await api.get<API.Response<CourseDetail>>(`/courses/${id}`);
  return res.data;
};

export const approveCourseService = async (id: string) => {
  const res = await api.put(`/courses/submissions/${id}/approve`);
  return res.data;
};

export const rejectedCourseService = async ({ id, reason }: { id: string; reason: string }) => {
  const res = await api.put(`/courses/submissions/${id}/reject`, { reason });
  return res.data;
};

export const createCourseService = async (
  payload: CreateCourseRequest
): Promise<API.Response<Course>> => {
  const formData = new FormData();

  try {
    console.log('inservice', payload);
    formData.append('Title', payload.title);
    formData.append('Description', payload.description);

    if (payload.image) {
      formData.append('Image', payload.image);
    }

    formData.append('TemplateId', payload.templateId);

    payload.topicIds.forEach((id) => formData.append('TopicIds', id));
    payload.goalIds?.forEach((id) => formData.append('GoalIds', id.toString()));

    formData.append('Price', payload.price.toString());

    if (payload.discountPrice !== undefined) {
      formData.append('DiscountPrice', payload.discountPrice.toString());
    }

    formData.append('CourseType', payload.courseType.toString());
    // formData.append('GoalIds', payload.goalIds?.join(',') || '');

    if (payload.Level !== undefined) {
      formData.append('Level', payload.Level.toString());
    }

    if (payload.courseSkill !== undefined) {
      formData.append('CourseSkill', payload.courseSkill.toString());
    }
  } catch (error) {
    console.log(error);
  }

  const res = await api.post('/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
};

export const updateCourseService = async ({ id, payload }: { id: string; payload: FormData }) => {
  const res = await api.put<Course>(`/courses/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteCourseService = async (id: string) => {
  const res = await api.delete(`/courses/${id}`);
  return res.data;
};

export const getCourseTemplatesService = async ({
  page = 1,
  pageSize = 100,
}: Partial<CourseTemplateQuery> = {}): Promise<CourseTemplateResponse> => {
  const res = await api.get<CourseTemplateResponse>('coursetemplates', {
    params: { page, pageSize },
  });
  return res.data;
};

export const createCourseUnitsService = async (payload: CourseUnitsRequest) => {
  const url = `/courses/${payload.courseId}/units`;
  const res = await api.post<CourseTemplate>(url, {
    title: payload.title,
    description: payload.description,
    isPreview: payload.isPreview,
  });
  return res.data;
};

// services/course.ts (add these exports)

export const getCourseDetailService = async (id: string) => {
  const res = await api.get<API.Response<CourseDetail>>(`/courses/${id}`);
  return res.data.data;
};

export const getCourseUnitsService = async ({
  id,
  page = 1,
  pageSize = 100,
}: {
  id: string;
  page?: number;
  pageSize?: number;
}) => {
  const res = await api.get(
    `/courses/${id}/units?${page ? `page=${page}` : ''}&${pageSize ? `pageSize=${pageSize}` : ''}`
  );
  return res.data.data;
};

export const getUnitByIdService = async ({
  id,
  page = 1,
  pageSize = 100,
}: {
  id: string;
  page?: number;
  pageSize?: number;
}) => {
  const res = await api.get(
    `/units/${id}?${page ? `page=${page}` : ''}&${pageSize ? `pageSize=${pageSize}` : ''}`
  );
  return res.data.data;
};

export const createCourseLessonService = async (unitId: string, formData: FormData) => {
  const res = await api.post(`/units/${unitId}/lessons`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getLessonsByUnits = async ({
  unitId,
  page = 1,
  pageSize = 100,
}: {
  unitId: string;
  page?: number;
  pageSize?: number;
}): Promise<API.Response<Lesson[]>> => {
  const res = await api.get(
    `units/${unitId}/lessons?${page ? `page=${page}` : ''}&${
      pageSize ? `pageSize=${pageSize}` : ''
    }`
  );
  return res.data;
};

export const updateLessonCourseService = async (payload: {
  id: string;
  unitId: string;
  payload: FormData;
}) => {
  const data = new FormData();
  const dataRequestBody = payload.payload;
  data.append('Title', dataRequestBody.get('Title') as string);
  data.append('Description', dataRequestBody.get('Description') as string);
  data.append('Content', dataRequestBody.get('Content') as string);
  data.append('VideoFile', dataRequestBody.get('VideoFile') as File);
  data.append('DocumentFile', dataRequestBody.get('DocumentFile') as File);
  const res = await api.put<Course>(`/units/${payload.unitId}/lessons/${payload.id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const submitCourseService = async (courseId: string) => {
  const res = await api.post(`/courses/${courseId}/submit`);
  return res.data;
};

export const createExerciseService = async (
  lessonId: string,
  payload: ExercisePayload
): Promise<Exercise> => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const { data } = await api.post(`/lessons/${lessonId}/exercises`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
};

export const getExercisesByLesson = async (lessonId: string) => {
  const res = await api.get<API.Response<ExerciseData[]>>(`/lessons/${lessonId}/exercises`);
  return res.data.data;
};

export const deleteExercisesByLesson = async (lessonId: string) => {
  const res = await api.delete(`/exercises/${lessonId}`);
  return res.data.data;
};
