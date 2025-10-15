/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Typography,
  Tag,
  Empty,
  Spin,
  Space,
  Form,
  Input,
  Upload,
  Divider,
  Collapse,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  FileOutlined,
  VideoCameraOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  createCourseLessonService,
  getLessonsByUnits,
  getUnitByIdService,
  updateLessonCourseService,
} from '../../services/course';
import type { Unit, Lesson } from '../../services/course/type';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import type { AxiosError } from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const UnitsManager: React.FC = () => {
  const { id: unitId } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState<string | string[]>('');

  // Fetch unit
  const {
    data: unit,
    isLoading: loadingUnit,
    refetch,
  } = useQuery<Unit>({
    queryKey: ['unit-detail', unitId],
    queryFn: () => getUnitByIdService({ id: unitId! }),
    enabled: !!unitId,
    retry: 1,
  });

  // Create or update lesson
  const createLessonMutation = useMutation({
    mutationFn: (data: FormData) => createCourseLessonService(unitId || '', data),
    onSuccess: () => {
      notifySuccess('Lesson created successfully!');
      form.resetFields();
      setActiveKey('');
      refetch();
    },
    onError: (err: AxiosError<any>) =>
      notifyError(err?.response?.data.message || 'Something went wrong!'),
  });

  const handleSubmit = (values: any) => {
    if (!unit) return;
    const formData = new FormData();
    formData.append('Title', values.title);
    formData.append('Description', values.description || '');
    formData.append('Content', values.content || '');
    formData.append('CourseUnitID', unit.courseUnitID);
    if (values.video?.file) formData.append('VideoFile', values.video.file);
    if (values.document?.file) formData.append('DocumentFile', values.document.file);
    console.log(values);

    createLessonMutation.mutate(formData);
  };

  if (loadingUnit)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );

  if (!unit)
    return (
      <Empty
        description="Unit not found"
        className="mt-10"
      />
    );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title
            level={3}
            className="!mb-1">
            {unit.title}
          </Title>
          <Paragraph className="text-gray-500 mb-1">{unit.description}</Paragraph>
          <Tag color="blue">Lessons: {unit.totalLessons}</Tag>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setActiveKey(activeKey === 'create' ? '' : 'create')}>
          {activeKey === 'create' ? 'Close Form' : 'Add Lesson'}
        </Button>
      </div>

      <Divider />
      <div className="flex flex-col gap-3">
        <Collapse
          activeKey={activeKey}
          onChange={(key) => setActiveKey(key)}
          className="mb-6">
          <Panel
            header={activeKey === 'create' ? 'Creating Lesson...' : 'Add New Lesson'}
            key="create">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ content: '' }}>
              <Form.Item
                name="title"
                label="Lesson Title"
                rules={[{ required: true, message: 'Please enter lesson title' }]}>
                <Input placeholder="e.g., Basic Greetings" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description">
                <Input.TextArea
                  rows={2}
                  placeholder="Short description"
                />
              </Form.Item>

              <Form.Item
                name="content"
                label="Lesson Content">
                <ReactQuill
                  theme="snow"
                  placeholder="Write lesson content here..."
                />
              </Form.Item>

              <Space
                direction="vertical"
                className="w-full">
                <Form.Item
                  name="video"
                  label="Video File"
                  valuePropName="file">
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    accept="video/*">
                    <Button icon={<VideoCameraOutlined />}>Upload Video</Button>
                  </Upload>
                </Form.Item>
                <Form.Item
                  name="document"
                  label="Document File"
                  valuePropName="file">
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    accept=".pdf,.doc,.docx">
                    <Button icon={<FileOutlined />}>Upload Document</Button>
                  </Upload>
                </Form.Item>
              </Space>

              <div className="flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createLessonMutation.isPending}
                  disabled={createLessonMutation.isPending}>
                  Save Lesson
                </Button>
              </div>
            </Form>
          </Panel>
        </Collapse>
        <LessonsList
          unit={unit}
          onEditLesson={(lesson) => console.log('Edit', lesson)}
        />
      </div>
    </div>
  );
};
const LessonsList: React.FC<{
  unit: Unit;
  onEditLesson?: (lesson: Lesson) => void;
}> = ({ unit }) => {
  const {
    data: lessonsResponse,
    isLoading,
    refetch,
  } = useQuery<API.Response<Lesson[]>>({
    queryKey: ['lessons', unit.courseUnitID],
    queryFn: () => getLessonsByUnits({ unitId: unit.courseUnitID }),
    enabled: !!unit.courseUnitID,
    retry: 1,
  });

  const lessons = lessonsResponse?.data ?? [];
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({});
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const updateLessonMutation = useMutation({
    mutationFn: (data: { id: string; formData: FormData }) =>
      updateLessonCourseService({
        id: data.id,
        unitId: unit.courseUnitID,
        payload: data.formData,
      }),
    onSuccess: () => {
      notifySuccess('Lesson updated successfully!');
      setEditingLessonId(null);
      refetch();
    },
    onError: () => {
      notifyError('Failed to update lesson');
    },
  });

  const handleSaveEdit = (lesson: Lesson) => {
    form.validateFields().then((values) => {
      const formData = new FormData();
      formData.append('Title', values.title);
      formData.append('Description', values.description || '');
      formData.append('Content', values.content || '');
      if (values.video?.file) formData.append('VideoFile', values.video.file);
      if (values.document?.file) formData.append('DocumentFile', values.document.file);

      updateLessonMutation.mutate({ id: lesson.lessonID, formData });
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-6">
        <Spin size="large" />
      </div>
    );

  if (!lessons.length)
    return (
      <Empty
        description={<span className="text-gray-500">No lessons yet</span>}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="py-6"
      />
    );

  const renderVideo = (url?: string) => {
    if (!url) return null;
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Lesson Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full rounded-lg aspect-video border border-gray-100 mt-3"
        />
      );
    }
    return (
      <video
        controls
        className="w-full rounded-lg border border-gray-100 mt-3"
        src={url}
        preload="metadata"
      />
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {lessons.map((lesson, index) => {
        const key = lesson.lessonID ?? `lesson-${index}`;
        const isOpen = openPanels[key];
        const isEditing = editingLessonId === key;

        return (
          <Collapse
            key={key}
            ghost
            bordered={false}
            activeKey={isOpen ? [key] : []}
            onChange={() => setOpenPanels((prev) => ({ ...prev, [key]: !prev[key] }))}
            className="bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300"
            expandIconPosition="end">
            <Panel
              key={key}
              header={
                <div className="flex justify-between items-center w-full my-1.5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Text
                        strong
                        className="text-base">
                        {lesson.title}
                      </Text>
                      <Tag
                        color="blue-inverse"
                        className="rounded-md text-xs">
                        #{lesson.position}
                      </Tag>
                    </div>
                    <Paragraph className="text-gray-500 text-xs mb-0">
                      {lesson.description}
                    </Paragraph>
                  </div>

                  {!isEditing && (
                    <Space>
                      <Tooltip title="Edit lesson">
                        <Button
                          size="small"
                          shape="circle"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLessonId(key);
                            form.setFieldsValue({
                              title: lesson.title,
                              description: lesson.description,
                              content: lesson.content,
                            });
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Delete lesson">
                        <Button
                          danger
                          size="small"
                          shape="circle"
                          icon={<DeleteOutlined />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Tooltip>
                    </Space>
                  )}
                </div>
              }>
              {isEditing ? (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={() => handleSaveEdit(lesson)}>
                  <Form.Item
                    name="title"
                    label="Lesson Title"
                    rules={[{ required: true, message: 'Please enter title' }]}>
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label="Description">
                    <Input.TextArea rows={2} />
                  </Form.Item>

                  <Form.Item
                    name="content"
                    label="Content">
                    <ReactQuill theme="snow" />
                  </Form.Item>

                  {/* --- EXISTING VIDEO PREVIEW --- */}
                  {lesson.videoUrl && (
                    <div className="mb-3">
                      <Text className="text-sm text-gray-500">Current Video:</Text>
                      {renderVideo(lesson.videoUrl)}
                    </div>
                  )}

                  <Form.Item
                    name="video"
                    label="Replace Video"
                    valuePropName="file">
                    <Upload
                      beforeUpload={() => false}
                      maxCount={1}
                      accept="video/*">
                      <Button icon={<VideoCameraOutlined />}>Upload New Video</Button>
                    </Upload>
                  </Form.Item>

                  {/* --- EXISTING DOCUMENT PREVIEW --- */}
                  {lesson.documentUrl && (
                    <div className="mb-3">
                      <Text className="text-sm text-gray-500 block">Current Document:</Text>
                      <Button
                        size="small"
                        type="default"
                        className="!text-green-600 !border-green-100 hover:!bg-green-50 mt-1"
                        icon={<FileOutlined />}
                        href={lesson.documentUrl}
                        target="_blank">
                        View Existing Document
                      </Button>
                    </div>
                  )}

                  <Form.Item
                    name="document"
                    label="Replace Document"
                    valuePropName="file">
                    <Upload
                      beforeUpload={() => false}
                      maxCount={1}
                      accept=".pdf,.doc,.docx">
                      <Button icon={<FileOutlined />}>Upload New Document</Button>
                    </Upload>
                  </Form.Item>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setEditingLessonId(null)}>Cancel</Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={updateLessonMutation.isPending}>
                      Save
                    </Button>
                  </div>
                </Form>
              ) : (
                <>
                  {lesson.content && (
                    <div
                      className="prose prose-sm max-w-none text-gray-800"
                      dangerouslySetInnerHTML={{ __html: lesson.content }}
                    />
                  )}

                  {lesson.videoUrl && renderVideo(lesson.videoUrl)}

                  {lesson.documentUrl && (
                    <Button
                      size="small"
                      type="default"
                      className="!text-green-600 !border-green-100 hover:!bg-green-50 mt-3"
                      icon={<FileOutlined />}
                      href={lesson.documentUrl}
                      target="_blank">
                      View Document
                    </Button>
                  )}
                </>
              )}
            </Panel>
          </Collapse>
        );
      })}
    </div>
  );
};

export default UnitsManager;
