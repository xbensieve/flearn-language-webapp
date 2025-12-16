import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Schema cho Create (Bắt buộc ảnh)
export const createTopicSchema = z.object({
  name: z.string().min(1, "Tên chủ đề là bắt buộc").max(100),
  description: z.string().min(1, "Mô tả là bắt buộc").max(500),
  contextPrompt: z.string().min(1, "Prompt là bắt buộc").max(2000),
  image: z
    .instanceof(File, { message: "Ảnh là bắt buộc" })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Kích thước tối đa là 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Chỉ chấp nhận định dạng .jpg, .jpeg, .png và .webp"
    ),
});

// Schema cho Update (Tất cả optional)
export const updateTopicSchema = z.object({
  name: z.string().min(1, "Tên không được để trống").max(100),
  description: z.string().min(1, "Mô tả không được để trống").max(500),
  contextPrompt: z.string().min(1, "Prompt không được để trống").max(2000),
  status: z.boolean().optional(),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `Kích thước tối đa là 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Chỉ chấp nhận định dạng .jpg, .jpeg, .png và .webp"
    )
    .optional(),
});

export type CreateTopicFormValues = z.infer<typeof createTopicSchema>;
export type UpdateTopicFormValues = z.infer<typeof updateTopicSchema>;
