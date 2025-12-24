/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { message } from "antd";
import { toast } from "react-hot-toast";
import {
  getClassByIdService,
  deleteClassService,
  updateClassService,
  getClassAssignmentsService,
  publishClassService,
  requestCancelClassService,
} from "../../services/class";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  ArrowLeft,
  Book,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Users,
  Wallet,
  Star,
  Zap,
  Ban,
  Trophy,
  Edit,
} from "lucide-react";

import EditClassModal from "./components/EditClassModal";
import ClassEnrollmentList from "./components/ClassEnrollmentList";

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  Draft: {
    label: "Bản nháp",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  Published: {
    label: "Đã xuất bản",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  InProgress: {
    label: "Đang diễn ra",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  Finished: {
    label: "Đã kết thúc",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: <Trophy className="h-3.5 w-3.5" />,
  },
  Completed_PendingPayout: {
    label: "Chờ thanh toán",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Wallet className="h-3.5 w-3.5" />,
  },
  Completed_Paid: {
    label: "Đã thanh toán",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: <Star className="h-3.5 w-3.5" />,
  },
  PendingCancel: {
    label: "Chờ duyệt hủy",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    icon: <Ban className="h-3.5 w-3.5" />,
  },
  Cancelled: {
    label: "Đã hủy",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  Cancelled_InsufficientStudents: {
    label: "Không đủ HV",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: <Users className="h-3.5 w-3.5" />,
  },
};

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleEditSubmit = (values: Partial<any>) => {
    if (!classData) return Promise.reject(new Error("No class selected"));
    setUpdating(true);

    const updateData: Partial<any> = { ...values };
    const statusVal = (classData.status || "").toString().toLowerCase();
    if (statusVal === "cancelled" || statusVal === "canceled") {
      (updateData as any).status = "Draft";
    }

    return updateClassService(classData.classID, updateData)
      .then((res) => {
        toast.success(res.message || "Cập nhật lớp học thành công");
        setEditModal(false);
        refetch();
        queryClient.invalidateQueries({ queryKey: ["class", id] });
        return res;
      })
      .catch((err: any) => {
        toast.error(err?.response?.data?.message || "Cập nhật thất bại");
        throw err;
      })
      .finally(() => setUpdating(false));
  };

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  // Cancel modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["class", id],
    queryFn: () => getClassByIdService(id!),
    enabled: !!id,
  });

  const classData = data?.data;

  // Program assignments list for mapping programAssignmentId -> name/level
  const [programsRes, setProgramsRes] = React.useState<any[]>([]);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getClassAssignmentsService();
        if (!mounted) return;
        setProgramsRes(res.data || []);
      } catch (err) {
        console.error("Failed to load program assignments", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const getProgramLabel = (assignmentId?: string) => {
    if (!assignmentId) return null;
    const found = programsRes.find(
      (p: any) => p.programAssignmentId === assignmentId
    );
    if (found) return `${found.programName} - ${found.levelName}`;
    return null;
  };

  const programLabel =
    getProgramLabel((classData as any)?.programAssignmentId) ||
    (classData as any)?.programName
      ? `${(classData as any).programName}${
          (classData as any).levelName
            ? " - " + (classData as any).levelName
            : ""
        }`
      : null;

  // Handle delete class
  const handleDeleteClass = async () => {
    if (!deleteReason.trim()) {
      toast.error("Vui lòng nhập lý do xóa lớp.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteClassService(id!, deleteReason);
      toast.success(res.message || "Xóa lớp học thành công!");
      setIsDeleteModalOpen(false);
      navigate("/teacher/classes");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa lớp học.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Đang tải thông tin lớp học...
        </p>
      </div>
    );
  }

  if (isError || !classData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-destructive/10 text-destructive p-3 rounded-full">
              <Book className="h-8 w-8" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl">Không tìm thấy lớp học</CardTitle>
            <CardDescription className="mt-2">
              Lớp học bạn đang tìm kiếm có thể không tồn tại hoặc đã bị xóa.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => navigate("/teacher/classes")}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[classData.status] || statusConfig.Draft;

  const statusValue = (classData?.status || "").toString();
  const normalizedStatus = statusValue.toLowerCase();
  const isPublished = normalizedStatus === "published";
  const isCancelled =
    normalizedStatus === "cancelled" || normalizedStatus === "canceled";

  const handlePublish = async () => {
    setUpdating(true);
    try {
      await publishClassService(classData.classID);
      toast.success("Lớp học đã được xuất bản!");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["class", id] });
    } catch (err) {
      toast.error("Không thể xuất bản lớp học.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!cancelReason.trim()) {
      messageApi.error("Vui lòng nhập lý do hủy lớp.");
      return;
    }
    setIsCancelling(true);
    try {
      const now = new Date();
      const start = new Date(classData.startDateTime);
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      if (start.getTime() - now.getTime() >= sevenDaysMs) {
        await deleteClassService(classData.classID, cancelReason);
        messageApi.success("Lớp học đã bị hủy.");
      } else {
        const res = await requestCancelClassService(
          classData.classID,
          cancelReason
        );
        if (res && res.success === false) {
          messageApi.error(res.message);
        } else {
          messageApi.success("Yêu cầu hủy đã được gửi tới quản lý để duyệt.");
        }
      }

      setIsCancelModalOpen(false);
      setCancelReason("");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["class", id] });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Không thể xử lý hủy lớp.";
      messageApi.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
      {contextHolder}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/teacher/classes")}
              className="pl-0 text-muted-foreground hover:text-primary -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại Lịch học
            </Button>
            <h1 className="text-3xl font-bold tracking-tight mt-1">
              {classData.title}
            </h1>
          </div>
        </div>

        {/* Alerts */}
        {isPublished && (
          <Alert
            variant="default"
            className="bg-emerald-50 border-emerald-200 text-emerald-800"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <AlertTitle className="text-emerald-800 font-semibold ml-2">
              Lớp học đang hoạt động!
            </AlertTitle>
            <AlertDescription>
              Học viên có thể tìm và đăng ký lớp học này.
            </AlertDescription>
          </Alert>
        )}
        {normalizedStatus === "pendingcancel" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-semibold ml-2">
              Yêu cầu hủy đang chờ duyệt
            </AlertTitle>
            <AlertDescription>
              Lý do:{" "}
              {(classData as any)?.cancelReason ||
                (classData as any)?.cancellationReason ||
                "Chưa cung cấp."}
            </AlertDescription>
          </Alert>
        )}

        {/* 2. Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>Thông tin chung</CardTitle>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.className}`}
                  >
                    {statusInfo.icon} {statusInfo.label}
                  </div>
                </div>
                <CardDescription className="pt-2">
                  {classData.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Học viên</p>
                    <p className="text-xl font-bold">
                      {classData.currentEnrollments}/{classData.capacity}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày học</p>
                    <p className="text-xl font-bold">
                      {dayjs(classData.startDateTime).format("DD/MM")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian</p>
                    <p className="text-xl font-bold">
                      {dayjs(classData.startDateTime).format("HH:mm")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Học phí</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {(classData.pricePerStudent || 0).toLocaleString("vi-VN")}
                      đ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ClassEnrollmentList classId={id!} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hành động</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {(normalizedStatus === "draft" || isCancelled) && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setEditModal(true)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Sửa thông tin
                    </Button>
                    {normalizedStatus === "draft" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            disabled={updating}
                            className="!text-white cursor-pointer bg-blue-700 hover:bg-blue-500"
                          >
                            {updating ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                            )}
                            Xuất bản lớp học
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Xác nhận xuất bản?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Lớp học sẽ được hiển thị công khai cho học viên.
                              Bạn có chắc chắn muốn tiếp tục?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handlePublish}
                              className="!text-white bg-blue-700 hover:bg-blue-500 cursor-pointer"
                            >
                              Xác nhận
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </>
                )}

                {(isPublished || normalizedStatus === "inprogress") && (
                  <Dialog
                    open={isCancelModalOpen}
                    onOpenChange={setIsCancelModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Ban className="mr-2 h-4 w-4" /> Yêu cầu hủy lớp
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Yêu cầu hủy lớp học</DialogTitle>
                        <DialogDescription>
                          Vui lòng mô tả lý do bạn muốn hủy lớp học này.
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        rows={4}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Lý do hủy..."
                      />
                      <p className="text-sm text-muted-foreground">
                        Lưu ý: Nếu lớp bắt đầu trong vòng 7 ngày tới, yêu cầu sẽ
                        được gửi tới quản lý để duyệt.
                      </p>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsCancelModalOpen(false)}
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={handleCancelRequest}
                          disabled={isCancelling}
                        >
                          {isCancelling ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Gửi yêu cầu
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                <EditClassModal
                  visible={editModal}
                  onClose={() => setEditModal(false)}
                  onSubmit={handleEditSubmit}
                  initialValues={classData || {}}
                  loading={updating}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chi tiết bổ sung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ngôn ngữ</span>
                  <span className="font-semibold">
                    {classData.languageName}
                  </span>
                </div>
                {programLabel && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Chương trình</span>
                    <span className="font-semibold text-right">
                      {programLabel}
                    </span>
                  </div>
                )}
                {classData.googleMeetLink && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-muted-foreground">Link phòng học</p>
                    <a
                      href={classData.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 break-all hover:underline"
                    >
                      {classData.googleMeetLink}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa lớp học?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Lớp học sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            rows={4}
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            placeholder="Lý do xóa..."
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClass}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassDetail;
