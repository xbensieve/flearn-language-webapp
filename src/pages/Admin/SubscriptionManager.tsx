// src/pages/admin/SubscriptionManager.tsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Search,
  Package,
} from "lucide-react";
import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from "@/services/subscriptions/subscription";
import type {
  SubscriptionPlan,
  CreateSubscriptionPlanDto,
} from "@/types/subscription";

// --- UTILS ---
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// --- UI COMPONENTS ---
const Button = ({
  children,
  variant = "primary",
  size = "default",
  className,
  isLoading,
  type = "button",
  ...props
}: any) => {
  const base =
    "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants: any = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
    destructive:
      "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg",
    outline:
      "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700",
    ghost: "hover:bg-slate-100 text-slate-600",
  };

  const sizes: any = {
    default: "h-10 px-5 py-2",
    sm: "h-9 px-4",
    icon: "h-9 w-9",
    lg: "h-11 px-8",
  };

  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

const Input = React.forwardRef<HTMLInputElement, any>((props, ref) => (
  <input
    ref={ref}
    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all"
    {...props}
  />
));

const Label = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
    {children} {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

// --- MAIN COMPONENT ---
const SubscriptionManager = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );

  const [formData, setFormData] = useState<CreateSubscriptionPlanDto>({
    name: "",
    price: 0,
    conversationQuota: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["subscription-plans", page],
    queryFn: () => getSubscriptionPlans(page),
  });

  const createMutation = useMutation({
    mutationFn: createSubscriptionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      toast.success("Tạo gói dịch vụ thành công");
      closeModal();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Lỗi khi tạo gói"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateSubscriptionPlanDto) =>
      updateSubscriptionPlan(selectedPlan!.subscriptionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      toast.success("Cập nhật thành công");
      closeModal();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Lỗi cập nhật"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSubscriptionPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      toast.success("Đã xóa gói dịch vụ");
      setIsDeleteOpen(false);
      setSelectedPlan(null);
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Lỗi khi xóa"),
  });

  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      conversationQuota: plan.conversationQuota,
    });
    setIsOpen(true);
  };

  const handleDeleteClick = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsDeleteOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedPlan(null);
    setFormData({ name: "", price: 0, conversationQuota: 0 });
  };

  const validate = () => {
    if (!formData.name || !formData.name.trim())
      return "Vui lòng nhập tên gói dịch vụ";

    if (formData.price === undefined || formData.price === null)
      return "Vui lòng nhập giá tiền";
    if (formData.price < 5000) return "Giá gói tối thiểu là 5,000đ";
    if (formData.price > 5000000) return "Giá gói tối đa là 5,000,000đ";

    if (
      formData.conversationQuota === undefined ||
      formData.conversationQuota === null
    )
      return "Vui lòng nhập giới hạn AI";
    if (formData.conversationQuota < 0) return "Quota không được là số âm";
    if (formData.conversationQuota > 100) return "Quota tối đa là 100 lượt";

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    if (selectedPlan) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const totalItems = data?.meta?.totalItems || 0;
  const totalPages = data?.meta?.totalPages || 1;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            Quản lý Gói Dịch Vụ
          </h1>
          <p className="text-slate-500 mt-2">
            Thiết lập và quản lý các gói subscription cho người dùng.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-lg font-medium">
            Tổng: <span className="font-bold text-slate-900">{totalItems}</span>{" "}
            gói
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="!text-white cursor-pointer"
          >
            <Plus className="mr-2 h-5 w-5" /> Thêm gói mới
          </Button>
        </div>
      </div>

      {/* Search Bar (chỉ UI) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Tìm kiếm gói dịch vụ..."
          className="pl-10 bg-slate-50 border-slate-200"
          disabled // chưa có logic search
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Tên gói
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Quota AI
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.data?.map((plan) => (
                    <tr
                      key={plan.subscriptionId}
                      className="hover:bg-slate-50/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-5 text-sm font-medium text-slate-500">
                        #{plan.subscriptionId}
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-semibold text-slate-900">
                          {plan.name}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700">
                          {plan.price.toLocaleString("vi-VN")} ₫
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
                          {plan.conversationQuota} lượt
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500">
                        {plan.createdAt}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(plan)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(plan)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {(!data?.data || data.data.length === 0) && (
                    <tr>
                      <td colSpan={6} className="text-center py-16">
                        <div className="flex flex-col items-center">
                          <div className="bg-slate-100 p-5 rounded-full mb-4">
                            <Package className="h-12 w-12 text-slate-400" />
                          </div>
                          <p className="text-slate-500 font-medium">
                            Chưa có gói dịch vụ nào
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                            Nhấn "Thêm gói mới" để bắt đầu
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Trang <span className="font-semibold">{page}</span> /{" "}
                  {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <h3 className="text-xl font-bold">
                {selectedPlan ? "Chỉnh sửa gói dịch vụ" : "Tạo gói dịch vụ mới"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <Label required>Tên gói dịch vụ</Label>
                <Input
                  value={formData.name}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ví dụ: Gói Cơ Bản, Gói Pro..."
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label required>Giá (VNĐ)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e: any) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Từ 5.000đ → 5.000.000đ
                  </p>
                </div>

                <div>
                  <Label required>Quota AI (lượt hội thoại)</Label>
                  <Input
                    type="number"
                    value={formData.conversationQuota}
                    onChange={(e: any) =>
                      setFormData({
                        ...formData,
                        conversationQuota: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                  <p className="text-xs text-slate-500 mt-1">Tối đa 100 lượt</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {selectedPlan ? "Lưu thay đổi" : "Tạo gói mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setIsDeleteOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-5">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Xóa gói dịch vụ?
            </h3>
            <p className="text-slate-600 mb-8">
              Bạn chắc chắn muốn xóa gói{" "}
              <span className="font-bold text-red-600">
                {selectedPlan.name}
              </span>
              ?<br />
              Hành động này <strong>không thể hoàn tác</strong>.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                size="lg"
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={() =>
                  deleteMutation.mutate(selectedPlan.subscriptionId)
                }
                isLoading={deleteMutation.isPending}
              >
                Xóa vĩnh viễn
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
