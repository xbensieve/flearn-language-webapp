import React, { useState } from "react";
import {
  Card,
  Typography,
  Tag,
  Empty,
  Space,
  Button,
  Input,
  Skeleton,
  Drawer,
  Descriptions,
  Modal,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SoundOutlined,
  FileOutlined,
} from "@ant-design/icons";
import type { ExerciseData } from "../../../services/course/type";
import ExerciseForm from "../ExerciseForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteExercisesByLesson,
  getExercisesByLesson,
} from "../../../services/course";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";

const { Text, Paragraph } = Typography;

interface ExercisesListProps {
  onDelete?: (exerciseId: string) => void;
  onPreview?: (exercise: ExerciseData) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  lessonId: string;
  readonly?: boolean;
}

const TranslateExerciseType: Record<string, string> = {
  RepeatAfterMe: "Lặp lại theo mẫu",
  PictureDescription: "Mô tả tranh ảnh",
  StoryTelling: "Kể chuyện",
  Debate: "Tranh luận",
};

const TranslateDifficulty: Record<string, string> = {
  Easy: "Dễ",
  Medium: "Trung bình",
  Hard: "Khó",
  Advanced: "Nâng cao",
};

const ExercisesList: React.FC<ExercisesListProps> = ({
  onDelete,
  onPreview,
  onDragStart,
  onDragOver,
  onDrop,
  lessonId,
  readonly,
}) => {
  const [search, setSearch] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"preview" | "edit">("preview");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseData | null>(
    null
  );
  const queryClient = useQueryClient();
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);

  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(
    null
  );

  const { data, isLoading, refetch } = useQuery<ExerciseData[]>({
    queryKey: ["exercises", lessonId],
    queryFn: () => getExercisesByLesson(lessonId),
    select: (data) => data,
  });

  const { mutate: deleteExercise, isPending: isDeleting } = useMutation({
    mutationFn: deleteExercisesByLesson,
    onMutate: (variableId) => {
      setDeletingExerciseId(variableId);
    },
    onSettled: () => {
      setDeletingExerciseId(null);
    },
    onSuccess: (exerciseId) => {
      toast.success("Xóa bài tập thành công");
      queryClient.invalidateQueries({
        queryKey: ["exercises", selectedExercise?.lessonID],
      });
      onDelete?.(exerciseId);
      handleCloseDrawer();
      setConfirmDeleteVisible(false);
      refetch();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Xóa bài tập thất bại. Vui lòng thử lại.");
      setConfirmDeleteVisible(false);
    },
  });

  const handleOpenDrawer = (
    exercise: ExerciseData,
    mode: "preview" | "edit"
  ) => {
    setSelectedExercise(exercise);
    setDrawerMode(mode);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedExercise(null);
  };

  const handleDelete = (exerciseId: string) => {
    setExerciseToDelete(exerciseId);
    setConfirmDeleteVisible(true);
  };

  const handleConfirmDelete = () => {
    if (exerciseToDelete) {
      deleteExercise(exerciseToDelete);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteVisible(false);
    setExerciseToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton
            key={i}
            active
            avatar
            paragraph={{ rows: 3 }}
            className="rounded-md"
          />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-md shadow-sm border border-gray-100">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          imageStyle={{ height: 80 }}
          description={
            <Text className="text-gray-600 mt-4 text-lg">
              Chưa có bài tập nào
            </Text>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {!readonly && (
        <div className="flex justify-between items-center">
          <Input
            placeholder="Tìm kiếm bài tập..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md rounded-md border-gray-200 focus:border-blue-500 text-base"
            size="large"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data
          ?.filter((ex) =>
            ex.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((exercise, index) => (
            <div
              key={exercise.exerciseID}
              draggable
              onDragStart={(e) => onDragStart?.(e, index)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop?.(e, index)}
              className="cursor-move"
            >
              <Card
                hoverable
                className="group h-full rounded-md shadow-sm hover:shadow-sm transition-all duration-300 bg-white border border-gray-100 overflow-hidden"
                bodyStyle={{ padding: 0 }}
              >
                <div className="p-5 pb-3">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <Text
                        strong
                        className="text-lg text-gray-900 line-clamp-1"
                      >
                        {exercise.title}
                      </Text>
                      <Space size={4} wrap className="mt-2">
                        <Tag
                          color="blue"
                          className="text-xs font-medium px-2 py-0.5 rounded-md"
                        >
                          {TranslateExerciseType[exercise.exerciseType] ||
                            exercise.exerciseType}
                        </Tag>
                        <Tag
                          color="orange"
                          className="text-xs font-medium px-2 py-0.5 rounded-md"
                        >
                          {TranslateDifficulty[exercise.difficulty] ||
                            exercise.difficulty}
                        </Tag>
                      </Space>
                    </div>
                    {exercise.mediaUrls?.length > 0 && (
                      <div className="p-2 bg-blue-50 rounded-md">
                        {exercise.mediaUrls.some((url) =>
                          url.includes("mp3")
                        ) ? (
                          <SoundOutlined className="text-blue-600 text-base" />
                        ) : (
                          <FileOutlined className="text-blue-600 text-base" />
                        )}
                      </div>
                    )}
                  </div>

                  <Paragraph
                    ellipsis={{ rows: 3 }}
                    className="text-sm text-gray-600 leading-relaxed mb-0"
                  >
                    {exercise.prompt}
                  </Paragraph>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                  <span>
                    Điểm tối đa: <strong>{exercise.maxScore}</strong>
                  </span>
                  <span>
                    Điểm đạt: <strong>{exercise.passScore}</strong>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex divide-x divide-gray-200 border-t bg-white">
                  {readonly ? (
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        handleOpenDrawer(exercise, "preview");
                        onPreview?.(exercise);
                      }}
                      className="flex-1 h-12 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium rounded-none"
                    >
                      Xem trước
                    </Button>
                  ) : (
                    <>
                      <Tooltip title="Xem trước">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => {
                            handleOpenDrawer(exercise, "preview");
                            onPreview?.(exercise);
                          }}
                          className="flex-1 h-12 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium rounded-none"
                        >
                          Xem trước
                        </Button>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleOpenDrawer(exercise, "edit")}
                          className="flex-1 h-12 text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-medium rounded-none"
                        >
                          Chỉnh sửa
                        </Button>
                      </Tooltip>
                      <Tooltip title="Xóa bỏ">
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(exercise.exerciseID)}
                          className="flex-1 h-12 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-medium rounded-none"
                          loading={
                            isDeleting &&
                            deletingExerciseId === exercise.exerciseID
                          }
                        >
                          Xóa bỏ
                        </Button>
                      </Tooltip>
                    </>
                  )}
                </div>
              </Card>
            </div>
          ))}
      </div>
      <Modal
        open={confirmDeleteVisible}
        onCancel={handleCancelDelete}
        onOk={handleConfirmDelete}
        okText="Xóa bài tập"
        cancelText="Thoát"
        okButtonProps={{ danger: true, loading: isDeleting }}
        centered
        width={420}
      >
        <div className="text-center py-4">
          <Text className="text-gray-700 text-lg">
            Bạn có chắc chắn muốn xóa bài tập này? Hành động này không thể hoàn
            tác.
          </Text>
        </div>
      </Modal>
      <Drawer
        title={
          <div className="flex items-center gap-3">
            {drawerMode === "preview" ? (
              <EyeOutlined className="text-blue-600" />
            ) : (
              <EditOutlined className="text-amber-600" />
            )}
            <span className="font-semibold text-lg">
              {drawerMode === "preview" ? "Xem trước" : "Chỉnh sửa"}:{" "}
              {selectedExercise?.title}
            </span>
          </div>
        }
        width={720}
        open={drawerVisible}
        onClose={handleCloseDrawer}
        headerStyle={{
          borderBottom: "1px solid #f0f0f0",
          padding: "16px 24px",
        }}
        bodyStyle={{ padding: "24px" }}
        footer={null}
      >
        {selectedExercise && (
          <>
            {drawerMode === "preview" ? (
              <div className="space-y-6">
                {selectedExercise?.mediaUrls &&
                  selectedExercise.mediaUrls.length > 0 && (
                    <div className="space-y-6">
                      <Text
                        strong
                        className="text-lg text-gray-800 flex items-center gap-2"
                      >
                        <FileOutlined
                          style={{ marginRight: "8px" }}
                          className="text-blue-600"
                        />
                        Media ({selectedExercise.mediaUrls.length} file
                        {selectedExercise.mediaUrls.length > 1 ? "s" : ""})
                      </Text>

                      <div className="space-y-8">
                        {selectedExercise.mediaUrls.map((url, index) => {
                          const fileName =
                            url.split("/").pop()?.split("?")[0] ||
                            `media-${index + 1}`;
                          const isImage = /\.(jpe?g|png|webp|gif|svg)$/i.test(
                            url
                          );
                          const isAudio = /\.(mp3|mpeg|wav|ogg|webm)$/i.test(
                            url
                          );

                          return (
                            <div
                              key={index}
                              className="bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden"
                            >
                              {/* Header */}
                              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {isImage ? (
                                      <ImageIcon
                                        size={18}
                                        className="text-blue-600"
                                      />
                                    ) : isAudio ? (
                                      <SoundOutlined className="text-purple-600 text-lg" />
                                    ) : (
                                      <FileOutlined className="text-gray-600" />
                                    )}
                                    <Text strong className="text-gray-800">
                                      {fileName}
                                    </Text>
                                  </div>
                                  <Tag
                                    color={
                                      isImage
                                        ? "blue"
                                        : isAudio
                                        ? "purple"
                                        : "default"
                                    }
                                  >
                                    {isImage
                                      ? "Image"
                                      : isAudio
                                      ? "Audio"
                                      : "File"}
                                  </Tag>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="p-8 bg-gray-50">
                                {isImage ? (
                                  <div className="flex justify-center">
                                    <img
                                      src={url}
                                      alt={fileName}
                                      className="rounded-md shadow-xl max-h-96 object-contain border-4 border-white"
                                      style={{ maxHeight: "70vh" }}
                                    />
                                  </div>
                                ) : isAudio ? (
                                  <div className="max-w-2xl mx-auto">
                                    <div className="bg-white rounded-md shadow-inner p-6 border border-gray-200">
                                      <audio
                                        controls
                                        controlsList="nodownload"
                                        className="w-full h-14"
                                        style={{
                                          borderRadius: "12px",
                                          background: "#f8fafc",
                                        }}
                                      >
                                        <source src={url} type="audio/mpeg" />
                                        Trình duyệt của bạn không hỗ trợ phát
                                        audio.
                                      </audio>
                                    </div>
                                    <Text
                                      type="secondary"
                                      className="block text-center mt-3 text-sm"
                                    >
                                      Nhấn phát để nghe audio
                                    </Text>
                                  </div>
                                ) : (
                                  <div className="text-center py-12 text-gray-500">
                                    <FileOutlined className="text-5xl mb-4 text-gray-400" />
                                    <Text>Loại tệp không được hỗ trợ</Text>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                <Descriptions
                  bordered
                  column={1}
                  size="middle"
                  className="bg-gray-50 rounded-md"
                >
                  <Descriptions.Item label="Tiêu đề" className="py-3">
                    {selectedExercise.title}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hướng dẫn" className="py-3">
                    <div className="whitespace-pre-wrap">
                      {selectedExercise.prompt}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Nội dung" className="py-3">
                    <div className="whitespace-pre-wrap">
                      {selectedExercise.content}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại" className="py-3">
                    <Tag color="blue">{TranslateExerciseType[selectedExercise.exerciseType]}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Độ khó" className="py-3">
                    <Tag color="orange">{TranslateDifficulty[selectedExercise.difficulty]}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Điểm tối đa" className="py-3">
                    <Text strong>{selectedExercise.maxScore}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Điểm đạt" className="py-3">
                    <Text strong>{selectedExercise.passScore}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ) : (
              <ExerciseForm
                lessonId={selectedExercise.lessonID}
                exercise={selectedExercise}
              />
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default ExercisesList;
