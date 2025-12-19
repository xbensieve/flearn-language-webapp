/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


import { GraduationCap, CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Class } from '@/services/class/type';
import { getClassAssignmentsService } from '../../../services/class';
import type { ProgramAssignment } from '@/types/createCourse';

interface EditClassModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<Class>) => Promise<any>;
  initialValues: Partial<Class>;
  loading?: boolean;
}

const formSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tên lớp'),
  description: z.string().min(1, 'Vui lòng nhập mô tả'),
  programAssignmentId: z.string().min(1, 'Vui lòng chọn chương trình'),
  startDateTime: z.any().refine(val => val, { message: 'Vui lòng chọn ngày bắt đầu' }),
  endDateTime: z.any().refine(val => val, { message: 'Vui lòng chọn ngày kết thúc' }),
  minStudents: z.number().min(1, 'Tối thiểu 1 học viên'),
  capacity: z.number().min(1, 'Tối thiểu 1 học viên'),
  pricePerStudent: z.number().min(0, 'Học phí không được âm'),
  durationMinutes: z.number().min(1, 'Thời lượng phải lớn hơn 0'),
  googleMeetLink: z.string().url('Link không hợp lệ').optional().or(z.literal('')),
}).refine(data => data.endDateTime > data.startDateTime, {
  message: 'Ngày kết thúc phải sau ngày bắt đầu',
  path: ['endDateTime'],
}).refine(data => dayjs(data.startDateTime).isAfter(dayjs().add(6, 'day')), {
    message: 'Ngày bắt đầu phải cách ít nhất 7 ngày',
    path: ['startDateTime'],
});

const EditClassModal: React.FC<EditClassModalProps> = ({ visible, onClose, onSubmit, initialValues, loading }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialValues,
      title: initialValues.title || '',
      description: initialValues.description || '',
      programAssignmentId: initialValues.programAssignmentId || '',
      startDateTime: initialValues.startDateTime ? new Date(initialValues.startDateTime) : undefined,
      endDateTime: initialValues.endDateTime ? new Date(initialValues.endDateTime) : undefined,
      minStudents: initialValues.minStudents || 1,
      capacity: initialValues.capacity || 1,
      pricePerStudent: initialValues.pricePerStudent || 0,
      durationMinutes: initialValues.durationMinutes || 60,
      googleMeetLink: initialValues.googleMeetLink || '',
    },
  });

    React.useEffect(() => {
    if (visible) {
      form.reset({
        ...initialValues,
         title: initialValues.title || '',
        description: initialValues.description || '',
        programAssignmentId: initialValues.programAssignmentId || '',
        startDateTime: initialValues.startDateTime ? new Date(initialValues.startDateTime) : undefined,
        endDateTime: initialValues.endDateTime ? new Date(initialValues.endDateTime) : undefined,
        minStudents: initialValues.minStudents || 1,
        capacity: initialValues.capacity || 1,
        pricePerStudent: initialValues.pricePerStudent || 0,
        durationMinutes: initialValues.durationMinutes || 60,
        googleMeetLink: initialValues.googleMeetLink || '',
      });
    }
  }, [visible, initialValues, form]);


  const [programsRes, setProgramsRes] = React.useState<ProgramAssignment[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = React.useState<boolean>(true);

  React.useEffect(() => {
    let mounted = true;
    if (!visible) return;
    (async () => {
      try {
        setIsLoadingPrograms(true);
        const res = await getClassAssignmentsService();
        if (!mounted) return;
        setProgramsRes(res.data || []);
      } catch (err) {
        console.error('Failed to load programs', err);
      } finally {
        if (mounted) setIsLoadingPrograms(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [visible]);

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
     try {
       const payload: Partial<Class> = {
        ...values,
        startDateTime: values.startDateTime.toISOString(),
        endDateTime: values.endDateTime.toISOString(),
      };
      await onSubmit(payload);
      onClose();
     } catch (err: any) {
        const serverErr = err?.response?.data;
        if (serverErr?.errors && typeof serverErr.errors === 'object') {
            Object.keys(serverErr.errors).forEach(key => {
                form.setError(key as any, { type: 'server', message: serverErr.errors[key][0] });
            });
            return;
        }
        if (serverErr?.message) {
            toast.error(serverErr.message);
            return;
        }
        toast.error('Có lỗi xảy ra, vui lòng thử lại.');
     }
  };

  const formValues = form.watch();
  const estimatedRevenue = (formValues.pricePerStudent || 0) * (formValues.capacity || 0);

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin lớp. Thay đổi sẽ chuyển trạng thái Cancelled → Draft nếu cần.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid md:grid-cols-3 gap-6">
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
                      <Textarea placeholder="Mô tả ngắn về lớp học..." {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger disabled={isLoadingPrograms}>
                            <SelectValue placeholder="Chọn chương trình..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {programsRes.map(p => (
                            <SelectItem key={p.programAssignmentId} value={p.programAssignmentId}>
                              {p.programName} - {p.levelName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="startDateTime"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Ngày bắt đầu</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    dayjs(field.value).format('DD/MM/YYYY')
                                ) : (
                                    <span>Chọn ngày</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                    control={form.control}
                    name="endDateTime"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Ngày kết thúc</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    dayjs(field.value).format('DD/MM/YYYY')
                                ) : (
                                    <span>Chọn ngày</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="minStudents" render={({ field }) => (
                        <FormItem><FormLabel>Tối thiểu HV</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="capacity" render={({ field }) => (
                        <FormItem><FormLabel>Tối đa HV</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="pricePerStudent" render={({ field }) => (
                        <FormItem><FormLabel>Học phí (VNĐ)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="durationMinutes" render={({ field }) => (
                        <FormItem><FormLabel>Thời lượng (phút)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <FormField
                    control={form.control}
                    name="googleMeetLink"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Google Meet Link</FormLabel>
                        <FormControl>
                        <Input placeholder="https://meet.google.com/..." {...field} />
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
                        <h4 className="font-semibold text-primary">{formValues.title || 'Tên lớp học...'}</h4>
                        <p className="text-muted-foreground line-clamp-3">{formValues.description || 'Mô tả ngắn...'}</p>
                        <div className="border-t pt-3">
                            <p><span className="font-medium text-muted-foreground">Chương trình:</span> {programsRes.find(p => p.programAssignmentId === formValues.programAssignmentId)?.programName || '...'}</p>
                            <p><span className="font-medium text-muted-foreground">Ngày bắt đầu:</span> {formValues.startDateTime ? dayjs(formValues.startDateTime).format('DD/MM/YYYY') : '...'}</p>
                            <p><span className="font-medium text-muted-foreground">Số lượng:</span> {formValues.minStudents || '...'} - {formValues.capacity || '...'} học viên</p>
                            <p><span className="font-medium text-muted-foreground">Học phí:</span> {new Intl.NumberFormat('vi-VN').format(formValues.pricePerStudent || 0)} VNĐ</p>
                        </div>
                         <div className="border-t pt-3">
                             <p className="font-semibold">Dự toán doanh thu</p>
                             <p className="text-2xl font-bold text-green-600">{new Intl.NumberFormat('vi-VN').format(estimatedRevenue)} VNĐ</p>
                         </div>
                    </CardContent>
                </Card>
                <Alert>
                    <GraduationCap className="h-4 w-4" />
                    <AlertTitle>Lưu ý</AlertTitle>
                    <AlertDescription>
                        Nếu lớp đang ở trạng thái "Đã hủy", sau khi cập nhật sẽ chuyển về "Bản nháp".
                    </AlertDescription>
                </Alert>
            </div>
             <DialogFooter className="md:col-span-3">
                <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cập nhật
                </Button>
            </DialogFooter>
          </form>
        </Form>

      </DialogContent>
    </Dialog>
  );
};

export default EditClassModal;
