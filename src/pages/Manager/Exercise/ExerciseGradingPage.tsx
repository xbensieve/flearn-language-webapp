import { useState, useEffect, useMemo } from "react";
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
import {
  type Assignment,
  type AssignmentQueryParams,
  type AIFeedbackData,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RobotOutlined } from "@ant-design/icons";

const translateAssignmentStatus = (status: string): string => {
  switch (status) {
    case "Assigned":
      return "Đã giao";
    case "Returned":
      return "Đã chấm";
    case "Expired":
      return "Hết hạn";
    case "Pending":
      return "Đang chờ";
    default:
      return status;
  }
};

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
  const queryClient = useQueryClient();

  // --- Query Params State ---
  const [queryParams, setQueryParams] = useState<AssignmentQueryParams>({
    Page: 1,
    PageSize: 10,
    Status: "",
    courseId: "",
    exerciseId: "",
    FromDate: undefined,
    ToDate: undefined,
  });

  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // --- QUERY 1: Filters (Cache lâu vì ít thay đổi) ---
  const { data: filterOptions } = useQuery({
    queryKey: ["grading-filters"],
    queryFn: () => exerciseGradingService.getFilters(),
    staleTime: 60 * 60 * 1000, // 1 giờ
  });

  // --- QUERY 2: Assignments List (Main Data) ---
  const { data: assignmentsData, isLoading: loading } = useQuery({
    queryKey: ["grading-assignments", queryParams], // Tự động refetch khi queryParams đổi
    queryFn: () => exerciseGradingService.getAssignments(queryParams),
    staleTime: 2 * 60 * 1000, // 2 phút
  });

  const assignments = assignmentsData?.data || [];
  const meta = assignmentsData?.meta || {
    page: 1,
    totalPages: 1,
    totalItems: 0,
  };

  // --- Reassign Feature States ---
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const debouncedTeacherSearch = useDebounce(teacherSearchTerm, 500);
  const [selectedNewTeacher, setSelectedNewTeacher] = useState<string | null>(
    null
  );
  const [isPollingAI, setIsPollingAI] = useState(false);

  // --- QUERY 3: Eligible Teachers (Chỉ fetch khi mở dialog) ---
  const { data: eligibleTeachersResponse, isLoading: loadingTeachers } =
    useQuery({
      queryKey: [
        "eligible-teachers",
        selectedAssignment?.exerciseSubmissionId,
        debouncedTeacherSearch,
      ],
      queryFn: () =>
        exerciseGradingService.getEligibleTeachers(
          selectedAssignment!.exerciseSubmissionId,
          debouncedTeacherSearch,
          1,
          10
        ),
      enabled: !!isReassignDialogOpen && !!selectedAssignment, // Chỉ chạy khi mở dialog
      staleTime: 5 * 60 * 1000,
    });

  const eligibleTeachers = eligibleTeachersResponse?.data || [];

  // --- Date Range Effect ---
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

  // --- Mutations (Thay đổi dữ liệu) ---
  const assignTeacherMutation = useMutation({
    mutationFn: (teacherId: string) =>
      exerciseGradingService.assignTeacher(
        selectedAssignment!.exerciseSubmissionId,
        teacherId
      ),
    onSuccess: () => {
      toast.success("Đã phân công lại thành công!");
      setIsReassignDialogOpen(false);
      setSelectedAssignment(null);
      queryClient.invalidateQueries({ queryKey: ["grading-assignments"] }); // Refresh list
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Không thể phân công lại giáo viên"
      );
    },
  });

  const handleConfirmReassign = () => {
    if (selectedNewTeacher) assignTeacherMutation.mutate(selectedNewTeacher);
  };

  const handleOpenReassignDialog = () => {
    setTeacherSearchTerm("");
    setSelectedNewTeacher(null);
    setIsReassignDialogOpen(true);
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

  // --- LOGIC POLLING (Giữ nguyên logic tay vì custom stop condition phức tạp) ---
  // Bạn có thể dùng useQuery với refetchInterval, nhưng cách này đang ổn cho logic cụ thể
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPollingAI && selectedAssignment) {
      intervalId = setInterval(async () => {
        try {
          const statusData = await exerciseGradingService.getGradingStatus(
            selectedAssignment.exerciseSubmissionId
          );
          const isFinished =
            statusData.aiScore > 0 ||
            (statusData.status !== "PendingAIReview" &&
              statusData.status !== "Pending");

          if (isFinished) {
            setIsPollingAI(false);
            toast.success("AI Grading Completed!");
            setSelectedAssignment((prev) => {
              if (!prev) return null;
              return { ...prev, ...statusData };
            });
            // Refresh lại list bên ngoài
            queryClient.invalidateQueries({
              queryKey: ["grading-assignments"],
            });
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPollingAI, selectedAssignment, queryClient]);

  const handleRetryAI = async () => {
    if (!selectedAssignment) return;
    try {
      setIsPollingAI(true);
      await exerciseGradingService.retryAIGrading(
        selectedAssignment.exerciseSubmissionId
      );
      toast.info("AI is grading... Please wait.");
    } catch (error: any) {
      setIsPollingAI(false);
      toast.error(
        error?.response?.data?.message || "Failed to trigger AI retry"
      );
    }
  };

  // --- Client-Side Processing for Display ---
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
      // ... logic sort cũ
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

  const getStatusColor = (status: string) => {
    /* Giữ nguyên */
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
      console.log(e);
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
              Quản lý chấm điểm bài tập
            </h2>
            <p className="text-muted-foreground">
              Quản lý và chấm điểm các bài tập đã giao cho học viên.
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
              {/* Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm..."
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

                {/* Exercise */}
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

                {/* Status */}
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
                    Đặt lại bộ lọc
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
                <TableHead>Học viên</TableHead>
                <TableHead>Thông tin bài tập</TableHead>
                <TableHead>Giáo viên</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
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
                        Loại:{" "}
                        <span className="font-semibold">
                          {item.exerciseType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{item.assignedTeacherName}</TableCell>
                    <TableCell className="text-sm">
                      <div className="whitespace-nowrap text-xs">
                        Giao vào: {item.assignedAt}
                      </div>
                      <div className="whitespace-nowrap text-xs text-red-500">
                        Thời hạn: {item.deadline}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.isReassigned ? (
                        <div className="flex flex-col gap-1 items-start">
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                          >
                            Đã phân công lại
                          </Badge>
                          <Badge
                            className={`${getStatusColor(
                              item.status
                            )} opacity-50 line-through decoration-slate-400`}
                            variant="outline"
                          >
                            {translateAssignmentStatus(item.status)}
                          </Badge>
                        </div>
                      ) : (
                        /* Hiển thị bình thường nếu chưa Reassign */
                        <Badge
                          className={getStatusColor(item.status)}
                          variant="outline"
                        >
                          {translateAssignmentStatus(item.status)}
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
                    Không tìm thấy kết quả nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Trang {meta.page} of {meta.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page <= 1 || loading}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Trước
            </Button>
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page >= meta.totalPages || loading}
              className="cursor-pointer"
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
                  {/* Case A: Đã được Reassign (Chuyển giao) */}
                  {selectedAssignment.isReassigned ? (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-800 text-sm">
                            Bài tập được phân công lại
                          </h4>
                          <p className="text-sm text-blue-600 mb-3 mt-1">
                            Bài nộp này đã hết hạn/bị hủy và đã được chuyển cho
                            giáo viên mới.
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
                                  Được phân công vào{" "}
                                  {selectedAssignment.reassignedAt}
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-blue-600 bg-blue-50 border-blue-200"
                            >
                              Mới
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
                          Trạng thái bài tập
                        </span>
                        <Badge
                          className={getStatusColor(selectedAssignment.status)}
                        >
                          {translateAssignmentStatus(selectedAssignment.status)}
                        </Badge>
                      </div>
                      {selectedAssignment.isOverdue && (
                        <div className="flex items-center text-red-600 text-sm font-medium gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Bài tập đã quá hạn
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
                          Phân công lại giáo viên
                        </h4>
                        <p className="text-sm text-orange-700 mb-3">
                          Bài tập này đã hết hạn hoặc bị hủy. Bạn có thể phân
                          công lại cho giáo viên khác để tiếp tục chấm điểm.
                        </p>
                        <Button
                          onClick={handleOpenReassignDialog}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Phân công lại giáo viên
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
                        <User className="h-4 w-4" /> Học viên
                      </h4>
                      <p className="font-medium">
                        {selectedAssignment.learnerName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <UserCog className="h-4 w-4" /> Giáo viên gốc
                      </h4>
                      <p className="font-medium flex items-center gap-2">
                        {selectedAssignment.assignedTeacherName}
                        {selectedAssignment.isReassigned && (
                          <span className="text-xs text-red-500 font-normal">
                            (Đã được phân công lại)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Scoring Summary (Existing Code) */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" /> Tóm tắt điểm số
                    </h4>
                    {/* Final Score & Pass Score Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                          Điểm cuối cùng
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
                          /100
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs">
                          {selectedAssignment.finalScore !== null &&
                            (selectedAssignment.finalScore >=
                            (selectedAssignment.passScore || 0) ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-green-600" />{" "}
                                <span className="text-green-700 font-medium">
                                  Đạt
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-red-600" />{" "}
                                <span className="text-red-700 font-medium">
                                  Không đạt
                                </span>
                              </>
                            ))}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                          Điểm đạt
                        </div>
                        <div className="text-3xl font-bold text-slate-700">
                          {selectedAssignment.passScore || "--"}/100
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Mức điểm tối thiểu để đạt bài tập
                        </div>
                      </div>
                    </div>

                    {/* Teacher Feedback Section */}
                    <div className="space-y-2 border rounded-md p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          Phản hồi từ giáo viên
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          Điểm:{" "}
                          {selectedAssignment.teacherScore !== undefined
                            ? selectedAssignment.teacherScore
                            : "--"}
                          /100
                        </Badge>
                      </div>
                      {selectedAssignment.teacherFeedback ? (
                        <div className="text-sm text-gray-600 italic">
                          "{selectedAssignment.teacherFeedback}"
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Chưa có phản hồi từ giáo viên.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ... Rest of existing sheet content (Audio, AI, Timeline) ... */}
                  <Separator />
                  {/* Audio Player */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" /> Bài nói của học viên
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
                        <RobotOutlined className="h-4 w-4" /> Phân tích AI
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
                              Đang chấm điểm...
                            </>
                          ) : (
                            <>
                              <Bot className="mr-1 h-3 w-3" />
                              Thử lại chấm điểm AI
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
                              <span className="font-semibold">
                                Trạng thái:{" "}
                              </span>
                              {selectedAssignment.aiFeedback || "Không có sẵn"}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              Điểm: {selectedAssignment.aiScore}
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
                                Điểm tổng thể
                              </div>
                              <div className="text-xl font-bold">
                                {aiData.overall}/100
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
                                Bản ghi nhận dạng văn bản
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
                                Phản hồi từ AI
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
                      <Clock className="h-4 w-4" /> Thông tin thời gian
                    </h4>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Đã giao:</div>
                      <div>{selectedAssignment.assignedAt}</div>
                      <div className="text-muted-foreground">Hoàn thành:</div>
                      <div>
                        {selectedAssignment.completedAt || "Chưa hoàn thành"}
                      </div>
                      <div className="text-red-500 font-medium">Hạn chót:</div>
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
              <DialogTitle>Chỉ định giáo viên mới</DialogTitle>
              <DialogDescription>
                Tìm kiếm và chọn một giáo viên đủ tiêu chuẩn để chấm bài nộp
                này.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search Bar */}
              <div className="p-4 border-b bg-gray-50/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên hoặc email..."
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
                      Tìm giáo viên...
                    </p>
                  </div>
                ) : eligibleTeachers.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <UserCog className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>Không tìm thấy giáo viên đủ điều kiện.</p>
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
                              Đề xuất
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
                Hủy
              </Button>
              <Button
                onClick={handleConfirmReassign}
                disabled={!selectedNewTeacher || loading}
                className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 transition-colors flex items-center cursor-pointer"
              >
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                )}
                Xác nhận
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
