/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Row,
  Col,
  Tag,
  Avatar,
  Typography,
  Empty,
  Spin,
  Button,
  Form,
  Input,
  message,
  Collapse,
  Tooltip,
} from 'antd';
import {
  createCourseUnitsService,
  getCourseDetailService,
  getCourseUnitsService,
  getLessonsByUnits,
} from '../../services/course';
import type { Unit, Lesson } from '../../services/course/type';
import { CloseOutlined, FileOutlined, PlusOutlined, VideoCameraOutlined } from '@ant-design/icons';
import type { AxiosError } from 'axios';
import { notifyError } from '../../utils/toastConfig';
import {
  ArrowLeft,
  BookOpen,
  DollarSign,
  Edit,
  FileText,
  GraduationCap,
  Info,
  Lightbulb,
  Play,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const CourseDetail: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeKey, setActiveKey] = useState<string | string[]>('');

  // --- Fetch Course Info ---
  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseDetailService(courseId!),
    enabled: !!courseId,
  });

  // --- Fetch Units ---
  const {
    data: units,
    isLoading: loadingUnits,
    refetch: refetchUnits,
  } = useQuery<Unit[]>({
    queryKey: ['units', courseId],
    queryFn: () => getCourseUnitsService({ id: courseId! }),
    enabled: !!courseId,
  });

  // --- Create Unit Mutation ---
  const createUnitMutation = useMutation({
    mutationFn: (values: { id: string; title: string; description: string; isPreview: boolean }) =>
      createCourseUnitsService({
        courseId: values.id || '',
        title: values.title,
        description: values.description,
        isPreview: values.isPreview,
      }),
    onSuccess: () => {
      message.success('Unit created successfully');
      setActiveKey('');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      refetchUnits();
    },
    onError: (error: AxiosError<any>) => {
      notifyError(error.response?.data?.message || 'Failed to create unit');
    },
  });

  const handleAddUnit = (values: { title: string; description: string }) => {
    createUnitMutation.mutate({
      id: courseId!,
      title: values.title,
      description: values.description,
      isPreview: false,
    });
  };

  // --- Loading + Empty State ---
  if (loadingCourse || loadingUnits)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );

  if (!course) return <Empty description="Course not found" />;

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-t-2xl p-6 shadow-sm border border-gray-100">
          <Tooltip title="Back to courses">
            <Button
              onClick={() => navigate(-1)}
              type="default"
              className="rounded-xl shadow-sm border-gray-200 hover:border-indigo-300 transition-all flex items-center gap-2">
              <ArrowLeft size={16} />
              Back
            </Button>
          </Tooltip>
          <div className="flex items-center gap-3">
            <Title
              level={2}
              className="!mb-0 !text-gray-800 flex items-center gap-2">
              Course Builder
            </Title>
          </div>
          <Tooltip title="Edit course overview">
            <Button
              type="primary"
              onClick={() => navigate(`/teacher/course/${course?.courseID}/edit-course`)}
              className="rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2">
              <Edit size={16} />
              Edit Course
            </Button>
          </Tooltip>
        </div>

        <Row gutter={[24, 24]}>
          {/* LEFT: Course Info */}
          <Col
            xs={24}
            md={10}>
            <Card className="rounded-3xl shadow-lg border-0 overflow-hidden bg-gradient-to-br from-white to-blue-50">
              <div className="relative">
                <img
                  src={course?.imageUrl || '/default-course.jpg'}
                  alt={course?.title || 'Course Image'}
                  className="w-full h-64 object-cover rounded-3xl"
                />
                <div className="absolute top-4 right-4">
                  <Tag
                    color="gold"
                    className="!px-3 !py-2 !shadow-md !flex !items-center !gap-1">
                    <Sparkles size={12} />
                    Draft
                  </Tag>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/60 via-black/40 to-transparent rounded-b-3xl flex items-end p-6">
                  <div className="w-full max-w-4xl mx-4">
                    <Title
                      level={3}
                      className="!mb-2 !text-white">
                      {course?.title || 'Untitled Course'}
                    </Title>
                    <Paragraph className="!text-indigo-100 mb-4 max-w-md !leading-relaxed">
                      {course?.description || 'No description provided'}
                    </Paragraph>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={course?.teacherInfo?.avatar}
                        size={32}
                        className="border-2 !border-white"
                      />
                      <Text className="!text-white font-medium">
                        {course?.teacherInfo?.fullName || 'Unknown Teacher'}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 my-2">
                <div className="flex flex-wrap gap-2">
                  <div>
                    <Tag
                      color="blue"
                      className="!px-3 !py-2 !flex items-center !gap-1">
                      <Users size={12} />
                      {course?.languageInfo?.name || 'No Language'}
                    </Tag>
                  </div>
                  <Tag
                    color="green"
                    className="!px-3 !py-2 !flex items-center !gap-1">
                    <GraduationCap size={12} />
                    {course?.courseLevel || 'N/A'}
                  </Tag>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb
                      size={16}
                      className="text-blue-600"
                    />
                    <Text
                      strong
                      className="text-blue-800">
                      Topics
                    </Text>
                  </div>
                  <Paragraph className="text-gray-700">
                    {course?.topics.map((topic) => topic.topicName).join(', ')}
                  </Paragraph>
                </div>

                <div className="p-4 bg-indigo-50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb
                      size={16}
                      className="text-indigo-600"
                    />
                    <Text
                      strong
                      className="text-indigo-800">
                      Learning Goal
                    </Text>
                  </div>
                  <Paragraph className="text-gray-700">
                    {course?.goals?.map((goal) => goal.name).join(', ') || 'No goal description'}
                  </Paragraph>
                </div>

                <div className="p-4 bg-green-50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign
                      size={16}
                      className="text-green-600"
                    />
                    <Text
                      strong
                      className="text-green-800">
                      Pricing
                    </Text>
                  </div>
                  {course.price ? (
                    <div>
                      <Text className="text-2xl font-bold text-green-700">
                        {course?.discountPrice
                          ? `${course?.discountPrice} VNĐ`
                          : `${course?.price || 'N/A'} VNĐ`}
                      </Text>
                      {course?.discountPrice && (
                        <Text
                          delete
                          className="text-gray-500 ml-2">
                          {course?.price} VNĐ
                        </Text>
                      )}
                    </div>
                  ) : (
                    <Text className="text-2xl font-bold text-green-700">Free</Text>
                  )}
                </div>
              </div>
            </Card>
          </Col>

          {/* RIGHT: Units + Lessons */}
          <Col
            xs={24}
            md={14}>
            <Card className="!mb-6">
              <div className="flex !items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Info
                      size={16}
                      className="text-blue-600"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text
                      strong
                      className="text-blue-800">
                      Start to create units for your course
                    </Text>
                    <Paragraph className="text-gray-500 text-sm !mb-0">
                      Create units and lessons to make your course interactive and engaging.
                    </Paragraph>
                  </div>
                </div>
              </div>
            </Card>
            <Card
              className="rounded-3xl shadow-lg border-0 bg-white"
              title={
                <div className="flex items-center gap-2">
                  <BookOpen
                    size={20}
                    className="text-blue-600"
                  />
                  Units Overview
                </div>
              }
              extra={
                <Tooltip title={activeKey === 'create' ? 'Cancel adding unit' : 'Add a new unit'}>
                  <Button
                    type="primary"
                    icon={activeKey === 'create' ? <CloseOutlined /> : <PlusOutlined />}
                    onClick={() => setActiveKey(activeKey === 'create' ? '' : 'create')}
                    className="rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1">
                    {activeKey === 'create' ? 'Cancel' : 'Add Unit'}
                  </Button>
                </Tooltip>
              }>
              <Collapse
                style={{ marginBottom: 12 }}
                activeKey={activeKey}
                onChange={(key) => setActiveKey(key)}
                className="mb-4">
                <Panel
                  header={
                    <div className="flex items-center gap-3 p-3 rounded-2xl">
                      <Plus
                        size={20}
                        className="text-green-600"
                      />
                      <div>
                        <Text
                          strong
                          className="text-green-800">
                          Create New Unit
                        </Text>
                        <Text className="text-green-600 block text-sm mt-1">
                          Start building your module
                        </Text>
                      </div>
                    </div>
                  }
                  key="create">
                  <div className="p-4 bg-white rounded-2xl shadow-inner">
                    <Form
                      layout="vertical"
                      onFinish={handleAddUnit}>
                      <Form.Item
                        name="title"
                        label={
                          <span className="flex items-center gap-2">
                            <BookOpen
                              size={16}
                              className="text-blue-600"
                            />
                            Unit Title
                          </span>
                        }
                        rules={[{ required: true, message: 'Please enter unit title' }]}>
                        <Input placeholder="e.g., Introduction to Basics" />
                      </Form.Item>
                      <Form.Item
                        name="description"
                        label={
                          <span className="flex items-center gap-2">
                            <FileText
                              size={16}
                              className="text-gray-600"
                            />
                            Description
                          </span>
                        }>
                        <Input.TextArea
                          rows={2}
                          placeholder="Short description for this unit"
                        />
                      </Form.Item>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="default"
                          onClick={() => setActiveKey('')}>
                          Cancel
                        </Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={createUnitMutation.isPending}
                          icon={<Plus size={16} />}>
                          Create Unit
                        </Button>
                      </div>
                    </Form>
                  </div>
                </Panel>
              </Collapse>

              {Array.isArray(units) && units.length > 0 ? (
                units.map((unit) => (
                  <UnitWithLessons
                    key={unit?.courseUnitID || Math.random()}
                    unit={unit}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                  <Empty
                    description={
                      <div>
                        <BookOpen
                          size={48}
                          className="mx-auto mb-2 text-gray-400"
                        />
                        <Text className="text-gray-500">No units yet</Text>
                        <Text
                          type="secondary"
                          className="block text-sm mt-1">
                          Get started by adding your first unit!
                        </Text>
                      </div>
                    }
                  />
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

// ---- Subcomponent: Unit + Lessons preview ----
const UnitWithLessons: React.FC<{ unit: Unit }> = ({ unit }) => {
  const { data: lessonsResponse, isLoading } = useQuery({
    queryKey: ['lessons', unit?.courseUnitID],
    queryFn: () => getLessonsByUnits({ unitId: unit?.courseUnitID }),
    enabled: !!unit?.courseUnitID,
    retry: 1,
  });

  const lessons: Lesson[] = lessonsResponse?.data || [];

  return (
    <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-r from-indigo-50 to-blue-50 mb-4">
      <div className="flex items-start justify-between mb-4 p-2 rounded-xl bg-white -mx-4 -mt-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen
              size={20}
              className="text-blue-600"
            />
          </div>
          <div className="flex-1 min-w-0">
            <Text
              strong
              className="text-gray-800 block text-lg">
              {unit?.title || 'Untitled Unit'}
            </Text>
            <Paragraph className="text-gray-500 text-sm mb-1 truncate">
              {unit?.description || 'No description provided'}
            </Paragraph>
            <Tag
              color="blue"
              className="px-2 py-1 text-xs">
              <Users
                size={12}
                className="inline mr-1"
              />
              Lessons: {unit?.totalLessons ?? 0}
            </Tag>
          </div>
        </div>
        <Tooltip title="Manage lessons">
          <Link to={`unit/${unit?.courseUnitID}`}>
            <Button
              size="small"
              type="link"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
              <Edit size={16} />
              Edit Lessons
            </Button>
          </Link>
        </Tooltip>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spin size="small" />
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-6 bg-white rounded-xl">
          <Empty
            description={
              <div className="space-y-2">
                <Text
                  type="secondary"
                  className="text-sm">
                  Add lessons to bring this unit to life!
                </Text>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <div className="space-y-3 p-2">
          {lessons.map((lesson) => (
            <Card
              key={lesson?.lessonID || Math.random()}
              size="small"
              className="rounded-xl border-0 shadow-sm bg-white hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play
                      size={16}
                      className="text-green-600"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text className="text-gray-800 font-medium block">
                      {lesson?.title || 'Untitled Lesson'}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {lesson?.description || 'No description available'}
                    </Text>
                  </div>
                </div>
                <Tag
                  color="blue-inverse"
                  className="px-2 py-1 text-xs">
                  #{lesson?.position ?? '-'}
                </Tag>
              </div>
              <div className="flex space-x-2 mt-2">
                {lesson?.videoUrl && (
                  <Tooltip title="Watch video">
                    <Button
                      size="small"
                      type="link"
                      href={lesson.videoUrl}
                      target="_blank"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                      <VideoCameraOutlined />
                      Video
                    </Button>
                  </Tooltip>
                )}
                {lesson?.documentUrl && (
                  <Tooltip title="Download document">
                    <Button
                      size="small"
                      type="link"
                      href={lesson.documentUrl}
                      target="_blank"
                      className="flex items-center gap-1 text-green-600 hover:text-green-700">
                      <FileOutlined />
                      Document
                    </Button>
                  </Tooltip>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

export default CourseDetail;
