import { z } from "zod";

export const courseSchema = z
  .object({
    title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
    description: z.string().min(20, "Mô tả phải có ít nhất 20 ký tự"),
    levelId: z.string().min(1, "Vui lòng chọn chương trình & cấp độ"),
    templateId: z.string().optional(),

    // TopicIds: Form dùng mảng string
    topicIds: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một chủ đề"),
    courseType: z.number(),

    price: z.number().nonnegative(),

    durationDays: z.number().int().positive(),

    learningOutcome: z.string().min(10, "Vui lòng nhập kết quả học tập"),

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
    if (data.courseType === 2 && data.price < 100000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Giá phải ít nhất 100.000 VND đối với khóa học trả phí",
        path: ["price"],
      });
    }

    if (data.courseType === 2 && data.price > 5000000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Giá không được vượt quá 5.000.000 VND đối với khóa học trả phí",
        path: ["price"],
      });
    }

    if (data.courseType === 1 && data.price > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Giá phải là 0 đối với khóa học miễn phí",
        path: ["price"],
      });
    }

    // Validate Grading Type
    if (data.courseType === 1 && data.gradingType !== "1") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Khóa học miễn phí phải sử dụng chấm điểm tự động (AI Only)",
        path: ["gradingType"],
      });
    }
    if (data.courseType === 2 && data.gradingType !== "2") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Khóa học trả phí phải sử dụng chấm điểm bán tự động (Giáo viên + AI)",
        path: ["gradingType"],
      });
    }
  });

export type CourseSchemaType = z.infer<typeof courseSchema>;
