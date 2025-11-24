export type SubmissionStatus = "Pending" | "Approved" | "Rejected";
export type SortOption = "newest" | "oldest" | "price_asc" | "price_desc";

export interface MetaData {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface APIResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
  meta?: MetaData;
  errors?: string;
}

export interface Teacher {
  teacherId: string;
  name: string;
  avatar: string;
  email: string;
  phoneNumber?: string;
}

export interface Program {
  programId: string;
  name: string;
  description: string;
  level: {
    levelId: string;
    name: string;
    description: string;
  };
}

export interface Topic {
  topicId: string;
  topicName: string;
  topicDescription: string;
  imageUrl: string;
}

export interface Unit {
  courseUnitID: string;
  title: string;
  description: string;
  position: number;
  totalLessons: number;
  lessons: Lesson[];
}

export interface Lesson {
  lessonID: string;
  title: string;
  content: string | null;
  position: number;
  description: string;
  totalExercises: number;
  videoUrl: string | null;
  documentUrl: string | null;
  courseUnitID: string;
  unitTitle?: string;
}

export interface LessonDetail {
  lessonID: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  documentUrl: string | null;
  description: string;
  position: number;
  totalExercises: number;
  courseUnitID: string;
  courseID: string;
}

export interface CourseDetail {
  courseId: string;
  title: string;
  language: string;
  description: string;
  learningOutcome: string;
  imageUrl: string;
  price: number;
  discountPrice: number | null;
  courseType: string;
  courseStatus: string;
  estimatedHours: number;
  durationDays: number;
  numLessons: number;
  numUnits: number;
  averageRating: number;
  learnerCount: number;
  createdAt: string;
  program: Program;
  teacher: Teacher;
  topics?: Topic[];
  units?: Unit[];
}

export interface CourseSubmission {
  submissionId: string;
  course: CourseDetail;
  submitter: Teacher;
  submissionStatus: SubmissionStatus;
  submittedAt: string;
}

export interface CourseQueryParams {
  Page?: number;
  PageSize?: number;
  SearchTerm?: string;
  SortBy?: string;
  status?: SubmissionStatus;
}
