import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";

export default function RejectReasonModal({
  open,
  onOpenChange,
  reason,
  setReason,
  onConfirm,
  isProcessing,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] rounded-2xl p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold text-red-600 flex items-center gap-3">
            <Ban className="w-8 h-8" /> Reject Course
          </DialogTitle>

          <DialogDescription>
            Please provide the rejection reason.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={5}
        />

        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            onClick={onConfirm}
            disabled={!reason.trim() || isProcessing}
            className="bg-red-600 hover:bg-red-500 text-white cursor-pointer"
          >
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
