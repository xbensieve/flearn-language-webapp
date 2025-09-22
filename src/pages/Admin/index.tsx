// src/pages/Admin/Dashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Typography, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getDashboard } from '../../services/dashboard';
import type { IDashboard, RecentUser } from '../../services/dashboard/types';

const { Title, Text } = Typography;

const Admin: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data?.success) {
    return <div className="text-center mt-10">Không thể tải dashboard.</div>;
  }

  const dashboard: IDashboard = data.data;
  const { totalUsers, totalStaff, totalCourses, activeUsers, pendingCourses, recentUsers } =
    dashboard;

  const columns: ColumnsType<RecentUser> = [
    { title: 'User Name', dataIndex: 'userName', key: 'userName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => (
        <span className={status ? 'text-green-600' : 'text-red-600'}>
          {status ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
    { title: 'Last Access', dataIndex: 'lastAccessAt', key: 'lastAccessAt' },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => roles.join(', '),
    },
  ];

  return (
    <div className="p-6">
      <Card className="shadow-md rounded-xl">
        <Title level={3}>Dashboard</Title>

        <div
          style={{ marginBottom: '1rem' }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card
            className="text-center"
            style={{ margin: '6px' }}>
            <Text strong>Tổng người dùng</Text>
            <div className="text-xl">{totalUsers}</div>
          </Card>
          <Card
            className="text-center"
            style={{ margin: '6px' }}>
            <Text strong>Tổng nhân viên</Text>
            <div className="text-xl">{totalStaff}</div>
          </Card>
          <Card
            className="text-center"
            style={{ margin: '6px' }}>
            <Text strong>Tổng khóa học</Text>
            <div className="text-xl">{totalCourses}</div>
          </Card>
          <Card
            className="text-center"
            style={{ margin: '6px' }}>
            <Text strong>Người dùng hoạt động</Text>
            <div className="text-xl">{activeUsers}</div>
          </Card>
          <Card
            className="text-center"
            style={{ margin: '6px' }}>
            <Text strong>Khóa học chờ duyệt</Text>
            <div className="text-xl">{pendingCourses}</div>
          </Card>
        </div>

        <Table<RecentUser>
          rowKey="userID"
          columns={columns}
          dataSource={recentUsers}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default Admin;
