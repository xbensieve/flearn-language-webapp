import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  BookOpen,
  Users,
  ArrowUpDown,
  LayoutGrid,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

// --- Services & Utils ---
import {
  getTeacherCoursesService,
  deleteCourseService,
} from "../../services/course";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- Constants ---
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  Draft: {
    label: "Draft",
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
  },
  PendingApproval: {
    label: "Pending",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  Published: {
    label: "Published",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  Rejected: {
    label: "Rejected",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
  Archived: {
    label: "Archived",
    color: "text-gray-700",
    bg: "bg-gray-100 border-gray-200",
  },
};

export default function MyCourses() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<
    "default" | "price_asc" | "price_desc"
  >("default");

  // State quản lý việc xóa
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- QUERIES ---
  const { data, isLoading } = useQuery({
    queryKey: ["courses", status === "ALL" ? "" : status, page, pageSize],
    queryFn: () =>
      getTeacherCoursesService({
        status: status === "ALL" ? "" : status,
        page,
        pageSize,
      }),
    staleTime: 0,
    retry: 1,
  });

  // --- MUTATIONS ---
  const { mutate: deleteCourse, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteCourseService(id),
    onSuccess: () => {
      toast.success("Course deleted successfully");
      // Refresh lại list sau khi xóa
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setDeleteId(null);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to delete course";
      toast.error(msg);
    },
  });

  // --- DATA PROCESSING ---
  const rawCourses = data?.data || [];
  const totalItems = data?.meta?.totalItems || 0;

  const processedCourses = useMemo(() => {
    let result = [...rawCourses];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    if (sortOrder !== "default") {
      result.sort((a, b) => {
        const priceA = Number(a.discountPrice || a.price);
        const priceB = Number(b.discountPrice || b.price);
        return sortOrder === "price_asc" ? priceA - priceB : priceB - priceA;
      });
    }

    return result;
  }, [rawCourses, searchQuery, sortOrder]);

  const formatCurrency = (val: string | number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(val));

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteCourse(deleteId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8 font-sans text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Courses
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your curriculum and track learner progress.
          </p>
        </div>
        <Button
          onClick={() => navigate("create")}
          className="bg-blue-600 hover:bg-blue-700 !text-white shadow-sm h-10 px-6 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-md border border-slate-200 shadow-sm sticky top-4 z-20">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search courses..."
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-slate-50 border-slate-200 cursor-pointer">
              <div className="flex items-center gap-2 text-slate-600">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="PendingApproval">Pending</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Price Sort */}
          <Select
            value={sortOrder}
            onValueChange={(val: "default" | "price_asc" | "price_desc") =>
              setSortOrder(val)
            }
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-slate-50 border-slate-200 cursor-pointer">
              <div className="flex items-center gap-2 text-slate-600">
                <ArrowUpDown className="w-4 h-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card
              key={i}
              className="overflow-hidden border-slate-200 shadow-none"
            >
              <Skeleton className="h-48 w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="pt-4 flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : processedCourses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {processedCourses.map((course) => {
              const statusConfig =
                STATUS_CONFIG[course.courseStatus] || STATUS_CONFIG.Archived;
              const isFree = Number(course.price) === 0;
              const canEdit = ["Draft", "Rejected", "PendingApproval"].includes(
                course.courseStatus
              );

              return (
                <Card
                  key={course.courseId}
                  className="group flex flex-col overflow-hidden border-slate-200 hover:border-blue-300 hover:shadow-lg rounded-sm transition-all duration-300 bg-white"
                >
                  {/* Image & Badge */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={course.imageUrl || "/placeholder.jpg"}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant="secondary"
                        className={`${statusConfig.bg} ${statusConfig.color} border font-medium px-2.5 py-0.5 shadow-sm`}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Body */}
                  <CardContent className="flex-1 p-5 flex flex-col gap-3">
                    <h3 className="font-semibold text-lg leading-tight text-slate-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-sm text-slate-500 line-clamp-2">
                      {course.description || "No description provided."}
                    </p>

                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <div className="flex flex-col">
                        {isFree ? (
                          <span className="text-emerald-600 font-bold text-lg">
                            FREE
                          </span>
                        ) : course.discountPrice ? (
                          <>
                            <span className="text-xs text-slate-400 line-through">
                              {formatCurrency(course.price)}
                            </span>
                            <span className="text-blue-700 font-bold text-lg">
                              {formatCurrency(course.discountPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-blue-700 font-bold text-lg">
                            {formatCurrency(course.price)}
                          </span>
                        )}
                      </div>

                      {course.learnerCount !== undefined && (
                        <div className="flex items-center text-slate-400 text-xs gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          <Users className="w-3 h-3" />
                          <span>{course.learnerCount}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Footer / Actions */}
                  <CardFooter className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <Button
                      variant="ghost"
                      className="flex-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      onClick={() => navigate(`${course.courseId}`)}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      View
                    </Button>

                    {canEdit && (
                      <Button
                        variant="ghost"
                        className="flex-1 text-slate-600 hover:text-green-600 hover:bg-green-50 cursor-pointer"
                        onClick={() => navigate(`${course.courseId}/edit`)}
                      >
                        Edit
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => navigate(`${course.courseId}`)}
                        >
                          View Details
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => navigate(`${course.courseId}/edit`)}
                          >
                            Edit Content
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                          onClick={() => setDeleteId(course.courseId)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* --- Pagination --- */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">
              Showing <strong>{processedCourses.length}</strong> of{" "}
              <strong>{totalItems}</strong> results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={processedCourses.length < pageSize}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-md border border-dashed border-slate-300">
          <div className="h-16 w-16 bg-slate-50 rounded-md flex items-center justify-center mb-4">
            <LayoutGrid className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            No courses found
          </h3>
          <p className="text-slate-500 max-w-sm text-center mt-2 mb-6">
            {searchQuery
              ? `We couldn't find any courses matching "${searchQuery}".`
              : "Get started by creating your first course today."}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => navigate("create")}
              className="bg-blue-600 hover:bg-blue-700 !text-white cursor-pointer"
            >
              Create Course
            </Button>
          )}
        </div>
      )}

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Course?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be
              undone, and all associated data (lessons, exercises) will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <div></div>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
