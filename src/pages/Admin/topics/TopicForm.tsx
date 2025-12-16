import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTopicSchema, updateTopicSchema } from "./schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import type { TopicResponse } from "@/types/topic";
import { Loader2 } from "lucide-react";

interface TopicFormProps {
  initialData?: TopicResponse | null;
  onSubmit: (values: any) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export const TopicForm: React.FC<TopicFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}) => {
  const isEdit = !!initialData;
  const [preview, setPreview] = useState<string | null>(
    initialData?.imageUrl || null
  );

  const form = useForm<any>({
    resolver: zodResolver(isEdit ? updateTopicSchema : createTopicSchema),
    defaultValues: {
      name: initialData?.topicName || "",
      description: initialData?.topicDescription || "",
      contextPrompt: initialData?.contextPrompt || "",
      status: initialData?.status ?? true, // Mặc định true nếu tạo mới (dù BE set false, FE nên để true để UX tốt hơn)
      image: undefined,
    },
  });

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldChange: (file: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      fieldChange(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Tên chủ đề */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tên chủ đề <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Ví dụ: Daily Conversation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Mô tả <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Mô tả ngắn về chủ đề..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contextPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Context Prompt (AI) <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="System prompt cho AI..."
                  className="h-32 font-mono text-xs"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEdit && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Trạng thái hoạt động</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="image"
          // Lưu ý: Dùng code sửa lỗi 'value' ở bước trước
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Ảnh bìa
                {/* Chỉ hiện dấu * khi Tạo mới (vì Update ảnh là optional) */}
                {!isEdit && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-md border"
                    />
                  )}
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, field.onChange)}
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      disabled={field.disabled}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            className="cursor-pointer"
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-400 hover:bg-blue-300 cursor-pointer"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
