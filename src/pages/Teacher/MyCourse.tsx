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
    queryFn: () => getTeacherCoursesService({ status, page, pageSize }),
    retry: 1,
  });

  const courses = React.useMemo(() => data?.data || [], [data]);
  const total = React.useMemo(() => data?.meta?.totalItems ?? 0, [data]);

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Spin
            size="large"
            indicator={
              <LoadingOutlined
                className="text-5xl text-blue-600"
                spin
              />
            }
          />
          <Text className="block mt-6 text-lg text-gray-600 font-medium">
            Loading your courses...
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Book className="w-7 h-7 text-white" />
            </div>
            <div>
              <Title
                level={1}
                className="text-3xl font-bold text-gray-900 !mb-1">
                My Courses
              </Title>
            </div>
          </div>

          <Space
            wrap
            className="gap-3">
            <Select
              value={status}
              onChange={handleStatusChange}
              placeholder="Filter by status"
              className="w-48 rounded-xl"
              size="large">
              {statusOptions.map((s) => (
                <Option
                  key={s.value}
                  value={s.value}
                  className="font-medium">
                  {s.label}
                </Option>
              ))}
            </Select>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('create')}
              size="large"
              className="h-12 px-6 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md">
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
                    <div className="group flex flex-col h-full bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                      {/* Cover Image */}
                      <div className="relative h-48 overflow-hidden bg-gray-100">
                        <img
                          src={course.imageUrl || '/placeholder-course.jpg'}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div
                          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white bg-${statusColor}-500 shadow-sm`}>
                          {formatStatusLabel(course.courseStatus)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col flex-1 p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                          {course.description || 'No description available'}
                        </p>

                        {/* Price & Learners */}
                        <div className="flex justify-between items-end mt-auto pt-3 border-t border-gray-100">
                          <div>
                            {course.discountPrice ? (
                              <div>
                                <span className="text-xs text-gray-400 line-through">
                                  {Number(course.price).toLocaleString('vi-VN')}₫
                                </span>
                                <span className="block text-lg font-bold text-green-600">
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
                            <Text className="text-xs text-gray-500">
                              {course.learnerCount} learners
                            </Text>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex divide-x divide-gray-200 border-t bg-gray-50">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => navigate(`${course.courseId}`)}
                          className="flex-1 h-12 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium rounded-none">
                          View
                        </Button>
                        {canEdit && (
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`${course.courseId}/edit`)}
                            className="flex-1 h-12 text-green-600 hover:text-green-700 hover:bg-green-50 font-medium rounded-none">
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
            <div className="mt-12 bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Text className="text-gray-600">
                  Showing <strong>{(page - 1) * pageSize + 1}</strong> to{' '}
                  <strong>{Math.min(page * pageSize, total)}</strong> of <strong>{total}</strong>{' '}
                  courses
                </Text>

                <ConfigProvider
                  theme={{
                    token: { colorPrimary: '#2563eb' },
                  }}>
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    onChange={handlePageChange}
                    showSizeChanger
                    pageSizeOptions={pageSizeOptions}
                    className="flex justify-center"
                  />
                </ConfigProvider>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-3xl shadow-lg p-12 text-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{ height: 120 }}
              description={false}
            />
            <Title
              level={4}
              className="mt-6 text-gray-800 mb-3">
              {status
                ? `No ${statusOptions
                    .find((s) => s.value === status)
                    ?.label?.toLowerCase()} courses`
                : "You haven't created any courses yet"}
            </Title>
            <Text className="text-gray-600 mb-8 max-w-md">
              Start building your teaching portfolio today.
            </Text>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('create')}
              className="h-14 px-8 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
              Create Your First Course
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
