export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
  errors: any | null;
  meta: any | null;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface DashboardOverviewResponse {
  totalUsers: number;
  newRegistrations: number;
  activeLearners: number;
  totalRevenue: number;
  churnRate: number;
  revenueChart: ChartDataPoint[];
}

export interface EngagementResponse {
  avgTimeSpentPerUser: number;
  avgLessonCompletionRate: number;
  activityVolumeChart: ChartDataPoint[];
}

export interface ContentEffectivenessResponse {
  lessonId: string;
  courseName: string;
  lessonTitle: string;
  totalStarted: number;
  totalCompleted: number;
  dropOffRate: number;
  avgTimeSpent: number;
}
