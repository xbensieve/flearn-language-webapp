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
  status: string;
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
  goalIds?: number[];
  Level?: number;
  courseSkill?: number;
}

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

export interface Lesson {
  lessonID: string;
  title: string;
  content: string;
  position: number;
  description: string;
  totalExercises: number;
  videoUrl: string;
  documentUrl: string;
  courseUnitID: string;
  unitTitle: string;
  courseID: string;
  courseTitle: string;
  createdAt: string;
  updatedAt: string;
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

export interface CourseDetail {
  courseID: string;
  title: string;
  description: string;
  imageUrl: string;
  templateInfo: TemplateInfo;
  price: number;
  discountPrice: number;
  courseType: string;
  teacherInfo: TeacherInfo;
  languageInfo: LanguageInfo;
  goalInfo: GoalInfo;
  goals: GoalInfo[];
  courseLevel: string;
  publishedAt: string;
  status: string;
  createdAt: string;
  modifiedAt: string;
  numLessons: number;
  approvedBy: ApprovedBy;
  approvedAt: string;
  topics: Topic[];
}
export interface Unit {
  courseUnitID: string;
  title: string;
  description: string;
  position: number;
  courseID: string;
  courseTitle: string;
  totalLessons: number;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICourseDataStaff {
  courseSubmissionID: string;
  submissionStatus: string;
  feedback: string;
  submittedAt: string;
  reviewedAt: string;
  course: ICourseStaff;
}

export interface ICourseStaff {
  courseID: string;
  title: string;
  description: string;
  imageUrl: string;
  templateInfo: TemplateInfo;
  price: number;
  discountPrice: number;
  courseType: string;
  teacherInfo: TeacherInfo;
  languageInfo: LanguageInfo;
  goalInfo: GoalInfo;
  courseLevel: string;
  publishedAt: string;
  status: string;
  createdAt: string;
  modifiedAt: string;
  numLessons: number;
  approvedBy: string;
  approvedAt: string;
  topics: Topic[];
}

export interface TemplateInfo {
  templateId: string;
  name: string;
}

export interface TeacherInfo {
  teacherId: string;
  fullName: string;
  avatar: string;
  email: string;
  phoneNumber: string;
}

export interface LanguageInfo {
  name: string;
  code: string;
}

export interface GoalInfo {
  id?: number;
  name: string;
  description: string;
}

export interface Topic {
  topicId: string;
  topicName: string;
  topicDescription: string;
  imageUrl: string;
}

export interface ApprovedBy {
  staffId: string;
  userName: string;
  email: string;
}

// src/services/exercise/type.ts
export interface ExercisePayload {
  Title: string;
  Prompt: string;
  Hints?: string;
  Content?: string;
  ExpectedAnswer?: string;
  MediaFile?: File;
  MediaFileString?: string;
  Type?: string;
  Difficulty?: string;
  MaxScore?: number;
  PassScore?: number;
  FeedbackCorrect?: string;
  FeedbackIncorrect?: string;
}

export interface Exercise {
  exerciseId: string;
  lessonId: string;
  title: string;
  prompt: string;
  content?: string;
  type: string;
  difficulty?: string;
  maxScore?: number;
  passScore?: number;
  feedbackCorrect?: string;
  feedbackIncorrect?: string;
  mediaUrl?: string;
}

export interface ExerciseData {
  exerciseID: string;
  title: string;
  prompt: string;
  hints: string;
  content: string;
  expectedAnswer: string;
  mediaUrl: string;
  mediaPublicId: string;
  position: number;
  exerciseType: string;
  difficulty: string;
  maxScore: number;
  passScore: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  prerequisiteExerciseID: string;
  courseID: string;
  courseTitle: string;
  unitID: string;
  unitTitle: string;
  lessonID: string;
  lessonTitle: string;
  createdAt: string;
  updatedAt: string;
}
