import { z } from "zod";

export const courseSchema = z
  .object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters"),
    levelId: z.string().min(1, "Please select a program & level"),
    templateId: z.string().optional(),

    // TopicIds: Form dùng mảng string
    topicIds: z.array(z.string()).min(1, "Select at least one topic"),

    courseType: z.number(),

    price: z.number().nonnegative(),

    durationDays: z.number().int().positive(),

    learningOutcome: z.string().min(10, "Learning outcome is required"),

    gradingType: z.string(),

    // Validate File: Cho phép null hoặc File
    image: z
      .union([
        z.instanceof(File), // Cho phép File mới
        z.string(), // Cho phép URL cũ
        z.null(), // Cho phép null (không đổi ảnh)
        z.undefined(),
      ])
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Logic Validate chéo
    // CHECK LOGIC GIÁ TIỀN >= 5000
    if (data.courseType === 2 && data.price < 5000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price must be at least 5,000 VND for Paid courses",
        path: ["price"],
      });
    }

    if (data.courseType === 1 && data.price > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price must be 0 for Free courses",
        path: ["price"],
      });
    }

    // Validate Grading Type
    if (data.courseType === 1 && data.gradingType !== "1") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Free courses must use AI Only grading",
        path: ["gradingType"],
      });
    }
    if (data.courseType === 2 && data.gradingType !== "2") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Paid courses must use AI + Teacher Review grading",
        path: ["gradingType"],
      });
    }
  });

export type CourseSchemaType = z.infer<typeof courseSchema>;
