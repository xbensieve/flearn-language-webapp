import api from '../../config/axios';
import type { Course, CourseTemplate, CourseTemplateQuery, CourseTemplateResponse, CourseUnitsRequest, CreateCourseRequest, Lesson } from './type';

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

export const getCourseByIdService = async (id: string) => {
  const res = await api.get<API.Response<Course>>(`/courses/${id}`);
  return res.data;
};

export const createCourseService = async (
  payload: CreateCourseRequest
): Promise<API.Response<Course>> => {
  const formData = new FormData();

  formData.append('Title', payload.title);
  formData.append('Description', payload.description);

  if (payload.image) {
    formData.append('Image', payload.image);
  }

  formData.append('TemplateId', payload.templateId);

  payload.topicIds.forEach((id) => formData.append('TopicIds', id));

  formData.append('Price', payload.price.toString());

  if (payload.discountPrice !== undefined) {
    formData.append('DiscountPrice', payload.discountPrice.toString());
  }

  formData.append('CourseType', payload.courseType.toString());
  formData.append('LanguageID', payload.languageId);
  formData.append('GoalId', payload.goalId.toString());

  if (payload.courseLevel !== undefined) {
    formData.append('CourseLevel', payload.courseLevel.toString());
  }

  if (payload.courseSkill !== undefined) {
    formData.append('CourseSkill', payload.courseSkill.toString());
  }

  const res = await api.post('/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
};

export const updateCourseService = async (id: string, payload: FormData) => {
  const res = await api.put<Course>(`/courses/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteCourseService = async (id: string) => {
  const res = await api.delete(`/courses/${id}`);
  return res.data;
};

export const getCourseTemplatesService = async (
  { page = 1, pageSize = 10 }: Partial<CourseTemplateQuery> = {}
): Promise<CourseTemplateResponse> => {
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
    isPreview: payload.isPreview
  });
  return res.data;
};

// services/course.ts (add these exports)

export const getCourseDetailService = async (id: string) => {
  const res = await api.get(`/courses/${id}`);
  return res.data.data;
};

export const getCourseUnitsService = async ({id, page = 1, pageSize = 100}: {id: string, page?: number, pageSize?: number}) => {
  const res = await api.get(`/courses/${id}/units?${page ? `page=${page}` : ''}&${pageSize ? `pageSize=${pageSize}` : ''}`);
  return res.data.data;
};

export const createCourseLessonService = async (courseId: string, unitId: string, formData: FormData) => {
  const res = await api.post(`/courses/${courseId}/units/${unitId}/lessons`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getLessonsByUnits = async ({courseId , page = 1, pageSize = 100}: {courseId: string, page?: number, pageSize?: number}): Promise<API.Response<Lesson[]>> => {
  const res = await api.get(`courses/${courseId}/lessons?${page ? `page=${page}` : ''}&${pageSize ? `pageSize=${pageSize}` : ''}`);
  return res.data;
}