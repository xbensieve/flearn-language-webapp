import axiosInstance from "@/lib/axiosInstance";

export interface Topic {
  topicId: string;
  topicName: string;
  description?: string;
}

export const getTopicsService = async () => {
  try {
    const res = await axiosInstance.get<API.Response<Topic[]>>("/topics");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch topics", error);
    throw error;
  }
};
