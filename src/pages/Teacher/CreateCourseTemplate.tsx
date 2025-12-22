import React from 'react';
import { Form, Input, InputNumber, Button, Card, Typography, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createCourseTemplateService } from '../../services/course';
import { toast } from 'react-toastify';

const { Title } = Typography;

const CreateCourseTemplate: React.FC = () => {
  const navigate = useNavigate();

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: (payload: {
      name: string;
      description: string;
      unitCount: number;
      lessonsPerUnit: number;
      exercisesPerLesson: number;
      programId: string;
      levelId: string;
    }) => createCourseTemplateService(payload),
    onSuccess: () => {
      toast.success('Mẫu khóa học đã được tạo thành công!');
      navigate('course');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Tạo mẫu khóa học thất bại.');
    },
  });

  const onFinish = (values: {
    name: string;
    description: string;
    unitCount: number;
    lessonsPerUnit: number;
    exercisesPerLesson: number;
    programId: string;
    levelId: string;
  }) => {
    mutate(values);
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-50 py-10 px-4">
      <Card className="w-full max-w-3xl shadow-md">
        <Title level={3}>Tạo mẫu khóa học</Title>

        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            unitCount: 1,
            lessonsPerUnit: 1,
            exercisesPerLesson: 1,
          }}>
          <Form.Item
            label="Tên mẫu"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên mẫu' }]}>
            <Input placeholder="Nhập tên mẫu khóa học" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
            <Input.TextArea
              rows={3}
              placeholder="Nhập mô tả"
            />
          </Form.Item>

          <Form.Item
            label="Program ID"
            name="programId"
            rules={[{ required: true, message: 'Vui lòng nhập id chương trình' }]}>
            <Input placeholder="Enter program ID (e.g., 3fa85f64-5717-4562-b3fc-2c963f66afa6)" />
          </Form.Item>

          <Form.Item
            label="Level ID"
            name="levelId"
            rules={[{ required: true, message: 'Please enter level ID' }]}>
            <Input placeholder="Enter level ID (e.g., 3fa85f64-5717-4562-b3fc-2c963f66afa6)" />
          </Form.Item>

          <Form.Item
            label="Unit Count"
            name="unitCount"
            rules={[{ required: true, message: 'Please enter unit count' }]}>
            <InputNumber
              min={1}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="Lessons Per Unit"
            name="lessonsPerUnit"
            rules={[{ required: true, message: 'Please enter lessons per unit' }]}>
            <InputNumber
              min={1}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="Exercises Per Lesson"
            name="exercisesPerLesson"
            rules={[{ required: true, message: 'Please enter exercises per lesson' }]}>
            <InputNumber
              min={1}
              className="w-full"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}>
              Create Template
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCourseTemplate;
