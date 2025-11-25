import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { courseService } from "@/services/course/courseService";
import type {
  CourseSubmission,
  SubmissionStatus,
  MetaData,
} from "@/types/course";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Courses() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<CourseSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "atoz" | "ztoa" | "price-asc" | "price-desc"
  >("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">(
    "all"
  );
  const [page, setPage] = useState(1);
  const [levelFilter, setLevelFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await courseService.getSubmissions({
        Page: page,
        PageSize: 10,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setSubmissions(res.data);
      setMeta(res.meta || null);
    } catch (error) {
      console.error("Failed to load courses", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- LOGIC LỌC CLIENT ---
  const filteredSubmissions = useMemo(() => {
    const filtered = submissions.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.submitter.name.toLowerCase().includes(searchTerm.toLowerCase());

      const itemLevel =
        item.course.program.level.name?.toLowerCase().trim() || "";
      const filterLevel = levelFilter.toLowerCase();
      const matchLevel = levelFilter === "all" || itemLevel === filterLevel;

      let matchPrice = true;
      if (priceFilter === "free") {
        matchPrice = item.course.price === 0;
      } else if (priceFilter === "paid") {
        matchPrice = item.course.price > 0;
      }

      return matchesSearch && matchLevel && matchPrice;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.submittedAt.split("-").reverse().join("-")).getTime() -
            new Date(a.submittedAt.split("-").reverse().join("-")).getTime()
          );
        case "oldest":
          return (
            new Date(a.submittedAt.split("-").reverse().join("-")).getTime() -
            new Date(b.submittedAt.split("-").reverse().join("-")).getTime()
          );
        case "atoz":
          return a.course.title.localeCompare(b.course.title);
        case "ztoa":
          return b.course.title.localeCompare(a.course.title);
        case "price-asc":
          return a.course.price - b.course.price;
        case "price-desc":
          return b.course.price - a.course.price;
        default:
          return 0;
      }
    });
  }, [submissions, searchTerm, levelFilter, priceFilter, sortBy]);
  // ------------------------

  const getTimeAgo = (submittedAt: string) => {
    if (!submittedAt) return "unknown";
    const [day, month, year] = submittedAt.split("-");
    const submittedDate = new Date(`${year}-${month}-${day}`);
    if (isNaN(submittedDate.getTime())) return "invalid date";
    const now = new Date();
    const diffMs = now.getTime() - submittedDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "just now";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200";
      case "Pending":
        return "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200";
      case "Rejected":
        return "bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // --- PAGINATION LOGIC ---
  const renderPaginationButtons = () => {
    if (!meta || meta.totalPages <= 1) return null;

    const buttons = [];
    const totalPages = meta.totalPages;
    const currentPage = page;

    const renderButton = (pageNum: number) => (
      <Button
        key={pageNum}
        variant={pageNum === currentPage ? "default" : "outline"}
        size="icon"
        className={`w-9 h-9 transition-all font-medium ${
          pageNum === currentPage
            ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm"
            : "text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-blue-600"
        }`}
        onClick={() => setPage(pageNum)}
      >
        {pageNum}
      </Button>
    );

    const renderEllipsis = (key: string) => (
      <div key={key} className="flex items-center justify-center w-9 h-9">
        <MoreHorizontal className="h-4 w-4 text-slate-400" />
      </div>
    );

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) buttons.push(renderButton(i));
    } else {
      buttons.push(renderButton(1));

      if (currentPage > 3) buttons.push(renderEllipsis("start-dot"));

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      let adjustedStart = start;
      let adjustedEnd = end;

      if (currentPage < 3) adjustedEnd = 4;
      if (currentPage > totalPages - 2) adjustedStart = totalPages - 3;

      for (let i = adjustedStart; i <= adjustedEnd; i++) {
        if (i > 1 && i < totalPages) buttons.push(renderButton(i));
      }

      if (currentPage < totalPages - 2) buttons.push(renderEllipsis("end-dot"));

      buttons.push(renderButton(totalPages));
    }

    return buttons;
  };

  return (
    <DashboardLayout>
      <div className="font-sans space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Course Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review and manage instructor course submissions.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm">
          <div className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by course title, teacher name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 h-10 text-base bg-gray-50 focus:bg-white border border-gray-200 rounded-md focus:ring-4 focus:ring-blue-500/10"
                />
                {loading && searchTerm && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 pt-5 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filter by</span>
              </div>
              {/* Level Filter (Client-side) */}
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[180px] h-10 bg-gray-50 cursor-pointer">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">All Levels</SelectItem>

                  <SelectGroup>
                    <SelectLabel className="text-xs font-bold text-slate-500 mt-2 px-2">
                      English (CEFR)
                    </SelectLabel>
                    <SelectItem value="A1">A1 (Beginner)</SelectItem>
                    <SelectItem value="A2">A2 (Elementary)</SelectItem>
                    <SelectItem value="B1">B1 (Intermediate)</SelectItem>
                    <SelectItem value="B2">B2 (Upper Intermediate)</SelectItem>
                    <SelectItem value="C1">C1 (Advanced)</SelectItem>
                    <SelectItem value="C2">C2 (Proficiency)</SelectItem>
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel className="text-xs font-bold text-slate-500 mt-2 px-2">
                      Japanese (JLPT)
                    </SelectLabel>
                    <SelectItem value="N5">N5 (Basic)</SelectItem>
                    <SelectItem value="N4">N4 (Elementary)</SelectItem>
                    <SelectItem value="N3">N3 (Intermediate)</SelectItem>
                    <SelectItem value="N2">N2 (Pre-Advanced)</SelectItem>
                    <SelectItem value="N1">N1 (Advanced)</SelectItem>
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel className="text-xs font-bold text-slate-500 mt-2 px-2">
                      Chinese (HSK)
                    </SelectLabel>
                    <SelectItem value="HSK1">HSK 1</SelectItem>
                    <SelectItem value="HSK2">HSK 2</SelectItem>
                    <SelectItem value="HSK3">HSK 3</SelectItem>
                    <SelectItem value="HSK4">HSK 4</SelectItem>
                    <SelectItem value="HSK5">HSK 5</SelectItem>
                    <SelectItem value="HSK6">HSK 6</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-[130px] h-10 bg-gray-50 cursor-pointer">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(val: SubmissionStatus) => setStatusFilter(val)}
              >
                <SelectTrigger className="w-[130px] h-10 bg-gray-50 border-gray-200 cursor-pointer">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(val: any) => setSortBy(val)}
              >
                <SelectTrigger className="w-[200px] h-10 bg-gray-50 cursor-pointer">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="atoz">Title: A → Z</SelectItem>
                  <SelectItem value="ztoa">Title: Z → A</SelectItem>
                  <SelectItem value="price-asc">Price: Low → High</SelectItem>
                  <SelectItem value="price-desc">Price: High → Low</SelectItem>
                </SelectContent>
              </Select>
              {(levelFilter !== "all" ||
                priceFilter !== "all" ||
                sortBy !== "newest") && (
                <button
                  onClick={() => {
                    setLevelFilter("all");
                    setPriceFilter("all");
                    setSortBy("newest");
                  }}
                  className="text-blue-600 font-medium hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[380px] rounded-lg" />
            ))}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-sm border border-dashed">
            <p className="text-slate-500">
              No courses match your filters on this page.
            </p>
            <Button
              variant="link"
              onClick={() => {
                setLevelFilter("all");
                setPriceFilter("all");
                setSortBy("newest");
                setSearchTerm("");
              }}
              className="cursor-pointer"
            >
              Clear all filters & search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSubmissions.map((item: CourseSubmission) => (
              <div
                key={item.submissionId}
                className="group flex flex-col bg-white rounded-sm border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() =>
                  navigate(`/dashboard/courses/${item.course.courseId}`, {
                    state: { submissionId: item.submissionId },
                  })
                }
              >
                {/* 1. IMAGE SECTION */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={item.course.imageUrl}
                    alt={item.course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlay gradient nhẹ khi hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

                  {/* Status Badge - Floating top right */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      className={`${getStatusColor(
                        item.submissionStatus
                      )} border shadow-sm font-semibold px-3 py-1 rounded-full uppercase text-[10px] tracking-wide`}
                    >
                      {item.submissionStatus}
                    </Badge>
                  </div>
                </div>

                {/* 2. CARD BODY */}
                <div className="p-5 flex flex-col flex-grow">
                  {/* Metadata Row: Level & Price */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="default"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 rounded-sm font-medium text-sm px-2"
                      >
                        <span className="mr-1.5">Level:</span>
                        {item.course.program.level.name}
                      </Badge>
                    </div>
                    <span
                      className={`text-2xl font-sans font-medium ${
                        item.course.price === 0
                          ? "text-green-600"
                          : "text-slate-700"
                      }`}
                    >
                      {item.course.price === 0
                        ? "Free"
                        : `đ${item.course.price.toLocaleString()}`}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors font-sans">
                    {item.course.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-sans">Teacher:</span>
                    <img
                      src={item.submitter.avatar}
                      alt={item.submitter.name}
                      className="w-5 h-5 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-xs text-slate-600 font-medium truncate">
                      {item.submitter.name}
                    </span>
                  </div>

                  <p className="font-sans text-sm text-slate-950 line-clamp-2 mb-4 flex-grow leading-relaxed">
                    <span>Description:</span> {item.course.description}
                  </p>

                  <div className="pt-4 mt-auto border-t border-slate-100 flex flex-col gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Submitted:{" "}
                        <span className="font-medium text-slate-700">
                          {item.submittedAt}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">
                        Status changed{" "}
                        <span className="text-emerald-600 font-medium">
                          {getTimeAgo(item.submittedAt)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 gap-4 border-t border-slate-100 mt-6">
            <div className="text-sm text-slate-500 font-medium order-2 sm:order-1">
              Showing page{" "}
              <span className="text-slate-900 font-bold">{page}</span> of{" "}
              <span className="text-slate-900 font-bold">
                {meta.totalPages}
                <br />
              </span>
              <span className="hidden sm:inline">
                ({meta.totalItems} items total)
              </span>
            </div>
            <div className="flex items-center gap-1 order-1 sm:order-2 bg-white p-1 rounded-lg">
              <Button
                variant="outline"
                size="icon"
                className="w-9 h-9 border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-1 mx-1">{renderPaginationButtons()}</div>
              <Button
                variant="outline"
                size="icon"
                className="w-9 h-9 border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
