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
  Tooltip,
  Avatar,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getCoursesSubmitedService } from '../../services/course';
import { EyeOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { formatStatusLabel } from '../../utils/mapping';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'PendingApproval', label: 'Pending Approval' },
  { value: 'Published', label: 'Published' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Approved', label: 'Approved' },
];

const ReviewCourses: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['staff-courses', status],
    queryFn: () => getCoursesSubmitedService({ status }),
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Title
            level={2}
            className="mb-0">
            Course Review Management
          </Title>

          <Space>
            <Select
              value={status}
              onChange={handleStatusChange}
              style={{ width: 220 }}
              placeholder="Filter by submission status">
              {statusOptions.map((s) => (
                <Option
                  key={s.value}
                  value={s.value}>
                  {s.label}
                </Option>
              ))}
            </Select>

            <Tooltip title="Refresh list">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
              />
            </Tooltip>
          </Space>
        </div>

        {/* Course List */}
        {courses.length > 0 ? (
          <Row gutter={[24, 24]}>
            {courses.map((item) => {
              const course = item.course;
              const teacher = course.teacherInfo;

              return (
                <Col
                  key={item.courseSubmissionID}
                  xs={24}
                  sm={12}
                  lg={8}>
                  <Card
                    hoverable
                    className="shadow-sm rounded-lg border border-gray-200"
                    cover={
                      <img
                        alt={course.title}
                        src={course.imageUrl}
                        style={{
                          height: 180,
                          objectFit: 'cover',
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                        }}
                      />
                    }
                    actions={[
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() =>
                          navigate(`${item.course.courseID}/${item.courseSubmissionID}`)
                        }>
                        View Details
                      </Button>,
                    ]}>
                    <div className="flex flex-col gap-2">
                      <Title
                        level={4}
                        ellipsis>
                        {course.title}
                      </Title>

                      <Paragraph ellipsis={{ rows: 2 }}>
                        {course.description || 'No description available'}
                      </Paragraph>

                      {/* Teacher Info */}
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar
                          src={teacher.avatar}
                          icon={<UserOutlined />}
                          size="small"
                        />
                        <Text
                          type="secondary"
                          ellipsis>
                          {teacher.fullName}
                        </Text>
                      </div>

                      {/* Status + Dates */}
                      <div className="flex justify-between items-center mt-3">
                        <Tag color="blue">{formatStatusLabel(item.submissionStatus)}</Tag>

                        {item.submittedAt && (
                          <Tooltip
                            title={`Submitted: ${new Date(item.submittedAt).toLocaleString()}`}>
                            <Text
                              type="secondary"
                              className="text-xs">
                              {new Date(item.submittedAt).toLocaleDateString()}
                            </Text>
                          </Tooltip>
                        )}
                      </div>
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

export default ReviewCourses;
