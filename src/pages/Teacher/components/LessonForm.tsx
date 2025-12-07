/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Form, Input, Upload, Button, Row, Col, Divider, Alert } from "antd";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import type { Unit } from "../../../services/course/type";
import { useCreateLesson } from "../helpers";
import {
  Upload as UploadIcon,
  Video,
  FileText,
  Check,
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
        <Alert
          message="Bài học soạn thảo"
          description={`Bạn đang thêm một bài học vào đơn vị: "${unit.title}".`}
          type="info"
          showIcon
          className="mb-6 border-blue-100 bg-blue-50/50"
        />

        {/* Section 1: General Information */}
        <div className="space-y-4">
          <div className="mt-2">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              Thông tin chung
            </h3>
            <p className="text-sm text-gray-500">
              Thông tin cơ bản về bài học này.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Form.Item
              label="Tiêu đề bài học"
              name="title"
              rules={[{ required: true, message: "Tiêu đề là bắt buộc" }]}
            >
              <Input size="large" placeholder="Nhập tiêu đề bài học" />
            </Form.Item>

            <Form.Item
              label="Mô tả ngắn"
              name="description"
              rules={[{ required: true, message: "Mô tả là bắt buộc" }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Tổng quan ngắn gọn..."
                className="resize-none"
              />
            </Form.Item>
          </div>
        </div>

        <Divider />

        {/* Section 2: Educational Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-gray-500" /> Nội dung
            </h3>
            <p className="text-sm text-gray-500">Tài liệu học tập chính</p>
          </div>

          <Form.Item
            name="content"
            rules={[{ required: true, message: "Nội dung là bắt buộc" }]}
            className="mb-0"
          >
            <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <ReactQuill
                theme="snow"
                placeholder="Viết nội dung bài học của bạn ở đây..."
                className="h-64 mb-12" // mb-12 needed for toolbar spacing
                onChange={(e) => form.setFieldValue("content", e)}
              />
            </div>
          </Form.Item>
        </div>

        <Divider />

        {/* Section 3: Attachments */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Video size={18} className="text-gray-500" /> Phương tiện & Tệp
              đính kèm
            </h3>
            <p className="text-sm text-gray-500">
              Tài nguyên video hoặc PDF tùy chọn.
            </p>
          </div>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Tài nguyên video"
                name="video"
                valuePropName="file"
                help="Hỗ trợ: MP4, WebM (Tối đa 100MB)"
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
                    Chọn Video
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tài liệu bổ sung"
                name="document"
                valuePropName="file"
                help="Hỗ trợ: PDF, DOCX"
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

        {/* Action Bar */}
        <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-100 flex justify-end gap-3 z-10">
          <Button onClick={() => form.resetFields()} className="text-gray-500">
            Cài lại
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createLesson.isPending}
            icon={<Check size={16} />}
            className="bg-gray-900 hover:bg-gray-800 h-10 px-6"
          >
            Xuất bản bài học
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default LessonForm;
