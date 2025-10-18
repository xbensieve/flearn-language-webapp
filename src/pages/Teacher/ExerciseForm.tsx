/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Upload, InputNumber, Row, Col, Collapse, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { ExerciseData, ExercisePayload } from '../../services/course/type';
import { useCreateExercise } from './helpers';

const { TextArea } = Input;
const { Panel } = Collapse;

interface Props {
  lessonId: string;
  onCreated?: () => void;
  exercise?: ExerciseData;
}

const ExerciseForm: React.FC<Props> = ({ lessonId, onCreated, exercise }) => {
  const [form] = Form.useForm();
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
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
        media: exercise.mediaUrl ? [{ url: exercise.mediaUrl, status: 'done' }] : undefined,
      });
      setMediaPreview(exercise.mediaUrl);
    } else {
      form.resetFields();
      setMediaPreview(null);
    }
  }, [exercise, form]);

  const handleSubmit = (values: any) => {
    const payload: ExercisePayload = {
      Title: values.title,
      Prompt: values.prompt,
      Hints: values.hints,
      Content: values.content,
      ExpectedAnswer: values.expectedAnswer,
      Difficulty: values.difficulty,
      Type: undefined,
      MaxScore: Number(values.maxScore) || 0,
      PassScore: Number(values.passScore) || 0,
      FeedbackCorrect: values.feedbackCorrect,
      FeedbackIncorrect: values.feedbackIncorrect,
      MediaFile: values.media?.file?.originFileObj,
    };

    createExercise.mutate(payload, {
      onSuccess: () => {
        form.resetFields();
        setMediaPreview(null);
        onCreated?.();
      },
    });
  };

  const handleMediaChange = ({ file }: any) => {
    if (file) {
      const url = URL.createObjectURL(file.originFileObj);
      setMediaPreview(url);
    } else {
      setMediaPreview(null);
    }
  };

  return (
    <div className='p-4 mx-auto'>
      <Form
        layout='vertical'
        form={form}
        onFinish={handleSubmit}
        initialValues={{ type: 'multiple-choice', difficulty: 'medium' }}
      >
        <Collapse defaultActiveKey={['basic', 'scores', 'feedback']}>
          <Panel header='Basic Information' key='basic'>
            <Form.Item
              name='title'
              label='Exercise Title'
              rules={[{ required: true, message: 'Please enter a title' }]}
            >
              <Input placeholder='Enter exercise title' />
            </Form.Item>

            <Form.Item name='prompt' label='Prompt'>
              <TextArea rows={3} placeholder='Instruction for the student' />
            </Form.Item>

            <Form.Item name='hints' label='Hints'>
              <TextArea rows={2} placeholder='Provide hints (optional)' />
            </Form.Item>

            <Form.Item name='content' label='Content'>
              <TextArea rows={4} placeholder='Main exercise content' />
            </Form.Item>

            <Form.Item name='expectedAnswer' label='Expected Answer'>
              <TextArea rows={2} placeholder='Enter expected answer' />
            </Form.Item>
          </Panel>

          <Panel header='Scores & Type' key='scores'>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name='type'
                  label='Type'
                  rules={[{ required: true, message: 'Please select a type' }]}
                >
                  <Select
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
                  name='difficulty'
                  label='Difficulty'
                  rules={[{ required: true, message: 'Please select a difficulty' }]}
                >
                  <Select
                    options={[
                      { label: 'Easy', value: 'easy' },
                      { label: 'Medium', value: 'medium' },
                      { label: 'Hard', value: 'hard' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name='maxScore'
                  label='Max Score'
                  rules={[{ required: true, message: 'Please enter max score' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder='e.g. 10' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name='passScore'
                  label='Pass Score'
                  rules={[{ required: true, message: 'Please enter pass score' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder='e.g. 5' />
                </Form.Item>
              </Col>
            </Row>
          </Panel>

          <Panel header='Feedback & Media' key='feedback'>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name='feedbackCorrect' label='Feedback (Correct)'>
                  <TextArea rows={2} placeholder='Feedback for correct answer' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name='feedbackIncorrect' label='Feedback (Incorrect)'>
                  <TextArea rows={2} placeholder='Feedback for incorrect answer' />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name='media' label='Media File' valuePropName='file'>
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                accept='image/*,video/*'
                onChange={handleMediaChange}
              >
                <Button icon={<UploadOutlined />}>Upload Media</Button>
              </Upload>
            </Form.Item>
            {mediaPreview && (
              <div className='mt-2'>
                <p>Media Preview:</p>
                {mediaPreview.includes('image') ? (
                  <Image src={mediaPreview} width={200} className='mt-2' />
                ) : (
                  <video src={mediaPreview} controls width={200} className='mt-2' />
                )}
              </div>
            )}
          </Panel>
        </Collapse>

        <div className='flex justify-end gap-2 mt-4'>
          <Button type='primary' htmlType='submit' loading={createExercise.isPending}>
            Create Exercise
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ExerciseForm;
