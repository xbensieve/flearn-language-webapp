/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Collapse,
  Typography,
  Button,
  Space,
  Tooltip,
  Form,
  Input,
  Upload,
  Tag,
  Card,
  Tabs,
  Drawer,
  message,
  Modal,
  Col,
  Row,
} from 'antd';
import { EditOutlined, DeleteOutlined, FileOutlined, EyeOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useUpdateLesson } from '../helpers';
import type { Lesson } from '../../../services/course/type';
import ExerciseForm from '../ExerciseForm';
import ExercisesList from './ExercisesList';
import {
  Sparkles,
  BookOpen,
  Play,
  FileText,
  Video,
  Target,
  Trash2,
  Edit as EditIcon,
  Check,
  Lightbulb,
} from 'lucide-react';

const { Panel } = Collapse;
const { Text, Paragraph, Title } = Typography;
const { TabPane } = Tabs;

interface Props {
  lesson: Lesson;
  index: number;
  onUpdated: () => void;
}

const LessonItem: React.FC<Props> = ({ lesson, onUpdated, index }) => {
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [exerciseDrawerVisible, setExerciseDrawerVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [form] = Form.useForm();
  const updateLesson = useUpdateLesson(lesson.courseUnitID, () => {
    message.success('Lesson updated successfully');
    onUpdated();
    setEditDrawerVisible(false);
  });

  const handleOpenEditDrawer = () => {
    form.setFieldsValue({
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      video: lesson.videoUrl
        ? [{ uid: '-1', name: 'video', status: 'done', url: lesson.videoUrl }]
        : undefined,
      document: lesson.documentUrl
        ? [{ uid: '-1', name: 'document', status: 'done', url: lesson.documentUrl }]
        : undefined,
    });
    setEditDrawerVisible(true);
  };

  const handleCloseEditDrawer = () => {
    setEditDrawerVisible(false);
  };

  const handleOpenExerciseDrawer = () => {
    setExerciseDrawerVisible(true);
  };

  const handleCloseExerciseDrawer = () => {
    setExerciseDrawerVisible(false);
  };

  const handleSave = (values: any) => {
    const formData = new FormData();
    formData.append('Title', values.title);
    formData.append('Description', values.description || '');
    formData.append('Content', values.content || '');
    if (values.video?.file) formData.append('VideoFile', values.video.file);
    if (values.document?.file) formData.append('DocumentFile', values.document.file);
    updateLesson.mutate({ id: lesson.lessonID, formData });
  };

  const handleDelete = () => {
    setConfirmDeleteVisible(true);
  };

  const handleConfirmDelete = () => {
    // Implement delete API call (assumed useDeleteLesson hook)
    message.success('Lesson deleted successfully');
    onUpdated();
    setConfirmDeleteVisible(false);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteVisible(false);
  };

  const handlePreview = () => {
    setPreviewVisible(true);
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
  };

  const renderVideo = (url?: string) => {
    if (!url) return null;
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
    if (yt) {
      return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${yt[1]}`}
            title="Lesson Video"
            allowFullScreen
            className="w-full h-full rounded-2xl"
          />
        </div>
      );
    }
    return (
      <video
        controls
        className="w-full rounded-2xl shadow-lg"
        src={url}
      />
    );
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Add Exercise Button */}
        {index === 0 && <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100">
          <div className="flex justify-end items-center">
            <Tooltip title="Add an interactive exercise to this lesson">
              <Button
                type="primary"
                icon={<Sparkles size={16} />}
                onClick={handleOpenExerciseDrawer}
                className="rounded-xl shadow-md hover:shadow-lg transition-all bg-sky-600 hover:bg-sky-700 flex items-center gap-2 px-6 py-3 text-white font-semibold">
                Add New Exercise
              </Button>
            </Tooltip>
          </div>
        </div>}

        {/* Lesson Card */}
        <Card
          className="shadow-xl rounded-3xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 overflow-hidden"
          bodyStyle={{ padding: 0 }}>
          <Collapse
            ghost
            bordered={false}
            expandIconPosition="end"
            className="rounded-3xl"
            defaultActiveKey={['1']}>
            <Panel
              key="1"
              header={
                <div className="p-6 bg-gradient-to-r from-sky-50 to-blue-50">
                  <Row
                    align="middle"
                    gutter={16}>
                    <Col flex="auto">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center shadow-md">
                          <BookOpen
                            size={24}
                            className="text-sky-600"
                          />
                        </div>
                        <div className="min-w-0">
                          <Text
                            strong
                            className="text-xl text-gray-800 block">
                            {lesson.title}
                          </Text>
                          <Paragraph className="text-gray-500 text-sm mb-0 truncate">
                            {lesson.description}
                          </Paragraph>
                        </div>
                      </div>
                    </Col>
                    <Col>
                      <Tag
                        color="blue"
                        className="px-3 py-2 rounded-full text-xs font-medium shadow-sm">
                        <Play
                          size={12}
                          className="inline mr-1"
                        />
                        #{lesson.position}
                      </Tag>
                    </Col>
                    <Col>
                      <Space size="small">
                        <Tooltip title="Preview Lesson">
                          <Button
                            size="small"
                            shape="circle"
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview();
                            }}
                            className="border-sky-300 hover:border-sky-400 text-sky-600 hover:bg-sky-50 transition-all shadow-sm"
                          />
                        </Tooltip>
                        <Tooltip title="Edit Lesson">
                          <Button
                            size="small"
                            shape="circle"
                            icon={<EditOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditDrawer();
                            }}
                            className="border-gray-300 hover:border-sky-400 text-sky-600 hover:bg-sky-50 transition-all shadow-sm"
                          />
                        </Tooltip>
                        <Tooltip title="Delete Lesson">
                          <Button
                            danger
                            size="small"
                            shape="circle"
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete();
                            }}
                            className="hover:bg-red-50 transition-all shadow-sm"
                          />
                        </Tooltip>
                      </Space>
                    </Col>
                  </Row>
                </div>
              }
              className="bg-white">
              <div className="p-6 bg-gradient-to-b from-sky-50 to-white">
                <Tabs
                  defaultActiveKey="content"
                  className="mt-4"
                  tabBarStyle={{
                    background: '#f8fafc',
                    borderRadius: '12px 12px 0 0',
                    margin: 0,
                    padding: '8px 16px',
                  }}>
                  <TabPane
                    tab={
                      <div className="flex items-center gap-2">
                        <FileText
                          size={16}
                          className="text-sky-600"
                        />
                        Content
                      </div>
                    }
                    key="content">
                    <div className="space-y-6">
                      {lesson.content && (
                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                          <div className="prose prose-sm max-w-none p-6">
                            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                          </div>
                        </Card>
                      )}
                      {lesson.videoUrl && (
                        <Card className="border-0 shadow-sm rounded-2xl">
                          <div className="flex items-center gap-3 mb-4">
                            <Video
                              size={20}
                              className="text-sky-600"
                            />
                            <Text
                              strong
                              className="text-gray-800">
                              Video Resource
                            </Text>
                          </div>
                          {renderVideo(lesson.videoUrl)}
                        </Card>
                      )}
                      {lesson.documentUrl && (
                        <Card className="border-0 shadow-sm rounded-2xl">
                          <div className="flex items-center gap-3 mb-4">
                            <Text
                              strong
                              className="text-gray-800">
                              Document Resource
                            </Text>
                          </div>
                          <Tooltip title="Open in new tab">
                            <Button
                              type="primary"
                              icon={<FileOutlined />}
                              href={lesson.documentUrl}
                              target="_blank"
                              className="!text-green-600 !border-green-200 !bg-green-50 hover:!bg-green-100 rounded-xl flex items-center gap-2 px-4 py-2 shadow-sm">
                              View Document
                            </Button>
                          </Tooltip>
                        </Card>
                      )}
                    </div>
                  </TabPane>
                  <TabPane
                    tab={
                      <div className="flex items-center gap-2">
                        <Target
                          size={16}
                          className="text-sky-600"
                        />
                        Exercises ({lesson.totalExercises || 0})
                      </div>
                    }
                    key="exercises">
                    <div className="space-y-4 p-4 bg-white rounded-2xl shadow-sm">
                      <ExercisesList lessonId={lesson.lessonID} />
                    </div>
                  </TabPane>
                </Tabs>
              </div>
            </Panel>
          </Collapse>
        </Card>

        {/* Custom Delete Confirmation Modal */}
        {confirmDeleteVisible && (
          <Modal
            open={confirmDeleteVisible}
            onOk={handleConfirmDelete}
            onCancel={handleCancelDelete}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{
              danger: true,
              className: 'rounded-xl bg-red-600 hover:bg-red-700 px-6 py-2',
            }}
            cancelButtonProps={{ className: 'rounded-xl px-6 py-2' }}
            className="rounded-2xl"
            width={450}>
            <div className="flex items-center gap-3 mb-4">
              <Trash2
                size={32}
                className="text-red-500"
              />
              <Title
                level={4}
                className="!mb-0 text-gray-800">
                Delete Lesson
              </Title>
            </div>
            <Paragraph className="text-gray-600">
              Are you sure you want to delete "<strong>{lesson.title}</strong>"? This action cannot
              be undone and will remove all associated exercises.
            </Paragraph>
          </Modal>
        )}

        {/* Custom Preview Modal */}
        {previewVisible && (
          <Modal
            open={previewVisible}
            onOk={handleClosePreview}
            onCancel={handleClosePreview}
            footer={[
              <Button
                key="back"
                onClick={handleClosePreview}
                className="rounded-xl px-6 py-2">
                Close
              </Button>,
            ]}
            className="rounded-2xl"
            width={1000}>
            <div className="space-y-6">
              <Row
                align="middle"
                gutter={16}>
                <Col>
                  <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center shadow-md">
                    <BookOpen
                      size={20}
                      className="text-sky-600"
                    />
                  </div>
                </Col>
                <Col flex="auto">
                  <Title
                    level={3}
                    className="!mb-1">
                    {lesson.title}
                  </Title>
                  <Paragraph className="text-gray-600 mb-0">{lesson.description}</Paragraph>
                </Col>
              </Row>
              <div className="prose prose-sm max-w-none bg-gray-50 p-6 rounded-2xl shadow-sm">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </div>
              {lesson.videoUrl && (
                <Card className="border-0 shadow-sm rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Video
                      size={20}
                      className="text-sky-600"
                    />
                    <Text
                      strong
                      className="text-gray-800">
                      Video Preview
                    </Text>
                  </div>
                  {renderVideo(lesson.videoUrl)}
                </Card>
              )}
              {lesson.documentUrl && (
                <Card className="border-0 shadow-sm rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Text
                      strong
                      className="text-gray-800">
                      Document
                    </Text>
                  </div>
                  <Button
                    type="primary"
                    icon={<FileOutlined />}
                    href={lesson.documentUrl}
                    target="_blank"
                    className="!text-green-600 !border-green-200 !bg-green-50 hover:!bg-green-100 rounded-xl flex items-center gap-2 px-4 py-2 shadow-sm">
                    Open Document
                  </Button>
                </Card>
              )}
            </div>
          </Modal>
        )}

        {/* Edit Drawer */}
        <Drawer
          title={
            <div className="flex items-center gap-3">
              <EditIcon
                size={20}
                className="text-sky-600"
              />
              <Text
                strong
                className="text-sky-800">
                Edit Lesson
              </Text>
            </div>
          }
          width={800}
          open={editDrawerVisible}
          onClose={handleCloseEditDrawer}
          footer={
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleCloseEditDrawer}
                className="rounded-xl px-6 py-2">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                form="lesson-edit-form"
                loading={updateLesson.isPending}
                className="rounded-xl bg-sky-600 hover:bg-sky-700 flex items-center gap-2 px-6 py-2"
                onClick={() => handleSave(form.getFieldsValue())}
                icon={<Check size={16} />}>
                Save Changes
              </Button>
            </div>
          }
          className="rounded-2xl"
          placement="right">
          <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 py-8 px-4">
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
                  </div>
                }>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSave}
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
                        Lesson Basics
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
                              Lesson Title
                            </span>
                          }
                          name="title"
                          rules={[{ required: true, message: 'Lesson title is required' }]}>
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
                      <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
                        <ReactQuill
                          theme="snow"
                          value={form.getFieldValue('content')}
                          placeholder="Dive in! Add text, images, lists, or embeds to engage your learners..."
                          className="!h-64"
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
                            <span className="flex items-center gap-2">Document (Optional)</span>
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
                </Form>
              </Card>
            </div>
          </div>
        </Drawer>

        {/* Create Exercise Drawer */}
        <Drawer
          title={
            <div className="flex items-center gap-3">
              <Sparkles
                size={20}
                className="text-sky-600"
              />
              <Text
                strong
                className="text-sky-800">
                Create New Exercise
              </Text>
            </div>
          }
          width={700}
          open={exerciseDrawerVisible}
          onClose={handleCloseExerciseDrawer}
          footer={
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleCloseExerciseDrawer}
                className="rounded-xl">
                Cancel
              </Button>
            </div>
          }
          className="rounded-2xl"
          placement="right">
          <ExerciseForm
            lessonId={lesson.lessonID}
            onCreated={() => {
              message.success('Exercise created successfully');
              onUpdated();
              handleCloseExerciseDrawer();
            }}
          />
        </Drawer>
      </div>
    </div>
  );
};

export default LessonItem;
