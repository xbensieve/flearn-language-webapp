import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  managerDashboardService,
  type CancellationRequest,
} from "@/services/manager/managerDashboard.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  Mail,
  BookOpen,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";

export default function CancellationRequests() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<CancellationRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [approveNote, setApproveNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: cancellationData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["cancellation-requests"],
    queryFn: () => managerDashboardService.getPendingCancellationRequests(),
  });

  const requests = cancellationData?.data || [];
  const filteredRequests = requests.filter(
    (request) =>
      request.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.teacherEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetail = (request: CancellationRequest) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleOpenApprove = (request: CancellationRequest) => {
    setSelectedRequest(request);
    setApproveNote("");
    setIsApproveModalOpen(true);
  };

  const handleOpenReject = (request: CancellationRequest) => {
    setSelectedRequest(request);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      await managerDashboardService.approveCancellationRequest(
        selectedRequest.cancellationRequestId,
        approveNote || undefined
      );
      toast.success("Yêu cầu hủy đã được chấp thuận thành công!");
      setIsApproveModalOpen(false);
      setSelectedRequest(null);
      queryClient.invalidateQueries({ queryKey: ["cancellation-requests"] });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể chấp nhận yêu cầu."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!rejectReason.trim()) {
      toast.warning("Vui lòng cung cấp lý do từ chối.");
      return;
    }

    setIsSubmitting(true);
    try {
      await managerDashboardService.rejectCancellationRequest(
        selectedRequest.cancellationRequestId,
        rejectReason
      );
      toast.success("Yêu cầu hủy đã bị từ chối thành công!");
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      queryClient.invalidateQueries({ queryKey: ["cancellation-requests"] });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể từ chối yêu cầu."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Đang xét duyệt
          </Badge>
        );
      case "Approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Đã duyệt
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Từ chối
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Đang tải yêu cầu hủy...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="mt-4 text-gray-600">Không tải được yêu cầu hủy.</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6 min-h-screen">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Yêu cầu hủy
            </h2>
            <p className="text-muted-foreground mt-1">
              Xem xét và quản lý các yêu cầu hủy lớp học từ giáo viên.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo lớp hoặc giáo viên..."
                className="pl-10 w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Tổng số yêu cầu đang chờ xử lý
              </CardTitle>
              <div className="rounded-full p-2 bg-amber-100">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {cancellationData?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Đang chờ đánh giá của bạn
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Giáo viên
              </CardTitle>
              <div className="rounded-full p-2 bg-blue-100">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {new Set(requests.map((r) => r.teacherId)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Giáo viên có yêu cầu đang chờ xử lý
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Yêu cầu hủy đang chờ xử lý</CardTitle>
            <CardDescription>
              Xem xét từng yêu cầu và thực hiện hành động thích hợp.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="mt-4 text-gray-600 font-medium">
                  Không có yêu cầu đang chờ xử lý
                </p>
                <p className="text-sm text-gray-400">
                  Tất cả các yêu cầu hủy đã được xử lý.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[25%]">Tên lớp</TableHead>
                    <TableHead className="w-[20%]">Giáo viên</TableHead>
                    <TableHead className="w-[15%]">Ngày bắt đầu</TableHead>
                    <TableHead className="w-[10%]">Trạng thái</TableHead>
                    <TableHead className="text-right w-[30%]">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const startDate = dayjs(request.classStartDateTime);
                    const now = dayjs();
                    const daysUntilStart = startDate.diff(now, "day");
                    const isUrgent = daysUntilStart <= 1;

                    return (
                      <TableRow
                        key={request.cancellationRequestId}
                        className={`group hover:bg-slate-50 ${
                          isUrgent ? "bg-red-50/50" : ""
                        }`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isUrgent && (
                              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-medium text-slate-900">
                                {request.className}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {request.reason}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-700">
                              {request.teacherName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {request.teacherEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-700">
                              {startDate.format("DD/MM/YYYY")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {startDate.format("HH:mm")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetail(request)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Xem
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleOpenApprove(request)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleOpenReject(request)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Yêu cầu chi tiết
            </DialogTitle>
            <DialogDescription>
              Chi tiết đầy đủ về yêu cầu hủy.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Tên lớp
                  </Label>
                  <p className="font-medium">{selectedRequest.className}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Ngày & Giờ bắt đầu
                  </Label>
                  <p className="font-medium">
                    {dayjs(selectedRequest.classStartDateTime).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> Tên giáo viên
                  </Label>
                  <p className="font-medium">{selectedRequest.teacherName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email giáo viên
                  </Label>
                  <p className="font-medium text-sm">
                    {selectedRequest.teacherEmail}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Trạng thái
                </Label>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Lý do hủy bỏ
                </Label>
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {selectedRequest.reason}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailModalOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Phê duyệt yêu cầu hủy
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn chấp thuận yêu cầu hủy này không? Lớp học sẽ
              bị hủy và học viên đã đăng ký sẽ được thông báo.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-medium text-green-800">
                  {selectedRequest.className}
                </p>
                <p className="text-sm text-green-600">
                  bởi {selectedRequest.teacherName}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="approveNote">Ghi chú (tùy chọn)</Label>
                <Textarea
                  id="approveNote"
                  placeholder="Thêm ghi chú cho giáo viên..."
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Duyệt
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Từ chối yêu cầu hủy
            </DialogTitle>
            <DialogDescription>
              Vui lòng cung cấp lý do từ chối yêu cầu hủy này. Giáo viên sẽ phải
              tiếp tục lớp học.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="font-medium text-red-800">
                  {selectedRequest.className}
                </p>
                <p className="text-sm text-red-600">
                  bởi {selectedRequest.teacherName}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejectReason">
                  Lý do từ chối <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="rejectReason"
                  placeholder="Please explain why this request is being rejected..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Từ chối...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Từ chối yêu cầu
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
