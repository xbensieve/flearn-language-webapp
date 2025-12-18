import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Users,
  Star,
  TrendingUp,
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import {
  getCourseRevenueStats,
  getCourseEnrollmentStats,
  getCourseReviewStats,
  getCourseReviewDetails, // <--- Import mới
  type RevenueStats,
  type EnrollmentStats,
  type ReviewStats,
  type PagedReviewResponse, // <--- Type mới
} from "@/services/statistic/statistics";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CourseStatistics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State Global
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // State cho Reviews
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewRating, setReviewRating] = useState<string>("ALL"); // "ALL" | "5" | "4" ...

  // Helper formatting
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // --- QUERIES (No Cache) ---

  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ["stats-revenue", id, year],
    queryFn: () => getCourseRevenueStats(id!, year),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: enrollmentData, isLoading: isLoadingEnrollment } = useQuery({
    queryKey: ["stats-enrollment", id, year],
    queryFn: () => getCourseEnrollmentStats(id!, year),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: reviewData, isLoading: isLoadingReview } = useQuery({
    queryKey: ["stats-review", id],
    queryFn: () => getCourseReviewStats(id!),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
  });

  // Query cho danh sách review chi tiết
  const { data: reviewListData, isLoading: isLoadingReviewList } = useQuery({
    queryKey: ["stats-review-list", id, reviewPage, reviewRating],
    queryFn: () =>
      getCourseReviewDetails(
        id!,
        reviewPage,
        5, // PageSize = 5
        reviewRating === "ALL" ? null : Number(reviewRating)
      ),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
    placeholderData: (previousData) => previousData, // Giữ data cũ khi loading trang mới để mượt hơn
  });

  const revenueStats: RevenueStats | undefined = revenueData?.data;
  const enrollmentStats: EnrollmentStats | undefined = enrollmentData?.data;
  const reviewStats: ReviewStats | undefined = reviewData?.data;
  const reviewList: PagedReviewResponse | undefined = reviewListData?.data;

  // Prepare Chart Data
  const revenueChartData = revenueStats?.monthlyBreakdown.map((item) => ({
    name: `T${item.month}`,
    revenue: item.totalRevenue,
  }));

  const enrollmentChartData = enrollmentStats?.monthlyBreakdown.map((item) => ({
    name: `T${item.month}`,
    students: item.newEnrollments,
  }));

  if (!id) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8 font-sans text-slate-900">
      {/* HEADER: Giữ nguyên như cũ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Thống kê khóa học
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl truncate">
              {revenueStats?.courseTitle || "Đang tải dữ liệu..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <Calendar className="w-4 h-4 text-slate-500 ml-2" />
          <Select
            value={year.toString()}
            onValueChange={(val) => setYear(Number(val))}
          >
            <SelectTrigger className="w-[120px] border-0 focus:ring-0 shadow-none h-8">
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  Năm {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- OVERVIEW CARDS: Giữ nguyên --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu năm {year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRevenue ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(revenueStats?.totalYearlyRevenue || 0)}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Tổng doanh thu tích lũy
            </p>
          </CardContent>
        </Card>

        {/* Enrollments Card */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Học viên mới</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoadingEnrollment ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">
                {enrollmentStats?.totalYearlyEnrollments || 0}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Đăng ký trong năm {year}
            </p>
          </CardContent>
        </Card>

        {/* Rating Card */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đánh giá chung
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            {isLoadingReview ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold text-slate-900">
                  {reviewStats?.averageRating.toFixed(1) || 0}
                </div>
                <div className="text-sm text-slate-500 mb-1">
                  / 5.0 ({reviewStats?.totalReviews} lượt)
                </div>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Trung bình cộng tất cả
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- CHARTS SECTION: Giữ nguyên --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="shadow-sm border-slate-200">
          {/* ... Code cũ giữ nguyên ... */}
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Biểu đồ doanh
              thu
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            {isLoadingRevenue ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-[250px] w-[90%]" />
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      cursor={{ fill: "#f1f5f9" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enrollment Chart */}
        <Card className="shadow-sm border-slate-200">
          {/* ... Code cũ giữ nguyên ... */}
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> Biểu đồ học viên
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            {isLoadingEnrollment ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-[250px] w-[90%]" />
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={enrollmentChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#2563eb" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- REVIEW SECTION (UPDATED) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Star Distribution */}
        <Card className="md:col-span-1 shadow-sm border-slate-200 h-fit">
          <CardHeader>
            <CardTitle className="text-base">Phân bố đánh giá</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingReview ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {reviewStats?.starDistribution.map((item) => (
                    <div key={item.star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12 shrink-0">
                        <span className="text-sm font-medium">{item.star}</span>
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      </div>
                      <Progress
                        value={item.percentage}
                        className="h-2 flex-1 bg-slate-100"
                      />
                      <div className="w-12 text-right text-xs text-slate-500 shrink-0">
                        {Math.round(item.percentage)}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                  <div className="text-4xl font-bold text-slate-900">
                    {reviewStats?.averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(reviewStats?.averageRating || 0)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">
                    Dựa trên {reviewStats?.totalReviews} đánh giá
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right Col: Detailed Review List (REPLACED PLACEHOLDER) */}
        <Card className="md:col-span-2 shadow-sm border-slate-200 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <CardTitle className="text-base">Chi tiết bình luận</CardTitle>
            </div>

            {/* Filter Dropdown */}
            <Select
              value={reviewRating}
              onValueChange={(val) => {
                setReviewRating(val);
                setReviewPage(1); // Reset về trang 1 khi filter
              }}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs bg-slate-50">
                <div className="flex items-center gap-2">
                  <Filter className="w-3 h-3" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả sao</SelectItem>
                <SelectItem value="5">5 Sao</SelectItem>
                <SelectItem value="4">4 Sao</SelectItem>
                <SelectItem value="3">3 Sao</SelectItem>
                <SelectItem value="2">2 Sao</SelectItem>
                <SelectItem value="1">1 Sao</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            {isLoadingReviewList ? (
              // Loading Skeleton for List
              <div className="space-y-6 mt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-16 w-full mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : reviewList?.reviews && reviewList.reviews.length > 0 ? (
              <>
                <div className="space-y-6 mt-2">
                  {reviewList.reviews.map((review) => (
                    <div
                      key={review.reviewId}
                      className="flex gap-4 border-b border-slate-100 last:border-0 pb-6 last:pb-0"
                    >
                      <Avatar className="w-10 h-10 border border-slate-200">
                        <AvatarImage
                          src={review.learnerAvatar}
                          alt={review.learnerName}
                        />
                        <AvatarFallback>
                          {review.learnerName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-semibold text-slate-900">
                            {review.learnerName}
                          </h4>
                          <span className="text-xs text-slate-400">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Trang {reviewList.currentPage} / {reviewList.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={reviewPage <= 1}
                      onClick={() => setReviewPage((p) => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={reviewPage >= reviewList.totalPages}
                      onClick={() => setReviewPage((p) => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 h-full">
                <MessageSquare className="w-8 h-8 mb-2 text-slate-300" />
                <p>
                  Chưa có đánh giá nào{" "}
                  {reviewRating !== "ALL" ? `cho mức ${reviewRating} sao` : ""}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
