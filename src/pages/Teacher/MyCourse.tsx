import React, { useState } from 'react';
import { Card, Typography, Row, Col, Tag, Button, Empty, Spin, Select, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getMyCoursesService } from '../../services/course';
import { PlusOutlined } from '@ant-design/icons';
import { formatStatusLabel } from '../../utils/mapping';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'Draft', label: 'Draft' },
  { value: 'PendingApproval', label: 'Pending Approval' },
  { value: 'Published', label: 'Published' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Archived', label: 'Archived' },
];

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
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Title
            level={2}
            className="mb-0">
            My Courses
          </Title>

          <Space>
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
              onClick={() => navigate('create')}>
              Create Course
            </Button>
          </Space>
        </div>

        {courses.length > 0 ? (
          <Row gutter={[24, 24]}>
            {courses.map((course) => {
              const canEdit = ['Draft', 'Rejected'].includes(course.status);

              return (
                <Col
                  key={course.courseID}
                  xs={24}
                  sm={12}
                  lg={8}>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={course.title}
                        src={course.imageUrl}
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                    }
                    className="shadow-md rounded-lg"
                    actions={[
                      <Button
                        type="link"
                        onClick={() => navigate(`${course.courseID}`)}>
                        View Details
                      </Button>,
                      canEdit && (
                        <Button
                          type="link"
                          key="edit"
                          onClick={() => navigate(`${course.courseID}/edit`)}>
                          Edit
                        </Button>
                      ),
                    ].filter(Boolean)}>
                    <Title level={4}>{course.title}</Title>
                    <Paragraph ellipsis={{ rows: 2 }}>{course.description}</Paragraph>
                    <div className="flex justify-between items-center mt-2">
                      <span>
                        {course.discountPrice ? (
                          <>
                            <span className="line-through text-gray-400 mr-2">${course.price}</span>
                            <span className="text-green-600 font-bold">
                              {Number(course.discountPrice).toLocaleString('vi-VN')} VNĐ
                            </span>
                          </>
                        ) : (
                          <span className="text-primary font-bold">
                            {Number(course.price).toLocaleString('vi-VN')} VNĐ
                          </span>
                        )}
                      </span>
                      <Tag
                        color="blue"
                        style={{ marginRight: 0 }}>
                        {formatStatusLabel(course.status)}
                      </Tag>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <div className="flex flex-col justify-center items-center min-h-[60vh]">
            <Empty
              description="No courses found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
