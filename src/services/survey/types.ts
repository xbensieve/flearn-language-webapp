
export interface SurveyCompleteRequest {
  currentLevel: string;
  preferredLanguageID: string;
  learningReason: string;
  previousExperience?: string;
  preferredLearningStyle: string;
  interestedTopics?: string;
  prioritySkills?: string;
  targetTimeline: string;
  speakingChallenges?: string;
  confidenceLevel?: number;
  preferredAccent?: string;
}

export interface SurveyOptionsResponse {
  success: boolean;
  message: string;
  data: {
    currentLevels: string[];
    learningStyles: string[];
    prioritySkills: string[];
    targetTimelines: string[];
    speakingChallenges: string[];
    preferredAccents: string[];
    confidenceLevels: {
      value: number;
      label: string;
    }[];
  };
}

export interface IMySurvey {
  surveyID: string
  currentLevel: string
  preferredLanguageID: string
  preferredLanguageName: string
  learningReason: string
  previousExperience: string
  preferredLearningStyle: string
  interestedTopics: string
  prioritySkills: string
  targetTimeline: string
  speakingChallenges: string
  confidenceLevel: number
  preferredAccent: string
  isCompleted: boolean
  createdAt: string
  aiRecommendations: AiRecommendations
}

export interface AiRecommendations {
  recommendedCourses: RecommendedCourse[]
  reasoningExplanation: string
  learningPath: string
  studyTips: string[]
  generatedAt: string
}

export interface RecommendedCourse {
  courseID: string
  courseName: string
  courseDescription: string
  level: string
  matchScore: number
  matchReason: string
  estimatedDuration: number
  skills: string[]
}