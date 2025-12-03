/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  InputNumber,
  Divider,
  message,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExerciseData, ExercisePayload } from "../../services/course/type";
import {
  createExerciseService,
  updateExerciseService,
} from "../../services/course";
import { Type, HelpCircle, Save, Plus } from "lucide-react";
import { notifySuccess } from "../../utils/toastConfig";
import type { UploadFile } from "antd/es/upload/interface";

interface Props {
  lessonId: string;
  onCreated?: () => void;
  exercise?: ExerciseData;
}

const ExerciseForm: React.FC<Props> = ({ lessonId, onCreated, exercise }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const exerciseType = Form.useWatch("type", form);

  const isAudioFile = (file: UploadFile) => {
    const type = file.type || "";
    const name = file.name || "";
    return type.startsWith("audio/") || /\.(mp3|wav|ogg)$/i.test(name);
  };

  const isImageFile = (file: UploadFile) => {
    const type = file.type || "";
    const name = file.name || "";
    return (
      type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(name)
    );
  };


  const config = useMemo(() => {
    switch (exerciseType) {
      case 1: // Repeat After Me
        return {
          accept: "audio/*",
          label: "Attached Audio",
          isRequired: false,
          typeError: "Only audio files (MP3, WAV) are allowed!",
          requiredError: "",
        };
      case 2: // Picture Description
      case 3: // Story Telling
        return {
          accept: "image/*",
          label: "Attached Images",
          isRequired: true,
          typeError: "Only image files (JPG, PNG) are allowed!",
          requiredError: "You must upload at least one image!",
        };
      case 4: // Debate
        return {
          accept: "image/*",
          label: "Attached Images",
          isRequired: false,
          typeError: "Only image files are allowed for Debate!",
          requiredError: "",
        };
      default:
        return {
          accept: "image/*,audio/*",
          label: "Attached Media",
          isRequired: false,
          typeError: "Invalid file type",
          requiredError: "",
        };
    }
  }, [exerciseType]);

  // --- 2. Mutations ---
  const createMutation = useMutation({
    mutationFn: (payload: ExercisePayload) =>
      createExerciseService(lessonId, payload),
    onSuccess: () => {
      notifySuccess("Created exercise successfully!");
      queryClient.invalidateQueries({ queryKey: ["exercises", lessonId] });
      form.resetFields();
      form.setFieldsValue({ maxScore: 100, passScore: 40, type: 1 });
      onCreated?.();
    },
    onError: () => message.error("Failed to create exercise"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: ExercisePayload) =>
      updateExerciseService({
        lessonId: lessonId,
        exerciseId: exercise!.exerciseID,
        payload,
      }),
    onSuccess: () => {
      notifySuccess("Updated exercise successfully!");
      queryClient.invalidateQueries({ queryKey: ["exercises", lessonId] });
      onCreated?.();
    },
    onError: () => message.error("Failed to update exercise"),
  });

  // --- 3. Initial Data Loading ---
  useEffect(() => {
    if (exercise) {
      const existingMedia = exercise.mediaUrls
        ? exercise.mediaUrls.map((url: string, index: number) => {
            const fileName = url.split("/").pop() || `File-${index}`;
            return {
              uid: `existing-${index}`,
              name: fileName,
              status: "done",
              url: url,
              type: /\.(mp3|wav|ogg)$/i.test(fileName)
                ? "audio/mpeg"
                : "image/jpeg",
            } as UploadFile;
          })
        : [];

      form.setFieldsValue({
        title: exercise.title,
        prompt: exercise.prompt,
        hints: exercise.hints,
        content: exercise.content,
        expectedAnswer: exercise.expectedAnswer,
        type: exercise.exerciseType,
        difficulty: exercise.difficulty,
        maxScore: exercise.maxScore ?? 100,
        passScore: exercise.passScore ?? 40,
        feedbackCorrect: exercise.feedbackCorrect,
        feedbackIncorrect: exercise.feedbackIncorrect,
        media: existingMedia,
      });
    } else {
      form.setFieldsValue({
        maxScore: 100,
        passScore: 40,
        type: 1,
        difficulty: 1,
        media: [],
      });
    }
  }, [exercise, form]);

  const handleTypeChange = (newType: number) => {
    const currentFiles: UploadFile[] = form.getFieldValue("media") || [];

    if (currentFiles.length === 0) return;

    let shouldClear = false;
    let reason = "";

    if (newType === 1) {
      const hasImage = currentFiles.some((f) => isImageFile(f));
      if (hasImage) {
        shouldClear = true;
        reason = "Switched to Audio mode. Images were removed.";
      }
    } else {
      const hasAudio = currentFiles.some((f) => isAudioFile(f));
      if (hasAudio) {
        shouldClear = true;
        reason = "Switched to Image mode. Audio files were removed.";
      }
    }

    if (shouldClear) {
      form.setFieldsValue({ media: [] });
      message.warning(reason); 
    } else {
      form.validateFields(["media"]);
    }
  };

  // --- 5. Submit Handler ---
  const handleSubmit = (values: any) => {
    const currentFileList = values.media || [];
    const newFiles = currentFileList
      .filter((f: UploadFile) => f.originFileObj)
      .map((f: UploadFile) => f.originFileObj);

    const payload: ExercisePayload = {
      FeedbackIncorrect: values.feedbackIncorrect,
      PassScore: Number(values.passScore) || 40,
      Prompt: values.prompt,
      FeedbackCorrect: values.feedbackCorrect,
      Hints: values.hints,
      MaxScore: 100,
      MediaFiles: newFiles.length > 0 ? newFiles : undefined,
      ExpectedAnswer: values.expectedAnswer,
      Title: values.title,
      Content: values.content,
      Type: values.type,
      Difficulty: values.difficulty,
    };

    if (exercise) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const validateFileList = async (_: any, fileList: UploadFile[]) => {
    // 1. Check Required
    if (config.isRequired) {
      if (!fileList || fileList.length === 0) {
        return Promise.reject(new Error(config.requiredError));
      }
    }

    // 2. Check Valid Type (Phòng trường hợp user cố tình upload sai lúc chưa chuyển tab)
    if (fileList && fileList.length > 0) {
      const isInvalid = fileList.some((file) => {
        if (config.accept === "audio/*") return !isAudioFile(file);
        if (config.accept === "image/*") return !isImageFile(file);
        return false;
      });

      if (isInvalid) {
        return Promise.reject(new Error(config.typeError));
      }
    }
    return Promise.resolve();
  };

  return (
    <div className="py-2">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="space-y-6"
        initialValues={{ maxScore: 100, passScore: 40 }}
      >
        <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Type size={18} className="text-blue-600" /> Question Setup
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="title"
              label="Internal Title"
              rules={[{ required: true, message: "Please enter a title" }]}
              className="md:col-span-2"
            >
              <Input placeholder="e.g. Grammar Check #1" />
            </Form.Item>
            <Form.Item
              name="type"
              label="Interaction Type"
              rules={[{ required: true }]}
            >
              {/* Thêm onChange vào đây để xử lý logic xóa file */}
              <Select
                onChange={handleTypeChange}
                options={[
                  { label: "Repeat After Me (Audio Only)", value: 1 },
                  { label: "Picture Description (Image Required)", value: 2 },
                  { label: "Story Telling (Image Required)", value: 3 },
                  { label: "Debate (Image Only)", value: 4 },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="difficulty"
              label="Difficulty Level"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { label: "Easy", value: 1 },
                  { label: "Medium", value: 2 },
                  { label: "Hard", value: 3 },
                  { label: "Advanced", value: 4 },
                ]}
              />
            </Form.Item>
          </div>
        </div>

        <div className="space-y-4">
          <Form.Item
            name="prompt"
            label="Student Instruction (Prompt)"
            rules={[{ required: true, message: "Instruction is required" }]}
          >
            <Input.TextArea
              rows={2}
              placeholder="What should the student do?"
              className="bg-white"
            />
          </Form.Item>
          <Form.Item
            name="content"
            label="Exercise Content (Context)"
            rules={[{ required: true, message: "Content is required" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="The main text or context for the exercise..."
            />
          </Form.Item>
          <Form.Item
            name="expectedAnswer"
            label="Expected Answer / Key"
            rules={[{ required: true, message: "Answer is required" }]}
          >
            <Input.TextArea rows={2} className="font-mono text-sm bg-gray-50" />
          </Form.Item>
        </div>

        <Divider />

        <div className="border border-dashed border-gray-300 rounded-xl p-6 bg-gray-50/30">
          <Form.Item
            name="media"
            label={
              <span>
                {config.label}
                {config.isRequired && (
                  <span className="text-red-500 ml-1">*</span>
                )}
                <span className="text-gray-400 font-normal text-xs ml-2">
                  ({config.accept === "image/*" ? "JPG, PNG" : "MP3, WAV"})
                </span>
              </span>
            }
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ validator: validateFileList }]}
          >
            <Upload.Dragger
              multiple
              accept={config.accept}
              beforeUpload={() => false}
              listType={config.accept === "audio/*" ? "text" : "picture"}
              className="bg-white"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag files here to upload
              </p>
              <p className="ant-upload-hint">
                {exerciseType === 1
                  ? "Upload Audio Files"
                  : "Upload Image Files"}
              </p>
            </Upload.Dragger>
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Scoring</h4>
            <div className="flex gap-4">
              <Form.Item
                name="maxScore"
                label="Max Score"
                className="flex-1"
                help="Fixed at 100 points"
              >
                <InputNumber
                  disabled
                  className="w-full !text-gray-700 !bg-gray-100"
                />
              </Form.Item>
              <Form.Item
                name="passScore"
                label="Pass Threshold"
                className="flex-1"
                rules={[
                  { required: true, message: "Required" },
                  { type: "number", min: 40, message: "Min 40" },
                  { type: "number", max: 100, message: "Max 100" },
                ]}
              >
                <InputNumber min={40} max={100} className="w-full" />
              </Form.Item>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Assistive Text</h4>
            <Form.Item name="hints" label="Hint for Student">
              <Input
                prefix={<HelpCircle size={14} className="text-gray-400" />}
              />
            </Form.Item>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="feedbackCorrect" label="Success Message">
            <Input.TextArea
              rows={2}
              className="border-green-200 focus:border-green-500"
              placeholder="Well done!"
            />
          </Form.Item>
          <Form.Item name="feedbackIncorrect" label="Failure Message">
            <Input.TextArea
              rows={2}
              className="border-red-200 focus:border-red-500"
              placeholder="Try again. Remember..."
            />
          </Form.Item>
        </div>

        <div className="flex justify-end pt-4 gap-3">
          {onCreated && (
            <Button onClick={onCreated} className="h-10 px-6 rounded-lg">
              Cancel
            </Button>
          )}
          <Button
            type="primary"
            htmlType="submit"
            loading={createMutation.isPending || updateMutation.isPending}
            icon={exercise ? <Save size={16} /> : <Plus size={16} />}
            className="h-10 px-8 bg-gray-900 hover:bg-gray-800 rounded-lg flex items-center gap-2"
          >
            {exercise ? "Save Changes" : "Create Exercise"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ExerciseForm;
