/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CourseTemplate {
  templateId: string;
  program: string;
  level: string;
  name: string;
  description: string;
  unitCount: number;
  lessonsPerUnit: number;
  exercisesPerLesson: number;
  scoringCriteriaJson: string;
  version: string;
  createdAt: string;
  modifiedAt: string;
}

export interface PayloadCourseTemplate {
  name: string;
  description: string;
  unitCount: number;
  lessonsPerUnit: number;
  exercisesPerLesson: number;
  programId: string;
  levelId: string;
}

export interface Course {
  courseId: string;
  templateId: string;
  language: string;
  program: Program;
  teacher: Teacher;
  title: string;
  description: string;
  learningOutcome: string;
  imageUrl: string;
  price: number;
  discountPrice: number;
  courseType: string;
  gradingType: string;
  learnerCount: number;
  averageRating: number;
  reviewCount: number;
  numLessons: number;
  numUnits: number;
  durationDays: number;
  estimatedHours: number;
  courseStatus: string;
  publishedAt: string;
  createdAt: string;
  modifiedAt: string;
  approvedBy: ApprovedBy;
  approvedAt: string;
  topics: Topic[];
  units: Unit[];
}

export interface Program {
  programId: string;
  name: string;
  description: string;
  level: Level;
}

export interface Level {
  levelId: string;
  name: string;
  description: string;
}

export interface Teacher {
  teacherId: string;
  name: string;
  avatar: string;
  email: string;
}

export interface CreateCourseRequest {
  templateId: string;
  title: string;
  LevelId: string;
  description: string;
  learningOutcome: string;
  image?: File; // string($binary) → File trong FE
  topicIds: string[]; // string → sẽ gửi dạng array
  price: string;
  courseType: string;
  gradingType: string;
  durationDays: number; // integer
}
export interface CourseParams {
  Page?: number;
  PageSize?: number;
  SearchTerm?: string;
  SortBy?: string; // 'newest', 'oldest', 'price_asc', 'price_desc'
  Status?: string; // 'Draft', 'Published', 'Pending', 'Rejected'
  lang?: string;
  programId?: string;
  levelId?: string;
  teacherId?: string;
  title?: string;
}

export interface CourseMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}


export interface CourseListResponse {
  meta: CourseMeta;
  status: string;
  code: number;
  message: string;
  data: Course[];
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
  programId?: string;
  levelId?: string;
}

export interface Program {
  programId: string;
  programName: string;
  levelId: string;
  levelName: string;
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
  courseId: string;
  templateId: string;
  programId: string;
  LevelId: string;
  language: string;
  program: Program;
  teacher: Teacher;
  title: string;
  description: string;
  learningOutcome: string;
  imageUrl: string;
  price: number;
  discountPrice: number;
  courseType: string;
  gradingType: string;
  learnerCount: number;
  averageRating: number;
  reviewCount: number;
  numLessons: number;
  numUnits: number;
  durationDays: number;
  estimatedHours: number;
  courseStatus: string;
  publishedAt: string;
  createdAt: string;
  modifiedAt: string;
  approvedBy: ApprovedBy;
  approvedAt: string;
  topics: Topic[];
  units: Unit[];
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
  submissionId: string;
  course: Course;
  submitter: Submitter;
  reviewer?: Reviewer;
  submissionStatus: string;
  feedback: any;
  submittedAt: string;
  reviewedAt?: string;
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
  MediaFiles?: File[];
  MediaFileString?: string;
  Type?: number;
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
  difficulty?: number;
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
  mediaUrls: string[];
  mediaPublicIds: string[];
  position: number;
  exerciseType: string;
  difficulty: string;
  maxScore: number;
  passScore: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  courseID: string;
  courseTitle: string;
  unitID: string;
  unitTitle: string;
  lessonID: string;
  lessonTitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoursePopular {
  courseId: string;
  title: string;
  teacherName: string;
  price: number;
  averageRating: number;
  reviewCount: number;
  learnerCount: number;
  imageUrl: string;
  programName: string;
  proficiencyCode: string;
}

export interface ICourseDataStaff {
  courseId: string;
  templateId: string;
  language: string;
  program: Program;
  teacher: Teacher;
  title: string;
  description: string;
  learningOutcome: string;
  imageUrl: string;
  price: number;
  discountPrice: number;
  courseType: string;
  gradingType: string;
  learnerCount: number;
  averageRating: number;
  reviewCount: number;
  numLessons: number;
  numUnits: number;
  durationDays: number;
  estimatedHours: number;
  courseStatus: string;
  publishedAt?: string;
  createdAt: string;
  modifiedAt: string;
  approvedBy: any;
  approvedAt: any;
  topics: any[];
  units: any[];
}

export interface Program {
  programId: string;
  name: string;
  description: string;
  level: Level;
}

export interface Level {
  levelId: string;
  name: string;
  description: string;
}

export interface Teacher {
  teacherId: string;
  name: string;
  avatar: string;
  email: string;
}

export interface Submitter {
  teacherId: string;
  name: string;
  avatar: string;
  email: string;
  phoneNumber: string;
}

export interface Reviewer {
  managerId: string;
  name: any;
  email: string;
}
