/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  InputNumber,
  Row,
  Col,
  Collapse,
  Card,
  Tooltip,
  Typography,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { ExerciseData, ExercisePayload } from '../../services/course/type';
import { useCreateExercise } from './helpers';
import {
  Lightbulb,
  BookOpen,
  FileText,
  Check,
  Target,
  TrendingUp,
  Sparkles,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface Props {
  lessonId: string;
  onCreated?: () => void;
  exercise?: ExerciseData;
}

const ExerciseForm: React.FC<Props> = ({ lessonId, onCreated, exercise }) => {
  const [form] = Form.useForm();
  const [mediaPreview, setMediaPreview] = useState<string[] | null>(null);
  const createExercise = useCreateExercise(lessonId);

  // Pre-fill form for editing
  useEffect(() => {
    if (exercise) {
      form.setFieldsValue({
        title: exercise.title,
        prompt: exercise.prompt,
        hints: exercise.hints,
        content: exercise.content,
        expectedAnswer: exercise.expectedAnswer,
        type: exercise.exerciseType,
        difficulty: exercise.difficulty,
        maxScore: exercise.maxScore,
        passScore: exercise.passScore,
        feedbackCorrect: exercise.feedbackCorrect,
        feedbackIncorrect: exercise.feedbackIncorrect,
        media: exercise.mediaUrls
          ? exercise.mediaUrls.map((url: string) => ({
            url,
            name: url.split('/').pop() || 'audio.mp3',
            status: 'done',
            uid: '-1',
          }))
          : undefined,
      });

      // Set preview as array
      if (exercise.mediaUrls && exercise.mediaUrls.length > 0) {
        setMediaPreview(exercise.mediaUrls);
      }
    } else {
      form.resetFields();
      setMediaPreview(null);
    }
  }, [exercise, form]);

  const handleSubmit = (values: any) => {
    console.log(values);
    const payload: ExercisePayload = {
      Title: values.title,
      Prompt: values.prompt,
      Hints: values.hints,
      Content: values.content,
      ExpectedAnswer: values.expectedAnswer,
      Difficulty: values.difficulty,
      Type: 1,
      MaxScore: Number(values.maxScore) || 0,
      PassScore: Number(values.passScore) || 0,
      FeedbackCorrect: values.feedbackCorrect,
      FeedbackIncorrect: values.feedbackIncorrect,
      MediaFiles: values.media?.file,
    };

    createExercise.mutate(payload, {
      onSuccess: () => {
        form.resetFields();
        setMediaPreview(null);
        onCreated?.();
      },
    });
  };

  const handleMediaChange = ({ fileList }: any) => {
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      if (file) {
        const url = URL.createObjectURL(file);
        setMediaPreview([url]); // Always an array
      }
    } else {
      setMediaPreview(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card
          className="shadow-xl rounded-3xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden"
          title={
            <div className="flex items-center gap-3">
              <Lightbulb
                size={20}
                className="text-sky-600"
              />
              <Title
                level={3}
                className="!mb-0 text-gray-800">
                Create Exercise
              </Title>
              <Text
                type="secondary"
                className="text-sm ml-auto">
                Make it engaging!
              </Text>
            </div>
          }>
          <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
            initialValues={{ type: 'multiple-choice', difficulty: 'medium' }}
            className="space-y-6 pt-4">
            <Collapse
              defaultActiveKey={['basic', 'scores', 'feedback']}
              accordion>
              {/* Basic Information */}
              <Panel
                header={
                  <div className="flex items-center gap-2 p-2 bg-sky-50 rounded-xl">
                    <BookOpen
                      size={18}
                      className="text-sky-600"
                    />
                    <Text
                      strong
                      className="text-sky-800">
                      Basic Information
                    </Text>
                  </div>
                }
                key="basic"
                className="rounded-2xl border border-sky-200 bg-sky-50">
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="title"
                      label={
                        <span className="flex items-center gap-2">
                          <BookOpen
                            size={16}
                            className="text-gray-600"
                          />
                          Title
                        </span>
                      }
                      rules={[{ required: true, message: 'Please enter a title' }]}>
                      <Input placeholder="e.g., Verb Conjugation Quiz" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="prompt"
                      label={
                        <span className="flex items-center gap-2">
                          <FileText
                            size={16}
                            className="text-gray-600"
                          />
                          Prompt
                        </span>
                      }>
                      <Input.TextArea
                        rows={3}
                        placeholder="Clear instructions: 'Choose the correct translation...'"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="hints"
                      label={
                        <span className="flex items-center gap-2">
                          <Lightbulb
                            size={16}
                            className="text-gray-600"
                          />
                          Hints (Optional)
                        </span>
                      }>
                      <Input.TextArea
                        rows={2}
                        placeholder="e.g., Remember subject-verb agreement!"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="content"
                      label={
                        <span className="flex items-center gap-2">
                          <FileText
                            size={16}
                            className="text-gray-600"
                          />
                          Content
                        </span>
                      }>
                      <Input.TextArea
                        rows={4}
                        placeholder="Detailed exercise body..."
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="expectedAnswer"
                      label={
                        <span className="flex items-center gap-2">
                          <Check
                            size={16}
                            className="text-green-600"
                          />
                          Expected Answer
                        </span>
                      }>
                      <Input.TextArea
                        rows={2}
                        placeholder="e.g., 'Hola, ¿cómo estás?'"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>

              {/* Scores & Type */}
              <Panel
                header={
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-xl">
                    <Target
                      size={18}
                      className="text-blue-600"
                    />
                    <Text
                      strong
                      className="text-blue-800">
                      Scores & Type
                    </Text>
                  </div>
                }
                key="scores"
                className="border border-blue-200 bg-blue-50">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="type"
                      label={
                        <span className="flex items-center gap-2">
                          <Target
                            size={16}
                            className="text-gray-600"
                          />
                          Type
                        </span>
                      }
                      rules={[{ required: true, message: 'Please select a type' }]}>
                      <Select
                        placeholder="Choose exercise type"
                        suffixIcon={
                          <Target
                            size={16}
                            className="text-gray-400"
                          />
                        }
                        options={[
                          { label: 'Multiple Choice', value: 'multiple-choice' },
                          { label: 'Essay', value: 'essay' },
                          { label: 'Fill in the Blank', value: 'fill-blank' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="difficulty"
                      label={
                        <span className="flex items-center gap-2">
                          <TrendingUp
                            size={16}
                            className="text-gray-600"
                          />
                          Difficulty
                        </span>
                      }
                      rules={[{ required: true, message: 'Please select a difficulty' }]}>
                      <Select
                        placeholder="Select difficulty level"
                        suffixIcon={
                          <TrendingUp
                            size={16}
                            className="text-gray-400"
                          />
                        }
                        options={[
                          { label: 'Easy', value: 1 },
                          { label: 'Medium', value: 2 },
                          { label: 'Hard', value: 3 },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="maxScore"
                      label={
                        <span className="flex items-center gap-2">
                          <TrendingUp
                            size={16}
                            className="text-gray-600"
                          />
                          Max Score
                        </span>
                      }
                      rules={[{ required: true, message: 'Please enter max score' }]}>
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="e.g. 10"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="passScore"
                      label={
                        <span className="flex items-center gap-2">
                          <Check
                            size={16}
                            className="text-green-600"
                          />
                          Pass Score
                        </span>
                      }
                      rules={[{ required: true, message: 'Please enter pass score' }]}>
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="e.g. 7"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>

              {/* Feedback & Media */}
              <Panel
                header={
                  <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-xl">
                    <Sparkles
                      size={18}
                      className="text-indigo-600"
                    />
                    <Text
                      strong
                      className="text-indigo-800">
                      Feedback & Media
                    </Text>
                  </div>
                }
                key="feedback"
                className="rounded-2xl border border-indigo-200 bg-indigo-50">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="feedbackCorrect"
                      label={
                        <span className="flex items-center gap-2">
                          <Check
                            size={16}
                            className="text-green-600"
                          />
                          Feedback (Correct)
                        </span>
                      }>
                      <Input.TextArea
                        rows={4}
                        placeholder="Great job! You've nailed the concept."
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="feedbackIncorrect"
                      label={
                        <span className="flex items-center gap-2">
                          <AlertCircle
                            size={16}
                            className="text-red-600"
                          />
                          Feedback (Incorrect)
                        </span>
                      }>
                      <Input.TextArea
                        rows={2}
                        placeholder="Keep trying! Review the hint above."
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="media"
                  required
                  rules={[{ required: true, message: 'media file is required' }]}
                  label={
                    <span className="flex items-center gap-2">
                      <ImageIcon
                        size={16}
                        className="text-gray-600"
                      />
                      Media File
                    </span>
                  }
                  valuePropName="file">
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    accept="audio/mp3,audio/mpeg"
                    onChange={handleMediaChange}
                    className="hover:border-sky-400 transition-colors">
                    <Button
                      block
                      icon={<UploadOutlined />}
                      className="rounded-xl flex items-center gap-2 justify-center">
                      Add MP3 Audio
                    </Button>
                  </Upload>
                </Form.Item>
                {mediaPreview &&
                  mediaPreview.map((mediaPreview) => (
                    <div className="mt-4 p-4 bg-white rounded-xl shadow-sm">
                      <Text
                        strong
                        className="block mb-2">
                        Audio Preview:
                      </Text>
                      <audio
                        src={mediaPreview}
                        controls
                        className="w-full rounded-lg"
                      />
                    </div>
                  ))
                }
              </Panel>
            </Collapse>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Tooltip title="Launch this exercise!">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createExercise.isPending}
                  className="rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                  icon={<Check size={16} />}>
                  Create Exercise
                </Button>
              </Tooltip>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ExerciseForm;
