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
