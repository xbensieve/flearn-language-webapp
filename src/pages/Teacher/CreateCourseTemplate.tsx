import React from 'react';
import { Form, Input, InputNumber, Checkbox, Button, Card, Typography, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { CourseTemplate } from '../../services/course/type';
import { createCourseTemplateService } from '../../services/course';

const { Title } = Typography;

const CreateCourseTemplate: React.FC = () => {
  const navigate = useNavigate();

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: (payload: Omit<CourseTemplate, 'id'>) => createCourseTemplateService(payload),
    onSuccess: () => {
      message.success('Course Template created successfully!');
      navigate('course');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Failed to create course template');
    },
  });

  const onFinish = (values: Omit<CourseTemplate, 'id'>) => {
    mutate(values);
  };

  return (
    <div className='min-h-screen flex justify-center items-start bg-gray-50 py-10 px-4'>
      <Card className='w-full max-w-3xl shadow-md'>
        <Title level={3}>Create Course Template</Title>

        <Form
          layout='vertical'
          onFinish={onFinish}
          initialValues={{
            requireGoal: false,
            requireLevel: false,
            requireSkillFocus: false,
            requireTopic: false,
            requireLang: false,
            minUnits: 1,
            minLessonsPerUnit: 1,
            minExercisesPerLesson: 1,
          }}
        >
          <Form.Item
            label='Name'
            name='name'
            rules={[{ required: true, message: 'Please enter template name' }]}
          >
            <Input placeholder='Enter template name' />
          </Form.Item>

          <Form.Item
            label='Description'
            name='description'
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={3} placeholder='Enter template description' />
          </Form.Item>

          <Form.Item label='Requirements'>
            <Form.Item name='requireGoal' valuePropName='checked' noStyle>
              <Checkbox>Require Goal</Checkbox>
            </Form.Item>
            <br />
            <Form.Item name='requireLevel' valuePropName='checked' noStyle>
              <Checkbox>Require Level</Checkbox>
            </Form.Item>
            <br />
            <Form.Item name='requireSkillFocus' valuePropName='checked' noStyle>
              <Checkbox>Require Skill Focus</Checkbox>
            </Form.Item>
            <br />
            <Form.Item name='requireTopic' valuePropName='checked' noStyle>
              <Checkbox>Require Topic</Checkbox>
            </Form.Item>
            <br />
            <Form.Item name='requireLang' valuePropName='checked' noStyle>
              <Checkbox>Require Language</Checkbox>
            </Form.Item>
          </Form.Item>

          <Form.Item
            label='Minimum Units'
            name='minUnits'
            rules={[{ required: true, message: 'Please enter minimum units' }]}
          >
            <InputNumber min={1} className='w-full' />
          </Form.Item>

          <Form.Item
            label='Minimum Lessons per Unit'
            name='minLessonsPerUnit'
            rules={[{ required: true, message: 'Please enter minimum lessons per unit' }]}
          >
            <InputNumber min={1} className='w-full' />
          </Form.Item>

          <Form.Item
            label='Minimum Exercises per Lesson'
            name='minExercisesPerLesson'
            rules={[{ required: true, message: 'Please enter minimum exercises per lesson' }]}
          >
            <InputNumber min={1} className='w-full' />
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit' loading={isLoading}>
              Create Template
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCourseTemplate;
