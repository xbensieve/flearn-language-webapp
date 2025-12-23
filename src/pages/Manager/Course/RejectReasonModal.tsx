import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";

interface RejectReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  setReason: (value: string) => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export default function RejectReasonModal({
  open,
  onOpenChange,
  reason,
  setReason,
  onConfirm,
  isProcessing,
}: RejectReasonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 rounded-xl">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-600" />
            Từ chối yêu cầu duyệt khóa học
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <div className="text-xs text-gray-500">
              Vui lòng cung cấp lý do cụ thể để người tạo khóa học có thể hiểu
              và cải thiện.
            </div>
            <textarea
              className="w-full min-h-[120px] p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none transition-all"
              placeholder="Nhập lý do từ chối ở đây..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isProcessing}
            />
          </div>
        </div>

        <DialogFooter className="p-4 bg-gray-50 border-t flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="hover:bg-gray-200 text-gray-700 cursor-pointer"
          >
            Hủy
          </Button>

          <Button
            onClick={onConfirm}
            disabled={!reason.trim() || isProcessing}
            className="bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all cursor-pointer"
          >
            {isProcessing ? "Đang từ chối..." : "Xác nhận từ chối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
