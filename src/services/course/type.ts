export interface CourseTemplate {
  id: string;
  name: string;
  description: string;
  requireGoal: boolean;
  requireLevel: boolean;
  requireSkillFocus: boolean;
  requireTopic: boolean;
  requireLang: boolean;
  minUnits: number;
  minLessonsPerUnit: number;
  minExercisesPerLesson: number;
}

export interface Course {
  courseID?: string;
  title: string;
  description: string;
  image: string;
  imageUrl?: string;
  templateId: string;
  topicIds: string[];
  price: number;
  discountPrice?: number;
  courseType: number;
  languageId: string;
  goalId: number;
  courseLevel?: number;
  courseSkill?: number;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  image?: File;
  templateId: string;
  topicIds: string[];
  price: number;
  discountPrice?: number;
  courseType: number;
  languageId: string;
  goalId: number;
  courseLevel?: number;
  courseSkill?: number;
}


// services/coursetemplates/type.ts

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ICourseTemplate {
  id: string;
  name: string;
  description: string;
  requireGoal: boolean;
  requireLevel: boolean;
  requireSkillFocus: boolean;
  requireTopic: boolean;
  requireLang: boolean;
  minUnits: number;
  minLessonsPerUnit: number;
  minExercisesPerLesson: number;
}

export interface CourseTemplateResponse {
  meta: PaginationMeta;
  status: string;
  code: number;
  message: string;
  data: CourseTemplate[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any;
}

export interface CourseTemplateQuery {
  page?: number;
  pageSize?: number;
}

export interface CourseUnitsRequest {
  courseId: string;
  title: string;
  description: string;
  isPreview: boolean;
}


export interface ICourseMock {
  id: string;
  title: string;
  description: string;
  language: string;
  level: string;
  teacherId: string;
  teacherName: string;
  duration: string;
  price: number;
  imageUrl?: string;
  createdAt: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  languages: string[];
  experience: string;
  avatarUrl?: string;
}

export interface ApplicationForm {
  name: string;
  email: string;
  languages: string[];
  experience: string;
  motivation: string;
}
