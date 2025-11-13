/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Form, Input, Upload, Button, Card, Typography, Row, Col, Tooltip } from 'antd';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import type { Unit } from '../../../services/course/type';
import { useCreateLesson } from '../helpers';
import { BookOpen, FileText, Video, File, Lightbulb, Sparkles, Check } from 'lucide-react';

const { Title, Text } = Typography;

interface LessonFormProps {
  unit: Unit;
  onSuccess: () => void;
}

const LessonForm: React.FC<LessonFormProps> = ({ unit, onSuccess }) => {
  const [form] = Form.useForm();
  const createLesson = useCreateLesson(unit.courseUnitID, onSuccess);

  const handleSubmit = (values: any) => {
    const formData = new FormData();
    formData.append('Title', values.title);
    formData.append('Description', values.description || '');
    formData.append('Content', values.content || '');
    formData.append('CourseUnitID', unit.courseUnitID);
    if (values.video?.file) formData.append('VideoFile', values.video.file);
    if (values.document?.file) formData.append('DocumentFile', values.document.file);
    createLesson.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card
          className="shadow-xl rounded-3xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden"
          title={
            <div className="flex items-center gap-3">
              <Lightbulb
                size={20}
                className="text-sky-600"
              />
              <Title
                level={3}
                className="!mb-0 text-gray-800">
                Create New Lesson
              </Title>
              <Text
                type="secondary"
                className="text-sm ml-auto">
                Unit: {unit.title}
              </Text>
            </div>
          }>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-6 pt-4">
            {/* Basic Info Section */}
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen
                  size={20}
                  className="text-sky-600"
                />
                <Text
                  strong
                  className="text-sky-800">
                  Basics
                </Text>
              </div>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={
                      <span className="flex items-center gap-2">
                        <BookOpen
                          size={16}
                          className="text-gray-600"
                        />
                        Title
                      </span>
                    }
                    name="title"
                    rules={[{ required: true, message: 'Title is required' }]}>
                    <Input
                      placeholder="e.g., Basic Greetings in Spanish"
                      prefix={
                        <BookOpen
                          size={16}
                          className="text-gray-400"
                        />
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={
                      <span className="flex items-center gap-2">
                        <FileText
                          size={16}
                          className="text-gray-600"
                        />
                        Short Description
                      </span>
                    }
                    required
                    rules={[{ required: true, message: 'Description is required' }]}
                    name="description">
                    <Input.TextArea
                      rows={6}
                      placeholder="A quick overview of what this lesson covers..."
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Content Section */}
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles
                  size={20}
                  className="text-indigo-600"
                />
                <Text
                  strong
                  className="text-indigo-800">
                  Lesson Content
                </Text>
              </div>
              <Form.Item
                label={
                  <span className="flex items-center gap-2">
                    <FileText
                      size={16}
                      className="text-gray-600"
                    />
                    Rich Content
                  </span>
                }
                name="content"
                rules={[{ required: true, message: 'Lesson content is required' }]}>
                <div className="overflow-y-auto bg-white rounded-xl border border-gray-200">
                  <ReactQuill
                    theme="snow"
                    placeholder="Dive in! Add text, images, lists, or embeds to engage your learners..."
                    className="h-64"
                    onChange={(e) => {
                      form.setFieldValue('content', e);
                    }}
                  />
                </div>
              </Form.Item>
            </div>

            {/* Media Uploads */}
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
              <div className="flex items-center gap-2 mb-4">
                <Video
                  size={20}
                  className="text-sky-600"
                />
                <Text
                  strong
                  className="text-sky-800">
                  Media Resources
                </Text>
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <span className="flex items-center gap-2">
                        <Video
                          size={16}
                          className="text-gray-600"
                        />
                        Video (Optional)
                      </span>
                    }
                    name="video"
                    valuePropName="file">
                    <Upload
                      beforeUpload={() => false}
                      maxCount={1}
                      accept="video/*"
                      className="hover:border-sky-400 transition-colors">
                      <Button
                        block
                        className="rounded-xl flex items-center gap-2 justify-center">
                        Upload Video
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={
                      <span className="flex items-center gap-2">
                        <File
                          size={16}
                          className="text-gray-600"
                        />
                        Document (Optional)
                      </span>
                    }
                    name="document"
                    valuePropName="file">
                    <Upload
                      beforeUpload={() => false}
                      maxCount={1}
                      accept=".pdf,.doc,.docx"
                      className="hover:border-sky-400 transition-colors">
                      <Button
                        block
                        className="rounded-xl flex items-center gap-2 justify-center">
                        Upload Document
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Tooltip title="Publish this lesson to your unit">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createLesson.isPending}
                  className="rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                  icon={<Check size={16} />}>
                  Save & Publish Lesson
                </Button>
              </Tooltip>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LessonForm;
