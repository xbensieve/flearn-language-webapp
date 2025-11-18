/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Rate,
  Typography,
  Space,
  Card,
  Avatar,
  Spin,
  Alert,
} from 'antd';
import {
  AudioOutlined,
  DollarCircleFilled,
  CheckCircleFilled,
  ClockCircleFilled,
  RobotOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { Assignment } from '../../services/exercise/type';
import {
  getGradeSubmission,
  getTeacherAssignments,
  getGradingStatus,
} from '../../services/exercise';
import { notifyError, notifySuccess } from '../../utils/toastConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

export interface GradingStatus {
  exerciseSubmissionId: string;
  status: string;
  aiScore: number;
  teacherScore: number;
  finalScore: number;
  isPassed: boolean;
  aiFeedback: string;
  teacherFeedback: string;
  submittedAt: string;
  reviewedAt: string;
  assignedTeacherId: string;
  assignedTeacherName: string;
  assignmentDeadline: string;
}

const TeacherGradingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [gradingModal, setGradingModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<Assignment | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-assignments'],
    queryFn: () => getTeacherAssignments({ page: 1, pageSize: 50 }),
  });

  // ONLY useQuery — fetches status when modal opens
  const {
    data: gradingStatus,
    isLoading: statusLoading,
    isError: statusError,
  } = useQuery({
    queryKey: ['grading-status', currentSubmission?.exerciseSubmissionId],
    queryFn: () => getGradingStatus(currentSubmission!.exerciseSubmissionId),
    enabled: !!currentSubmission && gradingModal, // Only run when modal is open
    retry: 1,
    staleTime: 1000 * 60, // 1 minute
  });

  // Submit grade mutation (unchanged)
  const gradeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { score: number; feedback: string } }) =>
      getGradeSubmission(id, data),
    onSuccess: () => {
      notifySuccess('Graded successfully!');
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['grading-status'] });
      setGradingModal(false);
      form.resetFields();
    },
    onError: () => notifyError('Grading failed.'),
  });

  const openGradingModal = (record: Assignment) => {
    setCurrentSubmission(record);
    setGradingModal(true);
    form.resetFields(); // Reset form first
  };

  // Auto-fill form when status is loaded
  React.useEffect(() => {
    if (!gradingStatus || !gradingModal) return;

    if (gradingStatus.status === 'GRADED' && gradingStatus.assignedTeacherName) {
      form.setFieldsValue({
        score: gradingStatus.finalScore,
        feedback: gradingStatus.teacherFeedback || '(No feedback provided)',
      });
    } else {
      form.setFieldsValue({
        score: Math.round((currentSubmission?.aiScore || 80) / 10) * 10,
        feedback: '',
      });
    }
  }, [gradingStatus, gradingModal, currentSubmission, form]);

  const handleGrade = () => {
    form.validateFields().then((values) => {
      if (!currentSubmission) return;

      gradeMutation.mutate({
        id: currentSubmission.exerciseSubmissionId,
        data: {
          score: Number(values.score),
          feedback: values.feedback.trim(),
        },
      });
    });
  };

  const getGradingInfo = (assignment: Assignment) => {
    if (['PAID', 'PENDING', 'Approved'].includes(assignment.earningStatus)) {
      return {
        text: '1st Review – Paid',
        icon: <DollarCircleFilled />,
        color: 'green',
        paid: true,
      };
    }
    if (assignment.earningStatus === 'NO_PAYMENT') {
      return {
        text: '2nd Review – No Payment',
        icon: <ClockCircleFilled />,
        color: 'orange',
        paid: false,
      };
    }
    return { text: 'AI Only', color: 'gray', paid: false };
  };

  const getAIFeedbackText = (aiFeedback: string) => {
    try {
      const parsed = JSON.parse(aiFeedback);
      return parsed.feedback || 'No detailed feedback from AI.';
    } catch {
      return aiFeedback || 'No AI feedback available.';
    }
  };

  const columns = [
    {
      title: 'Student',
      width: 180,
      fixed: 'left' as const,
      render: (_: any, record: Assignment) => (
        <Space>
          <Avatar
            size="small"
            className="bg-indigo-600 text-white font-bold">
            {record.learnerName.charAt(0).toUpperCase()}
          </Avatar>
          <Text strong>{record.learnerName}</Text>
        </Space>
      ),
    },
    {
      title: 'Exercise',
      dataIndex: 'exerciseTitle',
      width: 280,
      render: (text: string, record: Assignment) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text
            type="secondary"
            className="text-xs">
            {record.lessonTitle} → {record.courseName}
          </Text>
        </div>
      ),
    },
    {
      title: 'Submitted',
      width: 160,
      render: (_: any, record: Assignment) => (
        <div>
          <Text>{record.completedAt}</Text>
        </div>
      ),
    },
    {
      title: 'Deadline',
      width: 130,
      render: (_: any, record: Assignment) => (
        <Space
          direction="vertical"
          size={0}>
          <Text>{record.deadline}</Text>
          {record.isOverdue && (
            <Tag
              color="red"
              className="text-xs">
              Overdue
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'AI Score',
      width: 100,
      align: 'center' as const,
      sorter: (a: Assignment, b: Assignment) => a.aiScore - b.aiScore,
      render: (_: any, record: Assignment) => (
        <Tag
          color="cyan"
          className="font-bold">
          {record.aiScore}
        </Tag>
      ),
    },
    {
      title: 'Review Type',
      width: 170,
      render: (_: any, record: Assignment) => {
        const info = getGradingInfo(record);
        return (
          <Tag
            icon={info.icon}
            color={info.color}>
            {info.text}
          </Tag>
        );
      },
    },
    {
      title: 'Payment',
      width: 130,
      align: 'center' as const,
      render: (_: any, record: Assignment) =>
        record.earningStatus === 'Approved' ? (
          <Space
            direction="vertical"
            size={0}>
            <Text
              strong
              className="text-green-600">
              {record.earningAmount.toLocaleString('vi-VN')} VNĐ
            </Text>
          </Space>
        ) : record.earningStatus === 'NO_PAYMENT' ? (
          <Tag color="orange">No Pay</Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Status',
      width: 140,
      fixed: 'right' as const,
      render: (_: any, record: Assignment) => {
        const alreadyGraded = record.finalScore !== null;

        return alreadyGraded ? (
          <Tag
            icon={<CheckCircleFilled />}
            color="success">
            Graded ({record.finalScore}/100)
          </Tag>
        ) : (
          <Button
            type="primary"
            size="middle"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 font-semibold shadow-lg"
            onClick={() => openGradingModal(record)}>
            Grade Now
          </Button>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <Title
            level={1}
            className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Teacher Grading Dashboard
          </Title>
        </div>

        <Card className="shadow-2xl border-0 !overflow-hidden">
          <Table
            columns={columns}
            dataSource={data?.data || []}
            rowKey="assignmentId"
            loading={isLoading}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        {/* Grading Modal */}
        <Modal
          open={gradingModal}
          onCancel={() => setGradingModal(false)}
          onOk={handleGrade}
          okText="Submit Final Grade"
          confirmLoading={gradeMutation.isPending}
          width={850}
          title={
            <div className="flex items-center gap-4">
              <Avatar
                size={56}
                className="bg-indigo-600 text-white text-xl font-bold">
                {currentSubmission?.learnerName.charAt(0)}
              </Avatar>
              <div>
                <Text
                  strong
                  className="text-2xl block">
                  {currentSubmission?.learnerName}
                </Text>
                <Text
                  type="secondary"
                  className="text-lg block">
                  {currentSubmission?.exerciseTitle}
                </Text>
              </div>
            </div>
          }>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Loading status */}
            {statusLoading && (
              <div className="text-center py-8">
                <Spin size="large" />
                <Text className="block mt-4">Checking if this has been graded...</Text>
              </div>
            )}

            {/* Error fallback */}
            {statusError && (
              <Alert
                type="warning"
                message="Could not check grading status. You can still grade normally."
                showIcon
              />
            )}

            {/* Already graded by another teacher */}
            {gradingStatus?.status === 'GRADED' && gradingStatus.assignedTeacherName && (
              <Alert
                type="warning"
                icon={<UserOutlined />}
                message={<Text strong>Already graded by {gradingStatus.assignedTeacherName}</Text>}
                description={
                  <span>
                    Score: <strong>{gradingStatus.finalScore}/100</strong> •{' '}
                    {new Date(gradingStatus.reviewedAt).toLocaleString('vi-VN')}
                  </span>
                }
                showIcon
              />
            )}

            {/* Audio */}
            {currentSubmission?.audioUrl && !statusLoading && (
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0">
                <Text
                  strong
                  className="flex items-center gap-2 text-indigo-700 mb-3">
                  <AudioOutlined /> Recording
                </Text>
                <audio
                  controls
                  controlsList="nodownload"
                  className="w-full h-14 rounded-xl">
                  <source src={currentSubmission.audioUrl} />
                </audio>
              </Card>
            )}

            {/* AI Feedback */}
            {currentSubmission?.aiFeedback && !statusLoading && (
              <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
                <Title
                  level={5}
                  className="text-cyan-800 flex items-center gap-2">
                  <RobotOutlined /> AI Suggestion
                </Title>
                <Text strong>Suggested Score: </Text>
                <Tag
                  color="cyan"
                  className="text-xl font-bold">
                  {currentSubmission.aiScore}/100
                </Tag>
                <Text
                  italic
                  className="block mt-3 p-3 bg-white/70 rounded-lg text-blue-700">
                  "{getAIFeedbackText(currentSubmission.aiFeedback)}"
                </Text>
              </Card>
            )}

            {/* Form */}
            <Form
              form={form}
              layout="vertical">
              <Form.Item
                name="score"
                label={<Text strong>Your Final Score (0–100)</Text>}
                rules={[{ required: true }]}>
                <Space
                  direction="vertical"
                  className="w-full">
                  <Rate
                    allowHalf
                    count={10}
                    style={{ fontSize: 40 }}
                    className="text-yellow-500"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    size="large"
                    className="w-full mt-2"
                  />
                </Space>
              </Form.Item>

              <Form.Item
                name="feedback"
                label={<Text strong>Your Personal Feedback</Text>}
                rules={[{ required: true }]}>
                <TextArea
                  rows={6}
                  placeholder="Write warm, specific, encouraging feedback..."
                  className="rounded-xl"
                />
              </Form.Item>

              {currentSubmission && !getGradingInfo(currentSubmission).paid && (
                <Tag
                  color="orange"
                  icon={<ClockCircleFilled />}
                  className="text-base">
                  2nd Review – No payment
                </Tag>
              )}
            </Form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default TeacherGradingPage;
