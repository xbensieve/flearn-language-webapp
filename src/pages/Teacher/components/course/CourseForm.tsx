import React, { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  UploadCloud,
  X,
  Layers,
  FileText,
  Dumbbell,
  CheckCircle2,
  Sparkles,
  Layout,
  DollarSign,
  BookOpen,
  Save,
  PlusCircle,
  ImageIcon,
} from "lucide-react";
import type {
  CourseFormValues,
  ProgramAssignment,
  CourseTemplate,
  Topic,
} from "@/types/createCourse";
import LoadingScreen from "@/components/Loading/LoadingScreen";

interface CourseFormProps {
  onSubmit: (data: CourseFormValues) => void;
  isLoading: boolean;
  programLevels: ProgramAssignment[];
  templates: CourseTemplate[];
  topics: Topic[];
  isEditMode?: boolean;
  initialImageUrl?: string | null;
  initialLevelId?: string | null;
  initialCourseType?: string;
  initialPrice?: number;
  initialGradingType?: string;
}

const convertCourseTypeToNumber = (type: string | undefined): number => {
  if (!type) return 1;
  return type.toLowerCase() === "paid" ? 2 : 1;
};

const convertGradingTypeToNumber = (type: string | undefined): string => {
  if (!type) return "1";
  return type.toLowerCase() === "aiandteacher" ? "2" : "1";
};

const RequiredMark = () => <span className="text-destructive ml-1">*</span>;

export const CourseForm: React.FC<CourseFormProps> = ({
  onSubmit,
  isLoading,
  programLevels,
  templates,
  topics,
  isEditMode = false,
  initialImageUrl,
  initialLevelId,
  initialCourseType = "1",
  initialPrice = 0,
  initialGradingType = "1",
}) => {
  const {
    control,
    watch,
    setValue,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useFormContext<CourseFormValues>();

  const currentImage = watch("image");
  const currentLevelId = watch("levelId");
  const currentCourseType = watch("courseType"); // number: 1 hoặc 2
  const selectedTemplateId = watch("templateId");
  const currentPrice = watch("price");
  const currentGradingType = watch("gradingType"); //

  useEffect(() => {
    if (isEditMode) {
      const updates = [];

      // Set levelId nếu có
      if (initialLevelId && !currentLevelId) {
        setValue("levelId", initialLevelId, { shouldValidate: true });
        updates.push("levelId");
      }

      // Set courseType nếu có (convert từ string -> number)
      if (initialCourseType && currentCourseType === undefined) {
        const courseTypeNumber = convertCourseTypeToNumber(initialCourseType);
        setValue("courseType", courseTypeNumber, { shouldValidate: true });
        updates.push("courseType");
      }

      // Set price nếu có
      if (initialPrice !== undefined && currentPrice === undefined) {
        setValue("price", initialPrice, { shouldValidate: true });
        updates.push("price");
      }

      // Set gradingType nếu có (convert từ string -> numeric string)
      if (initialGradingType && currentGradingType === undefined) {
        const gradingTypeNumber =
          convertGradingTypeToNumber(initialGradingType);
        setValue("gradingType", gradingTypeNumber, { shouldValidate: true });
        updates.push("gradingType");
      }

      if (updates.length > 0) {
        trigger(updates as any);
      }
    }
  }, [
    isEditMode,
    initialLevelId,
    initialCourseType,
    initialPrice,
    initialGradingType,
    currentLevelId,
    currentCourseType,
    currentPrice,
    currentGradingType,
    setValue,
    trigger,
  ]);

  useEffect(() => {
    if (
      !isEditMode ||
      (isEditMode &&
        initialCourseType &&
        convertCourseTypeToNumber(initialCourseType) !== currentCourseType)
    ) {
      if (currentCourseType === 1) {
        setValue("gradingType", "1", { shouldValidate: true });
        setValue("price", 0);
      } else if (currentCourseType === 2) {
        setValue("gradingType", "2", { shouldValidate: true });
      }
    }
  }, [currentCourseType, setValue, isEditMode, initialCourseType]);

  const previewImage = useMemo(() => {
    if (currentImage instanceof File) {
      return URL.createObjectURL(currentImage);
    }
    if (isEditMode && initialImageUrl) {
      return initialImageUrl;
    }
    if (isEditMode && initialLevelId) {
      return initialLevelId;
    }
    return null;
  }, [currentImage, initialImageUrl, isEditMode, initialLevelId]);

  useEffect(() => {
    if (currentCourseType === 1) {
      setValue("gradingType", "1", { shouldValidate: true });
      setValue("price", 0);
    } else if (currentCourseType === 2) {
      setValue("gradingType", "2", { shouldValidate: true });
    }
  }, [currentCourseType, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setValue("image", e.target.files[0], { shouldValidate: true });
    }
  };

  if (isLoading && !isEditMode)
    return <LoadingScreen message="Đang tạo khóa học! Vui lòng đợi..." />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* SECTION 1: GENERAL INFO */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Thông tin chung</CardTitle>
              <CardDescription>
                Những thông tin cốt lõi của khóa học của bạn.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tên khóa học <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. English for everyone"
                    className="h-11 text-md"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mô tả <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Giải thích nội dung khóa học..."
                      className="h-32 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="learningOutcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Kết quả học tập <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Học viên có thể làm gì sau khi hoàn thành?"
                      className="h-32 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* --- IMAGE UPLOAD SECTION --- */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Ảnh bìa {!isEditMode && <RequiredMark />}
            </Label>

            {!previewImage ? (
              // TRẠNG THÁI 1: CHƯA CÓ ẢNH (Upload Box)
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 hover:bg-gray-50 hover:border-blue-300 transition-all text-center cursor-pointer relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-700">
                      Bấm để tải hình ảnh lên
                    </p>
                    <p className="text-xs text-gray-500">
                      SVG, PNG, JPG (Khuyến khích 1280x720)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // TRẠNG THÁI 2: ĐÃ CÓ ẢNH (Hiển thị ảnh + Nút thay đổi)
              <div className="relative rounded-xl overflow-hidden border border-gray-200 group w-full h-64 bg-gray-100">
                <img
                  src={previewImage}
                  alt="Course Thumbnail"
                  className="w-full h-full object-cover"
                />

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  {/* Nút Change (Input file ẩn đè lên) */}
                  <div className="relative">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="gap-2 pointer-events-none"
                    >
                      <ImageIcon className="w-4 h-4" /> Thay đổi hình ảnh
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* Nút Remove (Chỉ hiện nếu đang upload file mới, hoặc nếu bạn muốn cho phép xóa ảnh cũ về null) */}
                  {currentImage instanceof File && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setValue("image", null, { shouldValidate: !isEditMode })
                      }
                      className="gap-2"
                    >
                      <X className="w-4 h-4" /> Hoàn tác
                    </Button>
                  )}
                </div>

                {/* Badge báo trạng thái ảnh */}
                <div className="absolute top-2 right-2">
                  {currentImage instanceof File ? (
                    <Badge className="bg-green-500">Tệp mới</Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-white/90 text-gray-700"
                    >
                      Hình ảnh hiện tại
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {errors.image && (
              <p className="text-sm text-destructive font-medium">
                {errors.image.message as string}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: STRUCTURE (Giữ nguyên) */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Cấu trúc chương trình giảng dạy</CardTitle>
              <CardDescription>
                Xác định mức độ, thời lượng và nội dung.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="levelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Chương trình <RequiredMark />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || (isEditMode && initialLevelId) || ""}
                    defaultValue={
                      isEditMode && initialLevelId ? initialLevelId : undefined
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue
                          placeholder="Chọn chương trình cụ thể"
                          className="text-muted-foreground truncate max-w-full"
                        >
                          {/* Hiển thị tên program khi đã chọn */}
                          {field.value &&
                            programLevels.find(
                              (pl) => pl.levelId === field.value
                            ) && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">
                                  {
                                    programLevels.find(
                                      (pl) => pl.levelId === field.value
                                    )?.programName
                                  }
                                </span>
                                <span className="text-muted-foreground">-</span>
                                <span className="text-muted-foreground">
                                  {
                                    programLevels.find(
                                      (pl) => pl.levelId === field.value
                                    )?.levelName
                                  }
                                </span>
                              </div>
                            )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {programLevels.map((pl) => (
                        <SelectItem
                          key={pl.levelId}
                          value={pl.levelId}
                          className="cursor-pointer py-2"
                        >
                          <div className="flex items-center gap-1 leading-relaxed py-0.5">
                            <span className="font-medium">
                              {pl.programName}
                            </span>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-muted-foreground">
                              {pl.levelName}
                            </span>
                            {/* Hiển thị dấu tích nếu đang edit và là program hiện tại */}
                            {isEditMode && initialLevelId === pl.levelId && (
                              <CheckCircle2 className="w-4 h-4 ml-2 text-green-500" />
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="durationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Thời lượng (Ngày) <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      className="h-11"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="topicIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Chủ đề <RequiredMark />
                </FormLabel>
                <Select
                  onValueChange={(val) => {
                    const currentVal = field.value || [];
                    if (!currentVal.includes(val))
                      field.onChange([...currentVal, val]);
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Chọn chủ đề liên quan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {topics.map((t) => (
                      <SelectItem
                        key={t.topicId}
                        value={t.topicId}
                        className="cursor-pointer py-2"
                      >
                        <div className="leading-relaxed py-0.5">
                          {t.topicName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-3">
                  {field.value?.map((id) => {
                    const topic = topics.find((t) => t.topicId === id);
                    return topic ? (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="px-3 py-1 gap-2 hover:bg-red-100 hover:text-red-700 cursor-pointer transition-colors"
                        onClick={() =>
                          field.onChange(
                            (field.value ?? []).filter((i) => i !== id)
                          )
                        }
                      >
                        {topic.topicName} <X className="w-3 h-3" />
                      </Badge>
                    ) : null;
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" /> Áp dụng một Bản
                mẫu
              </Label>
              {selectedTemplateId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue("templateId", undefined)}
                  className="text-red-500 h-8 hover:bg-red-50 cursor-pointer"
                >
                  <X className="w-4 h-4 mr-1" /> Xóa mẫu
                </Button>
              )}
            </div>

            <TooltipProvider delayDuration={200}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => {
                  const isSelected = selectedTemplateId === template.templateId;
                  return (
                    <div
                      key={template.templateId}
                      onClick={() =>
                        setValue(
                          "templateId",
                          isSelected ? undefined : template.templateId
                        )
                      }
                      className={`relative cursor-pointer rounded-xl border transition-all duration-200 group overflow-hidden ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                          : "bg-white hover:border-primary/50 hover:shadow-md"
                      }`}
                    >
                      <div className="p-4 pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <h4
                                className={`font-bold text-sm line-clamp-1 text-left ${
                                  isSelected ? "text-primary" : "text-gray-900"
                                }`}
                              >
                                {template.name}
                              </h4>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold">{template.name}</p>
                            </TooltipContent>
                          </Tooltip>

                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 ml-2" />
                          )}
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-muted-foreground line-clamp-2 h-8 leading-snug text-left">
                              {template.description ||
                                "Không có mô tả nào cho mẫu này."}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="max-w-[300px] text-xs"
                          >
                            <p>
                              {template.description || "Không có mô tả có sẵn."}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="grid grid-cols-3 border-t divide-x bg-gray-50/50">
                        <div className="p-2 flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] uppercase text-muted-foreground font-semibold mb-0.5">
                            Chương
                          </span>
                          <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                            <Layers className="w-3.5 h-3.5 text-blue-500" />
                            {template.unitCount}
                          </div>
                        </div>
                        <div className="p-2 flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] uppercase text-muted-foreground font-semibold mb-0.5">
                            Bài học/ Chương
                          </span>
                          <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                            <FileText className="w-3.5 h-3.5 text-orange-500" />
                            {template.lessonsPerUnit}
                          </div>
                        </div>
                        <div className="p-2 flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] uppercase text-muted-foreground font-semibold mb-0.5">
                            Bài tập/ Bài học
                          </span>
                          <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                            <Dumbbell className="w-3.5 h-3.5 text-green-500" />
                            {template.exercisesPerLesson}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Cài đặt & Giá cả</CardTitle>
              <CardDescription>
                Chính sách kiếm tiền và chấm điểm.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={control}
              name="courseType"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>
                      Loại khóa học
                      <RequiredMark />
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => field.onChange(1)}
                        className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${
                          field.value === 1
                            ? "bg-gray-900 text-white border-gray-900"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="block font-bold">Miễn phí</span>
                        <span className="text-xs opacity-70">
                          Chỉ chấm điểm AI
                        </span>
                        {isEditMode && field.value === 1 && (
                          <div className="mt-2">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-100 text-blue-800"
                            >
                              Hiện đã được chọn
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div
                        onClick={() => field.onChange(2)}
                        className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${
                          field.value === 2
                            ? "bg-gray-900 text-white border-gray-900"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="block font-bold">Paid</span>
                        <span className="text-xs opacity-70">
                          Đánh giá AI và giáo viên
                        </span>
                        {isEditMode && field.value === 2 && (
                          <div className="mt-2">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-100 text-blue-800"
                            >
                              Hiện đã được chọn
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {currentCourseType === 2 && (
              <FormField
                control={control}
                name="price"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-left-2">
                    <FormLabel>
                      Giá (đ) <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          className="pl-10 h-11 text-lg font-medium"
                          placeholder="Nhập số tiền"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min={0}
                          step={1000}
                        />
                        <span className="absolute left-3 top-2 text-gray-400 font-bold text-lg pointer-events-none">
                          ₫
                        </span>
                      </div>
                    </FormControl>
                    {(field.value ?? 0) > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                        <span className="text-gray-500">≈</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat("vi-VN").format(
                            field.value ?? 0
                          )}{" "}
                          đ
                        </span>
                        {isEditMode &&
                          initialPrice !== undefined &&
                          initialPrice !== field.value && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Original:{" "}
                              {new Intl.NumberFormat("vi-VN").format(
                                initialPrice
                              )}{" "}
                              đ
                            </Badge>
                          )}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <FormField
            control={control}
            name="gradingType"
            render={({ field }) => {
              const gradingTypeValue = field.value || "1";
              const initialGrading = initialGradingType
                ? convertGradingTypeToNumber(initialGradingType)
                : "1";

              return (
                <FormItem className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div>
                      <FormLabel>
                        Phương pháp chấm điểm <RequiredMark />
                      </FormLabel>
                      <FormDescription>
                        {gradingTypeValue === "1"
                          ? "AI sẽ tự động chấm điểm bài tập."
                          : "Giáo viên sẽ tự tay xem xét bài nộp + sự hỗ trợ của AI."}
                      </FormDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white">
                        {gradingTypeValue === "1"
                          ? "Tự động (AI)"
                          : "Thủ công (Giáo viên)"}
                      </Badge>
                      {isEditMode &&
                        initialGradingType &&
                        initialGrading !== gradingTypeValue && (
                          <Badge variant="secondary" className="text-xs">
                            Đã cập nhật
                          </Badge>
                        )}
                    </div>
                  </div>

                  {currentCourseType === 1 && gradingTypeValue !== "1" && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                      <span className="font-medium">Cảnh báo:</span> Các khóa
                      học miễn phí phải chỉ sử dụng công nghệ chấm điểm AI.
                      Phương pháp chấm điểm sẽ được tự động đặt thành "Tự động
                      (AI)".
                    </div>
                  )}
                </FormItem>
              );
            }}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4 py-4 sticky bottom-0 bg-white/80 backdrop-blur-md border-t p-4 z-20 rounded-xl shadow-lg mt-8">
        <span className="text-sm text-muted-foreground mr-auto hidden md:inline-block">
          {isLoading
            ? isEditMode
              ? "Lưu thay đổi..."
              : "Tạo..."
            : isEditMode
            ? "Xem lại những thay đổi trước khi lưu."
            : "Các bản nháp chưa lưu sẽ được lưu trữ cục bộ."}
        </span>
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="min-w-[150px] shadow-lg shadow-blue-500/20 !text-white bg-blue-500 hover:bg-blue-400 cursor-pointer"
        >
          {isLoading ? (
            isEditMode ? (
              "Lưu..."
            ) : (
              "Tạo..."
            )
          ) : isEditMode ? (
            <>
              <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" /> Tạo khóa học
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
