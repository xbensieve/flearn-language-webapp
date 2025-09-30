/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Table, Card, Typography, Button, Drawer, Spin, Descriptions, Form, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation } from '@tanstack/react-query';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import type { Goal } from '../../services/goals/type';
import {
  createGoalService,
  deleteGoalService,
  getGoalsService,
  updateGoalService,
} from '../../services/goals';
import { DeleteFilled, EditFilled, EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Goals: React.FC = () => {
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [openCreateDrawer, setOpenCreateDrawer] = useState(false);
  const [openUpdateDrawer, setOpenUpdateDrawer] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['goals'],
    queryFn: getGoalsService,
  });

  // Create mutation
  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: (payload: Omit<Goal, 'id'>) => createGoalService(payload),
    onSuccess: () => {
      notifySuccess('Goal created successfully!');
      setOpenCreateDrawer(false);
      refetch();
    },
    onError: (err: any) => {
      notifyError(err?.response?.data?.message || 'Failed to create goal');
    },
  });

  // Update mutation
  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: (payload: Goal) => updateGoalService(payload.id, payload),
    onSuccess: () => {
      notifySuccess('Goal updated successfully!');
      setOpenUpdateDrawer(false);
      refetch();
    },
    onError: (err: any) => {
      notifyError(err?.response?.data?.message || 'Failed to update goal');
    },
  });

  // Delete mutation
  const { mutate: deleteMutate } = useMutation({
    mutationFn: (id: number) => deleteGoalService(id),
    onSuccess: () => {
      notifySuccess('Goal deleted successfully!');
      refetch();
    },
    onError: (err: any) => {
      notifyError(err?.response?.data?.message || 'Failed to delete goal');
    },
  });

  const handleViewDetail = (record: Goal) => {
    setSelectedGoal(record);
    setOpenDetailDrawer(true);
  };

  const handleEdit = (record: Goal) => {
    setSelectedGoal(record);
    setOpenUpdateDrawer(true);
  };

  const handleDelete = (record: Goal) => {
    deleteMutate(record.id);
  };

  const onFinishCreate = (values: Omit<Goal, 'id'>) => {
    createMutate(values);
  };

  const onFinishUpdate = (values: Omit<Goal, 'id'>) => {
    if (!selectedGoal) return;
    updateMutate({ ...selectedGoal, ...values });
  };

  const columns: ColumnsType<Goal> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className="flex justify-start items-center gap-2">
          <EyeOutlined
            size={30}
            onClick={() => handleViewDetail(record)}
          />
          <EditFilled
            size={30}
            onClick={() => handleEdit(record)}
          />
          <DeleteFilled
            size={30}
            onClick={() => handleDelete(record)}>
            Delete
          </DeleteFilled>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="shadow-md">
        <div className="flex justify-between items-center mb-4">
          <Title
            level={3}
            className="!mb-0">
            Goals
          </Title>
          <Button
            type="primary"
            onClick={() => setOpenCreateDrawer(true)}>
            + Create Goal
          </Button>
        </div>

        <Table<Goal>
          rowKey="id"
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          pagination={false}
        />
      </Card>

      {/* Drawer for Details */}
      <Drawer
        title={selectedGoal?.name || 'Goal Detail'}
        width={480}
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}>
        {!selectedGoal ? (
          <Spin />
        ) : (
          <Descriptions
            column={1}
            bordered>
            <Descriptions.Item label="Name">{selectedGoal.name}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedGoal.description}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* Drawer for Create */}
      <Drawer
        title="Create Goal"
        width={600}
        open={openCreateDrawer}
        onClose={() => setOpenCreateDrawer(false)}>
        <Form
          layout="vertical"
          onFinish={onFinishCreate}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter goal name' }]}>
            <Input placeholder="Enter goal name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}>
            <Input.TextArea
              rows={3}
              placeholder="Enter goal description"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreating}>
              Create Goal
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Drawer for Update */}
      <Drawer
        title={`Update Goal: ${selectedGoal?.name || ''}`}
        width={600}
        open={openUpdateDrawer}
        onClose={() => setOpenUpdateDrawer(false)}>
        {selectedGoal && (
          <Form
            layout="vertical"
            onFinish={onFinishUpdate}
            initialValues={selectedGoal}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please enter goal name' }]}>
              <Input placeholder="Enter goal name" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: 'Please enter description' }]}>
              <Input.TextArea
                rows={3}
                placeholder="Enter goal description"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdating}>
                Update Goal
              </Button>
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </div>
  );
};

export default Goals;
