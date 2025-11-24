import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import {
  applicationService,
  type TeacherApplication,
  type ApplicationQueryParams,
} from "@/services/teacher/applicationService";
import { useNavigate } from "react-router-dom";

export default function TeacherApplications() {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filters & UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [sortOption, setSortOption] = useState<
    "newest" | "oldest" | "name-asc" | "name-desc"
  >("newest");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Fetch data (server-side pagination + filter by status)
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params: ApplicationQueryParams = {
        Page: 1,
        PageSize: 500, // Lấy nhiều để làm client-side search & sort
        status: statusFilter !== "all" ? statusFilter : undefined,
      };

      const response = await applicationService.getApplications(params);
      if (response?.data) {
        setApplications(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Reset page khi thay đổi filter/search/sort
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, sortOption]);

  // Client-side: Search + Sort + Filter (status đã filter ở server)
  const processedData = useMemo(() => {
    let filtered = [...applications];

    // Search client-side
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.fullName.toLowerCase().includes(term) ||
          app.email.toLowerCase().includes(term) ||
          app.phoneNumber.includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.submittedAt).getTime() -
            new Date(b.submittedAt).getTime()
          );
        case "name-asc":
          return a.fullName.localeCompare(b.fullName);
        case "name-desc":
          return b.fullName.localeCompare(a.fullName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [applications, searchTerm, sortOption]);

  // Pagination client-side
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return processedData.slice(start, end);
  }, [processedData, page]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  // Status badge
  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      Approved: {
        color:
          "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
        icon: CheckCircle2,
      },
      Pending: {
        color:
          "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200",
        icon: Clock,
      },
      Rejected: {
        color: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200",
        icon: XCircle,
      },
    };

    const { color, icon: Icon } = config[status] || {
      color: "bg-slate-100 text-slate-700",
      icon: Clock,
    };

    return (
      <Badge
        className={`${color} border font-medium text-xs px-2 py-0.5 flex items-center gap-1`}
      >
        <Icon className="w-3.5 h-3.5" />
        {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Teacher Applications
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage and review all teacher registration requests
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Search */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="md:col-span-3">
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as any)}
              >
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="md:col-span-4">
              <Select
                value={sortOption}
                onValueChange={(v) => setSortOption(v as any)}
              >
                <SelectTrigger>
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name A to Z</SelectItem>
                  <SelectItem value="name-desc">Name Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Result count */}
          <div className="mt-3 text-sm text-slate-500">
            Found <strong>{processedData.length}</strong> application
            {processedData.length !== 1 ? "s" : ""}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="divide-y divide-slate-100">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="p-6">
                  <Skeleton className="h-16 w-full rounded" />
                </div>
              ))}
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">
                No applications found
              </h3>
              <p className="text-slate-500 mt-1">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/90">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Certificates</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right w-24">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((app, index) => (
                  <TableRow
                    key={app.applicationID}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() =>
                      console.log("View detail:", app.applicationID)
                    } // Thay bằng mở modal
                  >
                    <TableCell className="font-medium text-slate-500">
                      {(page - 1) * pageSize + index + 1}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                          <AvatarImage src={app.avatar} alt={app.fullName} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-sm">
                            {app.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-slate-900">
                            {app.fullName}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Born {app.dateOfBirth}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[180px]">
                            {app.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <Phone className="w-3.5 h-3.5" />
                          {app.phoneNumber}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {app.language} ({app.proficiencyCode})
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-medium text-slate-700">
                        {app.certificates.length} certificate
                        {app.certificates.length !== 1 ? "s" : ""}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-slate-600">
                      {app.submittedAt}
                    </TableCell>

                    <TableCell className="text-center">
                      {getStatusBadge(app.status)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/teachers/${app.applicationID}`);
                        }}
                      >
                        <Eye className="h-4 w-4 text-slate-500 hover:text-blue-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> (
              {processedData.length} total)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
