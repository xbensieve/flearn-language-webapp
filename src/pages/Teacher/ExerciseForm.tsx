/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  InputNumber,
  Divider,
  message,
  Radio,
  Typography,
} from "antd";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExercisePayload } from "../../services/course/type";
import {
  createExerciseService,
  updateExerciseService,
} from "../../services/course";
import {
  Type,
  HelpCircle,
  Save,
  Plus,
  Mic,
  Square,
  Trash2,
  RefreshCcw,
} from "lucide-react";
import { notifyError, notifySuccess } from "../../utils/toastConfig";
import type { UploadFile } from "antd/es/upload/interface";

const { Text } = Typography;

// --- 1. Cập nhật Interface theo yêu cầu ---
export interface ExerciseData {
  exerciseID: string;
  title: string;
  prompt: string;
  hints: string;
  content: string;
  expectedAnswer: string;
  mediaUrls: string[];
  mediaPublicIds: string[];
  position: number;
  exerciseType: string; // Đã đổi thành string
  difficulty: string; // Đã đổi thành string
  maxScore: number;
  passScore: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  courseID: string;
  courseTitle: string;
  unitID: string;
  unitTitle: string;
  lessonID: string;
  lessonTitle: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  lessonId: string;
  onCreated?: () => void;
  exercise?: ExerciseData;
}

// --- Helper Maps: String <-> Number ---
// Bạn cần đảm bảo các chuỗi case khớp chính xác với DB trả về
const getExerciseTypeId = (typeStr: string): number => {
  switch (typeStr) {
    case "RepeatAfterMe":
      return 1;
    case "PictureDescription":
      return 2;
    case "StoryTelling":
      return 3;
    case "Debate":
      return 4;
    default:
      return 1; // Mặc định
  }
};

const getDifficultyId = (diffStr: string): number => {
  switch (diffStr) {
    case "Easy":
      return 1;
    case "Medium":
      return 2;
    case "Hard":
      return 3;
    case "Advanced":
      return 4;
    default:
      return 1;
  }
};

// Nếu API tạo/sửa yêu cầu gửi String thì dùng hàm này, nếu API nhận số thì bỏ qua
// (Trong ví dụ này tôi giả định API nhận số int ở payload như code cũ, nếu nhận string thì báo tôi sửa lại payload)

const ExerciseForm: React.FC<Props> = ({ lessonId, onCreated, exercise }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const exerciseType = Form.useWatch("type", form);

  // --- Audio Recording State ---
  const [audioSource, setAudioSource] = useState<"upload" | "record">("upload");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isAudioFile = (file: UploadFile) => {
    const type = file.type || "";
    const name = file.name || "";
    return type.startsWith("audio/") || /\.(mp3|wav|ogg|webm)$/i.test(name);
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
          label: "Audio Source",
          isRequired: false,
          typeError: "Only audio files (MP3, WAV) are allowed!",
          requiredError: "Please provide an audio file (Upload or Record)!",
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

  // --- Recording Logic (Giữ nguyên) ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        stopTimer();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startTimer();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      message.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setRecordedBlob(null);
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }
    setRecordingTimer(0);
  };

  const startTimer = () => {
    setRecordingTimer(0);
    timerIntervalRef.current = setInterval(() => {
      setRecordingTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (payload: ExercisePayload) =>
      createExerciseService(lessonId, payload),
    onSuccess: () => {
      notifySuccess("Created exercise successfully!");
      queryClient.invalidateQueries({ queryKey: ["exercises", lessonId] });
      resetForm();
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
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update exercise";
      message.error(errorMsg);
      notifyError(errorMsg);
    },
  });

  const resetForm = () => {
    form.resetFields();
    form.setFieldsValue({ maxScore: 100, passScore: 40, type: 1 });
    deleteRecording();
    setAudioSource("upload");
    setExistingAudioUrl(null);
  };

  // --- 2. Initial Data Loading (FIXED) ---
  useEffect(() => {
    if (exercise) {
      const existingMedia = exercise.mediaUrls
        ? exercise.mediaUrls.map((url: string, index: number) => {
            const fileName = url.split("/").pop() || `File-${index}`;
            const isAudio = /\.(mp3|wav|ogg|webm)$/i.test(fileName);
            return {
              uid: `existing-${index}`,
              name: fileName,
              status: "done",
              url: url,
              type: isAudio ? "audio/mpeg" : "image/jpeg",
            } as UploadFile;
          })
        : [];

      // Convert String -> Number cho Form
      const mappedType = getExerciseTypeId(exercise.exerciseType);
      const mappedDifficulty = getDifficultyId(exercise.difficulty);

      form.setFieldsValue({
        title: exercise.title,
        prompt: exercise.prompt,
        hints: exercise.hints,
        content: exercise.content,
        expectedAnswer: exercise.expectedAnswer,
        type: mappedType, // Sử dụng ID đã map
        difficulty: mappedDifficulty, // Sử dụng ID đã map
        maxScore: exercise.maxScore ?? 100,
        passScore: exercise.passScore ?? 40,
        feedbackCorrect: exercise.feedbackCorrect,
        feedbackIncorrect: exercise.feedbackIncorrect,
        media: existingMedia,
      });

      // Logic Repeat After Me
      if (mappedType === 1) {
        setAudioSource("upload");
        deleteRecording();
        const audioFile = existingMedia.find((f: UploadFile) => isAudioFile(f));
        if (audioFile && audioFile.url) {
          setExistingAudioUrl(audioFile.url);
        }
      }
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise, form]);

  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      stopTimer();
    };
  }, [recordedUrl]);

  const handleTypeChange = (newType: number) => {
    const currentFiles: UploadFile[] = form.getFieldValue("media") || [];
    if (currentFiles.length > 0) {
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
      }
    }
    if (newType !== 1) {
      deleteRecording();
      setAudioSource("upload");
    }
  };

  const handleSubmit = (values: any) => {
    let finalFiles: File[] = [];

    if (values.type === 1) {
      if (audioSource === "record") {
        if (recordedBlob) {
          const audioFile = new File([recordedBlob], "recording.webm", {
            type: "audio/webm",
          });
          finalFiles = [audioFile];
        } else if (exercise && existingAudioUrl) {
          finalFiles = [];
        } else {
          message.error("Please record an audio clip!");
          return;
        }
      } else {
        const currentFileList = values.media || [];
        finalFiles = currentFileList
          .filter((f: UploadFile) => f.originFileObj)
          .map((f: UploadFile) => f.originFileObj);
      }
    } else {
      const currentFileList = values.media || [];
      finalFiles = currentFileList
        .filter((f: UploadFile) => f.originFileObj)
        .map((f: UploadFile) => f.originFileObj);
    }

    // Nếu API CẦN NHẬN STRING, bạn cần map ngược lại ở đây.
    // Nếu API vẫn nhận Int (1,2,3) thì giữ nguyên values.type
    const payload: ExercisePayload = {
      FeedbackIncorrect: values.feedbackIncorrect,
      PassScore: Number(values.passScore) || 40,
      Prompt: values.prompt,
      FeedbackCorrect: values.feedbackCorrect,
      Hints: values.hints,
      MaxScore: 100,
      MediaFiles: finalFiles.length > 0 ? finalFiles : undefined,
      ExpectedAnswer: values.expectedAnswer,
      Title: values.title,
      Content: values.content,
      Type: values.type, // Lưu ý: Đang gửi số (1,2,3). Nếu cần gửi string thì sửa dòng này.
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
    if (exerciseType === 1 && audioSource === "record") {
      if (exercise && existingAudioUrl) return Promise.resolve();
      return Promise.resolve();
    }
    if (config.isRequired) {
      if (!fileList || fileList.length === 0) {
        return Promise.reject(new Error(config.requiredError));
      }
    }
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

  const itemRender = (
    originNode: React.ReactElement,
    file: UploadFile,
    _fileList: object[],
    actions: { remove: () => void }
  ) => {
    const isAudio = isAudioFile(file);
    const previewUrl =
      file.url ||
      (file.originFileObj ? URL.createObjectURL(file.originFileObj) : "");

    if (isAudio) {
      return (
        <div className="flex items-center gap-3 p-3 mb-2 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-medium text-gray-700 truncate mb-1">
              {file.name}
            </div>
            {previewUrl && (
              <audio controls src={previewUrl} className="w-full h-8" />
            )}
          </div>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={actions.remove}
          />
        </div>
      );
    }
    return originNode;
  };

  return (
    <div className="py-2">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="space-y-6"
        initialValues={{ maxScore: 100, passScore: 40, type: 1 }}
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
              <Select
                onChange={handleTypeChange}
                options={[
                  { label: "Repeat After Me (Audio)", value: 1 },
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

        {/* ... Phần còn lại của Form giữ nguyên như cũ ... */}
        {/* Để tiết kiệm không gian, tôi chỉ liệt kê các phần logic quan trọng đã thay đổi ở trên */}

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

        {/* --- Media Section --- */}
        <div className="border border-dashed border-gray-300 rounded-xl p-6 bg-gray-50/30">
          <div className="flex justify-between items-center mb-4">
            <label className="text-gray-700 font-medium">
              {config.label}
              {(config.isRequired ||
                (exerciseType === 1 &&
                  audioSource === "record" &&
                  !existingAudioUrl)) && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>

            {exerciseType === 1 && (
              <Radio.Group
                value={audioSource}
                onChange={(e) => setAudioSource(e.target.value)}
                buttonStyle="solid"
                size="small"
              >
                <Radio.Button value="upload">Upload File</Radio.Button>
                <Radio.Button value="record">Record Voice</Radio.Button>
              </Radio.Group>
            )}
          </div>

          {exerciseType === 1 && audioSource === "record" ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 text-center space-y-4">
              {existingAudioUrl && !recordedUrl && !isRecording && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs font-semibold text-blue-600 mb-2 text-left uppercase">
                    Current Audio (Will be replaced if you record)
                  </p>
                  <audio controls src={existingAudioUrl} className="w-full" />
                </div>
              )}

              <div className="flex flex-col items-center justify-center gap-4">
                {isRecording ? (
                  <div className="flex items-center gap-2 text-red-500 animate-pulse font-medium">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    Recording... {formatTime(recordingTimer)}
                  </div>
                ) : recordedUrl ? (
                  <Text type="success" className="font-medium">
                    New recording ready to submit
                  </Text>
                ) : (
                  <Text type="secondary">
                    {existingAudioUrl
                      ? "Click microphone to replace current audio"
                      : "Click microphone to start recording"}
                  </Text>
                )}

                <div className="flex items-center gap-4">
                  {!isRecording && !recordedUrl && (
                    <Button
                      type="primary"
                      shape="circle"
                      size="large"
                      danger
                      icon={<Mic size={24} />}
                      onClick={startRecording}
                      className="h-16 w-16 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    />
                  )}

                  {isRecording && (
                    <Button
                      type="default"
                      shape="circle"
                      size="large"
                      icon={<Square size={20} fill="currentColor" />}
                      onClick={stopRecording}
                      className="h-16 w-16 flex items-center justify-center border-red-200 text-red-600 hover:text-red-700 hover:border-red-400"
                    />
                  )}

                  {recordedUrl && !isRecording && (
                    <div className="flex items-center gap-3">
                      <audio
                        controls
                        src={recordedUrl}
                        className="h-10 rounded-full bg-gray-100"
                      />
                      <Button
                        icon={<Trash2 size={16} />}
                        danger
                        type="text"
                        onClick={deleteRecording}
                      >
                        Delete
                      </Button>
                      <Button
                        icon={<RefreshCcw size={16} />}
                        onClick={deleteRecording}
                      >
                        Re-record
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Form.Item
              name="media"
              noStyle
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ validator: validateFileList }]}
            >
              <Upload.Dragger
                multiple
                accept={config.accept}
                beforeUpload={() => false}
                listType="picture"
                itemRender={itemRender}
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
                    ? "Upload Audio Files (MP3, WAV)"
                    : "Upload Image Files (JPG, PNG)"}
                </p>
              </Upload.Dragger>
            </Form.Item>
          )}
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
