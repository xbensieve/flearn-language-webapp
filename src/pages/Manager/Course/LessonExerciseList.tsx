import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mic,
  Image as ImageIcon,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { courseService } from "@/services/course/courseService";
import type { Exercise, MetaData } from "@/types/course";

interface Props {
  lessonId: string;
}

const TranslatedDifficulties: Record<string, string> = {
  Easy: "Dễ",
  Medium: "Trung bình",
  Hard: "Khó",
  Advanced: "Nâng cao",
};

const TranslatedExerciseTypes: Record<string, string> = {
  RepeatAfterMe: "Lặp lại theo mẫu",
  PictureDescription: "Mô tả hình ảnh",
  StoryTelling: "Kể chuyện",
  Debate: "Tranh luận",
};

export default function LessonExerciseList({ lessonId }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const res = await courseService.getExercisesByLesson({
          lessonId,
          Page: page,
          PageSize: pageSize,
        });
        setExercises(res.data);
        if (res.meta) setMeta(res.meta);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [lessonId, page]);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy":
        return "bg-green-100 text-green-700 border-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "RepeatAfterMe":
        return <Mic className="w-4 h-4" />;
      case "PictureDescription":
        return <ImageIcon className="w-4 h-4" />;
      case "StoryTelling":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const renderMedia = (ex: Exercise) => {
    if (!ex.mediaUrls || ex.mediaUrls.length === 0) return null;

    const isAudio =
      ex.mediaUrls[0].includes(".mp3") || ex.mediaUrls[0].includes("/audio/");

    if (isAudio) {
      return (
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 flex items-center gap-4 my-4">
          <div className="bg-blue-600 p-3 rounded-md text-white shadow-sm">
            <Music className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-blue-600 mb-2 uppercase tracking-wide">
              Bản âm thanh
            </p>
            {ex.mediaUrls.map((url, idx) => (
              <audio
                key={idx}
                controls
                className="w-full h-10 block mb-2 last:mb-0"
              >
                <source src={url} type="audio/mpeg" />
                Trình duyệt của bạn không hỗ trợ phần tử âm thanh.
              </audio>
            ))}
          </div>
        </div>
      );
    }

    // Render Images Grid
    return (
      <div
        className={cn(
          "grid gap-2 my-4",
          ex.mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
        )}
      >
        {ex.mediaUrls.map((url, idx) => (
          <div
            key={idx}
            className="relative rounded-md overflow-hidden border border-gray-200 bg-gray-100 group"
          >
            {/* Aspect Ratio container */}
            <div className="aspect-video w-full">
              <img
                src={url}
                alt={`Illustration ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading && page === 1) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-md animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading practice content...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10 animate-in fade-in duration-500">
      {/* Exercise List Feed */}
      <div className="space-y-8">
        {exercises.map((ex) => (
          <div
            key={ex.exerciseID}
            className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden flex flex-col"
          >
            {/* 1. Header Section */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className="w-fit bg-white text-gray-500 border-gray-300"
                  >
                    #{ex.position}
                  </Badge>
                  <Badge
                    className={cn(
                      "font-semibold border",
                      getDifficultyColor(ex.difficulty)
                    )}
                    variant="outline"
                  >
                    {TranslatedDifficulties[ex.difficulty] || ex.difficulty}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {ex.title}
                </h3>
              </div>

              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                {getTypeIcon(ex.exerciseType)}
                <span className="font-medium">
                  {TranslatedExerciseTypes[ex.exerciseType] || ex.exerciseType}
                </span>
              </Badge>
            </div>

            {/* 2. Main Content Body */}
            <div className="p-6">
              {/* Prompt/Instruction */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Chỉ dẫn
                </h4>
                <p className="text-gray-800 text-lg font-medium leading-relaxed">
                  {ex.prompt}
                </p>
              </div>

              {renderMedia(ex)}

              {ex.content && ex.content !== ex.prompt && (
                <div className="mt-6 p-5 bg-gray-50 rounded-md border border-gray-100 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-400 rounded-l-md"></div>

                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">
                    Nội dung
                  </h4>

                  <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
                    {ex.content}
                  </p>
                </div>
              )}
            </div>

            {/* 3. Footer: Details & Hints (Accordion) */}
            <div className="bg-gray-50 border-t border-gray-100">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details" className="border-b-0">
                  <AccordionTrigger className="px-6 py-3 text-sm text-gray-600 hover:text-blue-600 hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Xem Đáp án & Gợi ý
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-0 space-y-4">
                    {/* Hints */}
                    {ex.hints && (
                      <div className="flex gap-3 items-start p-3 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-100">
                        <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-xs uppercase mb-1 opacity-70">
                            Gợi ý
                          </span>
                          <p className="text-sm">{ex.hints}</p>
                        </div>
                      </div>
                    )}

                    {/* Expected Answer */}
                    <div className="flex gap-3 items-start p-3 rounded-md bg-green-50 text-green-800 border border-green-100">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-bold block text-xs uppercase mb-1 opacity-70">
                          Câu trả lời mong đợi
                        </span>
                        <p className="text-base font-medium">
                          {ex.expectedAnswer}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center pt-6 pb-8">
          <div className="bg-white p-2 rounded-md shadow-md border flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="rounded-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center px-4 font-medium text-gray-700">
              Page {page} of {meta.totalPages}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages || loading}
              className="rounded-md"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
