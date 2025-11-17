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
} from 'antd';
import {
  AudioOutlined,
  DollarCircleFilled,
  CheckCircleFilled,
  ClockCircleFilled,
  RobotOutlined,
} from '@ant-design/icons';
import type { Assignment } from '../../services/exercise/type';
import { getGradeSubmission, getTeacherAssignments } from '../../services/exercise';
import { notifyError, notifySuccess } from '../../utils/toastConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TeacherGradingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [gradingModal, setGradingModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<Assignment | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-assignments'],
    queryFn: () => getTeacherAssignments({ page: 1, pageSize: 50 }),
  });

  const gradeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { score: number; feedback: string } }) =>
      getGradeSubmission(id, data),
    onSuccess: () => {
      notifySuccess('Graded successfully!');
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      setGradingModal(false);
      form.resetFields();
    },
    onError: () => {
      notifyError('Grading failed. Please try again.');
    },
  });

  const openGradingModal = (record: Assignment) => {
    setCurrentSubmission(record);
    setGradingModal(true);
    form.setFieldsValue({
      score: Math.round((record.aiScore || 80) / 10) * 10,
      feedback: '',
    });
  };

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

  // Fixed earning status detection
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

  const isAlreadyGraded = (record: Assignment) =>
    record.finalScore !== null && record.finalScore !== undefined;

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
      key: 'learner',
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
      key: 'exerciseTitle',
      render: (text: string) => <Text className="font-medium">{text}</Text>,
    },
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: 'Review Turn',
      key: 'turn',
      render: (_: any, record: Assignment) => {
        const info = getGradingInfo(record);
        return (
          <Tag
            icon={info.icon}
            color={info.color}
            className="font-medium">
            {info.text}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Assignment) => {
        const alreadyGraded = isAlreadyGraded(record);

        if (alreadyGraded) {
          return (
            <Tag
              color="success"
              icon={<CheckCircleFilled />}>
              Graded ({record.finalScore}/100)
            </Tag>
          );
        }

        return (
          <Button
            type="primary"
            size="middle"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 font-semibold shadow-lg hover:shadow-xl transition-all"
            onClick={() => openGradingModal(record)}>
            Grade Now
          </Button>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <Title
            level={1}
            className="text-5xl font-bold bg-clip-text text-transparent">
            Teacher Grading Dashboard
          </Title>
          <Text
            type="secondary"
            className="text-lg">
            Listen, review, and provide meaningful feedback to your students
          </Text>
        </div>

        <Card className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <Title
            level={4}
            className="text-indigo-700 mb-6">
            Grading Rules
          </Title>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <CheckCircleFilled className="text-4xl text-green-600 mb-3" />
              <Text
                strong
                className="block text-lg">
                1st Submission
              </Text>
              <Text type="secondary">Teacher + AI • You get paid</Text>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200">
              <ClockCircleFilled className="text-4xl text-orange-600 mb-3" />
              <Text
                strong
                className="block text-lg">
                2nd Submission
              </Text>
              <Text type="secondary">Teacher + AI • No payment</Text>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl border border-gray-200">
              <Text
                strong
                className="block text-lg text-gray-600">
                3rd+ Submission
              </Text>
              <Text type="secondary">AI Only • No teacher needed</Text>
            </div>
          </div>
        </Card>

        <Card className="shadow-2xl border-0 overflow-hidden">
          <Table
            columns={columns}
            dataSource={data?.data || []}
            rowKey="assignmentId"
            loading={isLoading}
            pagination={{ pageSize: 10 }}
            rowClassName="hover:bg-indigo-50/50 transition-colors cursor-pointer"
          />
        </Card>

        {/* Grading Modal */}
        <Modal
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
          }
          open={gradingModal}
          onCancel={() => setGradingModal(false)}
          onOk={handleGrade}
          okText="Submit Final Grade"
          cancelText="Cancel"
          width={800}
          confirmLoading={gradeMutation.isPending}
          closeIcon={null}>
          <div className="!space-y-7 max-h-[75vh] overflow-y-auto pr-2">
            {/* Audio Player */}
            {currentSubmission?.audioUrl && (
              <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50">
                <Text
                  strong
                  className="flex items-center gap-2 text-indigo-700 mb-4 text-lg">
                  <AudioOutlined className="text-2xl" /> Student's Recording
                </Text>
                <audio
                  controls
                  controlsList="nodownload noplaybackrate"
                  className="w-full h-16 rounded-xl">
                  <source
                    src={currentSubmission.audioUrl}
                    type="audio/wav"
                  />
                  <source
                    src={currentSubmission.audioUrl}
                    type="audio/mpeg"
                  />
                  Your browser does not support audio.
                </audio>
              </Card>
            )}

            {/* AI Feedback - Clearly Separated */}
            {currentSubmission?.aiFeedback && (
              <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
                <Title
                  level={5}
                  className="text-cyan-800 flex items-center gap-2">
                  <RobotOutlined /> AI Analysis (Reference Only)
                </Title>
                <div className="mt-3 space-y-3">
                  <Text strong>Suggested Score: </Text>
                  <Tag
                    color="cyan"
                    className="text-2xl font-bold py-1 px-4">
                    {currentSubmission.aiScore}/100
                  </Tag>
                  <div className="p-4 bg-white/70 rounded-xl">
                    <Text
                      italic
                      className="text-blue-700 leading-relaxed block">
                      "{getAIFeedbackText(currentSubmission.aiFeedback)}"
                    </Text>
                  </div>
                  <Text
                    type="secondary"
                    className="text-sm block">
                    This is AI-generated. Please write your own feedback below.
                  </Text>
                </div>
              </Card>
            )}

            {/* Teacher Grading Form */}
            <Form
              form={form}
              layout="vertical">
              <Form.Item
                name="score"
                label={
                  <Text
                    strong
                    className="text-lg">
                    Your Final Score (0–100)
                  </Text>
                }
                rules={[{ required: true, message: 'Please enter the final score' }]}>
                <Space
                  direction="vertical"
                  className="w-full">
                  <Rate
                    allowHalf
                    count={10}
                    style={{ fontSize: 42 }}
                    className="text-yellow-500"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    size="large"
                    className="w-full mt-3 rounded-xl"
                    placeholder="e.g. 87"
                  />
                </Space>
              </Form.Item>

              <Form.Item
                name="feedback"
                label={
                  <Text
                    strong
                    className="text-lg">
                    Your Personal Feedback
                  </Text>
                }
                rules={[{ required: true, message: 'Feedback is required' }]}>
                <TextArea
                  rows={7}
                  placeholder="Write warm, specific, and encouraging feedback... (e.g. Great improvement in fluency! Try adding more examples next time.)"
                  className="rounded-xl text-base"
                />
              </Form.Item>

              {currentSubmission && !getGradingInfo(currentSubmission).paid && (
                <Tag
                  color="orange"
                  icon={<ClockCircleFilled />}
                  className="text-base py-2 px-5">
                  This is the 2nd review — no payment
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
