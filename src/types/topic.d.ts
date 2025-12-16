export interface TopicResponse {
  topicId: string;
  topicName: string;
  topicDescription: string;
  contextPrompt: string | null;
  imageUrl: string;
  status: boolean;
}

// Định nghĩa cho object "meta" trong JSON
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Định nghĩa cấu trúc phản hồi tổng thể từ API
export interface PagedResponse<T> {
  meta: PaginationMeta; // Thay đổi quan trọng ở đây
  status: string;
  code: number;
  message: string;
  data: T;
  errors: null | any;
}

// (Giữ nguyên các type cho Request nếu cần)
export interface TopicRequest {
  name: string;
  description: string;
  contextPrompt: string;
  image: File;
}

export interface UpdateTopicRequest {
  name?: string;
  description?: string;
  contextPrompt?: string;
  status?: boolean;
  image?: File;
}
