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
  Statistic,
  Image,
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

const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['courses', status],
    queryFn: () => getMyCoursesService({ status }),
    retry: 1,
    retryDelay: 500,
  });

  const courses = data?.data ?? [];

  const handleStatusChange = (value: string) => {
    setStatus(value);
    refetch();
  };

  if (isLoading) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-md">
              <Book className="text-white" />
            </div>
            <Title
              level={2}
              className="!mb-0 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              My Courses
            </Title>
            <Badge
              count={courses.length}
              style={{ backgroundColor: '#52c41a' }}
            />
          </div>

          <Space>
            <Select
              value={status}
              onChange={handleStatusChange}
              style={{ width: 200 }}
              placeholder="Filter by status"
              suffixIcon={<Book className="text-white" />}>
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
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200">
              Create Course
            </Button>
          </Space>
        </div>

        {courses.length > 0 ? (
          <Row gutter={[24, 24]}>
            {courses.map((course) => {
              const canEdit = ['Draft', 'Rejected'].includes(course.status);
              const statusColor = statusColors[course.status] || 'default';

              return (
                <Col
                  key={course.courseID}
                  xs={24}
                  sm={12}
                  lg={8}>
                  <Card
                    hoverable
                    cover={
                      <div className="relative overflow-hidden rounded-t-xl w-full">
                        <Image
                          alt={course.title}
                          src={course.imageUrl}
                          preview={false}
                          width={'100%'}
                          style={{
                            height: 200,
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <Tag
                            color={statusColor}
                            className="shadow-md">
                            {formatStatusLabel(course.status)}
                          </Tag>
                        </div>
                      </div>
                    }
                    className="shadow-lg rounded-xl hover:shadow-2xl border-0 bg-white"
                    actions={[
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`${course.courseID}`)}
                        className="text-blue-600 hover:text-blue-800">
                        View Details
                      </Button>,
                      canEdit && (
                        <Button
                          type="link"
                          key="edit"
                          icon={<EditOutlined />}
                          onClick={() => navigate(`${course.courseID}/edit`)}
                          className="text-green-600 hover:text-green-800">
                          Edit
                        </Button>
                      ),
                    ].filter(Boolean)}>
                    <div className="p-4">
                      <Title
                        level={4}
                        className="text-gray-800 mb-2 line-clamp-1">
                        {course.title}
                      </Title>
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        className="text-gray-600 mb-4 line-clamp-2">
                        {course.description}
                      </Paragraph>
                      <div className="flex justify-between items-center">
                        <div className="space-x-2">
                          {course.discountPrice ? (
                            <>
                              <Text
                                delete
                                className="text-gray-400 text-sm">
                                {Number(course.price).toLocaleString('vi-VN')} VNĐ
                              </Text>
                              <Statistic
                                value={Number(course.discountPrice).toLocaleString('vi-VN')}
                                prefix="VNĐ"
                                valueStyle={{
                                  color: '#52c41a',
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                }}
                              />
                            </>
                          ) : (
                            <Statistic
                              value={Number(course.price).toLocaleString('vi-VN')}
                              prefix="VNĐ"
                              valueStyle={{
                                color: '#1890ff',
                                fontSize: '16px',
                                fontWeight: 'bold',
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <div className="flex flex-col justify-center items-center min-h-[60vh] bg-white rounded-xl shadow-lg p-8">
            <Empty
              description={
                <div className="text-center">
                  <Text className="text-gray-600 mb-2 block">No courses found</Text>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('create')}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600">
                    Create Your First Course
                  </Button>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{ height: 120 }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
