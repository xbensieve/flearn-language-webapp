import React, { useState } from 'react';
import {
  Typography,
  Row,
  Col,
  Button,
  Empty,
  Spin,
  Select,
  Space,
  Badge,
  Pagination,
  ConfigProvider,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getTeacherCoursesService } from '../../services/course';
import { PlusOutlined, EditOutlined, EyeOutlined, LoadingOutlined } from '@ant-design/icons';
import { formatStatusLabel } from '../../utils/mapping';
import { Book } from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'Draft', label: 'Draft' },
  { value: 'PendingApproval', label: 'Pending Approval' },
  { value: 'Published', label: 'Published' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Archived', label: 'Archived' },
];

const statusColors: Record<string, string> = {
  Draft: 'orange',
  PendingApproval: 'gold',
  Published: 'green',
  Rejected: 'red',
  Archived: 'gray',
};

const pageSizeOptions = ['6', '12', '24', '48'];

const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const { data, isLoading } = useQuery({
    queryKey: ['courses', status, page, pageSize],
    queryFn: () =>
      getTeacherCoursesService({
        status,
        page,
        pageSize,
      }),
    retry: 1,
  });

  const courses = React.useMemo(() => data?.data || [], [data]);
  const total = React.useMemo(() => data?.meta?.totalItems ?? 0, [data]);

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1); // Reset to first page
  };

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    setPage(newPage);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPage(1);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-indigo-100">
        <Spin
          size="large"
          indicator={
            <LoadingOutlined
              style={{ fontSize: 48 }}
              spin
            />
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-md">
              <Book className="w-8 h-8 text-white" />
            </div>
            <div>
              <Title
                level={2}
                className="!mb-0 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                My Courses
              </Title>
              <Text
                type="secondary"
                className="text-lg">
                Manage and track your teaching journey
              </Text>
            </div>
            <Badge
              count={total}
              overflowCount={999}
              style={{ backgroundColor: '#52c41a' }}
            />
          </div>

          <Space wrap>
            <Select
              value={status}
              onChange={handleStatusChange}
              style={{ width: 200 }}
              placeholder="Filter by status">
              {statusOptions.map((s) => (
                <Option
                  key={s.value}
                  value={s.value}>
                  {s.label}
                </Option>
              ))}
            </Select>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('create')}
              size="large"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg">
              Create Course
            </Button>
          </Space>
        </div>

        {/* Courses Grid */}
        {courses.length > 0 ? (
          <>
            <Row gutter={[24, 24]}>
              {courses.map((course) => {
                const canEdit = ['Draft', 'Rejected'].includes(course.courseStatus);
                const statusColor = statusColors[course.courseStatus] || 'default';
                const isFree = Number(course.price) === 0;

                return (
                  <Col
                    key={course.courseId}
                    xs={24}
                    sm={12}
                    lg={8}
                    xl={6}>
                    <div className="group flex flex-col h-full rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                      {/* Cover image */}
                      <div className="relative w-full h-[200px] overflow-hidden bg-gray-100">
                        <img
                          src={course.imageUrl || '/placeholder-course.jpg'}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span
                          className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md bg-opacity-90 shadow bg-${statusColor}-500 text-white`}>
                          {formatStatusLabel(course.courseStatus)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col flex-1 p-4">
                        <h5 className="text-gray-900 font-semibold text-base leading-snug mb-2 line-clamp-2">
                          {course.title}
                        </h5>

                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">
                          {course.description || 'No description available'}
                        </p>

                        {/* Price Section */}
                        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-end">
                          <div>
                            {course.discountPrice ? (
                              <div className="flex flex-col">
                                <span className="text-gray-400 text-xs line-through">
                                  {Number(course.price).toLocaleString('vi-VN')}₫
                                </span>
                                <span className="text-lg font-bold text-green-600">
                                  {Number(course.discountPrice).toLocaleString('vi-VN')}₫
                                </span>
                              </div>
                            ) : (
                              <span
                                className={`text-lg font-bold ${
                                  isFree ? 'text-emerald-600' : 'text-blue-600'
                                }`}>
                                {isFree
                                  ? 'FREE'
                                  : `${Number(course.price).toLocaleString('vi-VN')}₫`}
                              </span>
                            )}
                          </div>

                          {course.learnerCount !== undefined && (
                            <span className="text-xs text-gray-500">
                              👥 {course.learnerCount} learners
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between items-center border-t px-4 py-3 bg-gray-50">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => navigate(`${course.courseId}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium px-0">
                          View
                        </Button>

                        {canEdit && (
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`${course.courseId}/edit`)}
                            className="text-green-600 hover:text-green-800 font-medium px-0">
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>

            {/* Pagination */}
            <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-6 bg-white p-6 rounded-2xl shadow-lg">
              <Text className="text-gray-600">
                Showing <strong>{(page - 1) * pageSize + 1}</strong> to{' '}
                <strong>{Math.min(page * pageSize, total)}</strong> of <strong>{total}</strong>{' '}
                courses
              </Text>

              <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: '#2563eb',
                  },
                }}>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  onChange={handlePageChange}
                  showSizeChanger
                  pageSizeOptions={pageSizeOptions}
                />
              </ConfigProvider>
            </div>
          </>
        ) : (
          // Your Empty state remains unchanged
          <div className="flex flex-col justify-center items-center min-h-[60vh] bg-white rounded-2xl shadow-lg p-12">
            <Empty
              description={
                <div className="text-center max-w-md">
                  <Text className="text-xl text-gray-600 mb-4 block">
                    {status
                      ? `No ${statusOptions
                          .find((s) => s.value === status)
                          ?.label?.toLowerCase()} courses`
                      : "You haven't created any courses yet"}
                  </Text>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('create')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                    Create Your First Course
                  </Button>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{ height: 140 }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
