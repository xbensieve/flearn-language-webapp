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
  const [mediaPreview, setMediaPreview] = useState<
    { url: string; type: 'image' | 'audio'; name: string }[] | null
  >(null);
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

      if (exercise?.mediaUrls && exercise.mediaUrls.length > 0) {
        const previews = exercise.mediaUrls.map((url: string, idx: number) => {
          const name = url.split('/').pop()?.split('?')[0] || `media-${idx + 1}`;
          const type = /\.(mp3|mpeg|wav|ogg)$/i.test(name) ? 'audio' : 'image';
          return { url, type, name };
        });

        setMediaPreview(previews as any);

        const fileList = exercise.mediaUrls.map((url: string, idx: number) => ({
          uid: `-${idx + 1}`,
          name: url.split('/').pop()?.split('?')[0] || `media-${idx + 1}`,
          status: 'done',
          url,
        }));

        form.setFieldsValue({ media: fileList });
      }
    } else {
      form.resetFields();
      setMediaPreview(null);
    }
  }, [exercise, form]);

  useEffect(() => {
    return () => {
      if (mediaPreview) {
        mediaPreview.forEach((item) => {
          if (item.url.startsWith('blob:')) {
            URL.revokeObjectURL(item.url);
          }
        });
      }
    };
  }, [mediaPreview]);

  const handleSubmit = (values: any) => {
    console.log(values);
    const payload: ExercisePayload = {
      FeedbackIncorrect: values.feedbackIncorrect,
      PassScore: Number(values.passScore) || 0,
      Prompt: values.prompt,
      FeedbackCorrect: values.feedbackCorrect,
      Hints: values.hints,
      MaxScore: Number(values.maxScore) || 0,
      MediaFiles: values.media
        ? values.media
            .filter((f: any) => f.originFileObj) // only new files
            .map((f: any) => f.originFileObj)
        : undefined,
      ExpectedAnswer: values.expectedAnswer,
      Title: values.title,
      Content: values.content,
      Type: 1,
      Difficulty: values.difficulty,
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
    const previews: { url: string; type: 'image' | 'audio'; name: string }[] = [];

    fileList.forEach((file: any) => {
      let url = '';
      let type: 'image' | 'audio' = 'image';
      let name = file.name || 'unknown';

      if (file.originFileObj) {
        url = URL.createObjectURL(file.originFileObj);
        if (file.originFileObj.type.startsWith('image/')) {
          type = 'image';
        } else if (file.originFileObj.type.startsWith('audio/')) {
          type = 'audio';
        }
      } else if (file.url) {
        url = file.url;
        name = file.name || url.split('/').pop()?.split('?')[0] || 'media';

        // Fallback: detect from file extension in name
        if (/\.(mp3|mpeg|wav|ogg)$/i.test(name)) {
          type = 'audio';
        } else if (/\.(jpe?g|png|webp|gif)$/i.test(name)) {
          type = 'image';
        }
      }

      previews.push({ url, type, name });
    });

    setMediaPreview(previews.length > 0 ? previews : null);
  };

  return (
    <div className='min-h-screen py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        <Card
          className='shadow-xl rounded-3xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden'
          title={
            <div className='flex items-center gap-3'>
              <Lightbulb size={20} className='text-sky-600' />
              <Title level={3} className='!mb-0 text-gray-800'>
                Create Exercise
              </Title>
              <Text type='secondary' className='text-sm ml-auto'>
                Make it engaging!
              </Text>
            </div>
          }
        >
          <Form layout='vertical' form={form} onFinish={handleSubmit} className='space-y-6 pt-4'>
            <Collapse defaultActiveKey={['basic', 'scores', 'feedback']} accordion>
              {/* Basic Information */}
              <Panel
                header={
                  <div className='flex items-center gap-2 p-2 bg-sky-50 rounded-xl'>
                    <BookOpen size={18} className='text-sky-600' />
                    <Text strong className='text-sky-800'>
                      Basic Information
                    </Text>
                  </div>
                }
                key='basic'
                className='rounded-2xl border border-sky-200 bg-sky-50'
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name='title'
                      label={
                        <span className='flex items-center gap-2'>
                          <BookOpen size={16} className='text-gray-600' />
                          Title
                        </span>
                      }
                      rules={[{ required: true, message: 'Please enter a title' }]}
                    >
                      <Input placeholder='e.g., Verb Conjugation Quiz' />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='prompt'
                      label={
                        <span className='flex items-center gap-2'>
                          <FileText size={16} className='text-gray-600' />
                          Prompt
                        </span>
                      }
                      rules={[{ required: true, message: 'Please input prompt' }]}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Clear instructions: 'Choose the correct translation...'"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='hints'
                      label={
                        <span className='flex items-center gap-2'>
                          <Lightbulb size={16} className='text-gray-600' />
                          Hints
                        </span>
                      }
                      required
                      rules={[{ required: true, message: 'Please input hints' }]}
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder='e.g., Remember subject-verb agreement!'
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='content'
                      label={
                        <span className='flex items-center gap-2'>
                          <FileText size={16} className='text-gray-600' />
                          Content
                        </span>
                      }
                      required
                      rules={[{ required: true, message: 'Please input content' }]}
                    >
                      <Input.TextArea rows={4} placeholder='Detailed exercise body...' />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='expectedAnswer'
                      label={
                        <span className='flex items-center gap-2'>
                          <Check size={16} className='text-green-600' />
                          Expected Answer
                        </span>
                      }
                      required
                      rules={[{ required: true, message: 'Expected Answer is required' }]}
                    >
                      <Input.TextArea rows={2} placeholder="e.g., 'Hola, ¿cómo estás?'" />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>

              {/* Scores & Type */}
              <Panel
                header={
                  <div className='flex items-center gap-2 p-2 bg-blue-50 rounded-xl'>
                    <Target size={18} className='text-blue-600' />
                    <Text strong className='text-blue-800'>
                      Scores & Type
                    </Text>
                  </div>
                }
                key='scores'
                className='border border-blue-200 bg-blue-50'
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name='type'
                      label={
                        <span className='flex items-center gap-2'>
                          <Target size={16} className='text-gray-600' />
                          Type
                        </span>
                      }
                      required
                      rules={[{ required: true, message: 'Please select a type' }]}
                    >
                      <Select
                        placeholder='Choose exercise type'
                        suffixIcon={<Target size={16} className='text-gray-400' />}
                        options={[
                          { label: 'RepeatAfterMe', value: 1 },
                          { label: 'PictureDescription', value: 2 },
                          { label: 'StoryTelling', value: 3 },
                          { label: 'Debate', value: 4 },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='difficulty'
                      label={
                        <span className='flex items-center gap-2'>
                          <TrendingUp size={16} className='text-gray-600' />
                          Difficulty
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: 'Please select a difficulty',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select difficulty level'
                        suffixIcon={<TrendingUp size={16} className='text-gray-400' />}
                        options={[
                          { label: 'Easy', value: 1 },
                          { label: 'Medium', value: 2 },
                          { label: 'Hard', value: 3 },
                          { label: 'Advanced', value: 4 },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name='maxScore'
                      label={
                        <span className='flex items-center gap-2'>
                          <TrendingUp size={16} className='text-gray-600' />
                          Max Score
                        </span>
                      }
                      rules={[{ required: true, message: 'Please enter max score' }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} placeholder='e.g. 10' />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='passScore'
                      label={
                        <span className='flex items-center gap-2'>
                          <Check size={16} className='text-green-600' />
                          Pass Score
                        </span>
                      }
                      rules={[{ required: true, message: 'Please enter pass score' }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} placeholder='e.g. 7' />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>

              {/* Feedback & Media */}
              <Panel
                header={
                  <div className='flex items-center gap-2 p-2 bg-indigo-50 rounded-xl'>
                    <Sparkles size={18} className='text-indigo-600' />
                    <Text strong className='text-indigo-800'>
                      Feedback & Media
                    </Text>
                  </div>
                }
                key='feedback'
                className='rounded-2xl border border-indigo-200 bg-indigo-50'
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name='feedbackCorrect'
                      label={
                        <span className='flex items-center gap-2'>
                          <Check size={16} className='text-green-600' />
                          Feedback (Correct)
                        </span>
                      }
                      rules={[{ required: true, message: 'Feedback Correct is required' }]}
                    >
                      <Input.TextArea
                        rows={4}
                        placeholder="Great job! You've nailed the concept."
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='feedbackIncorrect'
                      label={
                        <span className='flex items-center gap-2'>
                          <AlertCircle size={16} className='text-red-600' />
                          Feedback (Incorrect)
                        </span>
                      }
                      rules={[{ required: true, message: 'Feedback Incorrect is required' }]}
                    >
                      <Input.TextArea rows={4} placeholder='Keep trying! Review the hint above.' />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name='media'
                  label={
                    <span className='flex items-center gap-2'>
                      <ImageIcon size={16} className='text-gray-600' />
                      Media Files (Images & Audio - Multiple)
                    </span>
                  }
                  rules={[{ required: true, message: 'Please upload at least one media file' }]}
                  valuePropName='fileList'
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                >
                  <Upload
                    beforeUpload={() => false}
                    multiple
                    accept='image/jpeg,image/png,image/webp,image/gif,audio/mp3,audio/mpeg'
                    onChange={handleMediaChange}
                    listType='picture-card'
                    className='upload-list-inline'
                    showUploadList={{
                      showRemoveIcon: true,
                    }}
                  >
                    <div className='flex flex-col items-center justify-center p-4'>
                      <UploadOutlined className='text-xl' />
                      <div className='text-xs text-gray-500'>Images & MP3</div>
                    </div>
                  </Upload>
                </Form.Item>

                {mediaPreview && mediaPreview.length > 0 && (
                  <div className='mt-8 space-y-6'>
                    <Text strong className='block text-lg text-gray-800'>
                      Media Preview ({mediaPreview.length} file{mediaPreview.length > 1 ? 's' : ''})
                    </Text>

                    <div className='space-y-8'>
                      {mediaPreview.map((item, index) => (
                        <div
                          key={index}
                          className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'
                        >
                          <div className='bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200'>
                            <div className='flex items-center justify-between'>
                              <Text strong className='text-gray-800 flex items-center gap-2'>
                                {item.type === 'image' ? (
                                  <ImageIcon size={16} className='text-blue-600' />
                                ) : (
                                  <FileText size={16} className='text-purple-600' />
                                )}
                                {item.name}
                              </Text>
                              <span className='text-xs px-3 py-1 rounded-full bg-gray-200 text-gray-600'>
                                {item.type === 'image' ? 'Image' : 'Audio'}
                              </span>
                            </div>
                          </div>

                          <div className='p-6 bg-gray-50'>
                            {item.type === 'image' ? (
                              <div className='flex justify-center'>
                                <div className='relative max-w-2xl w-full'>
                                  <img
                                    src={item.url}
                                    alt={item.name}
                                    className='rounded-xl shadow-xl max-h-screen object-contain mx-auto border-4 border-white'
                                    style={{ maxHeight: '65vh' }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className='max-w-2xl mx-auto'>
                                <div className='bg-white rounded-2xl shadow-inner p-6 border border-gray-200'>
                                  <audio
                                    src={item.url}
                                    controls
                                    controlsList='nodownload noremoteplayback'
                                    className='w-full h-12'
                                    style={{ borderRadius: '12px', background: '#f9fafb' }}
                                  />
                                </div>
                                <Text type='secondary' className='block text-center mt-4 text-sm'>
                                  Click play to listen
                                </Text>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Panel>
            </Collapse>

            <div className='flex justify-end pt-6 border-t border-gray-200'>
              <Tooltip title='Launch this exercise!'>
                <Button
                  type='primary'
                  htmlType='submit'
                  loading={createExercise.isPending}
                  className='rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold'
                  icon={<Check size={16} />}
                >
                  Create
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
