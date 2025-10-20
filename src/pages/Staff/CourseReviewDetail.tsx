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
  Tooltip,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatStatusLabel } from '../../utils/mapping';
import type { Topic, Unit } from '../../services/course/type';
import {
  getCourseByIdStaffService,
  approveCourseService,
  rejectedCourseService,
  getCourseUnitsService,
} from '../../services/course';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import type { AxiosError } from 'axios';
import { UnitLessons } from '../Teacher/CourseDetailView';
import { BookOpen, Puzzle, ArrowLeft, Check, X, User } from 'lucide-react';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const CourseReviewDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id, courseSubmissionID } = useParams<{ id: string; courseSubmissionID: string }>();
  const queryClient = useQueryClient();

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['staff-course-detail', id],
    queryFn: () => getCourseByIdStaffService(id!),
    enabled: !!id,
  });

  const { data: unitsData, isLoading: unitsLoading } = useQuery({
    queryKey: ['units', id],
    queryFn: async () => {
      const res = await getCourseUnitsService({ id: id! });
      return Array.isArray(res) ? res : res?.data ?? [];
    },
    enabled: !!id,
  });

  const course = data?.data;

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

  const rejectMutation = useMutation({
    mutationFn: (values: { id: string; reason: string }) => rejectedCourseService(values),
    onSuccess: () => {
      notifySuccess('Course rejected successfully');
      setIsRejectModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['staff-course-detail', id] });
    },
    onError: (err: AxiosError<any>) =>
      notifyError(err?.response?.data?.message || 'Failed to reject course'),
  });

  if (isLoading || unitsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-gradient-to-br from-blue-50 to-indigo-100">
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Empty description="Course not found" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Tooltip title="Back to list">
            <Button
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate(-1)}
              className="rounded-xl border-gray-300 hover:border-indigo-300">
              Back
            </Button>
          </Tooltip>

          {course.status?.toLowerCase() !== 'published' && (
            <Space>
              <Tooltip title="Reject this course">
                <Button
                  danger
                  icon={<X size={16} />}
                  onClick={() => setIsRejectModalOpen(true)}
                  loading={rejectMutation.isPending}
                  className="rounded-xl">
                  Reject
                </Button>
              </Tooltip>
              <Tooltip title="Approve and publish this course">
                <Button
                  type="primary"
                  icon={<Check size={16} />}
                  onClick={() => setIsApproveOpen(true)}
                  loading={approveMutation.isPending}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                  Approve
                </Button>
              </Tooltip>
            </Space>
          )}
        </div>

        {/* HERO / COURSE IMAGE */}
        <Card className="rounded-3xl overflow-hidden shadow-xl border-0 relative bg-gradient-to-r from-indigo-600 to-purple-700">
          <img
            src={course?.imageUrl ?? '/default-course.jpg'}
            alt={course?.title ?? 'Course Image'}
            className="w-full h-72 object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
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
                <Text className="!text-indigo-100 text-sm flex items-center gap-2">
                  <Avatar
                    src={course?.teacherInfo?.avatar}
                    icon={<User size={14} />}
                  />
                  By {course?.teacherInfo?.fullName ?? 'Unknown Teacher'}
                </Text>
              </div>
            </div>
            <Paragraph className="!text-gray-200 leading-relaxed">
              {course?.description ?? 'No description available'}
            </Paragraph>
          </div>
        </Card>

        {/* COURSE INFO */}
        <Card className="rounded-2xl shadow-sm border-0 bg-white p-6">
          <Row
            gutter={[16, 16]}
            className="mb-6">
            <Col
              xs={24}
              sm={12}
              md={8}>
              <Tag
                color="blue"
                className="px-3 py-1">
                {course?.languageInfo?.name ?? 'Unknown Language'}
              </Tag>
            </Col>
            <Col
              xs={24}
              sm={12}
              md={8}>
              <Tag
                color="green"
                className="px-3 py-1">
                {course?.courseLevel ?? 'N/A'}
              </Tag>
            </Col>
            <Col
              xs={24}
              sm={12}
              md={8}>
              <Tag
                color={course?.status === 'published' ? 'success' : 'default'}
                className="px-3 py-1">
                {formatStatusLabel(course?.status ?? 'unknown')}
              </Tag>
            </Col>
          </Row>

          <Divider />

          <div className="space-y-4">
            <div>
              <Text
                strong
                className="text-gray-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" /> Goal
              </Text>
              <Paragraph className="text-gray-700 mt-1">
                {course?.goalInfo?.description ?? 'No goal description provided'}
              </Paragraph>
            </div>

            <div>
              <Text
                strong
                className="text-gray-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-600" /> Price
              </Text>
              <Paragraph className="text-gray-700 mt-1">
                {course?.discountPrice ? (
                  <>
                    <Text
                      delete
                      className="text-gray-400 mr-1">
                      {Number(course?.price ?? 0).toLocaleString('vi-VN')} VNĐ
                    </Text>
                    <Text
                      type="success"
                      strong>
                      {Number(course?.discountPrice ?? 0).toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </>
                ) : (
                  <Text strong>{Number(course?.price ?? 0).toLocaleString('vi-VN')} VNĐ</Text>
                )}
              </Paragraph>
            </div>
          </div>
        </Card>

        {/* COURSE CONTENT */}
        <Card
          className="rounded-2xl shadow-md border border-gray-100 bg-white p-6"
          title={
            <div className="flex items-center gap-2 text-indigo-700">
              <BookOpen className="w-5 h-5" />
              <Title
                level={4}
                className="!mb-0">
                Course Content
              </Title>
            </div>
          }>
          {!Array.isArray(unitsData) || unitsData.length === 0 ? (
            <Empty description="No units found" />
          ) : (
            <Collapse
              bordered={false}
              expandIconPosition="end"
              className="space-y-3 bg-transparent">
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
                  <UnitLessons unit={unit} />
                </Panel>
              ))}
            </Collapse>
          )}
        </Card>

        {/* COURSE TOPICS */}
        <Card
          className="shadow-md rounded-2xl border border-gray-100 bg-white p-6"
          title={
            <div className="flex items-center gap-2 text-indigo-700">
              <Puzzle className="w-5 h-5" />
              <Title
                level={4}
                className="!mb-0">
                Course Topics
              </Title>
            </div>
          }>
          {course?.topics?.length ? (
            <Row gutter={[16, 16]}>
              {course.topics.map((topic: Topic) => (
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  key={topic?.topicId}>
                  <Card
                    hoverable
                    className="rounded-xl shadow-sm border border-gray-100"
                    cover={
                      <img
                        src={topic?.imageUrl ?? 'https://via.placeholder.com/400x150?text=No+Image'}
                        alt={topic?.topicName ?? 'Topic Image'}
                        style={{ height: 150, objectFit: 'cover' }}
                      />
                    }>
                    <Title
                      level={5}
                      className="text-gray-800">
                      {topic?.topicName}
                    </Title>
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      className="text-gray-600">
                      {topic?.topicDescription ?? 'No description'}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="No topics available" />
          )}
        </Card>
      </div>

      {/* APPROVE MODAL */}
      <Modal
        title="Approve Course"
        open={isApproveOpen}
        onOk={() => approveMutation.mutate()}
        confirmLoading={approveMutation.isPending}
        onCancel={() => setIsApproveOpen(false)}
        okText="Approve"
        okButtonProps={{ className: 'bg-indigo-600 hover:bg-indigo-700 rounded-xl' }}>
        <p>Are you sure you want to approve and publish this course?</p>
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        title="Reject Course"
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        okText="Submit Rejection"
        onOk={() => form.submit()}
        confirmLoading={rejectMutation.isPending}
        okButtonProps={{ danger: true, className: 'rounded-xl' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => rejectMutation.mutate({ id: courseSubmissionID!, ...v })}>
          <Form.Item
            name="reason"
            label="Reason for rejection"
            rules={[{ required: true, message: 'Please enter a reason' }]}>
            <Input.TextArea
              rows={4}
              placeholder="Enter rejection reason..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseReviewDetail;
