/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Button,
  Tabs,
  Drawer,
  message,
  Modal,
  Badge,
  Tooltip,
  Form,
  Input,
  Upload,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill-new";
import "@/index.css";
import "react-quill-new/dist/quill.snow.css";
import { useUpdateLesson } from "../helpers";
import type { Lesson } from "../../../services/course/type";
import ExerciseForm from "../ExerciseForm";
import ExercisesList from "./ExercisesList";
import {
  FileText,
  Video,
  Trash2,
  Eye,
  Dumbbell,
  Download,
  PlayCircle,
  AlertCircle,
  PencilIcon,
  Book,
} from "lucide-react";
import { toast } from "sonner";
interface Props {
  lesson: Lesson;
  onUpdated: () => void;
  onDeleted: (id: string) => void;
}

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const LessonItem: React.FC<Props> = ({ lesson, onUpdated, onDeleted }) => {
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [exerciseDrawerVisible, setExerciseDrawerVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const [form] = Form.useForm();
  const updateLesson = useUpdateLesson(lesson.courseUnitID, () => {
    toast.success("Cập nhật bài học thành công");
    onUpdated();
    setEditDrawerVisible(false);
  });

  const handleOpenEditDrawer = () => {
    form.setFieldsValue({
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      video: lesson.videoUrl
        ? [{ uid: "-1", name: "video", status: "done", url: lesson.videoUrl }]
        : undefined,
      document: lesson.documentUrl
        ? [
            {
              uid: "-1",
              name: "document",
              status: "done",
              url: lesson.documentUrl,
            },
          ]
        : undefined,
    });
    setEditDrawerVisible(true);
  };

  const handleSave = (values: any) => {
    const formData = new FormData();
    formData.append("Title", values.title);
    formData.append("Description", values.description || "");
    formData.append("Content", values.content || "");
    if (values.video && values.video.length > 0) {
      const file = values.video[0];
      if (file.originFileObj) {
        formData.append("VideoFile", file.originFileObj);
      }
    }
    if (values.document && values.document.length > 0) {
      const file = values.document[0];
      if (file.originFileObj) {
        formData.append("DocumentFile", file.originFileObj);
      }
    }
    updateLesson.mutate({ id: lesson.lessonID, formData });
  };

  const renderVideo = (url?: string) => {
    if (!url) return null;
    const yt = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/
    );

    return (
      <div className="relative w-full aspect-video rounded-md overflow-hidden bg-slate-900 shadow-sm border border-slate-200 mb-6 group">
        {yt ? (
          <iframe
            src={`https://www.youtube.com/embed/${yt[1]}`}
            title="Video bài học"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <video controls className="w-full h-full" src={url} />
        )}
      </div>
    );
  };

  const renderDocument = (url?: string) => {
    if (!url) return null;
    return (
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Download size={16} className="text-blue-600" /> Tài nguyên đính kèm
        </h4>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md transition-all group/doc max-w-md"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-red-50 text-red-500 flex items-center justify-center shadow-sm">
              <FileText size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm group-hover/doc:text-blue-700 transition-colors">
                Tài liệu bài học
              </p>
              <p className="text-xs text-gray-500 group-hover/doc:text-blue-500">
                Nhấp để xem hoặc tải xuống
              </p>
            </div>
          </div>
          <Download
            size={16}
            className="text-gray-400 group-hover/doc:text-blue-600"
          />
        </a>
      </div>
    );
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-all duration-300 mb-6 overflow-hidden">
      <div className="px-6 py-5 flex items-start justify-between border-b border-gray-100 bg-white">
        <div className="flex gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {lesson.title}
            </h3>
            <p className="text-gray-500 text-sm line-clamp-1 max-w-xl">
              {lesson.description || "Chưa có mô tả nào được thêm vào."}
            </p>
            <div className="flex items-center gap-4 pt-1">
              {lesson.videoUrl && (
                <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  <PlayCircle size={12} className="text-blue-500" /> Video
                </div>
              )}
              {lesson.totalExercises > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Dumbbell size={12} className="text-orange-500" />{" "}
                  {lesson.totalExercises}Bài tập
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="Xem trước bài học">
            <Button
              type="text"
              shape="circle"
              icon={
                <Eye size={18} className="text-gray-500 hover:text-blue-600" />
              }
              onClick={() => setPreviewVisible(true)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa bài học">
            <Button
              type="text"
              shape="circle"
              icon={
                <PencilIcon
                  size={18}
                  className="text-gray-500 hover:text-gray-900"
                />
              }
              onClick={handleOpenEditDrawer}
            />
          </Tooltip>
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <Tooltip title="Xóa bài học">
            <Button
              type="text"
              danger
              shape="circle"
              icon={<Trash2 size={18} />}
              onClick={() => setConfirmDeleteVisible(true)}
              className="hover:bg-red-50"
            />
          </Tooltip>
        </div>
      </div>

      <div className="bg-gray-50/50">
        <Tabs
          defaultActiveKey="content"
          className="custom-tabs"
          tabBarStyle={{
            padding: "0 16px",
            marginBottom: 0,
            borderBottom: "1px solid #e5e7eb",
            background: "#f9fafb",
          }}
          items={[
            {
              key: "content",
              label: (
                <span className="flex items-center gap-2 py-2 text-sm font-medium">
                  Nội dung
                </span>
              ),
              children: (
                <div className="p-8 bg-white min-h-[200px]">
                  {lesson.videoUrl && (
                    <div className="max-w-3xl mb-8 justify-center">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
                          <Video size={16} />
                        </div>
                        <h1 className="font-semibold text-gray-900">
                          Bài giảng video
                        </h1>
                      </div>
                      {renderVideo(lesson.videoUrl)}
                    </div>
                  )}
                  <div
                    className="prose prose-slate prose-sm md:prose-base max-w-none 
                            prose-headings:font-bold prose-headings:text-gray-900 
                            prose-p:text-gray-600 prose-p:leading-relaxed
                            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                            prose-img:rounded-xl prose-img:shadow-md
                            prose-strong:text-gray-900 prose-strong:font-bold"
                  >
                    {lesson.content ? (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
                            <Book size={16} />
                          </div>
                          <h1 className="font-semibold text-gray-900">
                            Nội dung bài học
                          </h1>
                        </div>
                        <div
                          className="bg-gray-50/50 p-6 rounded-md border border-gray-100 overflow-auto max-h-[400px] w-full"
                          dangerouslySetInnerHTML={{ __html: lesson.content }}
                        />
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-400 italic">
                        Chưa có nội dung nào được thêm vào.
                      </div>
                    )}
                  </div>
                  {renderDocument(lesson.documentUrl)}
                </div>
              ),
            },
            {
              key: "exercises",
              label: (
                <span className="flex items-center gap-2 py-2 text-sm font-medium">
                  Bài tập
                  {lesson.totalExercises > 0 && (
                    <Badge
                      count={lesson.totalExercises}
                      style={{
                        backgroundColor: "#f1f5f9",
                        color: "#475569",
                        boxShadow: "none",
                        fontWeight: 600,
                      }}
                    />
                  )}
                </span>
              ),
              children: (
                <div className="p-6 bg-gray-50/50 min-h-[200px]">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Bài tập thực hành
                      </h3>
                      <p className="text-sm text-gray-500">
                        Quản lý các bài tập liên quan đến bài học này.
                      </p>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setExerciseDrawerVisible(true)}
                      className="bg-gray-900 hover:bg-gray-800 border-none shadow-lg shadow-gray-200"
                    >
                      Thêm bài tập mới
                    </Button>
                  </div>
                  <ExercisesList lessonId={lesson.lessonID} />
                </div>
              ),
            },
          ]}
        />
      </div>
      <Drawer
        title={
          <div className="flex items-center gap-2 text-gray-900">
            Chỉnh sửa bài học
          </div>
        }
        width={720}
        open={editDrawerVisible}
        onClose={() => setEditDrawerVisible(false)}
        footer={
          <div className="flex justify-end gap-3 px-4 py-2">
            <Button
              onClick={() => setEditDrawerVisible(false)}
              className="rounded-md h-10 px-6"
            >
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              onClick={() => handleSave(form.getFieldsValue())}
              loading={updateLesson.isPending}
              className="rounded-lg h-10 px-6 bg-blue-600"
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" className="space-y-6">
          <Form.Item
            name="title"
            label="Tiêu đề bài học"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề bài học" },
            ]}
          >
            <Input size="large" className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả ngắn"
            className="mb-0"
            rules={[{ required: true, message: "Vui lòng nhập mô tả ngắn" }]}
          >
            <Input.TextArea rows={2} className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            className="mb-0"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung bài học" },
            ]}
          >
            <ReactQuill theme="snow" className="h-64 mb-12 rounded-md" />
          </Form.Item>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="video"
              label="Video bài học"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload beforeUpload={() => false} maxCount={1} accept="video/*">
                <Button
                  block
                  icon={<UploadOutlined />}
                  className="h-10 rounded-md"
                >
                  Tải video lên
                </Button>
              </Upload>
            </Form.Item>
            <Form.Item
              name="document"
              label="Tài liệu đính kèm"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                accept=".pdf,.doc,.docx"
              >
                <Button
                  block
                  icon={<UploadOutlined />}
                  className="h-10 rounded-md"
                >
                  Tải tài liệu lên
                </Button>
              </Upload>
            </Form.Item>
          </div>
        </Form>
      </Drawer>
      <Modal
        title={null}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={
          <div className="flex justify-end pt-2">
            <Button
              onClick={() => setPreviewVisible(false)}
              className="rounded-md"
            >
              Đóng
            </Button>
          </div>
        }
        width={900}
        centered
        className="rounded-sm overflow-hidden"
      >
        <div className="p-2">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 m-0">
                {lesson.title}
              </h2>
              <p className="text-gray-500 m-0 text-sm">{lesson.description}</p>
            </div>
          </div>

          <div className="space-y-6">
            {lesson.videoUrl && (
              <>
                <h3 className="text-black p-2">Video bài học</h3>
                {renderVideo(lesson.videoUrl)}
              </>
            )}
            {lesson.content && (
              <>
                <h3 className="text-black p-2">Nội dung bài học</h3>
                <div
                  className="bg-gray-50/50 p-6 rounded-md border border-gray-100 overflow-auto max-h-[400px] w-full"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              </>
            )}
            {lesson.documentUrl && renderDocument(lesson.documentUrl)}
            {!lesson.documentUrl && !lesson.videoUrl && !lesson.content && (
              <div className="text-center py-10 text-gray-400">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Bài học này hiện đang trống.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
      <Drawer
        title="Thêm bài tập mới"
        width={800}
        open={exerciseDrawerVisible}
        onClose={() => setExerciseDrawerVisible(false)}
      >
        <ExerciseForm
          lessonId={lesson.lessonID}
          onCreated={() => {
            message.success("Đã thêm bài tập");
            onUpdated();
            setExerciseDrawerVisible(false);
          }}
        />
      </Drawer>
      <Modal
        title={
          <span className="flex items-center gap-2 text-red-600">
            <AlertCircle size={20} /> Xác nhận xóa bài học
          </span>
        }
        open={confirmDeleteVisible}
        onOk={() => {
          onDeleted(lesson.lessonID);
          setConfirmDeleteVisible(false);
        }}
        onCancel={() => setConfirmDeleteVisible(false)}
        okButtonProps={{ danger: true, className: "bg-red-600" }}
        okText="Xóa bài học"
        cancelText="Hủy bỏ"
      >
        <p className="text-gray-600 mt-2">
          Bạn có chắc chắn muốn xóa bài học này? Hành động này không thể hoàn
          tác.
        </p>
      </Modal>
    </div>
  );
};

export default LessonItem;
