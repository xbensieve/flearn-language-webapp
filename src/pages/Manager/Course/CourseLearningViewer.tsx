import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  ArrowLeft,
  ChevronDown,
  BookOpen,
  Check,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { courseService } from "@/services/course/courseService";
import type { CourseDetail, LessonDetail, Lesson } from "@/types/course";
import SafeHtmlContent from "./SafeHtmlContent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import RejectReasonModal from "./RejectReasonModal";
import { Dumbbell } from "lucide-react";
import LessonExerciseList from "./LessonExerciseList";
interface Props {
  course: CourseDetail;
  submissionId: string;
  onExit: () => void;
  isSubmissionReview?: boolean;
  onStatusChange?: (newStatus: "Approved" | "Rejected") => void;
}

interface FlatLesson {
  lesson: Lesson;
  unitId: string;
  unitTitle: string;
  unitPosition: number;
}

const useFlattenedLessons = (units: CourseDetail["units"]) => {
  return useMemo(() => {
    const flat: FlatLesson[] = [];
    units?.forEach((unit) => {
      unit.lessons?.forEach((lesson) => {
        flat.push({
          lesson,
          unitId: unit.courseUnitID,
          unitTitle: unit.title,
          unitPosition: unit.position,
        });
      });
    });
    return flat.sort((a, b) => {
      if (a.unitPosition !== b.unitPosition)
        return a.unitPosition - b.unitPosition;
      return a.lesson.position - b.lesson.position;
    });
  }, [units]);
};

export default function CourseLearningViewer({
  course,
  submissionId,
  onExit,
  isSubmissionReview = true,
  onStatusChange,
}: Props) {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [lessonData, setLessonData] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>(
    {}
  );

  // State cho Approval/Rejection
  const [currentStatus, setCurrentStatus] = useState<string>(
    course.courseStatus
  );
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isExerciseOpen, setIsExerciseOpen] = useState(false);
  const units = useMemo(() => {
    return [...(course.units || [])]
      .sort((a, b) => a.position - b.position)
      .map((u) => ({
        ...u,
        lessons: [...(u.lessons || [])].sort((a, b) => a.position - b.position),
      }));
  }, [course.units]);

  const flatLessons = useFlattenedLessons(units);

  // Auto select first lesson
  useEffect(() => {
    if (activeLessonId || flatLessons.length === 0) return;

    const first = flatLessons[0];
    setActiveLessonId(first.lesson.lessonID);
    setExpandedUnits({ [first.unitId]: true });
  }, [flatLessons, activeLessonId]);

  // Load lesson detail
  useEffect(() => {
    if (!activeLessonId) return;

    setLoading(true);
    courseService
      .getLessonDetail(activeLessonId)
      .then(setLessonData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeLessonId]);

  const currentIndex = flatLessons.findIndex(
    (l) => l.lesson.lessonID === activeLessonId
  );
  const hasNext = currentIndex < flatLessons.length - 1;
  const hasPrev = currentIndex > 0;

  const goNext = useCallback(() => {
    if (!hasNext) return;
    const next = flatLessons[currentIndex + 1];
    setActiveLessonId(next.lesson.lessonID);
    setExpandedUnits((prev) => ({ ...prev, [next.lesson.courseUnitID]: true }));
  }, [currentIndex, flatLessons, hasNext]);

  const goPrev = useCallback(() => {
    if (!hasPrev) return;
    const prevLessonObj = flatLessons[currentIndex - 1];
    setActiveLessonId(prevLessonObj.lesson.lessonID);
    setExpandedUnits((prevExpanded) => ({
      ...prevExpanded,
      [prevLessonObj.lesson.courseUnitID]: true,
    }));
  }, [currentIndex, flatLessons, hasPrev]);

  const selectLesson = (lessonId: string, unitId: string) => {
    setActiveLessonId(lessonId);
    setExpandedUnits((prev) => ({ ...prev, [unitId]: true }));
    setSidebarOpen(false);
  };

  // Xử lý Approve
  const handleApprove = () => {
    setIsApproveConfirmOpen(true);
  };

  const confirmApprove = async () => {
    if (!submissionId) {
      setMessage({
        type: "error",
        text: "Submission ID is missing. Cannot approve.",
      });
      setIsApproveConfirmOpen(false);
      return;
    }
    setIsProcessingAction(true);
    try {
      await courseService.approveCourse(submissionId);
      setCurrentStatus("Approved");
      onStatusChange?.("Approved");
      setIsApproveConfirmOpen(false);
      setMessage({
        type: "success",
        text: "The course has been APPROVED successfully!",
      });
    } catch (error) {
      console.error("Lỗi khi phê duyệt khóa học:", error);
      setMessage({
        type: "error",
        text: "Approval failed. Please try again.",
      });
      setIsApproveConfirmOpen(false);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Xử lý Reject
  const handleReject = () => {
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      return;
    }

    if (!submissionId) {
      setMessage({
        type: "error",
        text: "Submission ID is missing. Cannot reject.",
      });
      return;
    }
    setIsProcessingAction(true);
    try {
      await courseService.rejectCourse(submissionId, rejectReason.trim());
      setCurrentStatus("Rejected");
      onStatusChange?.("Rejected");
      setIsRejectModalOpen(false);
      setRejectReason("");
      setMessage({
        type: "success",
        text: "The course was successfully REJECTED!",
      });
    } catch (error) {
      console.error("Lỗi khi từ chối khóa học:", error);
      setMessage({
        type: "error",
        text: "Rejection failed. Please try again.",
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const SidebarContent = useMemo(() => {
    return (
      <div className="py-3 font-sans">
        {units.map((unit) => {
          const isExpanded = !!expandedUnits[unit.courseUnitID];

          return (
            <div key={unit.courseUnitID}>
              <button
                onClick={() =>
                  setExpandedUnits((prev) => ({
                    ...prev,
                    [unit.courseUnitID]: !prev[unit.courseUnitID],
                  }))
                }
                className={cn(
                  "w-full px-5 py-4 flex items-center justify-between text-left rounded-lg mx-3 transition-all",
                  "hover:bg-gray-100 cursor-pointer",
                  isExpanded && "bg-gray-50"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    Unit {unit.position}
                  </p>
                  <p className="font-medium text-gray-900 truncate">
                    {unit.title}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-gray-400 transition-transform flex-shrink-0",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>

              {isExpanded && (
                <div className="mt-1 border-l-2 border-gray-200 ml-8">
                  {unit.lessons.map((lesson) => {
                    const isActive = activeLessonId === lesson.lessonID;

                    return (
                      <button
                        key={lesson.lessonID}
                        onClick={() =>
                          selectLesson(lesson.lessonID, unit.courseUnitID)
                        }
                        className={cn(
                          "w-full px-5 py-3 text-left flex items-center gap-3 text-sm rounded-r-lg transition-all cursor-pointer",
                          isActive
                            ? "bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600 -ml-0.5"
                            : "hover:bg-gray-50 text-gray-700"
                        )}
                      >
                        <BookOpen
                          className={cn(
                            "w-4 h-4 flex-shrink-0",
                            isActive ? "text-blue-600" : "text-gray-400"
                          )}
                        />
                        <span className="block w-full line-clamp-2">
                          {lesson.position}. {lesson.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }, [units, expandedUnits, activeLessonId]);

  const StatusBadge = ({ status }: { status: string }) => {
    let classes = "px-3 py-1 rounded-full text-md font-medium font-sans ";
    let text = "";

    switch (status) {
      case "Published":
      case "Approved":
        classes += "bg-green-100 text-green-800";
        text = "Approved";
        break;
      case "PendingApproval":
        classes += "bg-red-100 text-red-800";
        text = "Awaiting Approval";
        break;
      default:
        classes += "bg-yellow-100 text-yellow-800";
        text = "Rejected";
        break;
    }
    return <span className={classes}>{text}</span>;
  };

  // Approve Confirmation Modal
  const ApproveConfirmModal = () => (
    <Dialog open={isApproveConfirmOpen} onOpenChange={setIsApproveConfirmOpen}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden gap-0 rounded-xl">
        <div className="bg-green-50 p-6 flex flex-col items-center justify-center text-center border-b border-green-100">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Approve Course
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2 max-w-xs mx-auto">
            Are you sure you want to approve this course for publication?
          </DialogDescription>
        </div>

        <DialogFooter className="p-4 gap-3 sm:justify-center bg-white">
          <Button
            variant="outline"
            onClick={() => setIsApproveConfirmOpen(false)}
            disabled={isProcessingAction}
            className="w-full sm:w-auto min-w-[100px] border-gray-300 text-gray-700 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmApprove}
            disabled={isProcessingAction}
            className="w-full sm:w-auto min-w-[100px] bg-green-600 hover:bg-green-700 
          !text-white font-medium shadow-sm cursor-pointer"
          >
            {isProcessingAction ? "Processing..." : "Yes, Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {pdfUrl && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="h-16 border-b flex items-center justify-between px-6 bg-white shadow-sm">
            <h3 className="font-semibold text-lg flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              Tài liệu
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setPdfUrl(null)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <iframe src={pdfUrl} className="flex-1 w-full" title="PDF" />
        </div>
      )}

      <ApproveConfirmModal />
      <RejectReasonModal
        open={isRejectModalOpen}
        onOpenChange={setIsRejectModalOpen}
        reason={rejectReason}
        setReason={setRejectReason}
        onConfirm={confirmReject}
        isProcessing={isProcessingAction}
      />

      {/* --- Modal hiển thị danh sách bài tập --- */}
      <Dialog open={isExerciseOpen} onOpenChange={setIsExerciseOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl">
          <DialogHeader className="p-6 pb-4 border-b bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Dumbbell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Practice Exercises
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  Lesson: {lessonData?.title}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {lessonData && (
              <LessonExerciseList lessonId={lessonData.lessonID} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="h-screen flex flex-col bg-gray-50">
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onExit}
              className="cursor-pointer flex-shrink-0 text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-3 min-w-0">
              <div
                className="font-semibold text-gray-900 truncate text-base sm:text-lg max-w-[150px] sm:max-w-md"
                title={course.title}
              >
                {course.title}
              </div>
              {isSubmissionReview && (
                <div className="hidden sm:block transform scale-90 origin-left">
                  <StatusBadge status={currentStatus} />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isSubmissionReview && currentStatus === "PendingApproval" && (
              <div className="flex items-center gap-2 mr-1 sm:mr-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReject}
                  disabled={isProcessingAction}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 font-medium px-2 sm:px-4 h-9 cursor-pointer border-2 border-red-200"
                >
                  <Ban className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Reject</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={isProcessingAction}
                  className="bg-blue-600 hover:bg-blue-700 !text-white font-medium px-2 sm:px-4 h-9 shadow-sm cursor-pointer"
                >
                  {isProcessingAction ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin sm:mr-2" />
                  ) : (
                    <Check className="w-4 h-4 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">Approve</span>
                </Button>
                <div className="h-6 w-px bg-gray-200 mx-1 sm:hidden"></div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {message && (
          <div
            className={cn(
              "p-3 text-center font-medium flex items-center justify-center",
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            )}
          >
            {message.text}
            <Button
              variant="ghost"
              size="icon"
              className="ml-3 h-5 w-5 hover:bg-transparent"
              onClick={() => setMessage(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-80 p-0">
              <div className="h-16 border-b flex items-center px-6 font-semibold bg-gray-50">
                Course Content
              </div>
              <ScrollArea className="h-[calc(100vh-4rem)]">
                {SidebarContent}
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <aside className="hidden sm:flex w-80 border-r bg-white flex-col">
            <div className="h-16 border-b flex items-center px-6 font-semibold bg-gray-50">
              Course Content
            </div>
            <ScrollArea className="flex-1">{SidebarContent}</ScrollArea>
          </aside>

          <main className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-b-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-3 text-gray-700 text-base font-medium flex justify-center items-center gap-1">
                    Loading
                    <span className="flex space-x-1 ml-1">
                      <span className="w-1 h-1 bg-gray-700 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1 h-1 bg-gray-700 rounded-full animate-bounce delay-150"></span>
                      <span className="w-1 h-1 bg-gray-700 rounded-full animate-bounce delay-200"></span>
                    </span>
                  </p>
                </div>
              </div>
            ) : lessonData ? (
              <div
                className={cn(
                  "max-w-4xl mx-auto py-8 px-6 sm:px-8",
                  isSubmissionReview && currentStatus === "Pending"
                    ? "pb-24"
                    : "pb-8"
                )}
              >
                <div className="text-sm text-gray-500 mb-5">
                  Unit{" "}
                  {
                    units.find(
                      (u) => u.courseUnitID === lessonData.courseUnitID
                    )?.position
                  }{" "}
                  • Lesson {lessonData.position}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  {lessonData.position}. {lessonData.title}
                </h1>

                {lessonData.description && (
                  <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                    {lessonData.description}
                  </p>
                )}

                {lessonData.videoUrl && (
                  <div className="mb-12 -mx-6 sm:mx-0">
                    <div className="aspect-video bg-black rounded-sm overflow-hidden shadow-lg">
                      <iframe
                        src={lessonData.videoUrl}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                        title="Video"
                      />
                    </div>
                  </div>
                )}

                {lessonData.documentUrl && (
                  <div className="mb-12 p-6 bg-white border border-gray-200 rounded-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <FileText className="w-12 h-12 text-blue-600" />
                        <div>
                          <p className="font-medium">Document</p>
                          <p className="text-sm text-gray-500">PDF</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setPdfUrl(lessonData.documentUrl!)}
                        className="bg-blue-500 hover:bg-blue-400 !text-white cursor-pointer rounded-md"
                      >
                        View document
                      </Button>
                    </div>
                  </div>
                )}

                {lessonData.content && (
                  <div className="mb-20 -mx-6 sm:mx-0">
                    <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                      <SafeHtmlContent html={lessonData.content} />
                    </div>
                  </div>
                )}
                <div className="flex justify-end mb-8">
                  <Button
                    onClick={() => setIsExerciseOpen(true)}
                    variant="outline"
                    className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-medium cursor-pointer"
                  >
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Exercises
                    {lessonData.totalExercises > 0 && (
                      <span className="ml-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {lessonData.totalExercises}
                      </span>
                    )}
                  </Button>
                </div>
                <div className="fixed sm:static bottom-0 left-0 right-0 border-t sm:border-0 p-4 sm:p-0 z-10">
                  <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={!hasPrev}
                      onClick={goPrev}
                      className={`
                                group transition-all duration-300 hover:-translate-x-1
                                ${
                                  hasPrev
                                    ? "hover:bg-gray-50 hover:border-gray-400 cursor-pointer"
                                    : ""
                                }`}
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Previous</span>
                    </Button>

                    {hasNext && (
                      <Button
                        size="lg"
                        onClick={goNext}
                        className="min-w-0 flex-1 sm:flex-initial max-w-xs sm:max-w-none bg-blue-600 hover:bg-blue-700 !text-white forced-color-adjust-none font-medium transition-all duration-300 hover:translate-x-1 active:scale-95 cursor-pointer"
                      >
                        <span className="hidden sm:inline">Next Lesson</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="h-24 sm:hidden" />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center px-8 text-center">
                <p className="text-xl text-gray-600">Select a lesson</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
