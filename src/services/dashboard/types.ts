export interface Data {
  users: User[]
  pagination: Pagination
}


export interface IDashboard {
  totalUsers: number
  totalStaff: number
  totalCourses: number
  activeUsers: number
  pendingCourses: number
  recentUsers: RecentUser[]
}

export interface RecentUser {
  userID: string
  userName: string
  email: string
  status: boolean
  createdAt: string
  lastAccessAt: string
  isEmailConfirmed: boolean
  roles: string[]
}

export interface User {
  userID: string
  userName: string
  email: string
  status: boolean
  createdAt: string
  lastAccessAt: string
  isEmailConfirmed: boolean
  roles: string[]
}

export interface Pagination {
  currentPage: number
  pageSize: number
  totalUsers: number
  totalPages: number
}