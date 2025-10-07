import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Collapse,
  Tag,
  Typography,
  Row,
  Col,
  Spin,
  Empty,
  Avatar,
  Button,
  message,
} from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, FileOutlined } from '@ant-design/icons';
import {
  getCourseDetailService,
  getCourseUnitsService,
  getLessonsByUnits,
} from '../../services/course';
import type { Lesson } from '../../services/course/type';
import type { Unit } from './CourseDetail';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const CourseDetailView: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseDetailService(courseId!),
    enabled: !!courseId,
  });

  const { data: unitsData, isLoading: unitsLoading } = useQuery({
    queryKey: ['units', courseId],
    queryFn: () => getCourseUnitsService({ id: courseId! }),
    enabled: !!courseId,
  });

  const { data: lessonsResponse, isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => getLessonsByUnits({ courseId: courseId! }),
    enabled: !!courseId,
  });

  const lessonsByUnit = useMemo(() => {
    if (!lessonsResponse?.data) return {};
    return lessonsResponse.data.reduce((acc, lesson) => {
      const unitId = lesson.courseUnitID;
      if (!acc[unitId]) acc[unitId] = [];
      acc[unitId].push(lesson);
      return acc;
    }, {} as Record<string, Lesson[]>);
  }, [lessonsResponse]);

  const handleToggleEdit = () => {
    if (isEditMode) {
      message.success('Changes saved (mock)');
    }
    setIsEditMode((prev) => !prev);
  };

  if (courseLoading || unitsLoading || lessonsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <Title
            level={2}
            className="!mb-0 text-gray-800">
            Course Detail
          </Title>
          <div className="space-x-2">
            {isEditMode ? (
              <>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleToggleEdit}>
                  Save
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/teacher/course/${courseId}/edit`)}>
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden shadow-md">
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-6 text-white">
            <Title
              level={2}
              className="!text-white mb-0">
              {course.title}
            </Title>
            <Paragraph className="text-gray-200 mt-1 max-w-xl">{course.description}</Paragraph>
            <div className="flex items-center mt-3 space-x-3">
              <Avatar src={course.teacherInfo.avatarUrl} />
              <Text className="text-gray-100 text-sm">{course.teacherInfo.fullName}</Text>
            </div>
          </div>
        </div>

        {/* Course Info */}
        <Card className="rounded-2xl shadow-sm border border-gray-100">
          <Row gutter={[16, 16]}>
            <Col
              xs={24}
              sm={12}
              md={6}>
              <Tag color="blue">{course.languageInfo.name}</Tag>
            </Col>
            <Col
              xs={24}
              sm={12}
              md={6}>
              <Tag color="green">{course.courseLevel}</Tag>
            </Col>
            <Col
              xs={24}
              sm={12}
              md={6}>
              <Tag color="purple">{course.courseSkill}</Tag>
            </Col>
            <Col
              xs={24}
              sm={12}
              md={6}>
              <Tag color={course.status === 'published' ? 'success' : 'default'}>
                {course.status}
              </Tag>
            </Col>
          </Row>

          <div className="mt-6 space-y-1">
            <Text
              strong
              className="block text-sm">
              🎯 Goal:
            </Text>
            <Paragraph className="text-gray-600 text-sm mb-2">
              {course.goalInfo.description}
            </Paragraph>

            <Text
              strong
              className="block text-sm">
              💰 Price:
            </Text>
            {course.discountPrice ? (
              <>
                <Text
                  delete
                  className="text-gray-500 text-sm mr-1">
                  ${course.price}
                </Text>
                <Text
                  type="success"
                  strong>
                  ${course.discountPrice}
                </Text>
              </>
            ) : (
              <Text className="text-gray-800 font-semibold">${course.price}</Text>
            )}

            <div className="flex items-center gap-2 mt-3">
              <Text
                strong
                className="text-sm">
                📅 Published:
              </Text>
              <Text className="text-gray-500 text-sm">
                {new Date(course.createdAt).toLocaleDateString()}
              </Text>
            </div>

            {course.approvedBy && (
              <div className="flex items-center gap-2">
                <Text
                  strong
                  className="text-sm">
                  ✅ Approved by:
                </Text>
                <Avatar
                  size={24}
                  src={course.approvedBy.avatarUrl}
                />
                <Text className="text-gray-600 text-sm">{course.approvedBy.fullName}</Text>
              </div>
            )}
          </div>
        </Card>

        {/* Units and Lessons */}
        <div>
          <Title
            level={3}
            className="text-gray-800 mb-4">
            📘 Course Content
          </Title>

          {!unitsData?.length ? (
            <Empty description="No units found" />
          ) : (
            <Collapse
              bordered={false}
              expandIconPosition="end"
              className="space-y-3">
              {unitsData.map((unit: Unit) => {
                const unitLessons = lessonsByUnit[unit.courseUnitID] || [];

                return (
                  <Panel
                    key={unit.courseUnitID}
                    header={
                      <div>
                        <h4 className="text-gray-800 font-semibold">{unit.title}</h4>
                        <p className="text-gray-500 text-sm mt-1">{unit.description}</p>
                      </div>
                    }
                    className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                    {unitLessons.length === 0 ? (
                      <Empty description="No lessons yet" />
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {unitLessons.map((lesson) => (
                          <div
                            key={lesson.lessonID}
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <Text
                                strong
                                className="text-gray-800">
                                {lesson.title}
                              </Text>
                              {lesson.skillFocus && (
                                <Tag color="blue-inverse">{lesson.skillFocus}</Tag>
                              )}
                            </div>
                            <Paragraph className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {lesson.description}
                            </Paragraph>
                            <div className="space-y-4">
                              {/* Video Section */}
                              {lesson.videoUrl && (
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 bg-black shadow-md hover:shadow-lg transition-all duration-300">
                                  {lesson.videoUrl.includes('youtube.com') ||
                                  lesson.videoUrl.includes('youtu.be') ? (
                                    <iframe
                                      src={lesson.videoUrl
                                        .replace('watch?v=', 'embed/')
                                        .replace('youtu.be/', 'youtube.com/embed/')}
                                      title={lesson.title}
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      className="w-full h-full"
                                    />
                                  ) : lesson.videoUrl.includes('vimeo.com') ? (
                                    <iframe
                                      src={lesson.videoUrl.replace(
                                        'vimeo.com',
                                        'player.vimeo.com/video'
                                      )}
                                      title={lesson.title}
                                      allow="autoplay; fullscreen; picture-in-picture"
                                      allowFullScreen
                                      className="w-full h-full"
                                    />
                                  ) : (
                                    <video
                                      controls
                                      src={lesson.videoUrl}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              )}

                              {/* Document + Actions */}
                              <div className="flex flex-wrap gap-2">
                                {lesson.documentUrl && (
                                  <Button
                                    type="default"
                                    size="small"
                                    icon={<FileOutlined />}
                                    href={lesson.documentUrl}
                                    target="_blank"
                                    className="text-green-600 border-green-200 hover:border-green-400 rounded-lg">
                                    View Document
                                  </Button>
                                )}

                                {isEditMode && (
                                  <Button
                                    size="small"
                                    icon={<EditOutlined />}
                                    className="text-gray-600 border-gray-300 hover:border-gray-400 rounded-lg">
                                    Edit Lesson
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Panel>
                );
              })}
            </Collapse>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailView;
