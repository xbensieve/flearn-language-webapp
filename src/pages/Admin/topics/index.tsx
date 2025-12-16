import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getTopicsService,
  createTopicService,
  updateTopicService,
  deleteTopicService,
} from "@/services/topic/topicService";
import type { TopicResponse, PagedResponse } from "@/types/topic";
import { TopicForm } from "./TopicForm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TopicPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isOpen, setIsOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicResponse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 1. Fetch Data
  const { data, isLoading } = useQuery<PagedResponse<TopicResponse[]>>({
    // Thêm pageSize vào queryKey để tự động fetch lại khi đổi size
    queryKey: ["topics", page, pageSize],
    // Truyền pageSize vào hàm service
    queryFn: () => getTopicsService(page, pageSize),
    placeholderData: keepPreviousData,
  });

  // ... (Phần Mutation giữ nguyên như câu trả lời trước) ...
  const createMutation = useMutation({
    mutationFn: createTopicService,
    onSuccess: () => {
      toast.success("Tạo chủ đề thành công");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
    onError: (err: any) => toast.error(err.message || "Lỗi khi tạo"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateTopicService(id, data),
    onSuccess: () => {
      toast.success("Cập nhật thành công");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
    onError: (err: any) => toast.error(err.message || "Lỗi khi cập nhật"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTopicService,
    onSuccess: () => {
      toast.success("Xóa chủ đề thành công");
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
    onError: (err: any) =>
      toast.error(err.message || "Không thể xóa chủ đề này"),
  });

  const handleEdit = (topic: TopicResponse) => {
    setEditingTopic(topic);
    setIsOpen(true);
  };

  const handleCreate = () => {
    setEditingTopic(null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingTopic(null);
  };

  const handleSubmit = (values: any) => {
    if (editingTopic) {
      updateMutation.mutate({ id: editingTopic.topicId, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Chủ đề</h1>
          <p className="text-muted-foreground text-sm">
            Danh sách các chủ đề khóa học trong hệ thống.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="w-full sm:w-auto bg-blue-400 hover:bg-blue-300 cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm mới
        </Button>
      </div>

      {/* Table Section */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Hình ảnh</TableHead>
              <TableHead className="min-w-[150px]">Tên chủ đề</TableHead>
              <TableHead className="hidden md:table-cell">Mô tả</TableHead>
              <TableHead className="w-[100px]">Trạng thái</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5 text-gray-500" />{" "}
                    Đang tải...
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((topic) => (
                <TableRow key={topic.topicId}>
                  <TableCell>
                    <img
                      src={topic.imageUrl || "/placeholder.png"}
                      alt={topic.topicName}
                      className="h-10 w-10 rounded object-cover bg-gray-100"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {topic.topicName}
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[300px] truncate text-muted-foreground">
                    {topic.topicDescription}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        topic.status
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "bg-rose-500 text-white hover:bg-rose-600"
                      }
                    >
                      {topic.status ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(topic)}>
                          <Pencil className="mr-2 h-4 w-4" /> Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(topic.topicId)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không tìm thấy dữ liệu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.meta && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
          {/* Chọn Page Size */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Hiển thị</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1); // Quan trọng: Reset về trang 1 khi đổi size
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>kết quả mỗi trang</span>
          </div>

          {/* Nút chuyển trang */}
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium mr-2">
              Trang {data.meta.page} / {data.meta.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1 || isLoading}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((old) => old + 1)}
              disabled={page >= data.meta.totalPages || isLoading}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Các Dialog (Create/Edit, Delete) giữ nguyên */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTopic ? "Cập nhật chủ đề" : "Tạo chủ đề mới"}
            </DialogTitle>
          </DialogHeader>
          <TopicForm
            initialData={editingTopic}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
            onCancel={closeModal}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TopicPage;
