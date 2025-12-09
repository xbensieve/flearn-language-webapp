import React from 'react';
import {
  Card,
  Table,
  Typography,
  Tag,
  Avatar,
  Empty,
  Spin,
  Row,
  Col,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
  TeamOutlined,
  UserOutlined,
  MailOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { getClassEnrollmentsService } from '../../../services/class';
import type { ClassEnrollment } from '../../../services/class/type';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Users, Wallet, TrendingUp } from 'lucide-react';

const { Title, Text } = Typography;

interface ClassEnrollmentListProps {
  classId: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  Paid: { 
    label: 'Đã thanh toán', 
    color: '#10b981', 
    bgColor: '#d1fae5',
    icon: <CheckCircleOutlined />
  },
  Pending: { 
    label: 'Chờ xử lý', 
    color: '#f59e0b', 
    bgColor: '#fef3c7',
    icon: <ClockCircleOutlined />
  },
  Refunded: { 
    label: 'Đã hoàn tiền', 
    color: '#ef4444', 
    bgColor: '#fee2e2',
    icon: <DollarOutlined />
  },
};

const ClassEnrollmentList: React.FC<ClassEnrollmentListProps> = ({ classId }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['class-enrollments', classId],
    queryFn: () => getClassEnrollmentsService(classId),
    enabled: !!classId,
  });

  const columns: ColumnsType<ClassEnrollment> = [
    {
      title: 'Học viên',
      key: 'student',
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              size={48}
              icon={<UserOutlined />}
              className="bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <Text className="font-bold block text-gray-900 text-base">
              {record.userName || 'Học viên'}
            </Text>
            <Text className="text-gray-500 text-sm flex items-center gap-1.5">
              <MailOutlined className="text-xs text-violet-500" />
              {record.studentEmail}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amountPaid',
      key: 'amountPaid',
      align: 'right',
      render: (amount: number) => (
        <div className="text-right">
          <Text className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {new Intl.NumberFormat('vi-VN').format(amount)}
          </Text>
          <Text className="text-gray-500 text-xs block">VNĐ</Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: string) => {
        const config = statusConfig[status] || statusConfig.Pending;
        return (
          <Tag
            icon={config.icon}
            className="px-4 py-1.5 rounded-full font-semibold border-0 text-sm"
            style={{
              backgroundColor: config.bgColor,
              color: config.color,
            }}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'enrolledAt',
      key: 'enrolledAt',
      render: (date: string) => (
        <div>
          <Text className="block text-gray-900 font-semibold">
            {dayjs(date).format('DD/MM/YYYY')}
          </Text>
          <Text className="text-violet-500 text-xs font-medium">
            {dayjs(date).format('HH:mm')}
          </Text>
        </div>
      ),
    },
    {
      title: 'Mã giao dịch',
      dataIndex: 'paymentTransactionId',
      key: 'paymentTransactionId',
      render: (id: string) => (
        <Text className="text-gray-500 font-mono text-xs bg-gray-100 px-3 py-1.5 rounded-lg">
          {id ? `#${id.slice(-8)}` : '-'}
        </Text>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Card className="shadow-xl rounded-3xl border-0 mt-8">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="absolute inset-0 animate-ping bg-violet-500 rounded-full opacity-20 scale-150"></div>
            <div className="relative p-4 bg-violet-100 rounded-2xl">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} className="text-violet-600" spin />} />
            </div>
          </div>
          <Text className="mt-6 text-gray-500 font-medium">Đang tải danh sách học viên...</Text>
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="shadow-xl rounded-3xl border-0 mt-8">
        <Empty
          description={
            <Text className="text-gray-500">Không thể tải danh sách học viên</Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  const enrollments = data?.data || [];
  const statistics = data?.statistics;

  return (
    <Card className="shadow-xl rounded-3xl border-0 mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <Title level={4} className="!m-0 !text-gray-900">
              Danh sách học viên
            </Title>
            <Text className="text-gray-500 text-sm">Quản lý học viên đăng ký lớp học</Text>
          </div>
        </div>

        {/* Statistics Pills */}
        {statistics && (
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-100">
              <TeamOutlined className="text-violet-600" />
              <div>
                <Text className="text-xs text-gray-500 block">Tổng số</Text>
                <Text className="text-violet-700 font-bold text-lg">{statistics.totalEnrollments}</Text>
              </div>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
              <CheckCircleOutlined className="text-emerald-600" />
              <div>
                <Text className="text-xs text-gray-500 block">Đã thanh toán</Text>
                <Text className="text-emerald-700 font-bold text-lg">{statistics.paidEnrollments}</Text>
              </div>
            </div>
            {statistics.pendingEnrollments > 0 && (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                <ClockCircleOutlined className="text-amber-600" />
                <div>
                  <Text className="text-xs text-gray-500 block">Chờ xử lý</Text>
                  <Text className="text-amber-700 font-bold text-lg">{statistics.pendingEnrollments}</Text>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table or Empty State */}
      {enrollments.length === 0 ? (
        <div className="py-16 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full blur-2xl opacity-20 scale-150"></div>
            <div className="relative w-28 h-28 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
              <TeamOutlined className="text-5xl text-violet-400" />
            </div>
          </div>
          <Title level={4} className="!text-gray-700 !mb-2">
            Chưa có học viên đăng ký
          </Title>
          <Text className="text-gray-500 max-w-md mx-auto block">
            Học viên sẽ xuất hiện ở đây khi họ đăng ký lớp học của bạn. 
            Hãy chia sẻ lớp học để thu hút thêm học viên!
          </Text>
        </div>
      ) : (
        <>
          <Table
            dataSource={enrollments}
            columns={columns}
            rowKey="enrollmentID"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng cộng ${total} học viên`,
              className: 'mt-4',
            }}
            className="enrollment-table"
            rowClassName="hover:bg-violet-50/50 transition-colors"
          />

          {/* Revenue Summary */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <CrownOutlined className="text-amber-500 text-xl" />
              <Text className="text-gray-900 font-bold text-lg">Tổng quan doanh thu</Text>
            </div>
            
            <Row gutter={[20, 20]}>
              <Col xs={24} md={8}>
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 shadow-lg">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Wallet size={24} className="text-white" />
                    </div>
                    <div>
                      <Text className="text-white/80 text-xs block mb-1 uppercase tracking-wide font-medium">Tổng doanh thu</Text>
                      <Text className="text-white font-black text-2xl">
                        {new Intl.NumberFormat('vi-VN').format(
                          enrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0)
                        )}
                      </Text>
                      <Text className="text-white/90 text-sm font-semibold"> VNĐ</Text>
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={8}>
                <div className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-2xl p-6 shadow-lg">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Users size={24} className="text-white" />
                    </div>
                    <div>
                      <Text className="text-white/80 text-xs block mb-1 uppercase tracking-wide font-medium">Tổng học viên</Text>
                      <Text className="text-white font-black text-2xl">
                        {enrollments.length}
                      </Text>
                      <Text className="text-white/90 text-sm font-semibold"> người</Text>
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={8}>
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-6 shadow-lg">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <TrendingUp size={24} className="text-white" />
                    </div>
                    <div>
                      <Text className="text-white/80 text-xs block mb-1 uppercase tracking-wide font-medium">Trung bình/học viên</Text>
                      <Text className="text-white font-black text-2xl">
                        {new Intl.NumberFormat('vi-VN').format(
                          Math.round(
                            enrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0) /
                              (enrollments.length || 1)
                          )
                        )}
                      </Text>
                      <Text className="text-white/90 text-sm font-semibold"> VNĐ</Text>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </>
      )}
    </Card>
  );
};

export default ClassEnrollmentList;
