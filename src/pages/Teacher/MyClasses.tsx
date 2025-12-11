import React, { useState } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Spin,
  Select,
  Tag,
  Pagination,
  Progress,
  Badge,
  Tooltip,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getClassesService } from '../../services/class';
import {
  PlusOutlined,
  EyeOutlined,
  LoadingOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FilterOutlined,
  RocketOutlined,
  StarFilled,
  ThunderboltFilled,
  FireFilled,
  TrophyOutlined,
} from '@ant-design/icons';
import type { Class } from '../../services/class/type';
import CreateClassForm from './components/CreateClassForm';
import { GraduationCap, Sparkles } from 'lucide-react';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const statusOptions = [
  { value: '', label: 'Tất cả lớp học', icon: <BookOutlined /> },
  { value: 'Draft', label: 'Bản nháp', color: '#8b5cf6' },
  { value: 'Published', label: 'Đã xuất bản', color: '#10b981' },
  { value: 'InProgress', label: 'Đang diễn ra', color: '#3b82f6' },
  { value: 'Finished', label: 'Đã kết thúc', color: '#6366f1' },
  { value: 'Completed_PendingPayout', label: 'Chờ thanh toán', color: '#f59e42' },
  { value: 'Completed_Paid', label: 'Đã thanh toán GV', color: '#22d3ee' },
  { value: 'PendingCancel', label: 'Chờ hủy', color: '#f59e0b' },
  { value: 'Cancelled', label: 'Đã hủy', color: '#ef4444' },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  Draft: {
    label: 'Bản nháp',
    color: '#8b5cf6',
    bgColor: 'bg-violet-50',
    icon: <ThunderboltFilled className="text-violet-500" />,
  },
  Published: {
    label: 'Đã xuất bản',
    color: '#10b981',
    bgColor: 'bg-emerald-50',
    icon: <StarFilled className="text-emerald-500" />,
  },
  InProgress: {
    label: 'Đang diễn ra',
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    icon: <ThunderboltFilled className="text-blue-500" />,
  },
  Finished: {
    label: 'Đã kết thúc',
    color: '#6366f1',
    bgColor: 'bg-indigo-50',
    icon: <TrophyOutlined className="text-indigo-500" />,
  },
  Completed_PendingPayout: {
    label: 'Chờ thanh toán',
    color: '#f59e42',
    bgColor: 'bg-amber-100',
    icon: <ThunderboltFilled className="text-amber-500" />,
  },
  Completed_Paid: {
    label: 'Đã thanh toán GV',
    color: '#22d3ee',
    bgColor: 'bg-cyan-100',
    icon: <StarFilled className="text-cyan-500" />,
  },
  PendingCancel: {
    label: 'Chờ hủy',
    color: '#f59e0b',
    bgColor: 'bg-amber-50',
    icon: <FireFilled className="text-amber-500" />,
  },
  Cancelled: {
    label: 'Đã hủy',
    color: '#ef4444',
    bgColor: 'bg-red-50',
    icon: null,
  },
};

const MyClasses: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const pageSize = 9;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['classes', status, page],
    queryFn: () => getClassesService({ status, page, pageSize }),
    retry: 1,
    retryDelay: 500,
  });

  const classes = data?.data ?? [];

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
    refetch();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const calculateEnrollmentPercentage = (current: number, capacity: number) => {
    if (!capacity) return 0;
    return Math.round((current / capacity) * 100);
  };

  const getStatusLabel = (statusKey: string) => {
    return statusConfig[statusKey]?.label || statusKey;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100">
        <div className="relative">
          <div className="absolute inset-0 animate-ping bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full opacity-20 scale-150"></div>
          <div className="relative p-6 bg-white rounded-3xl shadow-2xl">
            <Spin
              size="large"
              indicator={
                <LoadingOutlined
                  className="text-5xl text-violet-600"
                  spin
                />
              }
            />
          </div>
        </div>
        <Text className="mt-8 text-gray-600 text-xl font-medium animate-pulse">
          Đang tải danh sách lớp học...
        </Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="relative bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xl shadow-violet-100/50 mb-8">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-violet-400/10 to-indigo-400/10 rounded-full -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-blue-400/10 to-cyan-400/10 rounded-full -ml-30 -mb-30"></div>
          
          {/* Title Bar */}
          <div className="relative flex items-center gap-4 p-6 border-b border-gray-100/80">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl blur-lg opacity-40"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <GraduationCap size={28} className="text-white" />
              </div>
            </div>
            <div>
              <Title level={2} className="!m-0 !text-gray-900 !font-bold !text-2xl flex items-center gap-2">
                Quản lý lớp học
                <Sparkles size={20} className="text-amber-500" />
              </Title>
              <Text className="text-gray-500 text-sm">Tạo và quản lý các lớp học trực tuyến của bạn</Text>
            </div>
          </div>

          {/* Stats + Controls */}
          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center px-6 py-3 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100">
                  <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    {classes.length}
                  </div>
                  <div className="text-gray-500 text-sm mt-1 font-medium">
                    {status ? getStatusLabel(status) : 'Tổng số lớp'}
                  </div>
                </div>
                
                <div className="hidden md:flex items-center gap-3">
                  {[
                    { icon: <StarFilled className="text-emerald-500" />, label: 'Đang hoạt động', count: classes.filter(c => c.status === 'Published').length },
                    { icon: <ThunderboltFilled className="text-violet-500" />, label: 'Bản nháp', count: classes.filter(c => c.status === 'Draft').length },
                  ].map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                      {stat.icon}
                      <span className="text-gray-600 text-sm">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={status}
                  onChange={handleStatusChange}
                  style={{ width: 200 }}
                  size="large"
                  placeholder="Lọc theo trạng thái"
                  suffixIcon={<FilterOutlined className="text-violet-500" />}
                  className="rounded-xl shadow-sm"
                  popupClassName="rounded-xl">
                  {statusOptions.map((s) => (
                    <Option key={s.value} value={s.value}>
                      <div className="flex items-center gap-2">
                        {s.value && (
                          <Badge
                            color={s.color}
                            style={{ width: 8, height: 8 }}
                          />
                        )}
                        <span className="font-medium text-gray-700">{s.label}</span>
                      </div>
                    </Option>
                  ))}
                </Select>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsCreateModalVisible(true)}
                  size="large"
                  className="h-12 px-8 rounded-2xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 border-0 shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 transition-all duration-300">
                  Tạo lớp học mới
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        {classes.length > 0 ? (
          <div>
            <Row gutter={[24, 24]}>
              {classes.map((cls: Class) => {
                const enrollmentPercentage = calculateEnrollmentPercentage(
                  cls.currentEnrollments,
                  cls.capacity
                );
                const statusInfo = statusConfig[cls.status] || { label: cls.status, color: '#9ca3af', bgColor: 'bg-gray-50' };

                return (
                  <Col key={cls.classID} xs={24} sm={12} lg={8}>
                    <Card
                      hoverable
                      className="h-full rounded-3xl border-0 shadow-lg shadow-gray-100/80 hover:shadow-2xl hover:shadow-violet-100/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden group"
                      styles={{ body: { padding: 0 } }}>
                      
                      {/* Card Header with Gradient */}
                      <div className={`relative p-6 ${statusInfo.bgColor}`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full -mr-16 -mt-16"></div>
                        
                        <div className="relative flex justify-between items-start mb-4">
                          <Tag
                            className="px-4 py-1.5 rounded-full text-xs font-semibold border-0 shadow-sm"
                            style={{ 
                              backgroundColor: statusInfo.color + '15',
                              color: statusInfo.color,
                            }}>
                            <span className="flex items-center gap-1.5">
                              {statusInfo.icon}
                              {statusInfo.label}
                            </span>
                          </Tag>
                          
                          <Tooltip title="Chi tiết lớp học">
                            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                                 onClick={() => navigate(`${cls.classID}`)}>
                              <BookOutlined className="text-gray-500 text-lg" />
                            </div>
                          </Tooltip>
                        </div>

                        <Title
                          level={4}
                          className="!m-0 !text-gray-900 !font-bold !leading-snug"
                          style={{
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}>
                          {cls.title}
                        </Title>

                        <Text className="block mt-2 text-gray-500 font-medium text-sm">
                          🌐 {cls.languageName}
                        </Text>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-5">
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          className="!m-0 text-gray-600 text-sm leading-relaxed min-h-[2.8rem]">
                          {cls.description}
                        </Paragraph>

                        {/* Schedule Info */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <CalendarOutlined className="text-blue-600 text-base" />
                            </div>
                            <div className="flex-1">
                              <Text className="text-gray-400 text-xs block mb-0.5">Lịch học</Text>
                              <Text className="text-gray-800 font-semibold text-sm">
                                {new Date(cls.startDateTime).toLocaleDateString('vi-VN')}
                              </Text>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100/50">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <ClockCircleOutlined className="text-amber-600 text-base" />
                            </div>
                            <div className="flex-1">
                              <Text className="text-gray-400 text-xs block mb-0.5">Thời gian</Text>
                              <Text className="text-gray-800 font-semibold text-sm">
                                {new Date(cls.startDateTime).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}{' '}
                                -{' '}
                                {new Date(cls.endDateTime).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </Text>
                            </div>
                          </div>
                        </div>

                        {/* Enrollment Progress */}
                        <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100/50">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                              <TeamOutlined className="text-violet-600 text-base" />
                              <Text className="font-semibold text-gray-700 text-sm">Học viên đăng ký</Text>
                            </div>
                            <Text className="font-bold text-violet-700">
                              {cls.currentEnrollments}/{cls.capacity}
                            </Text>
                          </div>
                          <Progress
                            percent={enrollmentPercentage}
                            strokeColor={{
                              '0%': '#8b5cf6',
                              '100%': '#6366f1',
                            }}
                            trailColor="#e9d5ff"
                            showInfo={false}
                            strokeWidth={10}
                            className="!mb-2"
                          />
                          <div className="flex justify-between items-center">
                            <Text className="text-xs text-gray-500">
                              Còn {cls.capacity - cls.currentEnrollments} chỗ trống
                            </Text>
                            <Tag
                              color={
                                enrollmentPercentage >= 80
                                  ? 'red'
                                  : enrollmentPercentage >= 50
                                  ? 'orange'
                                  : 'green'
                              }
                              className="rounded-full text-xs font-medium border-0">
                              {enrollmentPercentage}%
                            </Tag>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div>
                            <Text className="text-xs text-gray-400 block mb-1">Học phí</Text>
                            <div className="flex items-baseline gap-1">
                              <Text className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                {cls.pricePerStudent.toLocaleString('vi-VN')}
                              </Text>
                              <Text className="text-gray-500 text-sm font-medium">đ</Text>
                            </div>
                          </div>
                          <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`${cls.classID}`)}
                            size="large"
                            className="rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 border-0 shadow-md hover:shadow-lg transition-all">
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <Pagination
                current={page}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                className="bg-white px-8 py-4 rounded-2xl shadow-lg shadow-gray-100/80 border border-gray-100"
              />
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl shadow-xl shadow-violet-100/50 p-16 text-center border border-gray-100">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-full blur-2xl opacity-20 scale-150"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center">
                <RocketOutlined className="text-6xl text-violet-600" />
              </div>
            </div>
            <Title level={2} className="!text-gray-900 !mb-4 !font-bold">
              Chưa có lớp học nào
            </Title>
            <Text className="text-gray-500 max-w-lg mx-auto block mb-10 text-lg leading-relaxed">
              Bắt đầu hành trình giảng dạy của bạn bằng cách tạo lớp học đầu tiên. 
              Chia sẻ kiến thức và truyền cảm hứng cho học viên!
            </Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
              size="large"
              className="h-14 px-12 rounded-2xl font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 border-0 shadow-xl shadow-violet-200 hover:shadow-2xl hover:shadow-violet-300 transition-all duration-300">
              Tạo lớp học đầu tiên
            </Button>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      <CreateClassForm
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />
    </div>
  );
};

export default MyClasses;
