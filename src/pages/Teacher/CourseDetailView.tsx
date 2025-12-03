/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

// Services
import {
  getCourseDetailService,
  getCourseUnitsService,
  getLessonsByUnits,
  submitCourseService,
  updateCourseVisibilityService,
} from "../../services/course";
import type { Unit } from "../../services/course/type";
import { notifyError, notifySuccess } from "../../utils/toastConfig";
import { formatStatusLabel } from "../../utils/mapping";
import type { AxiosError } from "axios";
import ExercisesList from "./components/ExercisesList";

// Icons (Lucide React - Standard for Shadcn)
import {
  ArrowLeft,
  Check,
  BookOpen,
  Target,
  GraduationCap,
  Users,
  Calendar,
  Sparkles,
  Play,
  FileText,
  Star,
  Box,
  Clock,
  Eye,
  Archive,
  Pencil,
  Save,
  X,
  Loader2,
  Video,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";

// UI Components (Shadcn/Tailwind wrapper)
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

// --- Subcomponent: Lesson Item ---
const LessonItem: React.FC<{ lesson: any; isEditMode?: boolean }> = ({
  lesson,
  isEditMode,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg mb-3 overflow-hidden bg-card transition-all hover:border-primary/50">
      <div
        className="flex items-center justify-between p-3 cursor-pointer bg-muted/30 hover:bg-muted/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Play className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm truncate">
              {lesson.title ?? "Untitled Lesson"}
            </span>
            <span className="text-xs text-muted-foreground">
              Lesson {lesson.position ?? "-"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isEditMode && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/teacher/lesson/${lesson.lessonID}/edit`);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4 border-t bg-white dark:bg-slate-950 animate-in slide-in-from-top-2 duration-200">
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4">
            {lesson.description ?? "No description provided."}
          </p>

          {/* HTML Content */}
          {lesson.content && (
            <div
              className="prose prose-sm prose-slate max-w-none p-4 rounded-md bg-slate-50 border mb-4 dark:bg-slate-900"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          )}

          {/* Video Player */}
          {lesson.videoUrl && (
            <div className="relative aspect-video rounded-lg overflow-hidden border bg-black mb-4">
              <video
                controls
                src={lesson.videoUrl}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Video className="w-12 h-12 text-white/20" />
              </div>
            </div>
          )}

          {/* Resources */}
          <div className="flex flex-wrap gap-2 mb-4">
            {lesson.documentUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
              >
                <a
                  href={lesson.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="h-4 w-4" />
                  View Document
                </a>
              </Button>
            )}
          </div>

          <Separator className="my-4" />

          {/* Exercises */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Exercises
            </h4>
            <ExercisesList
              lessonId={lesson.lessonID ?? ""}
              readonly={!isEditMode}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// --- Subcomponent: Unit Lessons Loader ---
export const UnitLessons: React.FC<{ unit: Unit; isEditMode?: boolean }> = ({
  unit,
  isEditMode,
}) => {
  const {
    data: lessonsResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["lessons", unit?.courseUnitID],
    queryFn: () => getLessonsByUnits({ unitId: unit?.courseUnitID }),
    enabled: !!unit?.courseUnitID,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !lessonsResponse?.data || lessonsResponse.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
        <Box className="h-8 w-8 mb-2 opacity-50" />
        <span className="text-sm">No lessons in this unit</span>
      </div>
    );
  }

  const lessons = [...lessonsResponse.data].sort(
    (a, b) => a.position - b.position
  );

  return (
    <div className="pt-2">
      {lessons.map((lesson) => (
        <LessonItem
          key={lesson.lessonID}
          lesson={lesson}
          isEditMode={isEditMode}
        />
      ))}
    </div>
  );
};

// --- Main Component ---
const CourseDetailView: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  const {
    data: course,
    isLoading: courseLoading,
    refetch,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseDetailService(courseId!),
    enabled: !!courseId,
  });

  const { mutate: updateVisibility } = useMutation({
    mutationFn: (isHidden: boolean) =>
      updateCourseVisibilityService({
        id: courseId!,
        isPublic: isHidden,
      }),
    onSuccess: (data) => {
      notifySuccess(
        data.isHidden
          ? "Course archived successfully"
          : "Course restored successfully"
      );
      refetch();
    },
    onError: (error: AxiosError<any>) => {
      notifyError(
        error.response?.data?.message || "Failed to update visibility"
      );
    },
  });

  const { data: unitsData, isLoading: unitsLoading } = useQuery({
    queryKey: ["units", courseId],
    queryFn: async () => {
      const res = await getCourseUnitsService({ id: courseId! });
      return Array.isArray(res) ? res : res?.data ?? [];
    },
    enabled: !!courseId,
  });

  const { mutate: submitCourse } = useMutation({
    mutationFn: (cId: string) => submitCourseService(cId),
    onSuccess: () => {
      notifySuccess("Course submitted successfully");
      refetch(); // Refresh status
    },
    onError: (error: AxiosError<any>) => {
      notifyError(error.response?.data?.message || "Error submitting course");
    },
  });

  const handleToggleEdit = () => {
    if (isEditMode) notifySuccess("Changes saved (mock)");
    setIsEditMode((prev) => !prev);
  };

  const isArchived = course?.courseStatus?.toLowerCase() === "archived";

  if (courseLoading || unitsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">
            Loading course data...
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Course not found</h2>
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* --- Header Section --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border shadow-sm sticky top-4 z-30">
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-full h-8 w-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Back to list</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">
                Course Details
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Manage content and settings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (courseId) updateVisibility(!isArchived);
                    }}
                  >
                    {isArchived ? (
                      <Eye className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Archive className="h-5 w-5 text-amber-600" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isArchived ? "Restore Course" : "Archive Course"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6" />

            {isEditMode ? (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleToggleEdit}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" /> Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditMode(false)}
                  className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" /> Cancel
                </Button>
              </>
            ) : (
              <>
                {course?.courseStatus?.toLowerCase() === "draft" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => courseId && submitCourse(courseId)}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4" /> Submit
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/teacher/course/${courseId}/edit`)}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" /> Edit Details
                </Button>
              </>
            )}
          </div>
        </div>

        {/* --- Alerts --- */}
        {course?.courseStatus?.toLowerCase() === "rejected" && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Action Required: Course Rejected</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>
                This course was rejected by the admin. Please review feedback
                and update.
              </span>
              <Button
                size="sm"
                variant="outline"
                className="ml-4 border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => navigate(`/teacher/course/${courseId}/edit`)}
              >
                Fix Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* --- Hero Banner --- */}
        <div className="group relative rounded-2xl overflow-hidden border shadow-sm aspect-[3/1] bg-slate-900">
          <img
            src={course.imageUrl ?? "/default-course.jpg"}
            alt="Course Cover"
            className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent p-6 sm:p-8 flex flex-col justify-end">
            <div className="flex justify-between items-end">
              <div className="max-w-3xl space-y-2">
                <div className="flex gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-md"
                  >
                    <Sparkles className="w-3 h-3 mr-1 text-yellow-400" />
                    {formatStatusLabel(course.courseStatus ?? "unknown")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-slate-200 border-slate-600 bg-slate-950/30 backdrop-blur-md"
                  >
                    {course.program?.level?.name ?? "Level N/A"}
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {course.title}
                </h1>
                <p className="text-slate-200 line-clamp-2 max-w-2xl text-lg">
                  {course.description}
                </p>
              </div>

              <div className="hidden sm:block text-right">
                {course.discountPrice ? (
                  <div className="flex flex-col items-end">
                    <span className="text-slate-400 line-through text-sm">
                      {Number(course.price).toLocaleString("vi-VN")} đ
                    </span>
                    <span className="text-2xl font-bold text-emerald-400">
                      {Number(course.discountPrice).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {Number(course.price ?? 0).toLocaleString("vi-VN")} đ
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Metadata */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" /> At a Glance
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="text-xs text-blue-600 font-semibold mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Learners
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      {course.learnerCount ?? 0}
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50/50 rounded-lg border border-yellow-100">
                    <div className="text-xs text-yellow-600 font-semibold mb-1 flex items-center gap-1">
                      <Star className="w-3 h-3" /> Rating
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      {course.averageRating ?? "N/A"}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Language
                    </span>
                    <span className="font-medium">{course.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Duration
                    </span>
                    <span className="font-medium">
                      {course.durationDays} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Est. Hours
                    </span>
                    <span className="font-medium">
                      {course.estimatedHours} hrs
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" /> Program
                  Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {course.program?.description ??
                    "No specific program details available."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    Total Units: {course.numUnits}
                  </Badge>
                  <Badge variant="secondary">
                    Total Lessons: {course.numLessons}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Curriculum (Takes up 2/3 width on large screens) */}
          <div className="lg:col-span-2">
            <Card className="h-full border-t-4 border-t-primary shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Box className="w-6 h-6 text-primary" /> Curriculum
                  </div>
                </CardTitle>
                <CardDescription>
                  {unitsData?.length || 0} Units • Structured learning path
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!Array.isArray(unitsData) || unitsData.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                    <Box className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>No curriculum content available yet.</p>
                    <Button variant="link" className="mt-2 text-primary">
                      Create First Unit
                    </Button>
                  </div>
                ) : (
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full space-y-4"
                  >
                    {unitsData.map((unit: Unit, index: number) => (
                      <AccordionItem
                        key={unit?.courseUnitID ?? index}
                        value={`item-${index}`}
                        className="border rounded-lg px-4 bg-white data-[state=open]:bg-slate-50 data-[state=open]:border-primary/20 transition-colors"
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-4 text-left w-full">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {unit?.title ?? "Untitled Unit"}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5 font-normal line-clamp-1">
                                {unit?.description ?? "Unit description"}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-1 px-1">
                          <UnitLessons unit={unit} isEditMode={isEditMode} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailView;
