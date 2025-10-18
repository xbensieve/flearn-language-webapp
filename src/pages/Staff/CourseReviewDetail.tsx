/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Avatar,
  Divider,
  Button,
  Spin,
  Empty,
  Space,
  Modal,
  Form,
  Input,
  Collapse,
} from 'antd';
import {
  UserOutlined,
  // GlobalOutlined,
  // BookOutlined,
  // StarOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  // ReadOutlined,
  // PlayCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatStatusLabel } from '../../utils/mapping';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Topic, Unit, Lesson } from '../../services/course/type';
import {
  getCourseByIdStaffService,
  approveCourseService,
  rejectedCourseService,
} from '../../services/course';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import type { AxiosError } from 'axios';

const { Title, Paragraph, Text } = Typography;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Panel } = Collapse;

const CourseReviewDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id, courseSubmissionID } = useParams<{
    id: string;
    courseSubmissionID: string;
  }>();
  const queryClient = useQueryClient();

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['staff-course-detail', id],
    queryFn: () => getCourseByIdStaffService(id!),
    enabled: !!id,
  });

  const course = data?.data;

  // --- Approve ---
  const approveMutation = useMutation({
    mutationFn: () => approveCourseService(courseSubmissionID!),
    onSuccess: () => {
      notifySuccess('Course approved successfully');
      queryClient.invalidateQueries({ queryKey: ['staff-course-detail', id] });
      setIsApproveOpen(false);
    },
    onError: (err: AxiosError<any>) =>
      notifyError(err?.response?.data?.message || 'Failed to approve course'),
  });

  // --- Reject ---
  const rejectMutation = useMutation({
    mutationFn: (values: { id: string; reason: string }) =>
      rejectedCourseService(values),
    onSuccess: () => {
      notifySuccess('Course rejected successfully');
      setIsRejectModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['staff-course-detail', id] });
    },
    onError: (err: AxiosError<any>) =>
      notifyError(err?.response?.data?.message || 'Failed to reject course'),
  });

  // --- Handlers ---
  const handleApprove = () => setIsApproveOpen(true);
  const handleReject = () => setIsRejectModalOpen(true);
  const handleRejectSubmit = (values: { reason: string }) => {
    rejectMutation.mutate({ id: courseSubmissionID!, reason: values.reason });
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Spin size='large' />
      </div>
    );
  }

  if (!course) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Empty description='Course not found' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-10 px-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Back
          </Button>

          <Space>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={handleReject}
              loading={rejectMutation.isPending}>
              Reject
            </Button>
            <Button
              type='primary'
              icon={<CheckCircleOutlined />}
              onClick={handleApprove}
              loading={approveMutation.isPending}>
              Approve
            </Button>
          </Space>
        </div>

        {/* Course Info */}
        <Card
          className='shadow-md rounded-xl overflow-hidden mb-8'
          cover={
            <img
              src={
                course?.imageUrl ??
                'https://via.placeholder.com/800x320?text=No+Image'
              }
              alt={course?.title ?? 'Course Image'}
              style={{ height: 320, objectFit: 'cover' }}
            />
          }>
          <div className='p-4'>
            <Title level={2}>{course?.title ?? 'Untitled Course'}</Title>
            <Tag color='blue'>{formatStatusLabel(course?.status ?? '')}</Tag>
            <Paragraph className='text-gray-700 mt-2'>
              {course?.description ?? 'No description available.'}
            </Paragraph>
          </div>
        </Card>

        {/* Teacher Info */}
        <Card className='shadow-sm rounded-lg mb-8'>
          <Title level={4}>Teacher Information</Title>
          <Divider />
          <div className='flex items-center gap-4'>
            <Avatar
              src={course?.teacherInfo?.avatar}
              icon={<UserOutlined />}
              size={64}
            />
            <div>
              <Text strong>{course?.teacherInfo?.fullName ?? 'Unknown'}</Text>
              <Paragraph type='secondary' className='mb-0'>
                {course?.teacherInfo?.email ?? 'N/A'}
              </Paragraph>
            </div>
          </div>
        </Card>

        {/* Goal */}
        <Card className='shadow-sm rounded-lg mb-8'>
          <Title level={4}>Course Goal</Title>
          <Divider />
          <Text strong>{course?.goalInfo?.name ?? 'N/A'}</Text>
          <Paragraph type='secondary'>
            {course?.goalInfo?.description ?? 'No goal description'}
          </Paragraph>
        </Card>

        {/* Topics */}
        <Card className='shadow-sm rounded-lg mb-8'>
          <Title level={4}>Course Topics</Title>
          <Divider />
          {course?.topics?.length ? (
            <Row gutter={[16, 16]}>
              {course.topics.map((topic: Topic) => (
                <Col xs={24} sm={12} md={8} key={topic?.topicId}>
                  <Card
                    hoverable
                    cover={
                      <img
                        src={
                          topic?.imageUrl ??
                          'https://via.placeholder.com/400x150?text=No+Image'
                        }
                        alt={topic?.topicName ?? 'Topic Image'}
                        style={{ height: 150, objectFit: 'cover' }}
                      />
                    }
                    className='rounded-lg shadow-sm'>
                    <Title level={5}>{topic?.topicName}</Title>
                    <Paragraph ellipsis={{ rows: 2 }}>
                      {topic?.topicDescription ?? 'No description'}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description='No topics available' />
          )}
        </Card>

        {/* Units & Lessons */}
      </div>

      {/* Approve Modal */}
      <Modal
        title='Approve Course'
        open={isApproveOpen}
        onOk={() => approveMutation.mutate()}
        confirmLoading={approveMutation.isPending}
        onCancel={() => setIsApproveOpen(false)}
        okText='Approve'>
        <p>Are you sure you want to approve this course?</p>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title='Reject Course'
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        okText='Submit Rejection'
        onOk={() => form.submit()}
        confirmLoading={rejectMutation.isPending}>
        <Form form={form} layout='vertical' onFinish={handleRejectSubmit}>
          <Form.Item
            name='reason'
            label='Reason for rejection'
            rules={[{ required: true, message: 'Please enter a reason' }]}>
            <Input.TextArea rows={4} placeholder='Enter rejection reason...' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseReviewDetail;
