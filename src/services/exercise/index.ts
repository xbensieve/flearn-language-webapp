import api from "../../config/axios";
import type { GradeRequestBody } from "./type";

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