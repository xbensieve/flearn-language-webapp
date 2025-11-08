import React, { useState } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Button,
  Empty,
  Spin,
  Select,
  Space,
  Badge,
  Image,
  Pagination,
  ConfigProvider,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getMyCoursesService } from '../../services/course';
import { PlusOutlined, EditOutlined, EyeOutlined, LoadingOutlined } from '@ant-design/icons';
import { formatStatusLabel } from '../../utils/mapping';
import { Book } from 'lucide-react';

const { Title, Paragraph, Text } = Typography;
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
      getMyCoursesService({
        status,
        page,
        pageSize,
      }),
    retry: 1,
  });

  const courses = data?.data ?? [];
  const total = data?.pagination?.pageSize ?? 0;

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
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
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
              <Title level={2} className="!mb-0 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                My Courses
              </Title>
              <Text type="secondary" className="text-lg">
                Manage and track your teaching journey
              </Text>
            </div>
            <Badge count={total} overflowCount={999} style={{ backgroundColor: '#52c41a' }} />
          </div>

          <Space wrap>
            <Select
              value={status}
              onChange={handleStatusChange}
              style={{ width: 200 }}
              placeholder="Filter by status"
            >
              {statusOptions.map((s) => (
                <Option key={s.value} value={s.value}>
                  {s.label}
                </Option>
              ))}
            </Select>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('create')}
              size="large"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
            >
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

                return (
                  <Col key={course.courseId} xs={24} sm={12} lg={8} xl={6}>
                    <Card
                      hoverable
                      cover={
                        <div className="relative overflow-hidden rounded-t-xl">
                          <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                            <Image
                              alt={course.title}
                              src={course.imageUrl || '/placeholder-course.jpg'}
                              preview={false}
                              className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                              fallback="/placeholder-course.jpg"
                            />
                          </div>
                          <div className="absolute top-3 right-3">
                            <Tag color={statusColor} className="shadow-lg font-medium text-xs">
                              {formatStatusLabel(course.courseStatus)}
                            </Tag>
                          </div>
                        </div>
                      }
                      className="h-full shadow-lg rounded-2xl hover:shadow-2xl transition-all duration-300 border-0 bg-white flex flex-col"
                      bodyStyle={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
                      actions={[
                        <Button
                          key="view"
                          type="link"
                          icon={<EyeOutlined />}
                          onClick={() => navigate(`${course.courseId}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Button>,
                        canEdit && (
                          <Button
                            type="link"
                            key="edit"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`${course.courseId}/edit`)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Edit
                          </Button>
                        ),
                      ].filter(Boolean)}
                    >
                      <div className="p-5 flex flex-col flex-1">
                        <Title level={5} className="mb-3 line-clamp-2 text-gray-800 font-semibold leading-tight">
                          {course.title}
                        </Title>
                        <Paragraph
                          ellipsis={{ rows: 3 }}
                          className="text-gray-600 text-sm mb-4 flex-1 leading-relaxed"
                        >
                          {course.description || 'No description available'}
                        </Paragraph>

                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <div className="flex justify-between items-end">
                            <div>
                              {course.discountPrice ? (
                                <Space direction="vertical" size={0}>
                                  <Text delete className="text-gray-400 text-xs">
                                    {Number(course.price).toLocaleString('vi-VN')}₫
                                  </Text>
                                  <div className="text-lg font-bold text-green-600">
                                    {Number(course.discountPrice).toLocaleString('vi-VN')}₫
                                  </div>
                                </Space>
                              ) : (
                                <div className="text-lg font-bold text-blue-600">
                                  {Number(course.price).toLocaleString('vi-VN') === '0' ? 'FREE' : `${Number(course.price).toLocaleString('vi-VN')}₫`}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {/* Pagination + Page Size */}
            <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-6 bg-white p-6 rounded-2xl shadow-lg">
              <Text className="text-gray-600">
                Showing <strong>{(page - 1) * pageSize + 1}</strong> to{' '}
                <strong>{Math.min(page * pageSize, total)}</strong> of <strong>{total}</strong> courses
              </Text>

              <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: '#2563eb',
                  },
                }}
              >
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  onChange={handlePageChange}
                  showSizeChanger
                  pageSizeOptions={pageSizeOptions}
                  locale={{ items_per_page: '/ page' }}
                  className="ant-pagination-custom"
                />
              </ConfigProvider>

              <Select
                value={pageSize.toString()}
                onChange={(value) => handlePageChange(1, Number(value))}
                style={{ width: 120 }}
              >
                {pageSizeOptions.map((size) => (
                  <Option key={size} value={size}>
                    {size} / page
                  </Option>
                ))}
              </Select>
            </div>
          </>
        ) : (
          // Your Empty state remains unchanged
          <div className="flex flex-col justify-center items-center min-h-[60vh] bg-white rounded-2xl shadow-lg p-12">
            <Empty
              description={
                <div className="text-center max-w-md">
                  <Text className="text-xl text-gray-600 mb-4 block">
                    {status ? `No ${statusOptions.find(s => s.value === status)?.label?.toLowerCase()} courses` : 'You haven\'t created any courses yet'}
                  </Text>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('create')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  >
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