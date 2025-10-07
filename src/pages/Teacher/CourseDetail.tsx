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
  getLessonsByUnits,
} from '../../services/course';
import type { Lesson } from '../../services/course/type';

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
    queryFn: () => getCourseUnitsService({ id: courseId! }),
    enabled: !!courseId,
  });

  const {
    data: lessonsResponse,
    isLoading: lessonsLoading,
    refetch: refetchLessons,
  } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => getLessonsByUnits({ courseId: courseId! }),
    enabled: !!courseId,
  });

  console.log(unitsData);

  const lessonsByUnit = React.useMemo(() => {
    if (!lessonsResponse?.data) return {};
    return lessonsResponse.data.reduce((acc, lesson) => {
      const unitId = lesson.courseUnitID;
      if (!acc[unitId]) acc[unitId] = [];
      acc[unitId].push(lesson);
      return acc;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Record<string, any[]>);
  }, [lessonsResponse]);

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
      refetchLessons();
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
        <Row gutter={[24, 24]}>
          {/* Left Side: Course Details (Smaller) */}
          <Col
            xs={24}
            lg={10}
            xl={9}>
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

          {/* Right Side: Units & Lessons */}
          <Col
            xs={24}
            lg={14}
            xl={15}>
            <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <Title
                  level={4}
                  className="!mb-0 text-gray-800">
                  🧩 Manage Units & Lessons
                </Title>
                <Tag color="geekblue">{unitsData?.length || 0} Units</Tag>
              </div>

              <Collapse
                bordered={false}
                expandIconPosition="end"
                className="space-y-3"
                accordion={false}
                defaultActiveKey={['add-unit']}>
                {/* Add Unit Form */}
                <Panel
                  header={<span className="font-semibold text-gray-700">➕ Add New Unit</span>}
                  key="add-unit"
                  className="bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300">
                  <Form
                    form={unitForm}
                    onFinish={handleUnitFinish}
                    layout="vertical"
                    size="middle"
                    className="space-y-3">
                    <Form.Item
                      name="title"
                      label={<span className="font-medium text-gray-700">Title</span>}
                      rules={[{ required: true, message: 'Title is required' }]}>
                      <Input
                        placeholder="Enter unit title"
                        className="rounded-lg"
                      />
                    </Form.Item>

                    <Form.Item
                      name="description"
                      label={<span className="font-medium text-gray-700">Description</span>}>
                      <TextArea
                        rows={2}
                        placeholder="Enter unit description"
                        className="rounded-lg"
                      />
                    </Form.Item>

                    <Form.Item
                      name="isPreview"
                      label={<span className="font-medium text-gray-700">Preview Access</span>}
                      valuePropName="checked">
                      <Switch />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={createUnitMutation.isPending}
                      className="w-full rounded-lg">
                      Create Unit
                    </Button>
                  </Form>
                </Panel>

                {/* Existing Units */}
                {unitsLoading ? (
                  <div className="flex justify-center py-8">
                    <Spin />
                  </div>
                ) : !unitsData?.length ? (
                  <Panel
                    key="no-units"
                    header="No Units Yet"
                    className="bg-gray-50 rounded-xl">
                    <Empty description="Create your first unit above" />
                  </Panel>
                ) : (
                  unitsData.map((unit) => {
                    const unitLessons = lessonsByUnit[unit.courseUnitID] || [];

                    return (
                      <Panel
                        key={unit.courseUnitID}
                        header={
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-gray-800">{unit.title}</span>
                              <p className="text-gray-500 text-xs mt-0.5">{unit.description}</p>
                            </div>
                            <Tag color="blue-inverse">{unitLessons.length} Lessons</Tag>
                          </div>
                        }
                        className="rounded-xl border border-gray-200 bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm text-gray-600">
                            Preview:{' '}
                            <Switch
                              checked={unit.isPreview}
                              disabled
                            />
                          </div>
                          <Button
                            size="small"
                            type="link"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => handleAddLessonClick(unit.courseUnitID)}>
                            + Add Lesson
                          </Button>
                        </div>

                        {/* Lesson Form */}
                        {showLessonForm && activeUnitForLesson === unit.courseUnitID && (
                          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
                            <Title
                              level={5}
                              className="!mt-0 text-gray-800">
                              🎬 Add Lesson
                            </Title>
                            <Form
                              form={lessonForm}
                              onFinish={handleLessonFinish}
                              layout="vertical"
                              size="middle"
                              className="space-y-3">
                              <Form.Item
                                name="title"
                                label={<span className="font-medium text-gray-700">Title</span>}
                                rules={[{ required: true, message: 'Title is required' }]}>
                                <Input
                                  placeholder="Enter lesson title"
                                  className="rounded-lg"
                                />
                              </Form.Item>
                              <Form.Item
                                name="content"
                                label={<span className="font-medium text-gray-700">Content</span>}
                                rules={[{ required: true, message: 'Content is required' }]}>
                                <TextArea
                                  rows={3}
                                  placeholder="Enter lesson content"
                                  className="rounded-lg"
                                />
                              </Form.Item>
                              <Form.Item
                                name="skillFocus"
                                label={
                                  <span className="font-medium text-gray-700">Skill Focus</span>
                                }
                                rules={[{ required: true, message: 'Skill focus is required' }]}>
                                <Input
                                  placeholder="Listening, Grammar, etc."
                                  className="rounded-lg"
                                />
                              </Form.Item>
                              <Form.Item
                                name="description"
                                label={
                                  <span className="font-medium text-gray-700">Description</span>
                                }>
                                <TextArea
                                  rows={2}
                                  placeholder="Brief description"
                                  className="rounded-lg"
                                />
                              </Form.Item>
                              <div className="grid grid-cols-2 gap-3">
                                <Form.Item label="Video File">
                                  <Upload
                                    name="videoFile"
                                    beforeUpload={() => false}
                                    onChange={handleVideoChange}
                                    accept="video/*"
                                    maxCount={1}>
                                    <Button icon={<VideoCameraOutlined />}>Select Video</Button>
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
                                    <Button icon={<FileOutlined />}>Select Document</Button>
                                  </Upload>
                                  {documentFile && (
                                    <Text className="block mt-1 text-xs">{documentFile.name}</Text>
                                  )}
                                </Form.Item>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  type="primary"
                                  htmlType="submit"
                                  loading={createLessonMutation.isPending}>
                                  Save Lesson
                                </Button>
                                <Button onClick={() => setShowLessonForm(false)}>Cancel</Button>
                              </div>
                            </Form>
                          </div>
                        )}

                        {/* Lesson List */}
                        <div className="grid grid-cols-1 gap-3">
                          {lessonsLoading ? (
                            <div className="flex justify-center py-6">
                              <Spin />
                            </div>
                          ) : unitLessons.length === 0 ? (
                            <Empty description="No lessons yet" />
                          ) : (
                            unitLessons.map((lesson: Lesson) => (
                              <div
                                key={lesson.lessonID}
                                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-gray-800 font-semibold text-sm">
                                    {lesson.title}
                                  </h4>
                                  {lesson.skillFocus && (
                                    <Tag
                                      color="blue-inverse"
                                      className="text-xs">
                                      {lesson.skillFocus}
                                    </Tag>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                  {lesson.description}
                                </p>
                                <div className="flex space-x-2">
                                  {lesson.videoUrl && (
                                    <Button
                                      type="default"
                                      size="small"
                                      icon={<VideoCameraOutlined />}
                                      href={lesson.videoUrl}
                                      target="_blank"
                                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-400 rounded-lg">
                                      Video
                                    </Button>
                                  )}
                                  {lesson.documentUrl && (
                                    <Button
                                      type="default"
                                      size="small"
                                      icon={<FileOutlined />}
                                      href={lesson.documentUrl}
                                      target="_blank"
                                      className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-400 rounded-lg">
                                      Document
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </Panel>
                    );
                  })
                )}
              </Collapse>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CourseDetail;
