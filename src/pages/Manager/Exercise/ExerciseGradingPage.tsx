import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import {
  Search,
  MoreHorizontal,
  ArrowUpDown,
  PlayCircle,
  Clock,
  User,
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  UserCog,
  UserCheck,
  Loader2,
  XCircle,
  Info,
  Bot,
} from "lucide-react";

import { exerciseGradingService } from "@/services/exerciseGrading/exerciseGradingService";
import type {
  Assignment,
  FilterOptions,
  AssignmentQueryParams,
  AIFeedbackData,
  EligibleTeacher,
} from "@/types/exerciseGrading";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DateRangePicker from "./DateRangePicker";
import { toast } from "sonner";

// Hook useDebounce đơn giản để tránh gọi API quá nhiều khi search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function ExerciseGradingPage() {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(
    null
  );

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

  // --- States for Reassign Feature ---
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const debouncedTeacherSearch = useDebounce(teacherSearchTerm, 500);
  const [eligibleTeachers, setEligibleTeachers] = useState<EligibleTeacher[]>(
    []
  );
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [selectedNewTeacher, setSelectedNewTeacher] = useState<string | null>(
    null
  );
  const [isPollingAI, setIsPollingAI] = useState(false);
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
      const response = await exerciseGradingService.getAssignments(queryParams);
      setAssignments(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error(error);
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

  // --- Reassign Logic ---

  // Khi mở dialog hoặc thay đổi search term thì gọi API tìm giáo viên
  useEffect(() => {
    if (!isReassignDialogOpen || !selectedAssignment) return;

    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      try {
        // Mặc định lấy page 1, size 10
        const res = await exerciseGradingService.getEligibleTeachers(
          selectedAssignment.exerciseSubmissionId, // exerciseSubmissionId (map tạm từ assignmentId)
          debouncedTeacherSearch,
          1,
          10
        );
        setEligibleTeachers(res.data || []);
      } catch (error) {
        console.error("Failed to fetch eligible teachers", error);
        toast.error("Failed to load eligible teachers");
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, [isReassignDialogOpen, debouncedTeacherSearch, selectedAssignment]);

  const handleOpenReassignDialog = () => {
    setTeacherSearchTerm("");
    setSelectedNewTeacher(null);
    setIsReassignDialogOpen(true);
  };

  const handleConfirmReassign = async () => {
    if (!selectedAssignment || !selectedNewTeacher) return;

    try {
      setLoading(true);
      await exerciseGradingService.assignTeacher(
        selectedAssignment.exerciseSubmissionId,
        selectedNewTeacher
      );
      toast.success("Reassigned successfully!");

      setIsReassignDialogOpen(false);
      setSelectedAssignment(null); // Đóng sheet chi tiết
      fetchData(); // Refresh lại danh sách assignment
    } catch (error) {
      console.error("Failed to reassign teacher", error);
      toast.error(
        (error as any).response?.data?.message || "Failed to reassign teacher"
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
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

  // --- LOGIC POLLING ---
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPollingAI && selectedAssignment) {
      // Bắt đầu gọi API mỗi 3 giây
      intervalId = setInterval(async () => {
        try {
          const statusData = await exerciseGradingService.getGradingStatus(
            selectedAssignment.exerciseSubmissionId
          );

          // Kiểm tra xem đã có kết quả chưa (Điểm > 0 hoặc Status không còn là Pending/Processing)
          // Lưu ý: Logic này tùy thuộc vào cách Backend trả về status khi đang chấm
          const isFinished =
            statusData.aiScore > 0 ||
            (statusData.status !== "PendingAIReview" &&
              statusData.status !== "Pending");

          if (isFinished) {
            // 1. Dừng polling
            setIsPollingAI(false);
            toast.success("AI Grading Completed!");

            // 2. Cập nhật lại selectedAssignment với dữ liệu mới để UI tự render lại điểm
            setSelectedAssignment((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                aiScore: statusData.aiScore,
                aiFeedback: statusData.aiFeedback,
                status: statusData.status,
                finalScore: statusData.finalScore ?? prev.finalScore,
                // Parse lại recognized text nếu cần thiết từ feedback
              };
            });

            // 3. Refresh lại danh sách tổng bên ngoài để đồng bộ
            fetchData();
          }
        } catch (error) {
          console.error("Polling error", error);
          // Nếu lỗi liên tục thì có thể cân nhắc dừng polling sau X lần
        }
      }, 3000); // 3 giây gọi 1 lần
    }

    // Cleanup khi unmount hoặc tắt polling
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPollingAI, selectedAssignment, fetchData]);

  const handleRetryAI = async () => {
    if (!selectedAssignment) return;

    try {
      setIsPollingAI(true);
      await exerciseGradingService.retryAIGrading(
        selectedAssignment.exerciseSubmissionId
      );
      toast.info("AI is grading... Please wait.");
    } catch (error: any) {
      setIsPollingAI(false); // Tắt loading nếu trigger thất bại
      const msg =
        error?.response?.data?.message || "Failed to trigger AI retry";
      toast.error(msg);
    }
  };
  // --- Client-Side Logic ---
  const processedAssignments = useMemo(() => {
    let result = [...assignments];
    if (clientSearch.trim()) {
      const term = clientSearch.toLowerCase();
      result = result.filter(
        (item) =>
          item.learnerName.toLowerCase().includes(term) ||
          item.assignedTeacherName.toLowerCase().includes(term) ||
          item.exerciseTitle.toLowerCase().includes(term) ||
          item.lessonTitle.toLowerCase().includes(term) ||
          item.courseName.toLowerCase().includes(term)
      );
    }
    result.sort((a, b) => {
      const parseDate = (dateStr: string) => {
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

  // --- Render Helpers ---

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Assigned":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200";
      case "Returned":
        return "bg-green-100 text-green-800 hover:bg-green-200 border-green-200";
      case "Expired":
        return "bg-red-100 text-red-800 hover:bg-red-200 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200";
    }
  };

  const parseAIFeedback = (jsonString: string): AIFeedbackData | null => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse AI feedback JSON:", e);
      return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Exercise Submissions
            </h2>
            <p className="text-muted-foreground">
              Manage and grade student assignments.
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
              {sortOrder === "latest" ? "Latest First" : "Oldest First"}
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 h-10"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                  />
                </div>

                {/* Course */}
                <Select
                  value={queryParams.courseId || "all"}
                  onValueChange={(val) =>
                    handleFilterChange("courseId", val === "all" ? "" : val)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {filterOptions?.courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Exercise */}
                <Select
                  value={queryParams.exerciseId || "all"}
                  onValueChange={(val) =>
                    handleFilterChange("exerciseId", val === "all" ? "" : val)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Exercises" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exercises</SelectItem>
                    {filterOptions?.exercises.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status */}
                <Select
                  value={queryParams.Status || "all"}
                  onValueChange={(val) =>
                    handleFilterChange("Status", val === "all" ? "" : val)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {filterOptions?.statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range + Reset */}
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
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Exercise Info</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
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
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => setSelectedAssignment(item)}
                  >
                    <TableCell className="font-medium">
                      <div>{item.learnerName}</div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="font-medium text-blue-600 line-clamp-1"
                        title={item.exerciseTitle}
                      >
                        {item.exerciseTitle}
                      </div>
                      <div
                        className="text-xs text-muted-foreground line-clamp-1"
                        title={item.courseName}
                      >
                        {item.courseName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Type:{" "}
                        <span className="font-semibold">
                          {item.exerciseType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{item.assignedTeacherName}</TableCell>
                    <TableCell className="text-sm">
                      <div className="whitespace-nowrap text-xs">
                        Assign: {item.assignedAt}
                      </div>
                      <div className="whitespace-nowrap text-xs text-red-500">
                        Deadline: {item.deadline}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.isReassigned ? (
                        <div className="flex flex-col gap-1 items-start">
                          {/* Badge mới để báo hiệu đã Reassign */}
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                          >
                            Reassigned
                          </Badge>

                          {/* Status cũ (thường là Expired) bị gạch ngang và làm mờ */}
                          <Badge
                            className={`${getStatusColor(
                              item.status
                            )} opacity-50 line-through decoration-slate-400`}
                            variant="outline"
                          >
                            {item.status}
                          </Badge>
                        </div>
                      ) : (
                        /* Hiển thị bình thường nếu chưa Reassign */
                        <Badge
                          className={getStatusColor(item.status)}
                          variant="outline"
                        >
                          {item.status}
                        </Badge>
                      )}
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
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page <= 1 || loading}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page >= meta.totalPages || loading}
              className="cursor-pointer"
            >
              Next <ChevronRight className="h-4 w-4" />
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
                  {/* Case A: Đã được Reassign (Chuyển giao) */}
                  {selectedAssignment.isReassigned ? (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-800 text-sm">
                            Assignment Reassigned
                          </h4>
                          <p className="text-sm text-blue-600 mb-3 mt-1">
                            This submission was expired/cancelled and has been
                            transferred to a new teacher.
                          </p>

                          {/* Thông tin giáo viên mới */}
                          <div className="bg-white rounded border border-blue-100 p-3 flex items-center gap-3 shadow-sm">
                            <Avatar className="h-10 w-10 border border-gray-200">
                              <AvatarImage
                                src={
                                  selectedAssignment.reassignedToTeacherAvatar ||
                                  ""
                                }
                              />
                              <AvatarFallback>
                                {selectedAssignment.reassignedToTeacherName?.charAt(
                                  0
                                ) || "T"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {selectedAssignment.reassignedToTeacherName}
                              </p>
                              <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                <span>
                                  Reassigned at:{" "}
                                  {selectedAssignment.reassignedAt}
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-blue-600 bg-blue-50 border-blue-200"
                            >
                              New
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Case B: Chưa Reassign -> Hiển thị Status bình thường */
                    <div
                      className={`p-4 rounded-lg border ${
                        selectedAssignment.isOverdue ||
                        selectedAssignment.status === "Expired"
                          ? "bg-red-50 border-red-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Current Status
                        </span>
                        <Badge
                          className={getStatusColor(selectedAssignment.status)}
                        >
                          {selectedAssignment.status}
                        </Badge>
                      </div>
                      {selectedAssignment.isOverdue && (
                        <div className="flex items-center text-red-600 text-sm font-medium gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Assignment is Overdue
                        </div>
                      )}
                    </div>
                  )}

                  {/* Nút Assign lại: Chỉ hiện nếu Chưa Reassign VÀ (Expired hoặc Overdue) */}
                  {!selectedAssignment.isReassigned &&
                    (selectedAssignment.status === "Expired" ||
                      selectedAssignment.isOverdue) && (
                      <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
                        <h4 className="font-semibold text-orange-800 mb-2">
                          Teacher Re-assignment Needed
                        </h4>
                        <p className="text-sm text-orange-700 mb-3">
                          This assignment has expired or is overdue. Please
                          select another teacher.
                        </p>
                        <Button
                          onClick={handleOpenReassignDialog}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Find & Assign New Teacher
                        </Button>
                      </div>
                    )}

                  {/* People Info (Giữ nguyên, nhưng có thể làm mờ nếu đã reassign) */}
                  <div
                    className={`grid grid-cols-2 gap-4 ${
                      selectedAssignment.isReassigned ? "opacity-70" : ""
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" /> Learner
                      </h4>
                      <p className="font-medium">
                        {selectedAssignment.learnerName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <UserCog className="h-4 w-4" /> Original Teacher
                      </h4>
                      <p className="font-medium flex items-center gap-2">
                        {selectedAssignment.assignedTeacherName}
                        {selectedAssignment.isReassigned && (
                          <span className="text-xs text-red-500 font-normal">
                            (Cancelled)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Scoring Summary (Existing Code) */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" /> Scoring Results
                    </h4>

                    {/* Final Score & Pass Score Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                          Final Score
                        </div>
                        <div
                          className={`text-3xl font-bold ${
                            selectedAssignment.finalScore !== null &&
                            selectedAssignment.finalScore >=
                              (selectedAssignment.passScore || 0)
                              ? "text-green-600"
                              : "text-slate-700"
                          }`}
                        >
                          {selectedAssignment.finalScore !== null
                            ? parseFloat(
                                Number(selectedAssignment.finalScore).toFixed(2)
                              )
                            : "--"}
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            /100
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs">
                          {selectedAssignment.finalScore !== null &&
                            (selectedAssignment.finalScore >=
                            (selectedAssignment.passScore || 0) ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-green-600" />{" "}
                                <span className="text-green-700 font-medium">
                                  Passed
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-red-600" />{" "}
                                <span className="text-red-700 font-medium">
                                  Failed
                                </span>
                              </>
                            ))}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                          Pass Score
                        </div>
                        <div className="text-3xl font-bold text-slate-700">
                          {selectedAssignment.passScore || "--"}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Required to pass
                        </div>
                      </div>
                    </div>

                    {/* Teacher Feedback Section */}
                    <div className="space-y-2 border rounded-md p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          Teacher Evaluation
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          Score:{" "}
                          {selectedAssignment.teacherScore !== undefined
                            ? selectedAssignment.teacherScore
                            : "--"}
                        </Badge>
                      </div>
                      {selectedAssignment.teacherFeedback ? (
                        <div className="text-sm text-gray-600 italic">
                          "{selectedAssignment.teacherFeedback}"
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No teacher feedback yet.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ... Rest of existing sheet content (Audio, AI, Timeline) ... */}
                  <Separator />
                  {/* Audio Player */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" /> Submission Audio
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
                        No audio submission available.
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* AI Analysis */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        AI Analysis & Scoring
                      </h4>

                      {(selectedAssignment.aiScore === 0 || isPollingAI) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRetryAI}
                          disabled={isPollingAI}
                          className={`h-7 text-xs border-orange-200 
                    ${
                      isPollingAI
                        ? "bg-orange-50 text-orange-600 w-32 justify-center"
                        : "text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                    }`}
                        >
                          {isPollingAI ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Grading...
                            </>
                          ) : (
                            <>
                              <Bot className="mr-1 h-3 w-3" />
                              Retry AI Grading
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    {(() => {
                      const aiData = parseAIFeedback(
                        selectedAssignment.aiFeedback
                      );

                      // Case 1: AI Feedback is a pending string or error string, not JSON
                      if (!aiData) {
                        return (
                          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-semibold">Status: </span>
                              {selectedAssignment.aiFeedback || "Unavailable"}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              Score: {selectedAssignment.aiScore}
                            </div>
                          </div>
                        );
                      }

                      // Case 2: AI Feedback is valid JSON data
                      return (
                        <div className="space-y-4">
                          {/* Overall Badge */}
                          <div className="flex gap-4">
                            <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-center flex-1">
                              <div className="text-xs uppercase font-bold">
                                Overall
                              </div>
                              <div className="text-xl font-bold">
                                {aiData.overall}
                              </div>
                            </div>
                            <div className="bg-purple-50 text-purple-700 px-3 py-2 rounded-md text-center flex-1">
                              <div className="text-xs uppercase font-bold">
                                CEFR
                              </div>
                              <div className="text-xl font-bold">
                                {aiData.cefrLevel || "N/A"}
                              </div>
                            </div>
                          </div>
                          {/* Detailed Scores Grid */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(aiData.scores || {})
                              .filter(([key]) => key !== "completeness")
                              .map(([key, score]) => (
                                <div
                                  key={key}
                                  className="flex justify-between border-b border-dashed py-1"
                                >
                                  <span className="capitalize text-muted-foreground">
                                    {key}
                                  </span>
                                  <span className="font-semibold">{score}</span>
                                </div>
                              ))}
                          </div>
                          {/* Transcript */}
                          {aiData.recognizedText && (
                            <div className="bg-slate-50 p-3 rounded-md text-sm text-gray-700 border">
                              <div className="font-semibold text-slate-600 mb-1">
                                Recognized Text
                              </div>
                              <div className="italic">
                                "{aiData.recognizedText}"
                              </div>
                            </div>
                          )}

                          {/* Feedback Text */}
                          {aiData.feedback && (
                            <div className="text-sm text-gray-600 bg-slate-50 p-3 rounded-md border">
                              <div className="font-semibold text-slate-600 mb-1">
                                AI Feedback
                              </div>
                              {aiData.feedback}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Timeline
                    </h4>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Assigned:</div>
                      <div>{selectedAssignment.assignedAt}</div>
                      <div className="text-muted-foreground">Completed:</div>
                      <div>
                        {selectedAssignment.completedAt || "Not completed"}
                      </div>
                      <div className="text-red-500 font-medium">Deadline:</div>
                      <div className="text-red-500 font-medium">
                        {selectedAssignment.deadline}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* --- Reassign Teacher Dialog --- */}
        <Dialog
          open={isReassignDialogOpen}
          onOpenChange={setIsReassignDialogOpen}
        >
          <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle>Assign New Teacher</DialogTitle>
              <DialogDescription>
                Search and select an eligible teacher to grade this submission.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search Bar */}
              <div className="p-4 border-b bg-gray-50/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-10"
                    value={teacherSearchTerm}
                    onChange={(e) => setTeacherSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              {/* Teacher List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loadingTeachers ? (
                  <div className="flex flex-col items-center justify-center h-40 space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-sm text-muted-foreground">
                      Finding teachers...
                    </p>
                  </div>
                ) : eligibleTeachers.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <UserCog className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No eligible teachers found.</p>
                  </div>
                ) : (
                  eligibleTeachers.map((teacher) => (
                    <div
                      key={teacher.teacherId}
                      onClick={() =>
                        setSelectedNewTeacher((prev) =>
                          prev === teacher.teacherId ? null : teacher.teacherId
                        )
                      }
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                        ${
                          selectedNewTeacher === teacher.teacherId
                            ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                            : "hover:bg-slate-50 border-gray-200"
                        }
                      `}
                    >
                      <Avatar>
                        <AvatarImage src={teacher.avatar} />
                        <AvatarFallback>
                          {teacher.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-medium truncate">
                            {teacher.fullName}
                          </p>
                          {teacher.isRecommended && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 px-1 bg-green-100 text-green-700"
                            >
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {teacher.email}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3" />{" "}
                            {teacher.proficiencyCode}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Active:{" "}
                            {teacher.activeAssignmentsCount}
                          </span>
                        </div>
                      </div>
                      {selectedNewTeacher === teacher.teacherId && (
                        <div className="text-blue-600">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-md">
              <Button
                variant="outline"
                onClick={() => setIsReassignDialogOpen(false)}
                className="hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReassign}
                disabled={!selectedNewTeacher || loading}
                className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 transition-colors flex items-center cursor-pointer"
              >
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                )}
                Confirm Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
