/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Table, Button, Space, Tag, Typography, Drawer, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LevelForm from './components/LevelForm';
import type { Level } from '../../services/level/type';
import { createLevel, deleteLevel, getLevelsByProgram, updateLevel } from '../../services/level';
import { useParams } from 'react-router-dom';
import { notifyError, notifySuccess } from '../../utils/toastConfig';

const { Title } = Typography;

const LevelPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['levels', programId],
    queryFn: () => getLevelsByProgram(programId || ''),
    enabled: !!programId,
  });

  const createMutation = useMutation({
    mutationFn: createLevel,
    onSuccess: () => {
      notifySuccess('Created successfully');
      queryClient.invalidateQueries({ queryKey: ['levels', programId] });
    },
    onError: () => notifyError('Create failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateLevel(id, payload),
    onSuccess: () => {
      notifySuccess('Updated successfully');
      queryClient.invalidateQueries({ queryKey: ['levels', programId] });
    },
    onError: () => notifyError('Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLevel(id),
    onSuccess: () => {
      notifySuccess('Deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['levels', programId] });
    },
    onError: () => notifyError('Delete failed'),
  });

  const handleSubmit = (values: any) => {
    console.log('asdasd', editingLevel);
    if (editingLevel) {
      updateMutation.mutate({
        id: editingLevel.levelId,
        payload: {
          name: values.name,
          description: values.description,
          orderIndex: values.orderIndex,
          status: values.status,
        },
      });
    } else {
      createMutation.mutate({ ...values, programId });
    }
    setOpen(false);
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Order Index', dataIndex: 'orderIndex', key: 'orderIndex', width: 120 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: boolean) =>
        status ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_: any, record: Level) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => {
              setEditingLevel(record);
              setOpen(true);
            }}
          />
          <Popconfirm
            title="Are you sure delete this level?"
            onConfirm={() => deleteMutation.mutate(record.levelId)}>
            <Button
              icon={<DeleteOutlined />}
              type="link"
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>Levels</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingLevel(null);
            setOpen(true);
          }}>
          Add Level
        </Button>
      </Space>

      <Table
        rowKey="levelId"
        loading={isLoading}
        dataSource={data?.data ?? []}
        columns={columns}
        pagination={false}
      />

      <Drawer
        title={editingLevel ? 'Edit Level' : 'Create Level'}
        width={500}
        onClose={() => setOpen(false)}
        open={open}
        destroyOnClose>
        <LevelForm
          initialValues={editingLevel || undefined}
          onCancel={() => setOpen(false)}
          onSubmit={handleSubmit}
          isEdit={!!editingLevel}
        />
      </Drawer>
    </>
  );
};

export default LevelPage;
