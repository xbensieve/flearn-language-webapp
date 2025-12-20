import React, { useEffect, useState, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";

// Components
import { CourseForm } from "@/pages/Teacher/components/course/CourseForm";
import { CoursePreview } from "@/pages/Teacher/components/course/CoursePreview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

// Schemas & Types
import { courseSchema } from "@/schemas/courseSchema";
import type {
  CourseFormValues,
  CreateCourseRequest,
  Topic,
  ProgramAssignment,
  CourseTemplate,
} from "@/types/createCourse";

// Services
import {
  getCourseDetailService,
  updateCourseService,
  deleteCourseService,
  getCourseTemplatesService,
} from "@/services/course";
import { getTeachingProgramService } from "@/services/teacher/teacherService";
import { getTopicsService } from "@/services/topics/topicService";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";

// --- HELPER FUNCTIONS ĐỂ CHUẨN HÓA DỮ LIỆU ---
const normalizeCourseType = (type: string | number | undefined): number => {
  if (!type) return 1; // Default Free
  const t = String(type).toLowerCase();
  // Nếu là "paid" hoặc "2" hoặc số 2 -> trả về 2 (Paid)
  if (t === "paid" || t === "2") return 2;
  return 1; // Còn lại là Free
};

const normalizeGradingType = (
  type: string | number | undefined,
  courseTypeVal: number
): string => {
  // Logic cứng: Nếu CourseType là Paid (2) -> Grading phải là AIAndTeacher ("2")
  if (courseTypeVal === 2) return "2";
  // Logic cứng: Nếu CourseType là Free (1) -> Grading phải là AIOnly ("1")
  if (courseTypeVal === 1) return "1";

  // Fallback (dự phòng)
  if (!type) return "1";
  const t = String(type).toLowerCase();
  if (t === "aiandteacher" || t === "2") return "2";
  return "1";
};

const EditCoursePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);

  // 1. Setup Form
  const methods = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      courseType: 1,
      topicIds: [],
      price: 0,
      description: "",
      title: "",
      learningOutcome: "",
      durationDays: 30,
      gradingType: "1",
      image: null,
      templateId: undefined,
      levelId: "",
    },
    mode: "onChange",
  });

  const { watch, reset, setValue } = methods;
  const formValues = watch();

  const { data: courseData, isLoading: isLoadingCourse } = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourseDetailService(id!),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  const { data: programData = [], isLoading: isLoadingPrograms } = useQuery({
    queryKey: ["programLevels"],
    queryFn: () => getTeachingProgramService({ pageSize: 100 }),
    select: (res) => (res.data as ProgramAssignment[]) || [],
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["courseTemplates"],
    queryFn: () => getCourseTemplatesService({ page: 1, pageSize: 100 }),
    select: (res) => (res.data as CourseTemplate[]) || [],
  });

  const { data: topics = [], isLoading: isLoadingTopics } = useQuery({
    queryKey: ["topics"],
    queryFn: getTopicsService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select: (res: any) => (res.data as Topic[]) || [],
  });

  // 3. POPULATE DATA
  useEffect(() => {
    if (courseData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingTopics =
        courseData.topics?.map((t: any) =>
          typeof t === "object" ? t.topicId?.toString() : t.toString()
        ) || [];

      if (courseData.imageUrl) {
        setCurrentImageUrl(courseData.imageUrl);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fetchedLevelId =
        (courseData as any).program?.level.levelId || courseData.LevelId || "";
      setCurrentLevelId(fetchedLevelId);

      // --- XỬ LÝ CONVERT DỮ LIỆU TẠI ĐÂY ---
      const normalizedCourseType = normalizeCourseType(courseData.courseType);
      const normalizedGradingType = normalizeGradingType(
        courseData.gradingType,
        normalizedCourseType
      );
      const normalizedPrice =
        normalizedCourseType === 1 ? 0 : Number(courseData.price) || 0;

      // 3.4 Reset Form với dữ liệu đã được chuẩn hóa
      reset({
        title: courseData.title || "",
        description: courseData.description || "",
        learningOutcome: courseData.learningOutcome || "",
        price: normalizedPrice,
        courseType: normalizedCourseType, // Đã convert sang 1 hoặc 2
        durationDays: courseData.durationDays || 30,
        gradingType: normalizedGradingType, // Đã convert sang "1" hoặc "2"
        levelId: fetchedLevelId,
        topicIds: existingTopics,
        templateId: courseData.templateId || undefined,
        image: null,
      });

      if (courseData.templateId) {
        setValue("templateId", courseData.templateId);
      }
    }
  }, [courseData, programData, reset, setValue]);

  const previewImage = useMemo(() => {
    if (formValues.image instanceof File) {
      return URL.createObjectURL(formValues.image);
    }
    return currentImageUrl;
  }, [formValues.image, currentImageUrl]);

  const { mutate: updateCourse, isPending: isUpdating } = useMutation({
    mutationFn: (payload: CreateCourseRequest) =>
      updateCourseService({ id: id!, payload: payload as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", id] });
      toast.success("Đã lưu thành công!", {
        description: "Course details have been updated.",
      });
      navigate("/teacher/course");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const msg = err.response?.message || "Thất bại khi cập nhật khóa học";
      toast.error("Cập nhật thất bại", { description: msg });
    },
  });

  const { mutate: deleteCourse, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteCourseService(id!),
    onSuccess: () => {
      toast.success("Khóa học đã bị xóa!", {
        description: "Khóa học đã bị xóa vĩnh viễn.",
      });
      navigate("/teacher/course");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Không thể xóa khóa học này";
      toast.error("Xóa không thành công", { description: msg });
    },
  });

  // Handle Submit
  const onSubmit = (data: CourseFormValues) => {
    // Đảm bảo logic trước khi gửi đi lần cuối
    const finalCourseType = data.courseType; // 1 hoặc 2
    const finalGradingType = finalCourseType === 2 ? 2 : 1; // Paid->2, Free->1
    const finalPrice = finalCourseType === 1 ? 0 : data.price;

    const payload: CreateCourseRequest = {
      Title: data.title,
      Description: data.description,
      LevelId: data.levelId,
      TopicIds: data.topicIds.join(","),
      CourseType: finalCourseType,
      Price: finalPrice,
      Image: data.image as File,
      LearningOutcome: data.learningOutcome,
      DurationDays: data.durationDays,
      GradingType: finalGradingType, // Gửi lên server dạng số (1 hoặc 2)
      TemplateId: data.templateId || undefined,
    };
    updateCourse(payload);
  };

  if (isLoadingCourse || isLoadingPrograms || isLoadingTopics) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">
            Đang tải dữ liệu khóa học...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* HEADER & HERO SECTION */}
      <div className="relative h-[280px] overflow-hidden rounded-b-3xl shadow-sm border-b border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/20" />

        <div className="absolute top-4 left-4 z-20">
          <Button
            variant="ghost"
            className="!text-white hover:text-white hover:bg-white/10 p-2 md:p-3 cursor-pointer backdrop-blur-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-10 h-10 md:w-5 md:h-5" />
          </Button>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-200 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">
                  Chế độ chỉnh sửa
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                {courseData?.title || "Chỉnh sửa khóa học"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Dialog
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="bg-red-500/20 hover:bg-red-600 border border-red-500/50 !text-white backdrop-blur-md cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Xóa khóa học
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-5 h-5" />
                      Xác nhận xóa
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                      Bạn có chắc chắn muốn xóa khóa học không?{" "}
                      <strong>{courseData?.title}</strong>?
                      <br />
                      Không thể hoàn tác hành động này và tất cả dữ liệu sẽ bị
                      mất.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4 gap-2 sm:gap-0">
                    <DialogClose asChild>
                      <Button className="cursor-pointer" variant="outline">
                        Thoát
                      </Button>
                    </DialogClose>
                    <div></div>
                    <Button
                      className="!text-white cursor-pointer"
                      variant="destructive"
                      onClick={() => deleteCourse()}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Xóa vĩnh viễn
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative">
          <div className="xl:col-span-8 space-y-8">
            <FormProvider {...methods}>
              <CourseForm
                onSubmit={onSubmit}
                isLoading={isUpdating}
                programLevels={programData}
                templates={templates}
                topics={topics}
                isEditMode={true}
                initialImageUrl={courseData?.imageUrl}
                initialLevelId={currentLevelId}
                initialCourseType={normalizeCourseType(
                  courseData?.courseType
                ).toString()}
                initialPrice={Number(courseData?.price || 0)}
                initialGradingType={normalizeGradingType(
                  courseData?.gradingType,
                  normalizeCourseType(courseData?.courseType)
                )}
              />
            </FormProvider>
          </div>

          <div className="hidden xl:block xl:col-span-4 sticky top-6 z-10">
            <div className="mt-2">
              <CoursePreview
                values={formValues}
                imagePreview={previewImage}
                topicsList={topics}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCoursePage;
