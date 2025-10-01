import React from 'react';
import { Card, Typography, Row, Col, Tag, Button, Empty, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getCoursesService } from '../../services/course'; // <-- implement list API
import { BookOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const MyCourses: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['courses'],
    queryFn: getCoursesService,
    retry: 1,
    retryDelay: 500,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data?.data || data.data.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <Empty
          description="No courses found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <Button
          type="primary"
          className="mt-4"
          onClick={() => navigate('create')}>
          Create Your First Course
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <Title
          level={2}
          className="mb-8">
          My Courses
        </Title>

        <Row gutter={[24, 24]}>
          {data.data.map((course) => (
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
                    onClick={() => navigate(`/courses/${course.courseID}`)}>
                    View Details
                  </Button>,
                ]}>
                <Title level={4}>{course.title}</Title>
                <Paragraph ellipsis={{ rows: 2 }}>{course.description}</Paragraph>
                <div className="flex justify-between items-center mt-2">
                  <span>
                    {course.discountPrice ? (
                      <>
                        <span className="line-through text-gray-400 mr-2">${course.price}</span>
                        <span className="text-green-600 font-bold">${course.discountPrice}</span>
                      </>
                    ) : (
                      <span className="text-primary font-bold">${course.price}</span>
                    )}
                  </span>
                  <Tag
                    icon={<BookOutlined />}
                    color="blue"
                    style={{ marginRight: 0 }}>
                    {course.courseType === 1
                      ? 'Video'
                      : course.courseType === 2
                      ? 'Interactive'
                      : 'Course'}
                  </Tag>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default MyCourses;
