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
      notifySuccess("Đã thay đổi mật khẩu thành công!"); 
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
      title: 'Nhân viên',
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
      title: 'Vai trò',
      dataIndex: 'roles',
      render: (roles: string[]) => (
        <Tag color="purple" className="rounded-full px-2 border-0 bg-purple-50 text-purple-700">{roles[0]}</Tag>
      ),
    },
    {
      title: 'Đã tham gia',
      dataIndex: 'createdAt',
      render: (date: string) => <Text className="text-xs text-gray-500">{new Date(date).toLocaleDateString()}</Text>,
    },
    {
      title: 'Hành động',
      render: (_: any, record: Staff) => (
        <Button 
          size="small" 
          icon={<KeyOutlined />} 
          onClick={() => handleOpenChangePass(record)}
          className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
        >
          Đổi mật khẩu
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        bordered={false}
        className="rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <TeamOutlined className="text-xl" />
            </div>
            <div>
              <Title level={4} className="!mb-0 !font-bold text-gray-800">
                Quản lý nhân viên
              </Title>
              <Text className="text-xs text-gray-500">
                Quản lý quản trị viên hệ thống và nhân viên
              </Text>
            </div>
          </div>
          <Button onClick={() => refetch()}>Làm mới</Button>
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
        title={`Thay đổi mật khẩu cho ${selectedStaff?.userName}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              {
                required: true,
                min: 6,
                message:
                  "Mật khẩu phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt",
              },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            name="confirmNewPassword"
            label="Xác nhận mật khẩu"
            dependencies={["newPassword"]}
            rules={[
              {
                required: true,
                message: "Vui lòng xác nhận mật khẩu của bạn!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Xác nhận mật khẩu mới" />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setModalOpen(false)} className="rounded-lg">
              Thoát
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={changePassMutation.isPending}
              className="bg-blue-600 rounded-lg shadow-md"
            >
              Thay đổi mật khẩu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffPage;