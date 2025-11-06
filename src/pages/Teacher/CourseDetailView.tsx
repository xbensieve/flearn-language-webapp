/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Card,
  Collapse,
  Tag,
  Typography,
  Row,
  Col,
  Spin,
  Empty,
  Button,
  message,
  Alert,
  Tooltip,
  Avatar,
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  FileOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import {
  getCourseDetailService,
  getCourseUnitsService,
  getLessonsByUnits,
  submitCourseService,
} from '../../services/course';
import type { Lesson, Unit } from '../../services/course/type';
import {
  ArrowLeft,
  Check,
  Lightbulb,
  BookOpen,
  Target,
  GraduationCap,
  DollarSign,
  Users,
  Calendar,
  Sparkles,
  Play,
  FileText,
  Star,
  MessageSquare,
  Box,
  Timer,
  Clock,
} from 'lucide-react';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import { formatStatusLabel } from '../../utils/mapping';
import type { AxiosError } from 'axios';
import ExercisesList from './components/ExercisesList';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

/** Subcomponent: handles fetching + rendering lessons for a specific unit */
export const UnitLessons: React.FC<{ unit: Unit; isEditMode?: boolean }> = ({
  unit,
  isEditMode,
}) => {
  const navigate = useNavigate();

  const {
    data: lessonsResponse,
    isLoading: lessonsLoading,
    isError,
  } = useQuery({
    queryKey: ['lessons', unit?.courseUnitID],
    queryFn: () => getLessonsByUnits({ unitId: unit?.courseUnitID }),
    enabled: !!unit?.courseUnitID,
    retry: 1,
  });

  if (lessonsLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spin />
      </div>
    );
  }

  if (isError || !lessonsResponse?.data || lessonsResponse.data.length === 0) {
    return <Empty description="No lessons found for this unit" />;
  }

  const lessons = [...lessonsResponse.data].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4">
      {lessons.map((lesson: Lesson) => (
        <Card
          key={lesson?.lessonID}
          className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-blue-50"
          hoverable={!isEditMode}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <Text
                  strong
                  className="text-gray-800 block">
                  {lesson?.title ?? 'Untitled Lesson'}
                </Text>
                <Tag
                  color="blue"
                  className="mt-1 px-2 py-1 text-xs">
                  Lesson {lesson?.position ?? '-'}
                </Tag>
              </div>
            </div>
            {isEditMode && (
              <Button
                size="small"
                icon={<EditOutlined />}
                className="text-gray-600 border-gray-300 hover:border-gray-400 rounded-lg flex-shrink-0"
                onClick={() => navigate(`/teacher/lesson/${lesson?.lessonID}/edit`)}>
                Edit
              </Button>
            )}
          </div>

          <Paragraph className="text-gray-600 text-sm mb-3 line-clamp-2">
            {lesson?.description ?? 'No description provided'}
          </Paragraph>

          {lesson?.content && (
            <div
              className="prose prose-sm max-w-none text-gray-800 bg-gray-50 p-3 rounded-lg"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          )}

          {/* Video Preview */}
          {lesson?.videoUrl && (
            <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 bg-black mb-4">
              <video
                controls
                src={lesson.videoUrl}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none rounded-xl">
                <PlayCircleOutlined className="text-white text-4xl opacity-80" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {lesson?.documentUrl && (
              <Tooltip title="Open in new tab">
                <Button
                  type="default"
                  size="small"
                  icon={<FileOutlined />}
                  href={lesson.documentUrl}
                  target="_blank"
                  className="text-green-600 border-green-200 hover:border-green-400 rounded-lg flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Document
                </Button>
              </Tooltip>
            )}
            <Button
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => navigate(`/teacher/lesson/${lesson?.lessonID}`)}
              className="rounded-lg flex items-center gap-1">
              <Play className="w-3 h-3" />
              Preview
            </Button>
          </div>
          <ExercisesList
            lessonId={lesson?.lessonID ?? ''}
            readonly={!isEditMode}
          />
        </Card>
      ))}
    </div>
  );
};

/** Main Component */
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
    queryFn: async () => {
      const res = await getCourseUnitsService({ id: courseId! });
      return Array.isArray(res) ? res : res?.data ?? [];
    },
    enabled: !!courseId,
  });

  const { mutate: submitCourse } = useMutation({
    mutationFn: (courseId: string) => submitCourseService(courseId),
    onSuccess: () => {
      notifySuccess('Course submitted successfully');
    },
    onError: (error: AxiosError<any>) => {
      notifyError(error.response?.data?.message || 'Error submitting course');
    },
  });

  const handleToggleEdit = () => {
    if (isEditMode) {
      message.success('Changes saved (mock)');
    }
    setIsEditMode((prev) => !prev);
  };

  const handleSubmitCourse = () => {
    if (courseId) submitCourse(courseId);
  };

  if (courseLoading || unitsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Spin
            size="large"
            className="mb-4"
          />
          <Title
            level={4}
            className="text-gray-600">
            Loading course details...
          </Title>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <Empty description="Course not found" />
      </div>
    );
  }

  const course = courseData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center bg-white rounded-t-2xl p-6 border-gray-100">
          <div className="flex items-center gap-3">
            <Tooltip title="Back to courses">
              <Button
                onClick={() => navigate(-1)}
                type="default"
                className="rounded-xl shadow-sm border-gray-200 hover:border-indigo-300 transition-colors">
                <ArrowLeft size={16} />
              </Button>
            </Tooltip>
            <div className="flex items-center gap-2">
              <Title
                level={2}
                className="!mb-0 text-gray-800">
                Course Overview
              </Title>
            </div>
          </div>
          <div className="space-x-2 flex items-center">
            {isEditMode ? (
              <>
                <Tooltip title="Save changes">
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleToggleEdit}
                    className="rounded-xl shadow-md hover:shadow-lg transition-all">
                    Save Changes
                  </Button>
                </Tooltip>
                <Tooltip title="Cancel editing">
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => setIsEditMode(false)}
                    className="rounded-xl">
                    Cancel
                  </Button>
                </Tooltip>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {course?.courseStatus?.toLowerCase() === 'draft' && (
                  <Tooltip title="Submit for review">
                    <Button
                      type="primary"
                      onClick={handleSubmitCourse}
                      icon={<Check size={16} />}
                      className="rounded-xl shadow-md hover:shadow-lg transition-all">
                      Submit Course
                    </Button>
                  </Tooltip>
                )}
                {(course?.courseStatus?.toLowerCase() === 'draft' ||
                  course?.courseStatus?.toLowerCase() === 'rejected') && (
                  <Tooltip title="Edit course details">
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => navigate(`/teacher/course/${courseId}/edit`)}
                      className="rounded-xl border-gray-300 hover:border-indigo-400 transition-colors">
                      Edit
                    </Button>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="overflow-hidden shadow-xl border-0 relative bg-gradient-to-r from-indigo-600 to-purple-700">
          <img
            src={course?.imageUrl ?? '/default-course.jpg'}
            alt={course?.title ?? 'Course Image'}
            className="w-full h-72 object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute top-6 right-6">
            <Tag
              color="gold"
              className="px-3 py-2 text-sm font-medium shadow-lg">
              <Sparkles className="w-3 h-3 inline mr-1" />
              {formatStatusLabel(course?.courseStatus ?? 'unknown')}
            </Tag>
          </div>
          <div className="absolute bottom-6 left-6 text-white max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <Title
                  level={1}
                  className="!text-white !mb-1">
                  {course?.title ?? 'Untitled Course'}
                </Title>
                <Text className="!text-indigo-100 text-sm">
                  <Avatar
                    src={course?.teacher?.avatar}
                    className="!mr-2"
                  />
                  By {course?.teacher?.name ?? 'Unknown Teacher'}
                </Text>
              </div>
            </div>
            <Paragraph className="!text-gray-200 leading-relaxed">
              {course?.description ?? 'No description available'}
            </Paragraph>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm">
                <Target className="w-4 h-4 text-white" />
                <Text className="!text-white text-sm">
                  {course?.language ?? 'Unknown Language'}
                </Text>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm">
                <GraduationCap className="w-4 h-4 text-white" />
                <Text className="!text-white text-sm">{course?.program.level.name ?? 'N/A'}</Text>
              </div>
            </div>
          </div>
        </div>

        {/* Course Info */}
        <Card
          style={{ borderRadius: 0 }}
          className="shadow-sm border-0 bg-white">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              <Text
                strong
                className="text-xl text-gray-800">
                Quick Stats
              </Text>
            </div>
            <Row
              gutter={[16, 16]}
              className="mb-6">
              <Col
                xs={24}
                sm={12}
                md={8}>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-blue-600" />
                    <Text
                      strong
                      className="text-blue-800">
                      Language
                    </Text>
                  </div>
                  <Text className="text-gray-900 font-medium">{course?.language ?? 'N/A'}</Text>
                </div>
              </Col>
              <Col
                xs={24}
                sm={12}
                md={8}>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                    <Text
                      strong
                      className="text-green-800">
                      Level
                    </Text>
                  </div>
                  <Text className="text-gray-900 font-medium">
                    {course?.program.level.name ?? 'N/A'}
                  </Text>
                </div>
              </Col>
              <Col
                xs={24}
                sm={12}
                md={8}>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <Text
                      strong
                      className="text-purple-800">
                      Status
                    </Text>
                  </div>
                  <Tag
                    color={course?.courseStatus === 'published' ? 'success' : 'default'}
                    className="px-3 py-1">
                    {formatStatusLabel(course?.courseStatus ?? 'unknown')}
                  </Tag>
                </div>
              </Col>
            </Row>

            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <Text
                    strong
                    className="text-indigo-800">
                    Program Description
                  </Text>
                </div>
                {/* <Paragraph className="text-gray-700 leading-relaxed">
                  {course?.?.description ?? 'No goal description provided'}
                </Paragraph> */}
                <Paragraph className="text-gray-700 leading-relaxed">
                  {course?.program?.description ?? 'No goal description provided'}
                </Paragraph>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <Text
                    strong
                    className="text-green-800">
                    Pricing
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  {course?.discountPrice ? (
                    <>
                      <Text
                        delete
                        className="text-gray-500 text-lg">
                        {Number(course?.price ?? 0).toLocaleString('vi-VN')} VNĐ
                      </Text>
                      <Text
                        type="success"
                        strong
                        className="text-2xl">
                        {Number(course?.discountPrice ?? 0).toLocaleString('vi-VN')} VNĐ
                      </Text>
                    </>
                  ) : (
                    <Text className="text-gray-800 font-bold text-2xl">
                      {Number(course?.price ?? 0).toLocaleString('vi-VN')} VNĐ
                    </Text>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Row gutter={[16, 12]}>
                  {/* ⭐ Rating */}
                  <Col
                    xs={24}
                    sm={8}
                    className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {course.averageRating ?? '—'}
                  </Col>

                  {/* 👥 Learners */}
                  <Col
                    xs={24}
                    sm={8}
                    className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    {course.learnerCount ?? 0} learners
                  </Col>

                  {/* 💬 Reviews */}
                  <Col
                    xs={24}
                    sm={8}
                    className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    {course.reviewCount ?? 0} reviews
                  </Col>

                  {/* 📦 Units */}
                  <Col
                    xs={24}
                    sm={8}
                    className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-purple-600" />
                    {course.numUnits ?? '—'} Units
                  </Col>

                  {/* 📚 Lessons */}
                  <Col
                    xs={24}
                    sm={8}
                    className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    {course.numLessons ?? '—'} Lessons
                  </Col>

                  {/* ⏳ Duration Days */}
                  <Col
                    xs={24}
                    sm={8}
                    className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-orange-600" />
                    {course.durationDays ?? '—'} days
                  </Col>

                  {/* ⏱ Estimated Hours */}
                  <Col
                    xs={24}
                    sm={8}
                    className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-600" />
                    {course.estimatedHours ?? '—'} hours
                  </Col>

                  {/* Empty placeholders */}
                  <Col
                    xs={24}
                    sm={8}
                    className="text-gray-400">
                    —
                  </Col>
                  <Col
                    xs={24}
                    sm={8}
                    className="text-gray-400">
                    —
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </Card>

        {/* Units + Lessons */}
        <Card
          style={{ borderRadius: 0 }}
          className="shadow-sm border-0 bg-white">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <Title
                level={3}
                className="!mb-0 text-gray-800">
                Course Content
              </Title>
            </div>

            {!Array.isArray(unitsData) || unitsData.length === 0 ? (
              <Empty description="No units found" />
            ) : (
              <Collapse
                bordered={false}
                expandIconPosition="end"
                defaultActiveKey={unitsData.map((_, idx) => idx.toString())}
                className="space-y-3">
                {unitsData.map((unit: Unit, index: number) => (
                  <Panel
                    key={unit?.courseUnitID ?? index}
                    header={
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50">
                        <div className="w-8 h-8 bg-indigo-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-gray-800 font-semibold truncate">
                            {unit?.title ?? 'Untitled Unit'}
                          </h4>
                          <Text className="text-gray-500 text-sm block truncate mt-1">
                            {unit?.description ?? 'No description provided'}
                          </Text>
                        </div>
                        <Tag
                          color="blue"
                          className="px-2 py-1 text-xs flex-shrink-0">
                          Unit {index + 1}
                        </Tag>
                      </div>
                    }
                    className="rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-all">
                    <UnitLessons
                      unit={unit}
                      isEditMode={isEditMode}
                    />
                  </Panel>
                ))}
              </Collapse>
            )}
          </div>
        </Card>

        {course?.courseStatus?.toLowerCase() === 'rejected' && (
          <Alert
            message="Course Feedback"
            description="Your course was rejected. Review the notes and edit to resubmit."
            type="warning"
            className="rounded-2xl"
            action={
              <Button
                size="small"
                onClick={() => navigate(`/teacher/course/${courseId}/edit`)}>
                Edit Now
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default CourseDetailView;
