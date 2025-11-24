import React, { useState } from 'react';
import { Table, Card, Typography, Tag, Avatar, Button, Modal, Form, Input } from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getStaffListService, changeStaffPasswordService } from '../../services/dashboard';
import { notifySuccess, notifyError } from '../../utils/toastConfig';
import type { Staff } from '../../services/dashboard/types';
import { KeyOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const StaffPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [form] = Form.useForm();

  const { data: staffList, isLoading, refetch } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: getStaffListService,
  });

  const changePassMutation = useMutation({
    mutationFn: changeStaffPasswordService,
    onSuccess: () => {
      notifySuccess('Password changed successfully!'); 
      setModalOpen(false);
      form.resetFields();
    },
  
    onError: (err: any) => {
      notifyError(err?.response?.data?.message || 'Failed to change password');
    },
  });

  const handleOpenChangePass = (record: Staff) => {
    setSelectedStaff(record);
    setModalOpen(true);
  };


  const onFinish = (values: any) => {
    if (!selectedStaff) return;
    changePassMutation.mutate({
      staffUserId: selectedStaff.userID,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmNewPassword,
    });
  };

  const columns = [
    {
      title: 'Staff',
      dataIndex: 'userName',
      render: (text: string, record: Staff) => (
        <div className="flex items-center gap-3">
          <Avatar style={{ backgroundColor: '#7c3aed' }}>
            {text?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <Text strong className="block text-sm">{text}</Text>
            <Text type="secondary" className="text-xs">{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      render: (roles: string[]) => (
        <Tag color="purple" className="rounded-full px-2 border-0 bg-purple-50 text-purple-700">{roles[0]}</Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      render: (date: string) => <Text className="text-xs text-gray-500">{new Date(date).toLocaleDateString()}</Text>,
    },
    {
      title: 'Action',
      render: (_: any, record: Staff) => (
        <Button 
          size="small" 
          icon={<KeyOutlined />} 
          onClick={() => handleOpenChangePass(record)}
          className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
        >
          Change Password
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card bordered={false} className="rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <TeamOutlined className="text-xl" />
             </div>
             <div>
               <Title level={4} className="!mb-0 !font-bold text-gray-800">Staff Management</Title>
               <Text className="text-xs text-gray-500">Manage system administrators and staff</Text>
             </div>
          </div>
          <Button onClick={() => refetch()}>Refresh</Button>
        </div>
        <Table
          columns={columns}
          dataSource={staffList || []}
          rowKey="userID"
          loading={isLoading}
          pagination={false}
          size="middle"
        />
      </Card>

      <Modal
        title={`Change Password for ${selectedStaff?.userName}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[{ required: true, min: 6, message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character ' }]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
          <Form.Item
            name="confirmNewPassword"
            label="Confirm Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setModalOpen(false)} className="rounded-lg">Cancel</Button>
            <Button type="primary" htmlType="submit" loading={changePassMutation.isPending} className="bg-blue-600 rounded-lg shadow-md">
              Change Password
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffPage;