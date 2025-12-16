import api from "@/lib/axiosInstance";
import type {
  PagedResponse,
  TopicResponse,
  TopicRequest,
  UpdateTopicRequest,
} from "@/types/topic";

export const getTopicsService = async (page = 1, pageSize = 10) => {
  const response = await api.get<PagedResponse<TopicResponse[]>>(
    "/topics/admin",
    {
      params: { page, pageSize },
    }
  );
  return response.data;
};

export const createTopicService = async (data: TopicRequest) => {
  const formData = new FormData();
  formData.append("Name", data.name);
  formData.append("Description", data.description);
  formData.append("ContextPrompt", data.contextPrompt);
  formData.append("Image", data.image);

  const response = await api.post("/topics", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateTopicService = async (
  id: string,
  data: UpdateTopicRequest
) => {
  const formData = new FormData();
  if (data.name) formData.append("Name", data.name);
  if (data.description) formData.append("Description", data.description);
  if (data.contextPrompt) formData.append("ContextPrompt", data.contextPrompt);
  if (data.status !== undefined)
    formData.append("Status", data.status.toString());
  if (data.image) formData.append("Image", data.image);

  const response = await api.put(`/topics/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteTopicService = async (id: string) => {
  const response = await api.delete(`/topics/${id}`);
  return response.data;
};
