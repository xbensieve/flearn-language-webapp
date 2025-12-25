/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dayjs from "dayjs";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Loader2, Trash2 } from "lucide-react";
import type { Class } from "@/services/class/type";
import { getClassAssignmentsService } from "../../../services/class";
import type { ProgramAssignment } from "@/types/createCourse";

interface EditClassModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<Class>) => Promise<any>;
  initialValues: Partial<Class>;
  onDelete?: () => void;
  loading?: boolean;
}

const formSchema = z
  .object({
    title: z.string().min(1, "Vui lòng nhập tên lớp"),
    description: z.string().min(1, "Vui lòng nhập mô tả"),
    programAssignmentId: z.string().min(1, "Vui lòng chọn chương trình"),
    startDateTime: z
      .any()
      .refine((val) => val, { message: "Vui lòng chọn ngày bắt đầu" }),
    minStudents: z.number().min(1, "Tối thiểu 1 học viên"),
    capacity: z.number().min(1, "Tối thiểu 1 học viên"),
    pricePerStudent: z
      .number()
      .min(100000, "Tối thiểu 100.000 VNĐ")
      .max(5000000, "Tối đa 5.000.000 VNĐ"),
    durationMinutes: z.number().min(1, "Thời lượng phải lớn hơn 0"),
    googleMeetLink: z
      .string()
      .url("Link không hợp lệ")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => dayjs(data.startDateTime).isAfter(dayjs().add(6, "day")), {
    message: "Ngày bắt đầu phải cách ít nhất 7 ngày",
    path: ["startDateTime"],
  });

const normalizeDate = (date: any) => {
  if (!date) return undefined;
  const d = dayjs(date);
  const m = d.minute();
  const roundedM = Math.round(m / 15) * 15;
  return d.minute(roundedM).second(0).toDate();
};

const EditClassModal: React.FC<EditClassModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialValues,
  onDelete,
  loading,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      ...initialValues,
      title: initialValues.title || "",
      description: initialValues.description || "",
      programAssignmentId: initialValues.programAssignmentId ? String(initialValues.programAssignmentId) : "",
      startDateTime: initialValues.startDateTime
        ? normalizeDate(initialValues.startDateTime)
        : undefined,
      minStudents: initialValues.minStudents || 1,
      capacity: initialValues.capacity || 1,
      pricePerStudent: initialValues.pricePerStudent || 0,
      durationMinutes: initialValues.durationMinutes || 60,
      googleMeetLink: initialValues.googleMeetLink || "",
    },
  });

  React.useEffect(() => {
    if (visible) {
      form.reset({
        ...initialValues,
        title: initialValues.title || "",
        description: initialValues.description || "",
        programAssignmentId: initialValues.programAssignmentId ? String(initialValues.programAssignmentId) : "",
        startDateTime: initialValues.startDateTime
          ? normalizeDate(initialValues.startDateTime)
          : undefined,
        minStudents: initialValues.minStudents || 1,
        capacity: initialValues.capacity || 1,
        pricePerStudent: initialValues.pricePerStudent || 0,
        durationMinutes: initialValues.durationMinutes || 60,
        googleMeetLink: initialValues.googleMeetLink || "",
      });
    }
  }, [visible, initialValues, form]);

  const [programsRes, setProgramsRes] = React.useState<ProgramAssignment[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] =
    React.useState<boolean>(true);

  React.useEffect(() => {
    let mounted = true;
    if (!visible) return;
    (async () => {
      try {
        setIsLoadingPrograms(true);
        const res = await getClassAssignmentsService();
        if (!mounted) return;
        let programs = res.data || [];
        let currentId = initialValues.programAssignmentId ? String(initialValues.programAssignmentId) : "";

        // Nếu không có ID nhưng có tên chương trình (dạng chuỗi), thử tìm trong danh sách để set ID cho form
        const initAny = initialValues as any;
        if (!currentId && initAny.program && typeof initAny.program === 'string') {
          const found = programs.find((p: any) => 
             `${p.programName} - ${p.levelName}` === initAny.program || 
             p.programName === initAny.program
          );
          if (found) {
              currentId = String(found.programAssignmentId);
              form.setValue('programAssignmentId', currentId);
          }
        }
        
        // Nếu vẫn chưa có ID nhưng có tên chương trình (dạng chuỗi), tạo một option ảo để hiển thị
        if (!currentId && initAny.program && typeof initAny.program === 'string') {
             currentId = "legacy_option";
             form.setValue('programAssignmentId', currentId);
        }

        if (
          currentId &&
          !programs.find((p: any) => String(p.programAssignmentId) === currentId)
        ) {
          // Kiểm tra tên chương trình ở nhiều vị trí (trực tiếp hoặc lồng trong object program)
          const pName = 
            initAny.programName || 
            initAny.ProgramName ||  
            initAny.program?.programName || 
            initAny.program?.name || 
            initAny.program?.title ||
            (typeof initAny.program === 'string' ? initAny.program : 'Chương trình hiện tại');

          const lName = 
            initAny.levelName || 
            initAny.LevelName || 
            initAny.program?.level?.name || 
            initAny.level?.name || 
            initAny.program?.levelName ||
            '';
          
          if (pName) {
            programs = [{
              programAssignmentId: currentId,
              programName: pName,
              levelName: lName,
            } as any, ...programs];
          }
        }
        setProgramsRes(programs);
      } catch (err) {
        console.error("Failed to load programs", err);
      } finally {
        if (mounted) setIsLoadingPrograms(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [visible, initialValues]);

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const start = normalizeDate(values.startDateTime) || new Date(values.startDateTime);
      const end = dayjs(start).add(values.durationMinutes, "minute").toDate();

      const payload: Partial<Class> = {
        ...values,
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
      };

      // Nếu người dùng không thay đổi chương trình (vẫn là option ảo), thì không gửi field này lên
      if (payload.programAssignmentId === "legacy_option") {
        delete payload.programAssignmentId;
      }

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      const serverErr = err?.response?.data;
      if (serverErr?.errors && typeof serverErr.errors === "object") {
        Object.keys(serverErr.errors).forEach((key) => {
          form.setError(key as any, {
            type: "server",
            message: serverErr.errors[key][0],
          });
        });
        return;
      }
      if (serverErr?.message) {
        toast.error(serverErr.message);
        return;
      }
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const formValues = form.watch();
  const estimatedRevenue =
    (formValues.pricePerStudent || 0) * (formValues.capacity || 0);

  const isDraft = (initialValues.status || "").toString().toLowerCase() === "draft";

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl sm:max-w-3xl lg:max-w-4xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin lớp. Thay đổi sẽ chuyển trạng thái Cancelled →
            Draft nếu cần.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* FORM FIELDS - CỘT TRÁI (2/3) */}
            <div className="md:col-span-2 space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên lớp</FormLabel>
                    <FormControl>
                      <Input placeholder="Tên lớp học..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả ngắn về lớp học..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="programAssignmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chương trình giảng dạy</FormLabel>
                    <Select
                      key={programsRes.length}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger disabled={isLoadingPrograms}>
                          <SelectValue placeholder="Chọn chương trình..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {programsRes.map((p) => (
                          <SelectItem
                            key={p.programAssignmentId}
                            value={String(p.programAssignmentId)}
                          >
                            {p.programName} - {p.levelName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDateTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Thời gian bắt đầu</FormLabel>
                    <div className="flex gap-2">
                      <FormControl className="flex-1">
                        <Input
                          type="date"
                          value={
                            field.value
                              ? dayjs(field.value).format("YYYY-MM-DD")
                              : ""
                          }
                          onChange={(e) => {
                            const datePart = e.target.value;
                            if (!datePart) return;
                            const timePart = field.value
                              ? dayjs(field.value).format("HH:mm")
                              : "00:00";
                            field.onChange(
                              dayjs(`${datePart}T${timePart}`).toDate()
                            );
                          }}
                        />
                      </FormControl>
                      <div className="flex gap-2 w-[160px]">
                        <Select
                          value={
                            field.value
                              ? dayjs(field.value).hour().toString()
                              : "0"
                          }
                          onValueChange={(val) => {
                            const current = field.value
                              ? dayjs(field.value)
                              : dayjs().startOf("day");
                            field.onChange(
                              current.hour(parseInt(val)).toDate()
                            );
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Giờ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {Array.from({ length: 24 }).map((_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i.toString().padStart(2, "0")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="flex items-center font-bold">:</span>
                        <Select
                          value={
                            field.value
                              ? dayjs(field.value).minute().toString()
                              : "0"
                          }
                          onValueChange={(val) => {
                            const current = field.value
                              ? dayjs(field.value)
                              : dayjs().startOf("day");
                            field.onChange(
                              current.minute(parseInt(val)).toDate()
                            );
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Phút" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[0, 15, 30, 45].map((m) => (
                              <SelectItem key={m} value={m.toString()}>
                                {m.toString().padStart(2, "0")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tối thiểu HV</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tối đa HV</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pricePerStudent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Học phí (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Nhập học phí"
                          value={field.value ? String(field.value).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[,.]/g, '');
                            if (raw === '' || /^\d+$/.test(raw)) {
                              field.onChange(Number(raw));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời lượng</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value ? String(field.value) : "60"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn thời lượng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="30">30 phút</SelectItem>
                          <SelectItem value="45">45 phút</SelectItem>
                          <SelectItem value="60">60 phút</SelectItem>
                          <SelectItem value="90">90 phút</SelectItem>
                          <SelectItem value="120">120 phút</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="googleMeetLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Meet Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://meet.google.com/..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* PREVIEW CỘT PHẢI (1/3) */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Xem trước thông tin lớp học</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <h4 className="font-semibold text-primary">
                    {formValues.title || "Tên lớp học..."}
                  </h4>
                  <p className="text-muted-foreground line-clamp-3">
                    {formValues.description || "Mô tả ngắn..."}
                  </p>
                  <div className="border-t pt-3">
                    <p>
                      <span className="font-medium text-muted-foreground">
                        Chương trình:
                      </span>{" "}
                      {programsRes.find(
                        (p) =>
                          String(p.programAssignmentId) === 
                          String(formValues.programAssignmentId)
                      )?.programName || 
                      ((initialValues as any).program && typeof (initialValues as any).program === 'string' ? (initialValues as any).program : "...")}
                    </p>
                    <p>
                      <span className="font-medium text-muted-foreground">
                        Ngày bắt đầu:
                      </span>{" "}
                      {formValues.startDateTime
                        ? dayjs(formValues.startDateTime).format("DD/MM/YYYY HH:mm") // Hiển thị Preview theo định dạng 24h
                        : "..."}
                    </p>
                    <p>
                      <span className="font-medium text-muted-foreground">
                        Số lượng:
                      </span>{" "}
                      {formValues.minStudents || "..."} -{" "}
                      {formValues.capacity || "..."} học viên
                    </p>
                    <p>
                      <span className="font-medium text-muted-foreground">
                        Học phí:
                      </span>{" "}
                      {new Intl.NumberFormat("vi-VN").format(
                        formValues.pricePerStudent || 0
                      )}{" "}
                      VNĐ
                    </p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="font-semibold">Dự toán doanh thu</p>
                    <p className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat("vi-VN").format(estimatedRevenue)}{" "}
                      VNĐ
                    </p>
                  </div>
                </CardContent>
              </Card>
           
            </div>
            <DialogFooter className="md:col-span-3 sm:justify-between gap-4">
              {isDraft && onDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  className="mr-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Xóa lớp
                </Button>
              ) : <div />}
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="!text-white bg-blue-700 hover:bg-blue-500 cursor-pointer"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cập nhật
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClassModal;
