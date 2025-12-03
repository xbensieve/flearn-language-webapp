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
  if (!type) return 1; // Mặc định là Free
  return type.toLowerCase() === "paid" ? 2 : 1;
};

const convertCourseTypeToString = (type: number): string => {
  return type === 2 ? "Paid" : "Free";
};

const convertGradingTypeToNumber = (type: string | undefined): string => {
  if (!type) return "1"; // Mặc định là AI Only
  return type.toLowerCase() === "aiandteacher" ? "2" : "1";
};

const convertGradingTypeToString = (type: string): string => {
  return type === "2" ? "AIAndTeacher" : "AIOnly";
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

      // Trigger validation sau khi set tất cả giá trị
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
    return <LoadingScreen message="Creating course! Please wait..." />;

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
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                The core details of your course.
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
                  Course Title <RequiredMark />
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
                    Description <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain what the course covers..."
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
                    Learning Outcomes <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What will students be able to do after finishing?"
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
              Thumbnail {!isEditMode && <RequiredMark />}
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
                      Click to upload image
                    </p>
                    <p className="text-xs text-gray-500">
                      SVG, PNG, JPG (Recommended 1280x720)
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
                      <ImageIcon className="w-4 h-4" /> Change Image
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
                      <X className="w-4 h-4" /> Undo
                    </Button>
                  )}
                </div>

                {/* Badge báo trạng thái ảnh */}
                <div className="absolute top-2 right-2">
                  {currentImage instanceof File ? (
                    <Badge className="bg-green-500">New File</Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-white/90 text-gray-700"
                    >
                      Current Image
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
              <CardTitle>Curriculum Structure</CardTitle>
              <CardDescription>
                Define the level, duration, and content.
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
                    Program <RequiredMark />
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
                          placeholder="Select specific program"
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
                    Duration (Days) <RequiredMark />
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
                  Topics <RequiredMark />
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
                      <SelectValue placeholder="Select relevant topics" />
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

          {/* TEMPLATES */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" /> Apply a
                Template
              </Label>
              {selectedTemplateId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue("templateId", undefined)}
                  className="text-red-500 h-8 hover:bg-red-50 cursor-pointer"
                >
                  <X className="w-4 h-4 mr-1" /> Clear Template
                </Button>
              )}
            </div>

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
                        <h4
                          className={`font-bold text-sm line-clamp-1 ${
                            isSelected ? "text-primary" : "text-gray-900"
                          }`}
                        >
                          {template.name}
                        </h4>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 h-8 leading-snug">
                        {template.description ||
                          "No description available for this template."}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 border-t divide-x bg-gray-50/50">
                      <div className="p-2 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold mb-0.5">
                          Units
                        </span>
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                          <Layers className="w-3.5 h-3.5 text-blue-500" />
                          {template.unitCount}
                        </div>
                      </div>
                      <div className="p-2 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold mb-0.5">
                          Lessons/Unit
                        </span>
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                          <FileText className="w-3.5 h-3.5 text-orange-500" />
                          {template.lessonsPerUnit}
                        </div>
                      </div>
                      <div className="p-2 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold mb-0.5">
                          Ex/Lesson
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
              <CardTitle>Settings & Pricing</CardTitle>
              <CardDescription>
                Monetization and grading policies.
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
                      Course Type <RequiredMark />
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
                        <span className="block font-bold">Free</span>
                        <span className="text-xs opacity-70">
                          AI Grading Only
                        </span>
                        {isEditMode && field.value === 1 && (
                          <div className="mt-2">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-100 text-blue-800"
                            >
                              Currently Selected
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
                          AI And Teacher Review
                        </span>
                        {isEditMode && field.value === 2 && (
                          <div className="mt-2">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-100 text-blue-800"
                            >
                              Currently Selected
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    {isEditMode && initialCourseType && (
                      <FormDescription className="text-blue-600">
                        {convertCourseTypeToNumber(initialCourseType) !==
                        field.value ? (
                          <span>
                            Course type changed from
                            <span className="font-bold mx-1">
                              {initialCourseType}
                            </span>
                            to
                            <span className="font-bold mx-1">
                              {convertCourseTypeToString(field.value ?? 0)}
                            </span>
                            . Grading method and price will be updated
                            accordingly.
                          </span>
                        ) : (
                          `Current course type: ${initialCourseType}`
                        )}
                      </FormDescription>
                    )}
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
                      Price (VND) <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          type="number"
                          className="pl-10 h-11 text-lg font-medium"
                          placeholder="500,000"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min={0}
                          step={1000}
                        />
                      </div>
                    </FormControl>
                    {(field.value ?? 0) > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                        <span className="text-gray-500">≈</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat("vi-VN").format(
                            field.value ?? 0
                          )}{" "}
                          VND
                        </span>
                        {isEditMode &&
                          initialPrice !== undefined &&
                          initialPrice !== field.value && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Original:{" "}
                              {new Intl.NumberFormat("vi-VN").format(
                                initialPrice
                              )}{" "}
                              VND
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
                        Grading Method <RequiredMark />
                      </FormLabel>
                      <FormDescription>
                        {gradingTypeValue === "1"
                          ? "AI will automatically grade exercises."
                          : "Teachers will manually review submissions + AI assistance."}
                      </FormDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white">
                        {gradingTypeValue === "1"
                          ? "Auto (AI)"
                          : "Manual (Teacher)"}
                      </Badge>
                      {isEditMode &&
                        initialGradingType &&
                        initialGrading !== gradingTypeValue && (
                          <Badge variant="secondary" className="text-xs">
                            Updated
                          </Badge>
                        )}
                    </div>
                  </div>

                  {/* Hiển thị thông báo nếu đang edit và giá trị thay đổi */}
                  {isEditMode &&
                    initialGradingType &&
                    initialGrading !== gradingTypeValue && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                        <span className="font-medium">Note:</span> Grading
                        method was updated from
                        <Badge variant="outline" className="mx-1">
                          {initialGradingType}
                        </Badge>
                        to
                        <Badge variant="outline" className="mx-1">
                          {convertGradingTypeToString(gradingTypeValue)}
                        </Badge>
                        {currentCourseType === 1
                          ? " because course is Free."
                          : " because course is Paid."}
                      </div>
                    )}

                  {/* Thông báo đặc biệt cho Free course */}
                  {currentCourseType === 1 && gradingTypeValue !== "1" && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                      <span className="font-medium">Warning:</span> Free courses
                      must use AI grading only. Grading method will be
                      automatically set to "Auto (AI)".
                    </div>
                  )}

                  {/* Hidden Select */}
                  <div className="hidden">
                    <Select
                      value={gradingTypeValue}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">AI Only</SelectItem>
                        <SelectItem value="2">AI + Teacher Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FormItem>
              );
            }}
          />
        </CardContent>
      </Card>

      {/* FINAL ACTION BAR */}
      <div className="flex items-center justify-end gap-4 py-4 sticky bottom-0 bg-white/80 backdrop-blur-md border-t p-4 z-20 rounded-xl shadow-lg mt-8">
        <span className="text-sm text-muted-foreground mr-auto hidden md:inline-block">
          {isLoading
            ? isEditMode
              ? "Saving changes..."
              : "Creating..."
            : isEditMode
            ? "Review your changes before saving."
            : "Unsaved drafts are stored locally."}
        </span>
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="min-w-[150px] shadow-lg shadow-blue-500/20 !text-white bg-blue-500 hover:bg-blue-400 cursor-pointer"
        >
          {isLoading ? (
            isEditMode ? (
              "Saving..."
            ) : (
              "Creating..."
            )
          ) : isEditMode ? (
            <>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" /> Create Course
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
