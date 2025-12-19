import api from "@/lib/axiosInstance";

// --- Interfaces ---
export interface ReviewDetailItem {
  reviewId: string;
  learnerName: string;
  learnerAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PagedReviewResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  reviews: ReviewDetailItem[];
}

export interface MonthlyRevenue {
  month: number;
  totalRevenue: number;
  transactionCount: number;
}

export interface RevenueStats {
  courseId: string;
  courseTitle: string;
  year: number;
  totalYearlyRevenue: number;
  monthlyBreakdown: MonthlyRevenue[];
}

export interface MonthlyEnrollment {
  month: number;
  newEnrollments: number;
}

export interface EnrollmentStats {
  courseId: string;
  courseTitle: string;
  year: number;
  totalYearlyEnrollments: number;
  monthlyBreakdown: MonthlyEnrollment[];
}

export interface StarDistribution {
  star: number;
  count: number;
  percentage: number;
}

export interface ReviewStats {
  courseId: string;
  courseTitle: string;
  averageRating: number;
  totalReviews: number;
  starDistribution: StarDistribution[];
}

// --- API Calls ---

export const getCourseRevenueStats = async (
  courseId: string,
  year: number = new Date().getFullYear()
) => {
  const response = await api.get<any>(
    `/statistics/revenue?CourseId=${courseId}&year=${year}`
  );
  return response.data;
};

export const getCourseEnrollmentStats = async (
  courseId: string,
  year: number = new Date().getFullYear()
) => {
  const response = await api.get<any>(
    `/statistics/enrollments?CourseId=${courseId}&year=${year}`
  );
  return response.data;
};

export const getCourseReviewStats = async (courseId: string) => {
  const response = await api.get<any>(`/statistics/reviews/${courseId}`);
  return response.data;
};

export const getCourseReviewDetails = async (
  courseId: string,
  page: number = 1,
  pageSize: number = 5,
  rating?: number | null
) => {
  let url = `/statistics/reviews-details?CourseId=${courseId}&Page=${page}&PageSize=${pageSize}`;
  if (rating) {
    url += `&Rating=${rating}`;
  }

  const response = await api.get<any>(url);
  return response.data;
};
