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
} from 'antd';
import {
  createCourseUnitsService,
  getCourseDetailService,
  getCourseUnitsService,
  getLessonsByUnits,
} from '../../services/course';
import type { Unit, Lesson } from '../../services/course/type';
import { PlusOutlined } from '@ant-design/icons';
import type { AxiosError } from 'axios';
import { notifyError } from '../../utils/toastConfig';

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
    <div className="max-w-6xl mx-auto py-10 px-4">
      <Button onClick={() => navigate(-1)} type="default" className="mb-4">
        ← Back
      </Button>
      <Row gutter={[24, 24]}>
        {/* LEFT: Course Info */}
        <Col xs={24} md={10}>
          <Card>
            <img
              src={course?.imageUrl || '/default-course.jpg'}
              alt={course?.title || 'Course Image'}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <Title level={3}>{course?.title || 'Untitled Course'}</Title>
            <Paragraph>{course?.description || 'No description provided'}</Paragraph>

            <div className="flex items-center mb-3">
              <Avatar src={course?.teacherInfo?.avatarUrl} size={32} className="mr-2" />
              <Text>{course?.teacherInfo?.fullName || 'Unknown Teacher'}</Text>
            </div>

            <Row gutter={4} className="mb-4">
              <Col>
                <Tag color="blue">{course?.languageInfo?.name || 'No Language'}</Tag>
              </Col>
              <Col>
                <Tag color="green">{course?.courseLevel || 'N/A'}</Tag>
              </Col>
              <Col>
                <Tag color="purple">{course?.courseSkill || 'N/A'}</Tag>
              </Col>
            </Row>

            <Text strong>Goal: </Text>
            <Paragraph>{course?.goalInfo?.description || 'No goal description'}</Paragraph>

            <Text strong>Price: </Text>
            <Paragraph>
              ${course?.discountPrice || course?.price || 'N/A'}
            </Paragraph>
            <Button
              type="primary"
              onClick={() => navigate(`/teacher/course/${course?.courseID}/edit-course`)}
            >
              Edit Course
            </Button>
          </Card>
        </Col>

        {/* RIGHT: Units + Lessons */}
        <Col xs={24} md={14}>
          <Card
            title="Units Overview"
            extra={
              <Button
                type="primary"
                icon={activeKey === 'create' ? null : <PlusOutlined />}
                onClick={() => setActiveKey(activeKey === 'create' ? '' : 'create')}
              >
                {activeKey === 'create' ? 'Cancel' : 'Add Unit'}
              </Button>
            }
          >
            <Collapse
              style={{ marginBottom: 12 }}
              activeKey={activeKey}
              onChange={(key) => setActiveKey(key)}
              className="mb-4"
            >
              <Panel header="Create New Unit" key="create">
                <Form layout="vertical" onFinish={handleAddUnit}>
                  <Form.Item
                    name="title"
                    label="Unit Title"
                    rules={[{ required: true, message: 'Please enter unit title' }]}
                  >
                    <Input placeholder="e.g., Introduction to Basics" />
                  </Form.Item>
                  <Form.Item name="description" label="Description">
                    <Input.TextArea
                      rows={2}
                      placeholder="Short description for this unit"
                    />
                  </Form.Item>
                  <div className="flex justify-end">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={createUnitMutation.isPending}
                    >
                      Save Unit
                    </Button>
                  </div>
                </Form>
              </Panel>
            </Collapse>

            {Array.isArray(units) && units.length > 0 ? (
              units.map((unit) => (
                <UnitWithLessons key={unit?.courseUnitID || Math.random()} unit={unit} />
              ))
            ) : (
              <Empty description="No units found" />
            )}
          </Card>
        </Col>
      </Row>
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
    <Card style={{ marginBottom: 8 }} size="small" className="mb-3 border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <div>
          <Text strong>{unit?.title || 'Untitled Unit'}</Text>
          <Paragraph className="text-xs text-gray-500 mb-1">
            {unit?.description || 'No description provided'}
          </Paragraph>
          <Tag color="default">Lessons: {unit?.totalLessons ?? 0}</Tag>
        </div>
        <Link to={`unit/${unit?.courseUnitID}`}>
          <Button size="small" type="link">
            Edit Lessons
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-2">
          <Spin size="small" />
        </div>
      ) : lessons.length === 0 ? (
        <Empty description="No lessons yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <Card
              style={{ marginBottom: 8 }}
              key={lesson?.lessonID || Math.random()}
              size="small"
              className="border-gray-100"
            >
              <div className="flex justify-between items-center">
                <Text>{lesson?.title || 'Untitled Lesson'}</Text>
                <Tag color="blue-inverse">#{lesson?.position ?? '-'}</Tag>
              </div>
              <Paragraph className="text-xs text-gray-500 mb-1">
                {lesson?.description || 'No description available'}
              </Paragraph>
              <div className="flex space-x-2">
                {lesson?.videoUrl && (
                  <Button size="small" type="link" href={lesson.videoUrl} target="_blank">
                    Video
                  </Button>
                )}
                {lesson?.documentUrl && (
                  <Button size="small" type="link" href={lesson.documentUrl} target="_blank">
                    Document
                  </Button>
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
