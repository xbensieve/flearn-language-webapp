export interface Assignment {
  assignmentId: string
  exerciseSubmissionId: string
  learnerId: string
  learnerName: string
  exerciseId: string
  exerciseTitle: string
  exerciseType: string
  lessonId: string
  lessonTitle: string
  courseId: string
  courseName: string
  audioUrl: string
  aiScore: number
  aiFeedback: string
  status: string
  gradingStatus: string
  earningStatus: string
  earningAmount: number
  assignedAt: string
  deadline: string
  startedAt: string
  completedAt: string
  isOverdue: boolean
  hoursRemaining: number
  finalScore: number
  feedback: string
}

export interface GradingStatus {
  exerciseSubmissionId: string
  status: string
  aiScore: number
  teacherScore: number
  finalScore: number
  isPassed: boolean
  aiFeedback: string
  teacherFeedback: string
  submittedAt: string
  reviewedAt: string
  assignedTeacherId: string
  assignedTeacherName: string
  assignmentDeadline: string
}

export interface GradeRequestBody {
  score: number
  feedback: string
}

export interface AssignExerciseRequestBody {
  exerciseSubmissionId: string
  teacherId: string
}