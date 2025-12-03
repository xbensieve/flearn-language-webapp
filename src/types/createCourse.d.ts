// src/types/createCourse.d.ts

export interface ProgramAssignment {
  programAssignmentId: string;
  programId: string;
  programName: string;
  levelId: string;
  levelName: string;
}

export interface CourseTemplate {
  templateId: string;
  program: string;
  level: string;
  name: string;
  description: string;
  unitCount: number;
  lessonsPerUnit: number;
  exercisesPerLesson: number;
  status?: boolean;
}

export interface Topic {
  topicId: string;
  topicName: string;
  description?: string;
}

// 1. Form Values (Dùng cho UI - camelCase)
export interface CourseFormValues {
  title: string;
  description: string;
  levelId: string;
  templateId?: string;
  topicIds: string[]; // Form lưu mảng string
  courseType: number;
  price: number;
  image: File | null;
  learningOutcome: string;
  durationDays: number; // TS nhận diện là number
  gradingType: string;
}

// 2. API Request (Dùng cho Service & Backend - PascalCase)
export interface CreateCourseRequest {
  Title: string;
  Description: string;
  LevelId: string;
  TemplateId?: string;
  TopicIds: string;
  CourseType: number;
  Price: number;
  Image: File;
  LearningOutcome: string;
  DurationDays: number;
  GradingType: number;
}

export interface APIResponse<T> {
  data: T;
  message: string;
  status: string;
}
