/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Form, Input, Button, Switch, Empty, Spin, message } from 'antd';
import { getCourseUnitsService, createCourseUnitsService } from '../../services/course';
import type { Unit } from '../../services/course/type';

const { TextArea } = Input;

const UnitDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: units, isLoading } = useQuery({
    queryKey: ['units', courseId],
    queryFn: () => getCourseUnitsService({ id: courseId! }),
    enabled: !!courseId,
  });

  const createUnit = useMutation({
    mutationFn: (values: any) =>
      createCourseUnitsService({
        courseId: courseId!,
        title: values.title,
        description: values.description,
        isPreview: values.isPreview,
      }),
    onSuccess: () => {
      message.success('Unit created successfully!');
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['units', courseId] });
    },
  });

  if (isLoading) return <Spin className='flex justify-center my-10' />;

  return (
    <div className='max-w-4xl mx-auto py-10 px-4'>
      <Card title='Manage Units'>
        <Form form={form} layout='vertical' onFinish={createUnit.mutate}>
          <Form.Item name='title' label='Title' rules={[{ required: true }]}>
            <Input placeholder='Enter unit title' />
          </Form.Item>
          <Form.Item name='description' label='Description'>
            <TextArea rows={3} placeholder='Enter description' />
          </Form.Item>
          <Form.Item name='isPreview' label='Preview' valuePropName='checked'>
            <Switch />
          </Form.Item>
          <Button type='primary' htmlType='submit' loading={createUnit.isPending}>
            Create Unit
          </Button>
        </Form>

        <div className='mt-6'>
          {units?.length ? (
            units.map((u: Unit) => (
              <Card key={u.courseUnitID} size='small' className='mb-3'>
                <p className='font-semibold'>{u.title}</p>
                <p className='text-xs text-gray-500 mb-0'>{u.description}</p>
              </Card>
            ))
          ) : (
            <Empty description='No units found' />
          )}
        </div>
      </Card>
    </div>
  );
};

export default UnitDetail;
