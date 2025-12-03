import axiosInstance from "@/lib/axiosInstance";
import type { ProgramAssignment, APIResponse } from "@/types/createCourse";

interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export const getTeachingProgramService = async ({
  pageNumber = 1,
  pageSize = 10,
}: PaginationParams): Promise<APIResponse<ProgramAssignment[]>> => {
  const res = await axiosInstance.get<APIResponse<ProgramAssignment[]>>(
    "teaching-programs",
    {
      params: { pageNumber, pageSize },
    }
  );
  return res.data;
};
