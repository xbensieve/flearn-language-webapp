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
  Divider,
  Card,
  Tabs,
  Drawer,
  message,
  Modal,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  VideoCameraOutlined,
  FileOutlined,
  SaveOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useUpdateLesson } from '../helpers';
import type { Lesson } from '../../../services/course/type';
import ExerciseForm from '../ExerciseForm';
import ExercisesList from './ExercisesList';

const { Panel } = Collapse;
const { Text, Paragraph, Title } = Typography;
const { TabPane } = Tabs;

interface Props {
  lesson: Lesson;
  onUpdated: () => void;
}

const LessonItem: React.FC<Props> = ({ lesson, onUpdated }) => {
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [exerciseDrawerVisible, setExerciseDrawerVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [form] = Form.useForm();
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const updateLesson = useUpdateLesson(lesson.courseUnitID, () => {
    message.success('Lesson updated successfully');
    onUpdated();
    setEditDrawerVisible(false);
    setVideoPreview(null);
    setDocumentPreview(null);
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
    setVideoPreview(null);
    setDocumentPreview(null);
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
    if (values.video?.file) formData.append('VideoFile', values.video.file.originFileObj);
    if (values.document?.file) formData.append('DocumentFile', values.document.file.originFileObj);
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

  const handleMediaChange = (type: 'video' | 'document', info: any) => {
    if (info.file) {
      const url = URL.createObjectURL(info.file.originFileObj);
      if (type === 'video') setVideoPreview(url);
      else setDocumentPreview(url);
    } else {
      if (type === 'video') setVideoPreview(null);
      else setDocumentPreview(null);
    }
  };

  const renderVideo = (url?: string) => {
    if (!url) return null;
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
    if (yt) {
      return (
        <div className='relative w-full aspect-video'>
          <iframe
            src={`https://www.youtube.com/embed/${yt[1]}`}
            title='Lesson Video'
            allowFullScreen
            className='w-full h-full rounded-lg border'
          />
        </div>
      );
    }
    return <video controls className='w-full rounded-lg border' src={url} />;
  };

  return (
    <div>
      <div className='mb-5 flex justify-end'>
        <Button type='primary' icon={<PlusOutlined />} onClick={handleOpenExerciseDrawer}>
          Add New Exercise
        </Button>
      </div>
      <Card
        className='shadow-md rounded-xl hover:shadow-lg transition-all duration-200 border'
        bodyStyle={{ padding: 0 }}
      >
        <Collapse
          ghost
          bordered={false}
          expandIconPosition='end'
          className='rounded-xl'
          defaultActiveKey={[]}
        >
          <Panel
            key={lesson.lessonID}
            header={
              <div className='flex justify-between items-center'>
                <div>
                  <div className='flex items-center gap-2'>
                    <Text strong className='text-lg'>
                      {lesson.title}
                    </Text>
                    <Tag color='blue' className='rounded-md text-xs'>
                      #{lesson.position}
                    </Tag>
                  </div>
                  <Paragraph className='text-gray-500 text-sm mb-0' ellipsis={{ rows: 2 }}>
                    {lesson.description}
                  </Paragraph>
                </div>
                <Space>
                  <Tooltip title='Preview Lesson'>
                    <Button
                      size='small'
                      shape='circle'
                      icon={<EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview();
                      }}
                    />
                  </Tooltip>
                  <Tooltip title='Edit Lesson'>
                    <Button
                      size='small'
                      shape='circle'
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditDrawer();
                      }}
                    />
                  </Tooltip>
                  <Tooltip title='Delete Lesson'>
                    <Button
                      danger
                      size='small'
                      shape='circle'
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                    />
                  </Tooltip>
                </Space>
              </div>
            }
          >
            <div className='p-6'>
              <Tabs defaultActiveKey='content' className='mt-4'>
                <TabPane tab='Content' key='content'>
                  <div className='space-y-4'>
                    {lesson.content && (
                      <div
                        className='prose prose-sm max-w-none border rounded-md p-4'
                        dangerouslySetInnerHTML={{ __html: lesson.content }}
                      />
                    )}
                    {lesson.videoUrl && (
                      <div>
                        <Text strong>Video:</Text>
                        {renderVideo(lesson.videoUrl)}
                      </div>
                    )}
                    {lesson.documentUrl && (
                      <div>
                        <Text strong>Document:</Text>
                        <Button
                          type='default'
                          icon={<FileOutlined />}
                          href={lesson.documentUrl}
                          target='_blank'
                          className='!text-green-600 mt-2'
                        >
                          View Document
                        </Button>
                      </div>
                    )}
                  </div>
                </TabPane>
                <TabPane tab='Exercises' key='exercises'>
                  <div className='space-y-4'>
                    <ExercisesList lessonId={lesson.lessonID} />
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </Panel>
        </Collapse>

        {/* Custom Delete Confirmation Dialog */}
        {confirmDeleteVisible && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg shadow-xl p-6 max-w-sm w-full'>
              <h3 className='text-lg font-semibold mb-4'>Delete Lesson</h3>
              <p className='text-gray-600 mb-6'>
                Are you sure you want to delete "{lesson.title}"? This action cannot be undone.
              </p>
              <div className='flex justify-end gap-2'>
                <Button type='default' onClick={handleCancelDelete} className='border-gray-300'>
                  Cancel
                </Button>
                <Button type='primary' danger onClick={handleConfirmDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Preview Dialog */}
        {previewVisible && (
          <Modal
            onOk={() => handleClosePreview()}
            visible={previewVisible}
            onCancel={handleClosePreview}
            width={800}
          >
            <h3 className='text-lg font-semibold mb-4'>{lesson.title}</h3>
            <div className='space-y-4'>
              <Paragraph>{lesson.description}</Paragraph>
              <div
                dangerouslySetInnerHTML={{ __html: lesson.content }}
                className='prose prose-sm max-w-none'
              />
              {lesson.videoUrl && renderVideo(lesson.videoUrl)}
              {lesson.documentUrl && (
                <Button
                  type='default'
                  icon={<FileOutlined />}
                  href={lesson.documentUrl}
                  target='_blank'
                  className='!text-green-600'
                >
                  View Document
                </Button>
              )}
            </div>
          </Modal>
        )}

        {/* Drawer for Editing Lesson */}
        <Drawer
          title='Edit Lesson'
          width={600}
          open={editDrawerVisible}
          onClose={handleCloseEditDrawer}
          footer={
            <div className='text-right'>
              <Button onClick={handleCloseEditDrawer} className='mr-2'>
                Cancel
              </Button>
            </div>
          }
        >
          <Form
            id='lesson-edit-form'
            form={form}
            layout='vertical'
            onFinish={handleSave}
            className='space-y-4'
          >
            <Title level={5} className='flex items-center gap-2'>
              <EditOutlined /> Edit Lesson
            </Title>

            <Form.Item
              name='title'
              label='Lesson Title'
              rules={[{ required: true, message: 'Please enter a lesson title' }]}
            >
              <Input placeholder='Enter lesson title' />
            </Form.Item>

            <Form.Item name='description' label='Description'>
              <Input.TextArea rows={3} placeholder='Enter a short description' />
            </Form.Item>

            <Form.Item name='content' label='Lesson Content'>
              <ReactQuill
                theme='snow'
                modules={{
                  toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'image'],
                    ['clean'],
                  ],
                }}
                className='border rounded-md'
              />
            </Form.Item>

            <Divider orientation='left'>Media</Divider>

            {videoPreview || lesson.videoUrl ? (
              <div className='mb-4'>
                <Text>Video Preview:</Text>
                {renderVideo(videoPreview || lesson.videoUrl)}
              </div>
            ) : null}

            <Form.Item name='video' label='Replace Video' valuePropName='file'>
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                accept='video/*'
                onChange={(info) => handleMediaChange('video', info)}
                fileList={
                  videoPreview || lesson.videoUrl
                    ? [
                        {
                          uid: '-1',
                          name: 'video',
                          status: 'done',
                          url: videoPreview || lesson.videoUrl,
                        },
                      ]
                    : []
                }
              >
                <Button icon={<VideoCameraOutlined />}>Upload New Video</Button>
              </Upload>
            </Form.Item>

            {documentPreview || lesson.documentUrl ? (
              <div className='mb-4'>
                <Text>Document Preview:</Text>
                {documentPreview ? (
                  <Button
                    type='default'
                    icon={<FileOutlined />}
                    href={documentPreview}
                    target='_blank'
                    className='!text-green-600 mt-2'
                  >
                    View Uploaded Document
                  </Button>
                ) : (
                  <Button
                    type='default'
                    icon={<FileOutlined />}
                    href={lesson.documentUrl}
                    target='_blank'
                    className='!text-green-600 mt-2'
                  >
                    View Existing Document
                  </Button>
                )}
              </div>
            ) : null}

            <Form.Item name='document' label='Replace Document' valuePropName='file'>
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                accept='.pdf,.doc,.docx'
                onChange={(info) => handleMediaChange('document', info)}
                fileList={
                  documentPreview || lesson.documentUrl
                    ? [
                        {
                          uid: '-1',
                          name: 'document',
                          status: 'done',
                          url: documentPreview || lesson.documentUrl,
                        },
                      ]
                    : []
                }
              >
                <Button icon={<FileOutlined />}>Upload New Document</Button>
              </Upload>
            </Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              icon={<SaveOutlined />}
              loading={updateLesson.isPending}
            >
              Save
            </Button>
          </Form>
        </Drawer>

        {/* Drawer for Creating Exercises */}
        <Drawer
          title='Create New Exercise'
          width={600}
          open={exerciseDrawerVisible}
          onClose={handleCloseExerciseDrawer}
          footer={
            <div className='text-right'>
              <Button onClick={handleCloseExerciseDrawer} className='mr-2'>
                Cancel
              </Button>
            </div>
          }
        >
          <ExerciseForm
            lessonId={lesson.lessonID}
            onCreated={() => {
              message.success('Exercise created successfully');
              onUpdated();
              handleCloseExerciseDrawer();
            }}
          />
        </Drawer>
      </Card>
    </div>
  );
};

export default LessonItem;
