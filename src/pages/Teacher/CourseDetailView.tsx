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
  Avatar,
  Button,
  message,
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
import { Check } from 'lucide-react';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import { formatStatusLabel } from '../../utils/mapping';
const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

/** Subcomponent: handles fetching + rendering lessons for a specific unit */
const UnitLessons: React.FC<{ unit: Unit; isEditMode: boolean }> = ({ unit, isEditMode }) => {
  const navigate = useNavigate();

  const {
    data: lessonsResponse,
    isLoading: lessonsLoading,
    isError,
  } = useQuery({
    queryKey: ['lessons', unit.courseUnitID],
    queryFn: () => getLessonsByUnits({ unitId: unit.courseUnitID }),
    enabled: !!unit.courseUnitID,
    retry: 1,
  });

  if (lessonsLoading) {
    return (
      <div className='flex justify-center py-6'>
        <Spin />
      </div>
    );
  }

  if (isError || !lessonsResponse?.data?.length) {
    return <Empty description='No lessons found for this unit' />;
  }

  const lessons = [...lessonsResponse.data].sort((a, b) => a.position - b.position);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {lessons.map((lesson: Lesson) => (
        <Card
          key={lesson.lessonID}
          className='rounded-xl border-gray-200 hover:shadow-md transition-all duration-300'
        >
          <div className='flex items-center justify-between mb-2'>
            <Text strong className='text-gray-800'>
              {lesson.title}
            </Text>
            <Tag color='blue-inverse'>Lesson {lesson.position}</Tag>
          </div>

          <Paragraph className='text-gray-600 text-sm mb-3 line-clamp-2'>
            {lesson.description}
          </Paragraph>

          {lesson.content && (
            <div
              className='prose prose-sm max-w-none text-gray-800'
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          )}

          {/* Video Preview */}
          {lesson.videoUrl && (
            <div className='relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-black'>
              <video controls src={lesson.videoUrl} className='w-full h-full object-cover' />
              <div className='absolute inset-0 flex items-center justify-center bg-black/10'>
                <PlayCircleOutlined className='text-white text-3xl opacity-80' />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className='flex flex-wrap gap-2 mt-3'>
            {lesson.documentUrl && (
              <Button
                type='default'
                size='small'
                icon={<FileOutlined />}
                href={lesson.documentUrl}
                target='_blank'
                className='text-green-600 border-green-200 hover:border-green-400 rounded-lg'
              >
                View Document
              </Button>
            )}
            <Button
              size='small'
              icon={<PlayCircleOutlined />}
              onClick={() => navigate(`/teacher/lesson/${lesson.lessonID}`)}
            >
              View Lesson
            </Button>
            {isEditMode && (
              <Button
                size='small'
                icon={<EditOutlined />}
                className='text-gray-600 border-gray-300 hover:border-gray-400 rounded-lg'
              >
                Edit Lesson
              </Button>
            )}
          </div>
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
    queryFn: () => getCourseUnitsService({ id: courseId! }),
    enabled: !!courseId,
  });

  const { mutate: submitCourse } = useMutation({
    mutationFn: (courseId: string) => submitCourseService(courseId),
    onSuccess: () => {
      notifySuccess('Course submitted successfully');
    },
    onError: () => {
      notifyError('Error submitting course');
    },
  });

  const handleToggleEdit = () => {
    if (isEditMode) {
      message.success('Changes saved (mock)');
    }
    setIsEditMode((prev) => !prev);
  };

  const handleSubmitCourse = () => {
    submitCourse(courseId!);
  };

  if (courseLoading || unitsLoading) {
    return (
      <div className='flex justify-center items-center min-h-[70vh]'>
        <Spin size='large' />
      </div>
    );
  }

  if (!courseData) {
    return <Empty description='Course not found' />;
  }

  const course = courseData;

  return (
    <div className='min-h-screen bg-gray-50 py-10 px-4'>
      <div className='max-w-6xl mx-auto space-y-8'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <Title level={2} className='!mb-0 text-gray-800'>
            Course Detail
          </Title>
          <div className='space-x-2'>
            {isEditMode ? (
              <>
                <Button type='primary' icon={<SaveOutlined />} onClick={handleToggleEdit}>
                  Save
                </Button>
                <Button danger icon={<CloseOutlined />} onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <div className='flex justify-center items-center gap-1.5'>
                {course.status.toLowerCase() === 'draft' && (
                  <Button
                    type='primary'
                    onClick={() => handleSubmitCourse()}
                    icon={<Check size={14} />}
                  >
                    Submit
                  </Button>
                )}
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/teacher/course/${courseId}/edit`)}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Hero */}
        <div className='relative rounded-2xl overflow-hidden shadow-md'>
          <img src={course.imageUrl} alt={course.title} className='w-full h-64 object-cover' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent' />
          <div className='absolute bottom-4 left-6 text-white'>
            <Title level={2} className='!text-white mb-0'>
              {course.title}
            </Title>
            <Paragraph className='text-gray-200 mt-1 max-w-xl'>{course.description}</Paragraph>
            <div className='flex items-center mt-3 space-x-3'>
              <Avatar src={course.teacherInfo.avatarUrl} />
              <Text className='text-gray-100 text-sm'>{course.teacherInfo.fullName}</Text>
            </div>
          </div>
        </div>

        {/* Course Info */}
        <Card className='rounded-2xl shadow-sm border border-gray-100'>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Tag color='blue'>{course.languageInfo.name}</Tag>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Tag color='green'>{course.courseLevel}</Tag>
            </Col>
            {/* <Col xs={24} sm={12} md={6}>
              <Tag color='purple'>{course.courseSkill}</Tag>
            </Col> */}
            <Col xs={24} sm={12} md={6}>
              <Tag color={course.status === 'published' ? 'success' : 'default'}>
                {formatStatusLabel(course.status)}
              </Tag>
            </Col>
          </Row>

          <div className='mt-6 space-y-1'>
            <Text strong className='block text-sm'>
              🎯 Goal:
            </Text>
            <Paragraph className='text-gray-600 text-sm mb-2'>
              {course.goalInfo.description}
            </Paragraph>

            <Text strong className='block text-sm'>
              💰 Price:
            </Text>
            {course.discountPrice ? (
              <>
                <Text delete className='text-gray-500 text-sm mr-1'>
                  ${course.price}
                </Text>
                <Text type='success' strong>
                  ${course.discountPrice}
                </Text>
              </>
            ) : (
              <Text className='text-gray-800 font-semibold'>${course.price}</Text>
            )}
          </div>
        </Card>

        {/* Units + Lessons */}
        <div>
          <Title level={3} className='text-gray-800 mb-4'>
            📘 Course Content
          </Title>

          {!unitsData?.length ? (
            <Empty description='No units found' />
          ) : (
            <Collapse bordered={false} expandIconPosition='end' className='space-y-3'>
              {unitsData.map((unit: Unit) => (
                <Panel
                  key={unit.courseUnitID}
                  header={
                    <div>
                      <h4 className='text-gray-800 font-semibold'>{unit.title}</h4>
                      <p className='text-gray-500 text-sm mt-1'>{unit.description}</p>
                    </div>
                  }
                  className='bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all'
                >
                  <UnitLessons unit={unit} isEditMode={isEditMode} />
                </Panel>
              ))}
            </Collapse>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailView;
