import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Typography, Spin, Table, Avatar, Row, Col, Button, Tooltip as AntTooltip, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getDashboard, getUserStatistics } from '../../services/dashboard';
import type { IDashboard, RecentUser } from '../../services/dashboard/types';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  InfoCircleOutlined,
  SolutionOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Clickable Stat Card
const StatCard = ({ title, value, icon, color, bgColor, subtext, onClick }: any) => (
  <Card 
    bordered={false} 
    className={`h-full shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl border border-gray-100 ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`} 
    bodyStyle={{ padding: '20px' }}
    onClick={onClick}
  >
    <div className="flex justify-between items-center mb-3">
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm" 
        style={{ backgroundColor: bgColor, color: color }}
      >
        {icon}
      </div>
    </div>
    <div>
      <Text className="text-2xl font-bold text-slate-800 block mb-0">{value}</Text>
      <Text className="text-slate-400 text-xs font-medium uppercase tracking-wide">{title}</Text>
      {subtext && (
        <div className="mt-2 pt-2 border-t border-dashed border-gray-100 text-xs text-slate-500">
          {subtext}
        </div>
      )}
    </div>
  </Card>
);

const Admin: React.FC = () => {
  const navigate = useNavigate();

  const { data: dashboardRes, isLoading: isLoadingDash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  const { data: statsRes, isLoading: isLoadingStats } = useQuery({
    queryKey: ['userStats', 30],
    queryFn: () => getUserStatistics(30),
  });

  if (isLoadingDash || isLoadingStats) {
    return <div className="flex justify-center items-center h-[80vh]"><Spin size="large" /></div>;
  }

  const dashboardData = dashboardRes?.data as IDashboard;
  const userStats = statsRes?.data;

  const chartData = userStats?.dailyRegistrations?.map((item) => ({
    name: dayjs(item.date).format('DD/MM'),
    register: item.count,
  })) || [];

  const { 
    totalUsers = 0, 
    totalStaff = 0, 
    totalCourses = 0, 
    totalTeachers = 0, 
    pendingRequest = 0, 
    recentUsers = [], 
    activeUsers = 0 
  } = dashboardData || {};

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const columns: ColumnsType<RecentUser> = [
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar size="small" style={{ backgroundColor: record.status ? '#0ea5e9' : '#cbd5e1' }}>
            {text?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div className="flex flex-col">
            <Text strong className="text-xs text-slate-700">{text}</Text>
            <Text className="text-[10px] text-slate-400">{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'roles',
      key: 'roles',
      align: 'right',
      render: (roles) => (
        <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {roles?.[0] || 'User'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-2 flex justify-between items-center">
        <div>
          <Title level={4} className="!mb-0 !font-bold text-slate-800">Dashboard Overview</Title>
          <Text className="text-slate-500 text-xs">Welcome back, here is what's happening with your platform today.</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
     
        <Col xs={24} sm={12} lg={4}> 
           <StatCard 
            title="Total Employees" 
            value={totalStaff} 
            icon={<TeamOutlined />} 
            color="#0284c7" 
            bgColor="#e0f2fe" 
            subtext="Managers"
            onClick={() => handleNavigate('/admin/staff')}
          />
        </Col>

        
        <Col xs={24} sm={12} lg={5}>
          <StatCard 
            title="Total Users" 
            value={totalUsers} 
            icon={<UserOutlined />} 
            color="#2563eb" 
            bgColor="#dbeafe" 
            subtext={<span className="text-green-600">● {activeUsers} Active now</span>}
            onClick={() => handleNavigate('/admin/users')}
          />
        </Col>

  
         <Col xs={24} sm={12} lg={5}>
          <StatCard 
            title="Total Teachers" 
            value={totalTeachers} 
            icon={<SolutionOutlined />} 
            color="#7c3aed" 
            bgColor="#f3e8ff" 
            subtext="Verified Teachers"
            onClick={() => handleNavigate('/admin/users?role=Teacher')}
          />
        </Col>

   
        <Col xs={24} sm={12} lg={5}>
          <StatCard 
            title="Total Courses" 
            value={totalCourses} 
            icon={<BookOutlined />} 
            color="#0891b2" 
            bgColor="#cffafe" 
            subtext="Active Programs"
            onClick={() => handleNavigate('/admin/courses')}
          />
        </Col>

       
        <Col xs={24} sm={12} lg={5}>
          <StatCard 
            title="Refund Requests" 
            value={pendingRequest} 
            icon={<ClockCircleOutlined />} 
            color="#ef4444" 
            bgColor="#fee2e2" 
            subtext="Pending Processing"
            onClick={() => handleNavigate('/admin/refund')} 
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            bordered={false} 
            className="rounded-2xl shadow-sm h-full border border-gray-100" 
            bodyStyle={{ padding: '20px' }} 
            title={
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-700">User Registration Trends</span>
                  <AntTooltip title="Number of new users registered in the last 30 days">
                    <InfoCircleOutlined className="text-slate-400 cursor-help" />
                  </AntTooltip>
                </div>
                <Button type="text" icon={<MoreOutlined />} size="small" />
              </div>
            }
          >
            <div style={{ height: 300, width: '100%' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={chartData} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11 }} 
                      dy={10} 
                      minTickGap={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11 }} 
                      allowDecimals={false}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f0f9ff' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', fontSize: '12px' }} 
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar name="New Signups" dataKey="register" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No registration data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            bordered={false} 
            className="rounded-2xl shadow-sm h-full border border-gray-100" 
            bodyStyle={{ padding: 0 }} 
            title={<div className="px-5 pt-4 pb-2 text-sm font-semibold text-slate-700">New Members</div>}
          >
            <Table<RecentUser>
              rowKey="userID"
              columns={columns}
              dataSource={recentUsers}
              pagination={false}
              showHeader={false}
              className="custom-table-row-padding"
              scroll={{ y: 280 }}
              size="small"
              locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No recent users" /> }}
            />
            <div className="p-3 text-center border-t border-gray-50">
              <Button 
                type="link" 
                size="small" 
                className="text-blue-600 font-medium text-xs"
                onClick={() => handleNavigate('/admin/users')}
              >
                View All Users
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Admin;