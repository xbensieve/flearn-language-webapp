// src/pages/Admin/Dashboard.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Card,
  Typography,
  Spin,
  Table,
  Input,
  Select,
  Button,
  Modal,
  Form,
  message,
  Tag,
  Space,
  Avatar,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  LockOutlined,
  UserOutlined,
  MailOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  changeStaffPassword,
  getAllUsers,
  getDashboard,
  getUserById,
} from '../../services/dashboard';

const { Title, Text } = Typography;

interface User {
  userID: string;
  userName: string;
  email: string;
  status: boolean;
  createdAt: string;
  lastAccessAt: string | null;
  isEmailConfirmed: boolean;
  roles: string[];
}
const AdminDashboard: React.FC = () => {
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });
  const [filters, setFilters] = useState({
    keyword: '',
    role: '',
    status: '' as 'true' | 'false' | '',
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Fetch dashboard stats
  const { data: dashData, isLoading: loadingDash } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => getDashboard(),
    select: (data) => data.data,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: usersData, isFetching } = useQuery<any>({
    queryKey: ['admin-users', pagination, filters],
    queryFn: () =>
      getAllUsers({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: filters.keyword || undefined,
        role: filters.role || undefined,
        status: filters.status === '' ? undefined : filters.status === 'true' ? true : false,
      }),
  });

  console.log(usersData);

  const changePassMutation = useMutation({
    mutationFn: changeStaffPassword,
    onSuccess: () => {
      message.success('Password changed successfully');
      setIsPassModalOpen(false);
      form.resetFields();
    },
    onError: () => message.error('Failed to change password'),
  });

  const columns: ColumnsType<User> = [
    {
      title: 'User',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} className='bg8 bg-blue-600' />
          <div>
            <div className='font-medium'>{record.userName}</div>
            <div className='text-xs text-gray-500'>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      render: (roles: string[]) => (
        <Space wrap>
          {roles.map((role) => (
            <Tag
              key={role}
              color={role === 'Staff' ? 'purple' : role === 'Teacher' ? 'green' : 'blue'}
            >
              {role}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: boolean) => (
        <Badge status={status ? 'success' : 'error'} text={status ? 'Active' : 'Inactive'} />
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button size='small' icon={<EyeOutlined />} onClick={() => viewUser(record.userID)}>
            View
          </Button>
          {record.roles.includes('Staff') && (
            <Button
              size='small'
              danger
              icon={<LockOutlined />}
              onClick={() => openChangePassword(record)}
            >
              Change Password
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const viewUser = async (userId: string) => {
    try {
      const res = await getUserById(userId);
      setSelectedUser(res.data);
      setIsDetailOpen(true);
    } catch {
      message.error('Failed to load user details');
    }
  };

  const openChangePassword = (user: User) => {
    setSelectedUser(user);
    setIsPassModalOpen(true);
    form.setFieldsValue({ staffUserId: user.userID });
  };

  if (loadingDash) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spin size='large' tip='Loading dashboard...' />
      </div>
    );
  }

  return (
    <div className='p-8 bg-gray-50 min-h-screen'>
      <Title level={2} className='mb-8'>
        Admin Dashboard
      </Title>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10'>
        {[
          { label: 'Total Users', value: dashData?.totalUsers, color: 'bg-blue-500' },
          {
            label: 'Staff Members',
            value: dashData?.totalStaff || 0,
            color: 'bg-purple-500',
          },
          {
            label: 'Total Courses',
            value: dashData?.totalCourses || 0,
            color: 'bg-green-500',
          },
          { label: 'Active Users', value: dashData?.activeUsers, color: 'bg-cyan-500' },
          {
            label: 'Pending Courses',
            value: dashData?.pendingCourses || 0,
            color: 'bg-orange-500',
          },
        ].map((stat) => (
          <Card key={stat.label} className='text-center shadow hover:shadow-lg transition'>
            <div className={`w-12 h-12 ${stat.color} rounded-xl mx-auto mb-3`} />
            <Text type='secondary'>{stat.label}</Text>
            <Title level={3} className='mt-2 mb-0'>
              {stat.value}
            </Title>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <Card title='All Users' className='mb-6'>
        <Space.Compact className='w-full mb-4'>
          <Input
            placeholder='Search by name or email...'
            prefix={<SearchOutlined />}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            onPressEnter={() => setPagination({ ...pagination, page: 1 })}
          />
          <Select
            placeholder='Role'
            allowClear
            style={{ width: 180 }}
            onChange={(v) => setFilters({ ...filters, role: v || '' })}
          >
            <Select.Option value='Learner'>Learner</Select.Option>
            <Select.Option value='Teacher'>Teacher</Select.Option>
            <Select.Option value='Staff'>Staff</Select.Option>
          </Select>
          <Select
            placeholder='Status'
            allowClear
            style={{ width: 160 }}
            onChange={(v) => setFilters({ ...filters, status: v || '' })}
          >
            <Select.Option value='true'>Active</Select.Option>
            <Select.Option value='false'>Inactive</Select.Option>
          </Select>
        </Space.Compact>

        {/* Users Table */}
        <Table
          rowKey='userID'
          columns={columns}
          dataSource={usersData?.users}
          loading={isFetching}
          pagination={{
            current: usersData?.pagination?.currentPage,
            pageSize: usersData?.pagination?.pageSize,
            total: usersData?.pagination?.totalUsers,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, pageSize) => {
              setPagination({ page, pageSize: pageSize || 20 });
            },
          }}
        />
      </Card>

      {/* Modals remain the same */}
      <Modal
        title='User Details'
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <Avatar size={80} icon={<UserOutlined />} className='bg-blue-600 text-3xl' />
              <div>
                <Title level={4}>{selectedUser.userName}</Title>
                <Text type='secondary'>
                  <MailOutlined className='mr-1' />
                  {selectedUser.email}
                </Text>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Text strong>Status:</Text>{' '}
                {selectedUser.status ? (
                  <Tag icon={<CheckCircleFilled />} color='success'>
                    Active
                  </Tag>
                ) : (
                  <Tag icon={<CloseCircleFilled />} color='error'>
                    Inactive
                  </Tag>
                )}
              </div>
              <div>
                <Text strong>Roles:</Text> {selectedUser.roles.join(', ')}
              </div>
              <div>
                <Text strong>Joined:</Text> {new Date(selectedUser.createdAt).toLocaleDateString()}
              </div>
              <div>
                <Text strong>Email Verified:</Text> {selectedUser.isEmailConfirmed ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title='Change Staff Password'
        open={isPassModalOpen}
        onCancel={() => {
          setIsPassModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText='Change Password'
        confirmLoading={changePassMutation.isPending}
      >
        <Form form={form} layout='vertical' onFinish={(v) => changePassMutation.mutate(v)}>
          <Form.Item name='staffUserId' hidden>
            <Input />
          </Form.Item>
          <Form.Item name='newPassword' label='New Password' rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder='Enter new password' />
          </Form.Item>
          <Form.Item
            name='confirmNewPassword'
            label='Confirm Password'
            dependencies={['newPassword']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder='Confirm new password' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
