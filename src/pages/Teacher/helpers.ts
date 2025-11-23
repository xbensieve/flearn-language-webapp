// hooks/useLessons.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createCourseLessonService,
  createExerciseService,
  getLessonsByUnits,
  updateLessonCourseService,
} from '../../services/course';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import type { ExercisePayload } from '../../services/course/type';
import type { AxiosError } from 'axios';

export const useLessons = (unitId: string) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['lessons', unitId],
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
    mutationFn: (formData: FormData) => createCourseLessonService(unitId, formData),
    onSuccess: () => {
      notifySuccess('Lesson created successfully!');
      onSuccess();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) =>
      notifyError(error?.response?.data?.errors || 'Failed to create lesson'),
  });

export const useUpdateLesson = (unitId: string, onSuccess: () => void) =>
  useMutation({
    mutationFn: (data: { id: string; formData: FormData }) =>
      updateLessonCourseService({ id: data.id, unitId, payload: data.formData }),
    onSuccess: () => {
      notifySuccess('Lesson updated successfully!');
      onSuccess();
    },
    onError: () => notifyError('Failed to update lesson'),
  });

export const useCreateExercise = (lessonId: string) => {
  return useMutation({
    mutationFn: (payload: ExercisePayload) => createExerciseService(lessonId, payload),
    onSuccess: () => {
      notifySuccess('Exercise created successfully!');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: AxiosError<any>) => {
      notifyError(error?.response?.data?.errors || 'Failed to create exercise');
    },
  });
};
