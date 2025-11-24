/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IDashboard {
  totalUsers: number;
  totalStaff: number;
  totalCourses: number;
  totalTeachers: number;
  activeUsers: number;
  pendingRequest: number;
  recentUsers: RecentUser[];
}

export interface RecentUser {
  userID: string;
  userName: string;
  email: string;
  status: boolean;
  createdAt: string;
  lastAccessAt: string | null;
  isEmailConfirmed: boolean;
  roles: string[];
}


export interface DailyRegistration {
  date: string;
  count: number;
}
export interface TeacherData {
  teacherId: string;
  language: string;
  fullName: string;
  dateOfBirth: string;
  bio: string;
  avatar: string;
  email: string;
  phoneNumber: string;
  proficiencyCode: string;
  averageRating: number;
  reviewCount: number;
  meetingUrl: string;
}

export interface UserStatisticsResponse {
  totalUsersInPeriod: number;
  dailyRegistrations: DailyRegistration[];
  averagePerDay: number;
}
export interface UserListResponse {
  users: RecentUser[];
  pagination: Pagination;
}
export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalUsers: number;
  totalPages: number;
}
export interface Staff {
  userID: string;
  userName: string;
  email: string;
  status: boolean;
  createdAt: string;
  lastAccessAt: string | null;
  isEmailConfirmed: boolean;
  roles: string[];
}
export interface StaffListResponse {
  data: Staff[];
  totalStaff: number;
}

export interface ChangePasswordPayload {
  staffUserId: string;
  newPassword: string;
  confirmNewPassword: string;
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
      period: string; 
      classCount: number;
      studentCount: number;
      revenue: number;
    }>;
  };
}