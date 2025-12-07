import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import {
  Search,
  MoreHorizontal,
  ArrowUpDown,
  PlayCircle,
  User,
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Wallet,
  X,
  Send,
  Loader2,
  XCircle,
  Trophy,
} from "lucide-react";

import { exerciseGradingService } from "@/services/exerciseGrading/exerciseGradingService";
import type {
  Assignment,
  FilterOptions,
  AssignmentQueryParams,
  AIFeedbackData,
} from "@/types/exerciseGrading";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import DateRangePicker from "@/pages/Manager/Exercise/DateRangePicker";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TeacherExerciseGradingPage() {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(
    null
  );
  const [isGradingMode, setIsGradingMode] = useState(false); // Toggle mở form chấm
  const [gradingScore, setGradingScore] = useState<string>(""); // Dùng string để dễ handle input trống
  const [gradingFeedback, setGradingFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  const [queryParams, setQueryParams] = useState<AssignmentQueryParams>({
    Page: 1,
    PageSize: 10,
    Status: "",
    courseId: "",
    exerciseId: "",
    FromDate: undefined,
    ToDate: undefined,
  });

  const [clientSearch, setClientSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // --- Initial Data Fetching ---

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const data = await exerciseGradingService.getFilters();
        setFilterOptions(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchFilters();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // SỬ DỤNG API MỚI DÀNH CHO TEACHER
      const response = await exerciseGradingService.getTeacherAssignments(
        queryParams
      );
      setAssignments(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được bài tập");
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (dateRange.from) {
      setQueryParams((prev) => ({
        ...prev,
        FromDate: format(dateRange.from!, "yyyy-MM-dd"),
        ToDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
        Page: 1,
      }));
    } else {
      setQueryParams((prev) => {
        if (!prev.FromDate && !prev.ToDate) return prev;
        return { ...prev, FromDate: undefined, ToDate: undefined, Page: 1 };
      });
    }
  }, [dateRange]);

  useEffect(() => {
    if (selectedAssignment) {
      setIsGradingMode(false);
      setGradingScore(selectedAssignment.teacherScore?.toString() || "");
      setGradingFeedback(selectedAssignment.teacherFeedback || "");
    }
  }, [selectedAssignment]);

  // --- Handlers ---
  const handleSubmitGrade = async () => {
    if (!selectedAssignment) return;

    // 1. Validate Score
    const scoreNum = parseFloat(gradingScore);
    if (isNaN(scoreNum) || scoreNum <= 0 || scoreNum > 100) {
      toast.error("Điểm không hợp lệ", {
        description: "Điểm phải lớn hơn 0 và nhỏ hơn hoặc bằng 100.",
      });
      return;
    }

    // 2. Validate Feedback
    if (gradingFeedback.length > 1000) {
      toast.error("Phản hồi quá dài", {
        description: `Chiều dài hiện tại: ${gradingFeedback.length}. Tối đa cho phép: 1000.`,
      });
      return;
    }

    if (!gradingFeedback.trim()) {
      toast.error("Cần có phản hồi", {
        description: "Vui lòng cung cấp một số phản hồi cho học sinh.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Gọi API
      await exerciseGradingService.submitGrade(
        selectedAssignment.exerciseSubmissionId,
        {
          score: scoreNum,
          feedback: gradingFeedback.trim(),
        }
      );

      toast.success("Đã gửi điểm thành công!");

      // Đóng form và refresh data
      setIsGradingMode(false);
      setSelectedAssignment(null); // Đóng Sheet
      fetchData(); // Load lại danh sách để cập nhật status
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to submit grade.";
      toast.error("Gửi không thành công!", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= meta.totalPages) {
      setQueryParams((prev) => ({ ...prev, Page: newPage }));
    }
  };

  const handleFilterChange = (
    key: keyof AssignmentQueryParams,
    value: string
  ) => {
    setQueryParams((prev) => ({
      ...prev,
      [key]: value === "all" ? "" : value,
      Page: 1,
    }));
  };

  // --- Client-Side Filtering/Sorting (Optional enhancement) ---
  const processedAssignments = useMemo(() => {
    let result = [...assignments];
    if (clientSearch.trim()) {
      const term = clientSearch.toLowerCase();
      result = result.filter(
        (item) =>
          item.learnerName.toLowerCase().includes(term) ||
          item.exerciseTitle.toLowerCase().includes(term) ||
          item.lessonTitle.toLowerCase().includes(term) ||
          item.courseName.toLowerCase().includes(term)
      );
    }
    result.sort((a, b) => {
      const parseDate = (dateStr: string) => {
        // Handle format "dd-MM-yyyy HH:mm"
        const [datePart, timePart] = dateStr.split(" ");
        const [day, month, year] = datePart.split("-");
        return new Date(`${year}-${month}-${day}T${timePart}`);
      };
      const dateA = parseDate(a.assignedAt).getTime();
      const dateB = parseDate(b.assignedAt).getTime();
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [assignments, clientSearch, sortOrder]);

  // --- Helper Functions ---

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Assigned":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200";
      case "Returned":
        return "bg-green-100 text-green-800 hover:bg-green-200 border-green-200";
      case "Expired":
        return "bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-200 line-through";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200";
    }
  };

  const getEarningColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "Rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const parseAIFeedback = (jsonString: string): AIFeedbackData | null => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      // Trường hợp chuỗi feedback đơn giản (vd: "Pending AI Evaluation")
      console.log(e);
      return null;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Nhiệm vụ chấm điểm của tôi
            </h2>
            <p className="text-muted-foreground">
              Xem xét các bài nộp, cung cấp phản hồi và theo dõi thu nhập của
              bạn.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSortOrder((prev) =>
                  prev === "latest" ? "oldest" : "latest"
                )
              }
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sortOrder === "latest"
                ? "Mới nhất đầu tiên"
                : "Cũ nhất đầu tiên"}
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm người học, bài tập..."
                    className="pl-10 h-10"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                  />
                </div>

                {/* Course Filter */}
                <Select
                  value={queryParams.courseId || "all"}
                  onValueChange={(val) =>
                    handleFilterChange("courseId", val === "all" ? "" : val)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Tất cả các khóa học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả các khóa học</SelectItem>
                    {filterOptions?.courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Exercise Filter */}
                <Select
                  value={queryParams.exerciseId || "all"}
                  onValueChange={(val) =>
                    handleFilterChange("exerciseId", val === "all" ? "" : val)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Tất cả các bài tập" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả các bài tập</SelectItem>
                    {filterOptions?.exercises.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                  value={queryParams.Status || "all"}
                  onValueChange={(val) =>
                    handleFilterChange("Status", val === "all" ? "" : val)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    {filterOptions?.statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date & Reset */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <DateRangePicker
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                />
                {(queryParams.courseId ||
                  queryParams.exerciseId ||
                  queryParams.Status ||
                  clientSearch ||
                  dateRange.from) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setQueryParams((prev) => ({
                        ...prev,
                        courseId: "",
                        exerciseId: "",
                        Status: "",
                        Page: 1,
                      }));
                      setClientSearch("");
                      setDateRange({});
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Đặt lại bộ lọc
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments Table */}
        <div className="rounded-md border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học viên</TableHead>
                <TableHead>Bài tập</TableHead>
                <TableHead>Dấu thời gian</TableHead>
                <TableHead>Thu nhập</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : processedAssignments.length > 0 ? (
                processedAssignments.map((item) => (
                  <TableRow
                    key={item.assignmentId}
                    className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                      item.isReassigned ? "opacity-60 bg-gray-50" : ""
                    }`}
                    onClick={() => setSelectedAssignment(item)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {item.learnerName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="font-medium text-blue-600 line-clamp-1"
                        title={item.exerciseTitle}
                      >
                        {item.exerciseTitle}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.lessonTitle}
                      </div>
                      <Badge variant="secondary" className="mt-1 text-[10px]">
                        {item.exerciseType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">
                          Được giao: {item.assignedAt}
                        </span>
                        <span
                          className={`text-xs ${
                            item.isOverdue ? "text-red-600 font-bold" : ""
                          }`}
                        >
                          Hết hạn: {item.deadline}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={getEarningColor(item.earningStatus)}
                        >
                          {item.earningAmount.toLocaleString()} đ
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center leading-none">
                        <Badge
                          className={cn(
                            getStatusColor(item.status),
                            "h-5 px-2 flex items-center justify-center"
                          )}
                          variant="outline"
                        >
                          {item.status}
                        </Badge>

                        {item.isReassigned && (
                          <div className="text-[10px] text-red-500 font-medium mt-0.5 text-center">
                            Đã được bàn giao lại
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssignment(item);
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Không tìm thấy bài tập nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Trang {meta.page} của {meta.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              className="cursor-pointer"
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" /> Trước
            </Button>
            <div></div>
            <Button
              className="cursor-pointer"
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page >= meta.totalPages || loading}
            >
              Tiếp theo <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* --- Detail Sheet --- */}
        <Sheet
          open={!!selectedAssignment}
          onOpenChange={(open) => !open && setSelectedAssignment(null)}
        >
          <SheetContent
            className="w-[400px] sm:w-[540px] overflow-y-auto"
            side="right"
          >
            {selectedAssignment && (
              <>
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-xl leading-6">
                    {selectedAssignment.exerciseTitle}
                  </SheetTitle>
                  <SheetDescription>
                    <span className="block mt-1 font-medium text-blue-600">
                      {selectedAssignment.courseName}
                    </span>
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                  {/* WARNING BLOCK: Nếu bài đã bị Reassign (mất quyền chấm) */}
                  {selectedAssignment.isReassigned ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-red-800 text-sm">
                            Nhiệm vụ được giao lại
                          </h4>
                          <p className="text-sm text-red-700 mt-1">
                            Bài tập này đã quá hạn/hết hạn và đã được chuyển cho
                            giáo viên khác. Bạn không thể chấm bài này nữa.
                          </p>
                          <div className="mt-2 text-xs text-red-800 bg-white/50 inline-block px-2 py-1 rounded border border-red-100">
                            Được bàn giao lại cho:{" "}
                            <span className="font-bold">
                              {selectedAssignment.reassignedToTeacherName}
                            </span>{" "}
                            lúc {selectedAssignment.reassignedAt}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* INFO BLOCK: Trạng thái hiện tại */
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">
                          Tình trạng hiện tại
                        </span>
                        <span className="font-medium text-slate-800">
                          {selectedAssignment.status}
                        </span>
                      </div>
                      <Badge
                        className={getStatusColor(selectedAssignment.status)}
                      >
                        {selectedAssignment.status}
                      </Badge>
                    </div>
                  )}

                  {/* Financial Info Block (Teacher Exclusive) */}
                  <div className="p-4 rounded-lg border border-emerald-100 bg-emerald-50/50">
                    <h4 className="text-sm font-semibold text-emerald-800 flex items-center gap-2 mb-3">
                      <Wallet className="h-4 w-4" /> Chi tiết thu nhập
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-emerald-100">
                        <div className="text-xs text-muted-foreground">
                          Tổng
                        </div>
                        <div className="text-lg font-bold text-emerald-600 flex items-center">
                          {selectedAssignment.earningAmount.toLocaleString()}
                          <span className="text-xs ml-1 font-normal">đ</span>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border border-emerald-100">
                        <div className="text-xs text-muted-foreground">
                          Trạng thái
                        </div>
                        <Badge
                          variant="outline"
                          className={`mt-1 ${getEarningColor(
                            selectedAssignment.earningStatus
                          )}`}
                        >
                          {selectedAssignment.earningStatus}
                        </Badge>
                      </div>
                    </div>
                    {selectedAssignment.earningStatus === "Rejected" && (
                      <p className="text-xs text-red-500 mt-2 italic">
                        * Thu nhập bị từ chối do hết hạn hoặc bị chuyển nhượng.
                      </p>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* --- NEW: FINAL SCORE & RESULT SECTION --- */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                      <Trophy className="h-4 w-4 text-yellow-600" /> Đánh giá
                      Kết quả
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Final Score Card */}
                      <div
                        className={`p-4 rounded-lg border flex flex-col justify-between ${
                          selectedAssignment.finalScore !== null
                            ? selectedAssignment.finalScore >=
                              (selectedAssignment.passScore || 0)
                              ? "bg-green-50 border-green-200" // Pass Style
                              : "bg-red-50 border-red-200" // Fail Style
                            : "bg-slate-50 border-slate-200" // Pending Style
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">
                            Điểm cuối cùng
                          </div>
                          <div className="text-3xl font-bold">
                            {selectedAssignment.finalScore !== null
                              ? Number(selectedAssignment.finalScore).toFixed(1) // Làm tròn 1 số thập phân
                              : "--"}
                            <span className="text-sm font-normal text-muted-foreground ml-1">
                              /100
                            </span>
                          </div>
                        </div>

                        {/* Pass/Fail Status Indicator */}
                        <div className="mt-3">
                          {selectedAssignment.finalScore !== null ? (
                            selectedAssignment.finalScore >=
                            (selectedAssignment.passScore || 0) ? (
                              <div className="flex items-center gap-1.5 text-green-700 font-bold bg-white/60 w-fit px-2 py-1 rounded border border-green-200">
                                <CheckCircle2 className="h-4 w-4" />
                                ĐẠT
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-red-700 font-bold bg-white/60 w-fit px-2 py-1 rounded border border-red-200">
                                <XCircle className="h-4 w-4" />
                                KHÔNG ĐẠT
                              </div>
                            )
                          ) : (
                            <div className="text-xs text-slate-500 italic">
                              Đang chờ chấm điểm...
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pass Score Requirement Card */}
                      <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-center">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Bắt buộc phải vượt qua
                        </div>
                        <div className="text-3xl font-bold text-slate-700">
                          {selectedAssignment.passScore || "--"}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Cần có điểm tối thiểu
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Student Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" /> Học viên
                      </h4>
                      <p className="font-medium">
                        {selectedAssignment.learnerName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Award className="h-4 w-4" /> Mục tiêu
                      </h4>
                      <p className="font-medium">
                        {selectedAssignment.passScore || "--"} / 100
                      </p>
                    </div>
                  </div>

                  {/* Audio Player */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" /> Bài nộp của học viên
                    </h4>
                    {selectedAssignment.audioUrl ? (
                      <audio controls className="w-full h-10">
                        <source
                          src={selectedAssignment.audioUrl}
                          type="audio/wav"
                        />
                        <source
                          src={selectedAssignment.audioUrl}
                          type="audio/mpeg"
                        />
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No audio submitted.
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* AI & Scoring Results */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Award className="h-4 w-4" /> Kết quả chấm điểm
                    </h4>

                    {/* AI Feedback Section */}
                    {(() => {
                      const aiData = parseAIFeedback(
                        selectedAssignment.aiFeedback
                      );

                      // Case 1: Simple string feedback
                      if (!aiData) {
                        return (
                          <div className="bg-slate-50 p-4 rounded-md border text-sm">
                            <span className="font-semibold text-slate-600">
                              Trạng thái AI:{" "}
                            </span>
                            {selectedAssignment.aiFeedback || "N/A"}
                            {selectedAssignment.aiScore > 0 && (
                              <div className="mt-1 font-bold text-blue-600">
                                Điểm: {selectedAssignment.aiScore}
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Case 2: Rich JSON feedback
                      return (
                        <div className="bg-white rounded-md border p-4 space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="font-semibold text-sm">
                              Đánh giá AI
                            </span>
                            <Badge className="bg-blue-600">
                              {aiData.overall}/100
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(aiData.scores || {})
                              .filter(([key]) => key !== "completeness")
                              .map(([key, val]) => (
                                <div
                                  key={key}
                                  className="flex justify-between text-slate-600"
                                >
                                  <span className="capitalize">{key}</span>
                                  <span className="font-medium text-slate-900">
                                    {val}
                                  </span>
                                </div>
                              ))}
                          </div>
                          {aiData.recognizedText && (
                            <div className="bg-slate-50 p-2 rounded text-xs italic text-slate-600">
                              "{aiData.recognizedText}"
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Teacher's Own Grade (Display Only) */}
                    <div className="border rounded-md p-4 bg-orange-50/30 border-orange-100">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="text-sm font-semibold text-orange-800">
                          Chấm điểm của bạn
                        </h5>
                        <Badge
                          variant="outline"
                          className="border-orange-200 text-orange-700 bg-white"
                        >
                          {selectedAssignment.teacherScore
                            ? `${selectedAssignment.teacherScore}/100`
                            : "Không được chấm điểm"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 italic">
                        {selectedAssignment.teacherFeedback ||
                          "Chưa có phản hồi nào được cung cấp."}
                      </p>
                    </div>
                  </div>

                  {selectedAssignment && !selectedAssignment.isReassigned && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                          Chấm điểm giáo viên
                        </h4>
                        {!isGradingMode &&
                          selectedAssignment.status !== "Returned" && (
                            <Button
                              size="sm"
                              onClick={() => setIsGradingMode(true)}
                              className="bg-blue-600 hover:bg-blue-700 !text-white cursor-pointer"
                            >
                              Bắt đầu chấm điểm
                            </Button>
                          )}
                      </div>

                      {/* Nếu đang ở chế độ chấm HOẶC bài đã được chấm (Returned) thì hiện form (read-only nếu đã chấm xong) */}
                      {(isGradingMode ||
                        selectedAssignment.status === "Returned") && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                          {/* Score Input */}
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <label className="text-sm font-medium text-slate-700">
                                Điểm <span className="text-red-500">*</span>
                              </label>
                              <span className="text-xs text-muted-foreground">
                                (0 - 100)
                              </span>
                            </div>
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder="e.g. 85"
                                value={gradingScore}
                                onChange={(e) =>
                                  setGradingScore(e.target.value)
                                }
                                disabled={
                                  isSubmitting ||
                                  selectedAssignment.status === "Returned"
                                }
                                className={`pr-12 font-semibold text-lg ${
                                  parseFloat(gradingScore) > 100 ||
                                  parseFloat(gradingScore) <= 0
                                    ? "border-red-500 focus-visible:ring-red-500"
                                    : ""
                                }`}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                                / 100
                              </div>
                            </div>
                          </div>

                          {/* Feedback Input */}
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <label className="text-sm font-medium text-slate-700">
                                Nhận xét <span className="text-red-500">*</span>
                              </label>
                              <span
                                className={`text-xs ${
                                  gradingFeedback.length > 1000
                                    ? "text-red-500 font-bold"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {gradingFeedback.length}/1000
                              </span>
                            </div>
                            <Textarea
                              placeholder="Viết phản hồi chi tiết của bạn ở đây..."
                              value={gradingFeedback}
                              onChange={(e) =>
                                setGradingFeedback(e.target.value)
                              }
                              disabled={
                                isSubmitting ||
                                selectedAssignment.status === "Returned"
                              }
                              className="min-h-[120px] resize-none bg-white"
                            />
                          </div>

                          {/* Actions Buttons */}
                          {selectedAssignment.status !== "Returned" && (
                            <div className="flex gap-3 pt-2">
                              <Button
                                variant="outline"
                                className="flex-1 cursor-pointer"
                                onClick={() => setIsGradingMode(false)}
                                disabled={isSubmitting}
                              >
                                <X className="mr-2 h-4 w-4 cursor-pointer" />{" "}
                                Thoát
                              </Button>
                              <Button
                                className="flex-1 bg-green-600 hover:bg-green-700 !text-white cursor-pointer"
                                onClick={handleSubmitGrade}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang gửi...
                                  </>
                                ) : (
                                  <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Gửi
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {/* Read-only Alert nếu đã trả bài */}
                          {selectedAssignment.status === "Returned" && (
                            <div className="bg-green-100 text-green-800 text-xs px-3 py-2 rounded flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Bài tập này đã được chấm điểm và trả lại.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
