/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Form, Input, Upload, Button, Space } from 'antd';
import { VideoCameraOutlined, FileOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import type { Unit } from '../../../services/course/type';
import { useCreateLesson } from '../helpers';

interface LessonFormProps {
  unit: Unit;
  onSuccess: () => void;
}

const LessonForm: React.FC<LessonFormProps> = ({ unit, onSuccess }) => {
  const [form] = Form.useForm();
  const createLesson = useCreateLesson(unit.courseUnitID, onSuccess);

  const handleSubmit = (values: any) => {
    const formData = new FormData();
    formData.append('Title', values.title);
    formData.append('Description', values.description || '');
    formData.append('Content', values.content || '');
    formData.append('CourseUnitID', unit.courseUnitID);
    if (values.video?.file) formData.append('VideoFile', values.video.file);
    if (values.document?.file) formData.append('DocumentFile', values.document.file);
    createLesson.mutate(formData);
  };

  return (
    <Form form={form} layout='vertical' onFinish={handleSubmit}>
      <Form.Item name='title' label='Lesson Title' rules={[{ required: true }]}>
        <Input placeholder='e.g., Basic Greetings' />
      </Form.Item>

      <Form.Item name='description' label='Description'>
        <Input.TextArea rows={2} />
      </Form.Item>

      <Form.Item name='content' label='Lesson Content'>
        <ReactQuill theme='snow' placeholder='Write lesson content here...' />
      </Form.Item>

      <Space direction='vertical' className='w-full'>
        <Form.Item name='video' label='Video File' valuePropName='file'>
          <Upload beforeUpload={() => false} maxCount={1} accept='video/*'>
            <Button icon={<VideoCameraOutlined />}>Upload Video</Button>
          </Upload>
        </Form.Item>

        <Form.Item name='document' label='Document File' valuePropName='file'>
          <Upload beforeUpload={() => false} maxCount={1} accept='.pdf,.doc,.docx'>
            <Button icon={<FileOutlined />}>Upload Document</Button>
          </Upload>
        </Form.Item>
      </Space>

      <div className='flex justify-end'>
        <Button type='primary' htmlType='submit' loading={createLesson.isPending}>
          Save Lesson
        </Button>
      </div>
    </Form>
  );
};

export default LessonForm;
