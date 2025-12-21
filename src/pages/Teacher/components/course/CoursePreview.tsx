import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, BookOpen, Image as ImageIcon, CheckCircle } from "lucide-react";
import type { CourseFormValues, Topic } from "@/types/createCourse";

interface CoursePreviewProps {
  values: Partial<CourseFormValues>;
  imagePreview: string | null;
  topicsList: Topic[];
}

export const CoursePreview: React.FC<CoursePreviewProps> = ({
  values,
  imagePreview,
  topicsList,
}) => {
  const isPaid = values.courseType === 2;

  // Format currency
  const formatPrice = (price: number = 0) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Xem trước khóa học
        </h3>
        <Badge
          variant="outline"
          className="animate-pulse bg-green-50 text-green-600 border-green-200"
        >
          Chế độ xem trước
        </Badge>
      </div>

      <Card className="overflow-hidden border-border/60 shadow-xl rounded-2xl group hover:shadow-2xl transition-all duration-300">
        {/* IMAGE SECTION */}
        <div className="relative aspect-video w-full bg-slate-100 flex items-center justify-center overflow-hidden">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Course preview"
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="flex flex-col items-center text-slate-400">
              <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
              <span className="text-sm font-medium">Ảnh bìa</span>
            </div>
          )}
        </div>

        {/* CONTENT SECTION */}
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <h3 className="font-bold text-xl leading-tight line-clamp-2 text-gray-900 min-h-[3.5rem]">
              {values.title || (
                <span className="text-gray-300 italic">Tên khóa học...</span>
              )}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
              {values.description || "Mô tả ngắn về khóa học..."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {values.topicIds && values.topicIds.length > 0 ? (
              values.topicIds.slice(0, 3).map((id) => {
                const topic = topicsList?.find((t) => t.topicId === id);
                return topic ? (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="text-[10px] font-medium bg-slate-100 text-slate-700"
                  >
                    {topic.topicName}
                  </Badge>
                ) : null;
              })
            ) : (
              <span className="text-xs text-gray-400 italic">
                Chưa có chủ đề nào được chọn
              </span>
            )}
            {values.topicIds && values.topicIds.length > 3 && (
              <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full text-slate-500">
                +{values.topicIds.length - 3}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{values.durationDays || 0} Ngày</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="w-4 h-4 text-orange-500" />
              <span>
                {values.templateId ? "Mẫu đang hoạt động" : "Gói tùy chỉnh"}
              </span>
            </div>
          </div>
        </CardContent>

        <Separator />

        {/* FOOTER SECTION */}
        <CardFooter className="p-4 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
              T
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Giáo viên
            </span>
          </div>

          <div className="text-right">
            {isPaid ? (
              <span className="text-lg font-bold text-primary block">
                {formatPrice(values.price)}
              </span>
            ) : (
              <span className="text-lg font-bold text-green-600 block">
                Miễn phí
              </span>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Grading Info Mini Card */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex gap-3 items-start">
        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-blue-900">
            Phương thức chấm điểm:{" "}
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            {values.gradingType === "1"
              ? "Bài tập sẽ được chấm tự động bởi AI."
              : "Bài tập sẽ được chấm bán tự động bởi giáo viên và AI."}
          </p>
        </div>
      </div>
    </div>
  );
};
