/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Data {
  users: User[];
  pagination: Pagination;
}

export interface IDashboard {
  totalUsers: number;
  totalStaff: number;
  totalCourses: number;
  activeUsers: number;
  pendingCourses: number;
  recentUsers: RecentUser[];
}

export interface RecentUser {
  userID: string;
  userName: string;
  email: string;
  status: boolean;
  createdAt: string;
  lastAccessAt: string;
  isEmailConfirmed: boolean;
  roles: string[];
}

export interface User {
  userID: string;
  userName: string;
  email: string;
  status: boolean;
  createdAt: string;
  lastAccessAt: string;
  isEmailConfirmed: boolean;
  roles: string[];
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalUsers: number;
  totalPages: number;
}

export interface DashboardData {
  totalUsers: number;
  totalStaff: number;
  totalCourses: number;
  activeUsers: number;
  pendingCourses: number;
  recentUsers: RecentUser[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface SearchUsersParams {
  keyword?: string;
  role?: string;
  status?: '' | 'true' | 'false' | boolean;
}

export interface ChangePasswordPayload {
  staffUserId: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UserAll {
  userID: string;
  userName: string;
  email: string;
  status: boolean;
  createdAt: string;
  lastAccessAt: string;
  isEmailConfirmed: boolean;
  roles: string[];
}

export interface TeacherDashboardResponse {
  status: string;
  code: number;
  message: string;
  data: {
    totalClasses: number;
    totalStudents: number;
    totalRevenue: number;
    totalPayout: number;
    pendingPayouts: number;
    completedPayouts: number;
    cancelledPayouts: number;
    activeClasses: number;
    finishedClasses: number;

    classes: Array<{
      classID: string;
      title: string;
      status: string;
      startDateTime: string;
      endDateTime: string;
      studentCount: number;
      revenue: number;
      programId: string;
      programName: string;
    }>;

    payouts: any[];
    programStats: Array<{
      programId: string;
      programName: string;
      classCount: number;
      studentCount: number;
      revenue: number;
    }>;

    periodStats: Array<{
      period: string; // YYYY-MM
      classCount: number;
      studentCount: number;
      revenue: number;
    }>;
  };
}
