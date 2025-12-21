import React, { useEffect, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { CourseForm } from "@/pages/Teacher/components/course/CourseForm";
import { CoursePreview } from "@/pages/Teacher/components/course/CoursePreview";
import { courseSchema } from "@/schemas/courseSchema";
import { Button } from "@/components/ui/button";
import { courseService } from "@/services/course/courseService";
import { getTeachingProgramService } from "@/services/teacher/teacherService";
import { getTopicsService } from "@/services/topics/topicService";
import type {
  CourseFormValues,
  CreateCourseRequest,
  Topic,
  ProgramAssignment,
  CourseTemplate,
} from "@/types/createCourse";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const STORAGE_KEY = "flearn_course_draft_v1";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const defaultValues: CourseFormValues = {
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
};

const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const isClearingRef = useRef(false);

  // 1. Setup Form
  const methods = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues,
    mode: "onChange",
  });

  const { watch, reset } = methods;
  const formValues = watch();

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;

    try {
      const parsedData = JSON.parse(savedData);
      if (
        !parsedData ||
        (typeof parsedData === "object" && Object.keys(parsedData).length === 0)
      ) {
        return;
      }

      reset({ ...defaultValues, ...parsedData, image: null });
    } catch (error) {
      console.error("Failed to parse draft", error);
    }
  }, [reset]);

  useEffect(() => {
    const subscription = watch((value) => {
      if (isClearingRef.current) return;

      const { ...dataToSave } = value;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const { data: programData = [] } = useQuery({
    queryKey: ["programLevels"],
    queryFn: () => getTeachingProgramService({ pageSize: 100 }),
    select: (res) => (res.data as ProgramAssignment[]) || [],
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["courseTemplates"],
    queryFn: () => courseService.getCourseTemplate({ Page: 1, PageSize: 100 }),
    select: (res) => (res.data as CourseTemplate[]) || [],
  });

  const { data: topics = [] } = useQuery({
    queryKey: ["topics"],
    queryFn: getTopicsService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select: (res: any) => (res.data as Topic[]) || [],
  });

  const { mutate: createCourse, isPending } = useMutation({
    mutationFn: courseService.createCourse,
    onSuccess: () => {
      isClearingRef.current = true;
      localStorage.removeItem(STORAGE_KEY);
      reset(defaultValues);

      setTimeout(() => {
        isClearingRef.current = false;
      }, 100);

      isClearingRef.current = false;

      toast.success("Khóa học đã được tạo thành công!", {
        description: "Khóa học của bạn đã được tạo.",
        duration: 4000,
      });
      navigate("/teacher/course");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Không tạo được khóa học!";
      toast.error("Gửi không thành công", {
        description: msg,
      });
    },
  });
  // 4. Submit Handler
  const onSubmit = (data: CourseFormValues) => {
    if (!data.image) {
      toast.error("Thiếu hình ảnh", {
        description: "Vui lòng tải lên ảnh bìa cho khóa học của bạn.",
      });
      return;
    }

    const payload: CreateCourseRequest = {
      Title: data.title,
      Description: data.description,
      LevelId: data.levelId,
      TopicIds: data.topicIds.join(","),
      CourseType: data.courseType,
      Price: data.price,
      Image: data.image,
      LearningOutcome: data.learningOutcome,
      DurationDays: data.durationDays,
      GradingType: Number(data.gradingType),
      TemplateId: data.templateId || undefined,
    };

    createCourse(payload);
  };

  // 5. Handle Clear Data
  const handleClearForm = () => {
    isClearingRef.current = true;

    localStorage.removeItem(STORAGE_KEY);
    reset(defaultValues);

    setTimeout(() => {
      isClearingRef.current = false;
    }, 0);

    toast.success("Đã xóa biểu mẫu", {
      description: "Tất cả dữ liệu đã được đặt lại về mặc định.",
    });
  };
  const imagePreviewUrl = formValues.image
    ? URL.createObjectURL(formValues.image)
    : null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="relative h-[320px] overflow-hidden rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.25)] border border-white/10">
        {/* Background image with zoom-on-hover */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70 transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white animate-in fade-in slide-in-from-bottom-4 delay-100">
                Tạo khóa học mới
              </h1>

              <p className="text-gray-300 mt-2 max-w-2xl text-lg animate-in fade-in slide-in-from-bottom-5 delay-200">
                Sử dụng biểu mẫu bên dưới để tạo khóa học mới cho học viên của
                bạn. Hãy chắc chắn rằng bạn đã cung cấp tất cả thông tin cần
                thiết.
              </p>
            </div>

            {/* Discard Draft Button */}
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 delay-300">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="
                          border-white/20
                          !text-white
                          hover:bg-white/15
                          transition-all
                          backdrop-blur-md
                          bg-white/10
                          cursor-pointer
                        "
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hủy biểu mẫu nháp
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bạn có chắc chắn không?</DialogTitle>
                    <DialogDescription>
                      Thao tác này sẽ xóa vĩnh viễn dữ liệu biểu mẫu nháp hiện
                      tại của bạn. Không thể hoàn tác thao tác này.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                      <Button className="cursor-pointer" variant="outline">
                        Đóng
                      </Button>
                    </DialogClose>

                    <DialogClose asChild>
                      <Button
                        onClick={handleClearForm}
                        className="bg-red-600 hover:bg-red-700 !text-white cursor-pointer"
                      >
                        Có, Hủy
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* --- END HERO SECTION --- */}

      {/* MAIN CONTENT CONTAINER (Shifted up slightly to overlap the hero) */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative">
          {/* LEFT: FORM */}
          <div className="xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-6 delay-500">
            <FormProvider {...methods}>
              <CourseForm
                onSubmit={onSubmit}
                isLoading={isPending}
                programLevels={programData}
                templates={templates}
                topics={topics}
              />
            </FormProvider>
          </div>

          {/* RIGHT: PREVIEW (Sticky) */}
          <div className="hidden xl:block xl:col-span-4 sticky top-6 z-10 animate-in fade-in slide-in-from-bottom-6 delay-700">
            {/* Added a little margin top to align better with the form cards */}
            <div className="mt-2">
              <CoursePreview
                values={formValues}
                imagePreview={imagePreviewUrl}
                topicsList={topics}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;
