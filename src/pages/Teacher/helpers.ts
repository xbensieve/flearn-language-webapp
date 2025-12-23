// hooks/useLessons.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createCourseLessonService,
  createExerciseService,
  getLessonsByUnits,
  updateLessonCourseService,
} from "../../services/course";
import type { ExercisePayload } from "../../services/course/type";
import type { AxiosError } from "axios";
import { toast } from "sonner";

export const useLessons = (unitId: string) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["lessons", unitId],
    queryFn: () => getLessonsByUnits({ unitId }),
    enabled: !!unitId,
    retry: 1,
  });

  return {
    lessons: data?.data ?? [],
    isLoading,
    refetch,
  };
};

export const useCreateLesson = (unitId: string, onSuccess: () => void) =>
  useMutation({
    mutationFn: (formData: FormData) =>
      createCourseLessonService(unitId, formData),
    onSuccess: () => {
      toast.success("Tạo bài học thành công");
      onSuccess();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error(error);
      toast.error("Tạo bài học thất bại. Vui lòng thử lại.");
    },
  });

export const useUpdateLesson = (unitId: string, onSuccess: () => void) =>
  useMutation({
    mutationFn: (data: { id: string; formData: FormData }) =>
      updateLessonCourseService({
        id: data.id,
        unitId,
        payload: data.formData,
      }),
    onSuccess: () => {
      toast.success("Cập nhật bài học thành công");
      onSuccess();
    },
    onError: () => toast.error("Cập nhật bài học thất bại. Vui lòng thử lại."),
  });

export const useCreateExercise = (lessonId: string) => {
  return useMutation({
    mutationFn: (payload: ExercisePayload) =>
      createExerciseService(lessonId, payload),
    onSuccess: () => {
      toast.success("Tạo bài tập thành công");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: AxiosError<any>) => {
      console.error(error);
      toast.error("Tạo bài tập thất bại. Vui lòng thử lại.");
    },
  });
};
