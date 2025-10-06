import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Row,
  Spin,
  Switch,
  Tag,
  Typography,
  Upload,
  Collapse,
} from 'antd';
import { VideoCameraOutlined, FileOutlined } from '@ant-design/icons';
import type { RcFile, UploadChangeParam } from 'antd/es/upload';
import {
  createCourseLessonService,
  createCourseUnitsService,
  getCourseDetailService,
  getCourseUnitsService,
} from '../../services/course';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

interface CourseDetail {
  courseID: string;
  title: string;
  description: string;
  imageUrl: string;
  templateInfo: {
    id: string;
    name: string;
  };
  price: number;
  discountPrice?: number;
  courseType: string;
  teacherInfo: {
    id: string;
    fullName: string;
    avatarUrl: string;
  };
  languageInfo: {
    id: string;
    name: string;
    code: string;
  };
  goalInfo: {
    id: number;
    name: string;
    description: string;
  };
  courseLevel: string;
  courseSkill: string;
  publishedAt: string;
  status: string;
  createdAt: string;
  modifiedAt: string;
  numLessons: number;
  approvedBy?: {
    id: string;
    fullName: string;
    avatarUrl: string;
  };
  approvedAt?: string;
  topics: Array<{
    topicId: string;
    topicName: string;
    topicDescription: string;
    imageUrl: string;
  }>;
}

export interface Unit {
  courseUnitID: string;
  title: string;
  description: string;
  position: number;
  courseID: string;
  courseTitle: string;
  totalLessons: number;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
}

const CourseDetail: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [unitForm] = Form.useForm();
  const [lessonForm] = Form.useForm();
  const [activeUnitForLesson, setActiveUnitForLesson] = useState<string>('');
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [videoFile, setVideoFile] = useState<RcFile | null>(null);
  const [documentFile, setDocumentFile] = useState<RcFile | null>(null);

  const { data: courseData, isLoading: courseLoading } = useQuery<CourseDetail>({
    queryKey: ['course', courseId],
    queryFn: () => getCourseDetailService(courseId!),
    enabled: !!courseId,
  });

  const {
    data: unitsData,
    isLoading: unitsLoading,
    refetch: refetchUnits,
  } = useQuery<Unit[]>({
    queryKey: ['units', courseId],
    queryFn: () => getCourseUnitsService(courseId!),
    enabled: !!courseId,
  });

  console.log(unitsData);

  const createUnitMutation = useMutation({
    mutationFn: (values: { id: string; title: string; description: string; isPreview: boolean }) =>
      createCourseUnitsService({
        courseId: values.id || '',
        title: values.title,
        description: values.description,
        isPreview: values.isPreview,
      }),
    onSuccess: () => {
      unitForm.resetFields();
      refetchUnits();
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: (formData: FormData) =>
      createCourseLessonService(courseId!, activeUnitForLesson, formData),
    onSuccess: () => {
      lessonForm.resetFields();
      setVideoFile(null);
      setDocumentFile(null);
      setShowLessonForm(false);
      refetchUnits();
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });

  const handleUnitFinish = (values: { title: string; description: string; isPreview: boolean }) => {
    createUnitMutation.mutate({
      ...values,
      id: courseId || '',
    });
    console.log(courseId);
  };

  const handleLessonFinish = (values: {
    title: string;
    content: string;
    skillFocus: string;
    description: string;
  }) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('content', values.content);
    formData.append('skillFocus', values.skillFocus);
    formData.append('description', values.description);
    if (videoFile) {
      formData.append('videoFile', videoFile);
    }
    if (documentFile) {
      formData.append('documentFile', documentFile);
    }
    createLessonMutation.mutate(formData);
  };

  const handleVideoChange = (info: UploadChangeParam) => {
    const file = info.fileList[0]?.originFileObj as RcFile;
    setVideoFile(file || null);
  };

  const handleDocumentChange = (info: UploadChangeParam) => {
    const file = info.fileList[0]?.originFileObj as RcFile;
    setDocumentFile(file || null);
  };

  const handleAddLessonClick = (unitId: string) => {
    setActiveUnitForLesson(unitId);
    setShowLessonForm(true);
  };

  if (courseLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (!courseData) {
    return <Empty description="Course not found" />;
  }

  const course = courseData;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <Row gutter={24}>
          {/* Left Side: Course Details (Smaller) */}
          <Col span={12}>
            <Card>
              <img
                alt={course.title}
                src={course.imageUrl}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <Title level={3}>{course.title}</Title>
              <Paragraph ellipsis={{ rows: 2 }}>{course.description}</Paragraph>
              <div className="flex items-center mb-4">
                <Avatar
                  src={course.teacherInfo.avatarUrl}
                  size={32}
                  className="mr-3"
                />
                <div>
                  <Text
                    strong
                    className="text-sm">
                    Teacher: {course.teacherInfo.fullName}
                  </Text>
                </div>
              </div>
              <Row
                gutter={4}
                className="mb-4">
                <Col>
                  <Tag color="blue">{course.languageInfo.name}</Tag>
                </Col>
                <Col>
                  <Tag color="green">{course.courseLevel}</Tag>
                </Col>
                <Col>
                  <Tag color="purple">{course.courseSkill}</Tag>
                </Col>
                <Col>
                  <Tag color={course.status === 'published' ? 'success' : 'default'}>
                    {course.status}
                  </Tag>
                </Col>
              </Row>
              <div className="mb-3">
                <Text
                  strong
                  className="text-sm">
                  Goal:{' '}
                </Text>
                <Paragraph className="text-sm mb-0">{course.goalInfo.description}</Paragraph>
              </div>
              <div className="mb-3">
                <Text
                  strong
                  className="text-sm">
                  Price:{' '}
                </Text>
                {course.discountPrice ? (
                  <>
                    <Text
                      delete
                      className="mr-1 text-xs">
                      ${course.price}
                    </Text>
                    <Text
                      type="success"
                      strong
                      className="text-sm">
                      ${course.discountPrice}
                    </Text>
                  </>
                ) : (
                  <Text
                    strong
                    className="text-sm">
                    ${course.price}
                  </Text>
                )}
              </div>
              <div className="mb-3">
                <Text
                  strong
                  className="text-sm">
                  Published:{' '}
                </Text>
                <Text className="text-xs">{course.createdAt}</Text>
              </div>
              <div className="mb-3">
                <Text
                  strong
                  className="text-sm">
                  Lessons:{' '}
                </Text>
                <Text className="text-xs">{course.numLessons}</Text>
              </div>
              {course.approvedBy && (
                <div className="mb-3">
                  <Text
                    strong
                    className="text-sm">
                    Approved by:{' '}
                  </Text>
                  <Avatar
                    src={course.approvedBy.avatarUrl}
                    size={20}
                    className="inline-block mr-1"
                  />
                  <Text className="text-xs">{course.approvedBy.fullName}</Text>
                  <Text className="ml-1 text-xs">
                    ({new Date(course.approvedAt!).toLocaleDateString()})
                  </Text>
                </div>
              )}
              <div>
                <Text
                  strong
                  className="text-sm">
                  Topics:{' '}
                </Text>
                <Row
                  gutter={4}
                  className="mt-1">
                  {course.topics.map((topic) => (
                    <Col key={topic.topicId}>
                      <Tag>{topic.topicName}</Tag>
                    </Col>
                  ))}
                </Row>
              </div>
            </Card>
          </Col>

          {/* Right Side: Collapsible Units & Lessons */}
          <Col span={12}>
            <Card title="Manage Units & Lessons">
              <Collapse
                defaultActiveKey={['add-unit']}
                accordion={false}>
                {/* Add Unit Panel */}
                <Panel
                  header="Add New Unit"
                  key="add-unit">
                  <Form
                    form={unitForm}
                    onFinish={handleUnitFinish}
                    layout="vertical"
                    size="small">
                    <Form.Item
                      name="title"
                      label="Title"
                      rules={[{ required: true, message: 'Title is required' }]}>
                      <Input placeholder="Enter unit title" />
                    </Form.Item>
                    <Form.Item
                      name="description"
                      label="Description">
                      <TextArea
                        rows={2}
                        placeholder="Enter unit description"
                      />
                    </Form.Item>
                    <Form.Item
                      name="isPreview"
                      label="Is Preview"
                      valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={createUnitMutation.isPending}
                        block
                        size="small">
                        Create Unit
                      </Button>
                    </Form.Item>
                  </Form>
                </Panel>

                {/* Units List Panels */}
                {unitsLoading ? (
                  <Spin />
                ) : !unitsData || unitsData.length === 0 ? (
                  <Panel
                    header="No Units Yet"
                    key="no-units">
                    <Empty description="Create a unit above to get started" />
                  </Panel>
                ) : (
                  unitsData.map((unit) => (
                    <Panel
                      header={`${unit.title} (${unit.totalLessons} lessons)`}
                      key={unit.courseUnitID}>
                      <Paragraph ellipsis={{ rows: 2 }}>{unit.description}</Paragraph>
                      <div className="mb-2">
                        <Text strong>Preview: </Text>
                        <Switch
                          checked={unit.isPreview}
                          disabled
                        />
                      </div>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleAddLessonClick(unit.courseUnitID)}
                        block
                        className="mb-2">
                        + Add Lesson to this Unit
                      </Button>
                      {/* Embedded Lesson Form for this Unit */}
                      {showLessonForm && activeUnitForLesson === unit.courseUnitID && (
                        <Collapse>
                          <Panel
                            header="Add Lesson"
                            key="add-lesson">
                            <Form
                              form={lessonForm}
                              onFinish={handleLessonFinish}
                              layout="vertical"
                              size="small">
                              <Form.Item
                                name="title"
                                label="Title"
                                rules={[{ required: true, message: 'Title is required' }]}>
                                <Input placeholder="Enter lesson title" />
                              </Form.Item>
                              <Form.Item
                                name="content"
                                label="Content"
                                rules={[{ required: true, message: 'Content is required' }]}>
                                <TextArea
                                  rows={3}
                                  placeholder="Enter lesson content"
                                />
                              </Form.Item>
                              <Form.Item
                                name="skillFocus"
                                label="Skill Focus"
                                rules={[{ required: true, message: 'Skill focus is required' }]}>
                                <Input placeholder="Enter skill focus" />
                              </Form.Item>
                              <Form.Item
                                name="description"
                                label="Description">
                                <TextArea
                                  rows={2}
                                  placeholder="Enter lesson description"
                                />
                              </Form.Item>
                              <Form.Item label="Video File">
                                <Upload
                                  name="videoFile"
                                  beforeUpload={() => false}
                                  onChange={handleVideoChange}
                                  accept="video/*"
                                  maxCount={1}>
                                  <Button
                                    icon={<VideoCameraOutlined />}
                                    size="small">
                                    Select Video
                                  </Button>
                                </Upload>
                                {videoFile && (
                                  <Text className="block mt-1 text-xs">{videoFile.name}</Text>
                                )}
                              </Form.Item>
                              <Form.Item label="Document File">
                                <Upload
                                  name="documentFile"
                                  beforeUpload={() => false}
                                  onChange={handleDocumentChange}
                                  accept=".pdf,.doc,.docx"
                                  maxCount={1}>
                                  <Button
                                    icon={<FileOutlined />}
                                    size="small">
                                    Select Document
                                  </Button>
                                </Upload>
                                {documentFile && (
                                  <Text className="block mt-1 text-xs">{documentFile.name}</Text>
                                )}
                              </Form.Item>
                              <Form.Item>
                                <div className="flex space-x-2">
                                  <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={createLessonMutation.isPending}
                                    size="small">
                                    Create Lesson
                                  </Button>
                                  <Button
                                    onClick={() => setShowLessonForm(false)}
                                    size="small">
                                    Cancel
                                  </Button>
                                </div>
                              </Form.Item>
                            </Form>
                          </Panel>
                        </Collapse>
                      )}
                    </Panel>
                  ))
                )}
              </Collapse>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CourseDetail;
