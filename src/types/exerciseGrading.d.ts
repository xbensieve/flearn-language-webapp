export interface GradingMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface EligibleTeacher {
  teacherId: string;
  userId: string;
  fullName: string;
  email: string;
  avatar: string;
  proficiencyCode: string;
  proficiencyOrder: number;
  averageRating: number;
  activeAssignmentsCount: number;
  isRecommended: boolean;
}

export interface AIFeedbackData {
  scores: {
    pronunciation: number;
    fluency: number;
    coherence: number;
    accuracy: number;
    intonation: number;
    grammar: number;
    vocabulary: number;
  };
  cefrLevel: string | null;
  overall: number;
  feedback: string;
  transcript: string;
}

export interface Assignment {
  assignmentId: string;
  exerciseSubmissionId: string;
  learnerId: string;
  learnerName: string;
  assignedTeacherId: string;
  assignedTeacherName: string;
  exerciseId: string;
  exerciseTitle: string;
  exerciseType: string;
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseName: string;
  audioUrl: string;

  passScore?: number;
  finalScore: number | null;

  aiScore: number;
  aiFeedback: string;

  teacherScore?: number;
  teacherFeedback?: string | null;

  status: "Assigned" | "Returned" | "Expired" | "Pending" | string;
  gradingStatus: string;
  earningStatus: string;
  earningAmount: number;
  assignedAt: string; // Format: "dd-MM-yyyy HH:mm"
  deadline: string;
  startedAt: string | null;
  completedAt: string | null;
  isOverdue: boolean;
  hoursRemaining: number;
  feedback: string | null; // General feedback if any
}

export interface FilterOptions {
  courses: { id: string; name: string }[];
  exercises: { id: string; name: string }[];
  statuses: string[];
}

export interface AssignmentQueryParams {
  Page: number;
  PageSize: number;
  Status?: string;
  FromDate?: string; // YYYY-MM-DD
  ToDate?: string; // YYYY-MM-DD
  courseId?: string;
  exerciseId?: string;
}

export interface APIListResponse<T> {
  meta: GradingMeta;
  status: string;
  code: number;
  message: string;
  data: T;
  errors: null;
}

export interface APIFilterResponse {
  status: string;
  code: number;
  message: string;
  data: FilterOptions;
  errors: null;
  meta: null;
}
