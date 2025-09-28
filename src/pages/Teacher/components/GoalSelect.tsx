/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Form, Select, Button, Modal, Input, Spin, message, Col } from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createGoalService, getGoalsService } from '../../../services/goals';
import type { Goal } from '../../../services/goals/type';

const { Option } = Select;

const GoalSelect: React.FC<{ form: any }> = ({ form }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch goals
  const {
    data: goals,
    isLoading: goalsLoading,
    refetch,
  } = useQuery({
    queryKey: ['goals'],
    queryFn: getGoalsService,
  });

  // Mutation for creating a goal
  const { mutate: createGoal, isPending: creatingGoal } = useMutation({
    mutationFn: (payload: Omit<Goal, 'id'>) => createGoalService(payload),
    onSuccess: (newGoal) => {
      message.success('Goal created successfully!');
      setIsModalOpen(false);
      form.setFieldValue('goalId', newGoal.id); // auto select new goal
      refetch();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Failed to create goal');
    },
  });

  // Handle new goal form submit
  const handleCreateGoal = (values: any) => {
    createGoal(values);
  };

  return (
    <Col span={12}>
      <Form.Item
        name='goalId'
        label='Learning Goal'
        rules={[{ required: true, message: 'Please select or create a goal' }]}
      >
        {goalsLoading ? (
          <Spin />
        ) : (
          <Select
            placeholder='Select goal'
            dropdownRender={(menu) => (
              <>
                {menu}
                <Button type='link' style={{ width: '100%' }} onClick={() => setIsModalOpen(true)}>
                  + Create new goal
                </Button>
              </>
            )}
          >
            {goals?.data.map((g) => (
              <Option key={g.id} value={g.id}>
                {g.name}
              </Option>
            ))}
          </Select>
        )}
      </Form.Item>

      {/* Modal for creating new goal */}
      <Modal
        title='Create New Goal'
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form layout='vertical' onFinish={handleCreateGoal}>
          <Form.Item
            label='Name'
            name='name'
            rules={[{ required: true, message: 'Please enter goal name' }]}
          >
            <Input placeholder='Enter goal name' />
          </Form.Item>

          <Form.Item
            label='Description'
            name='description'
            rules={[{ required: true, message: 'Please enter goal description' }]}
          >
            <Input.TextArea rows={3} placeholder='Enter description' />
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit' loading={creatingGoal}>
              Create Goal
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Col>
  );
};

export default GoalSelect;
