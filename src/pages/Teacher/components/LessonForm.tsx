/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Form, Input, Upload, Button, Row, Col, Divider } from "antd";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import type { Unit } from "../../../services/course/type";
import { useCreateLesson } from "../helpers";
import {
  Upload as UploadIcon,
  Video,
  FileText,
  Check,
  Book,
} from "lucide-react";

interface LessonFormProps {
  unit: Unit;
  onSuccess: () => void;
}

const LessonForm: React.FC<LessonFormProps> = ({ unit, onSuccess }) => {
  const [form] = Form.useForm();
  const createLesson = useCreateLesson(unit.courseUnitID, onSuccess);

  const handleSubmit = (values: any) => {
    const formData = new FormData();
    formData.append("Title", values.title);
    formData.append("Description", values.description || "");
    formData.append("Content", values.content || "");
    formData.append("CourseUnitID", unit.courseUnitID);
    if (values.video?.file) formData.append("VideoFile", values.video.file);
    if (values.document?.file)
      formData.append("DocumentFile", values.document.file);
    createLesson.mutate(formData);
  };

  return (
    <div className="py-2">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-8"
        requiredMark="optional"
      >
        <div className="space-y-4">
          <div className="mt-2">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Book size={18} className="text-gray-500" /> Thông tin cơ bản
            </h3>
            <p className="text-sm text-gray-500">
              Cung cấp các thông tin cơ bản về bài học.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Form.Item
              label="Tiêu đề bài học"
              name="title"
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề bài học" },
              ]}
            >
              <Input size="large" placeholder="Nhập tiêu đề bài học" />
            </Form.Item>

            <Form.Item
              label="Mô tả ngắn"
              name="description"
              rules={[{ required: true, message: "Vui lòng nhập mô tả ngắn" }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Nhập mô tả ngắn về bài học"
                className="resize-none"
              />
            </Form.Item>
          </div>
        </div>
        <Divider />
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-gray-500" /> Nội dung bài học
            </h3>
          </div>
          <Form.Item
            name="content"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung bài học" },
            ]}
            className="mb-0"
          >
            <ReactQuill
              theme="snow"
              placeholder="Nhập nội dung bài học tại đây..."
              className="h-64 mb-12"
              onChange={(e) => form.setFieldValue("content", e)}
            />
          </Form.Item>
        </div>
        <Divider />
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Video size={18} className="text-gray-500" /> Tài nguyên bổ sung
            </h3>
            <p className="text-sm text-gray-500">
              Thêm tài nguyên bổ sung cho bài học của bạn.
            </p>
          </div>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Video bài học"
                name="video"
                valuePropName="file"
                help="Định dạng video được hỗ trợ: MP4, AVI, MOV"
              >
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="video/*"
                >
                  <Button
                    block
                    icon={<UploadIcon size={16} />}
                    className="flex items-center justify-center gap-2 h-10"
                  >
                    Chọn video
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tài liệu đính kèm"
                name="document"
                valuePropName="file"
                help="Định dạng tài liệu được hỗ trợ: PDF, DOC, DOCX"
              >
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  accept=".pdf,.doc,.docx"
                >
                  <Button
                    block
                    icon={<FileText size={16} />}
                    className="flex items-center justify-center gap-2 h-10"
                  >
                    Chọn tài liệu
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </div>
        <div className="flex justify-end gap-3">
          <Button onClick={() => form.resetFields()} className="text-gray-500">
            Đặt lại biểu mẫu
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createLesson.isPending}
            icon={<Check size={16} />}
            className="bg-gray-900 hover:bg-gray-800 h-10 px-6"
          >
            Tạo bài học
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default LessonForm;
