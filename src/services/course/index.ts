import api from '../../config/axios';
import type {
  Course,
  CourseDetail,
  CourseTemplate,
  CourseTemplateQuery,
  CourseTemplateResponse,
  CourseUnitsRequest,
  CreateCourseRequest,
  ExerciseData,
  ExercisePayload,
  ICourseDataStaff,
  Lesson,
  PayloadCourseTemplate,
  Program,
  CourseListResponse, 
  CourseParams 
} from "./type";

export const getCourseTemplateByIdService = async (id: string) => {
  const res = await api.get<API.Response<CourseTemplate>>(`/templates/${id}`);
  return res.data;
};

export const createCourseTemplateService = async (payload: PayloadCourseTemplate) => {
  const res = await api.post('/templates', payload);
  return res.data;
};
export const getAdminCourseSubmissionsService = async (params: {
  page?: number;
  pageSize?: number;
  status?: string;
}) => {
 
  const res = await api.get<API.Response<ICourseDataStaff[]>>('/courses/submissions/by-admin', {
    params,
  });
  return res.data;
};
export const updateCourseTemplateService = async (payload: {
  templateId: string;
  data: PayloadCourseTemplate;
}) => {
  const res = await api.put<CourseTemplate>(`/templates/${payload.templateId}`, {
    ...payload.data,
  });
  return res.data;
};

export const deleteCourseTemplateService = async (id: string) => {
  const res = await api.delete(`/templates/${id}`);
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
  const res = await api.get<API.Response<Course[]>>('courses/by-manager', {
    params,
  });
  return res.data;
};
export const getAdminCoursesService = async (params: CourseParams) => {
 
  const res = await api.get<CourseListResponse>('/courses', { params });
  return res.data;
};
export const getTeacherCoursesService = async (params: {
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
  const res = await api.get<API.Response<ICourseDataStaff[]>>('/courses/submissions/by-manager', {
    params,
  });
  return res.data;
};

export const getCourseByIdService = async (id: string) => {
  const res = await api.get<API.Response<Course>>(`/courses/${id}`);
  return res.data;
};

export const getCourseByIdStaffService = async (id: string) => {
  if (!id) {
    throw new Error('Course ID is required');
  }
  const res = await api.get<API.Response<CourseDetail>>(`/courses/${id}/details`);
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

export const createCourseService = async (data: CreateCourseRequest) => {
  const formData = new FormData();

  formData.append('Price', data.price.toString());
  data.topicIds.forEach((id) => {
    formData.append('TopicIds', id);
  });
  formData.append('DurationDays', data.durationDays.toString());
  formData.append('GradingType', data.gradingType);
  formData.append('LearningOutcome', data.learningOutcome);
  formData.append('CourseType', data.courseType);
  formData.append('TemplateId', data.templateId);
  formData.append('Title', data.title);
  formData.append('Image', data.image as File);
  formData.append('Description', data.description);
  formData.append('LevelId', data.LevelId);

  return api.post('/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateCourseService = async ({
  id,
  payload,
}: {
  id: string;
  payload: CreateCourseRequest;
}) => {
  const formData = new FormData();
  console.log(payload);
  try {
    formData.append('Title', payload.title);
    formData.append('Description', payload.description);
    formData.append('TemplateId', payload.templateId);
    formData.append('Type', payload.courseType);
    formData.append('TopicIds', payload.topicIds.join(','));
    formData.append('Price', payload.price);
    if (payload.image) formData.append('Image', payload.image);
    if (payload.learningOutcome) formData.append('LearningOutcome', payload.learningOutcome);
    if (payload.durationDays) formData.append('DurationDays', payload.durationDays.toString());
    if (payload.gradingType) formData.append('GradingType', payload.gradingType);
  } catch (error) {
    console.log(error);
  }

  const res = await api.put<Course>(`/courses/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteCourseService = async (id: string) => {
  const res = await api.delete(`/courses/${id}`);
  return res.data;
};

export const getTeachingProgramService = async ({
  pageNumber = 1,
  pageSize = 1000,
}: {
  pageNumber?: number;
  pageSize?: number;
}) => {
  const res = await api.get<API.Response<Program[]>>('teaching-programs', {
    params: { pageNumber, pageSize },
  });
  return res.data;
};

export const updateCourseVisibilityService = async ({
  id,
  isPublic,
}: {
  id: string;
  isPublic: boolean;
}) => {
  const res = await api.patch(`/courses/${id}/visibility`, { isHidden: isPublic });
  return res.data;
};

export const deleteCourseUnitService = async ({ id }: { id: string }) => {
  const res = await api.delete(`/courses/${id}`);
  return res.data;
};

export const deleteUnitsService = async ({ id }: { id: string }) => {
  const res = await api.delete(`/units/${id}`);
  return res.data;
};

export const deleteLessonService = async ({ id }: { id: string }) => {
  const res = await api.delete(`/lessons/${id}`);
  return res.data;
};

export const getCourseTemplatesService = async ({
  page = 1,
  pageSize = 100,
}: Partial<CourseTemplateQuery> = {}): Promise<CourseTemplateResponse> => {
  const res = await api.get<CourseTemplateResponse>('templates', {
    params: { page, pageSize },
  });
  return res.data;
};

export const getCourseTemplatesByProgramService = async ({
  page = 1,
  pageSize = 100,
  programId = '',
  levelId = '',
}: Partial<CourseTemplateQuery> = {}): Promise<CourseTemplateResponse> => {
  const res = await api.get<CourseTemplateResponse>('templates', {
    params: { page, pageSize, programId, levelId },
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

// services/exercise.ts (or wherever createExerciseService lives)
export const createExerciseService = async (lessonId: string, payload: ExercisePayload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || key === 'MediaFiles') return;

    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, String(v)));
    } else {
      formData.append(key, String(value));
    }
  });

  if (payload.MediaFiles && Array.isArray(payload.MediaFiles)) {
    payload.MediaFiles.forEach((file: File) => {
      formData.append('MediaFiles', file, file.name);
    });
  }

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
