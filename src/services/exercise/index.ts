import api from "../../config/axios";
import type { GradeRequestBody, GradingStatus } from "./type";

export const getTeacherAssignments = async (params: {
  page?: number;
  pageSize?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  exerciseId?: string;
  lessonId?: string;
  courseId?: string;
}) => {
  const response = await api.get('exercise-grading/teacher-assignments', { params });
  return response.data;
};

// POST: Grade a submission
export const getGradeSubmission = async (exerciseSubmissionId: string, data: GradeRequestBody) => {
  const response = await api.post(
    `exercise-grading/teacher-grade/${exerciseSubmissionId}`,
    data
  );
  return response.data;
};

// services/exercise.ts
export const getGradingStatus = (id: string): Promise<GradingStatus> =>
  api.get(`/exercise-grading/status/${id}`).then(res => res.data);