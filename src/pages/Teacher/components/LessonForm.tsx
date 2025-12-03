/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Form,
  Input,
  Upload,
  Button,

  Row,
  Col,

  Divider,
  Alert,
} from "antd";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import type { Unit } from "../../../services/course/type";
import { useCreateLesson } from "../helpers";
import {
  Upload as UploadIcon,
  Video,
  FileText,
  Type,
  Check

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
          message="Drafting Lesson"
          description={`You are adding a lesson to the unit: "${unit.title}".`}
          type="info"
          showIcon
          className="mb-6 border-blue-100 bg-blue-50/50"
        />

        {/* Section 1: General Information */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Type size={18} className="text-gray-500" /> General Information
            </h3>
            <p className="text-sm text-gray-500">
              Basic details about this lesson.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Form.Item
              label="Lesson Title"
              name="title"
              rules={[{ required: true, message: "Title is required" }]}
            >
              <Input
                size="large"
                placeholder="e.g., Understanding State in React"
              />
            </Form.Item>

            <Form.Item
              label="Short Description"
              name="description"
              rules={[{ required: true, message: "Description is required" }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Brief overview for the student dashboard..."
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
              <FileText size={18} className="text-gray-500" /> Content Body
            </h3>
            <p className="text-sm text-gray-500">
              The main learning material (text, images, code).
            </p>
          </div>

          <Form.Item
            name="content"
            rules={[{ required: true, message: "Content is required" }]}
            className="mb-0"
          >
            <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <ReactQuill
                theme="snow"
                placeholder="Write your lesson content here..."
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
              <Video size={18} className="text-gray-500" /> Media & Attachments
            </h3>
            <p className="text-sm text-gray-500">
              Optional video or PDF resources.
            </p>
          </div>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Video Resource"
                name="video"
                valuePropName="file"
                help="Supported: MP4, WebM (Max 100MB)"
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
                    Select Video
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Supplemental Document"
                name="document"
                valuePropName="file"
                help="Supported: PDF, DOCX"
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
                    Select Document
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-100 flex justify-end gap-3 z-10">
          <Button onClick={() => form.resetFields()} className="text-gray-500">
            Reset
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createLesson.isPending}
            icon={<Check size={16} />}
            className="bg-gray-900 hover:bg-gray-800 h-10 px-6"
          >
            Publish Lesson
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default LessonForm;
